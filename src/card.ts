import { LitElement, css, html, type CSSResultGroup, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import {
  handleAction,
  hasConfigOrEntityChanged,
  type HomeAssistant,
  type LovelaceCardEditor,
} from "custom-card-helpers";
import { createFanAdapter } from "./adapters";
import { DEFAULT_CONFIG, normalizeCardConfig } from "./config";
import "./editor";
import { loadServiceAvailability } from "./services/service-dispatcher";
import { resolveRelatedEntities } from "./state/related-entities";
import { getAirflowAxis } from "./state/visual-state";
import { createTranslator, type TranslationKey, type TranslationValues, type Translator } from "./translations";
import { RELATED_ENTITY_DOMAINS } from "./types";
import type {
  FanAdapter,
  FanCardConfig,
  HassLike,
  FanRelatedEntitiesConfig,
  RelatedEntities,
  ResolvedFanCardConfig,
  ServiceAvailability,
} from "./types";

const TIMER_STEPS = [0, 60, 120, 180, 240, 300, 360, 420, 480];

const asHassLike = (hass: HomeAssistant): HassLike => hass as unknown as HassLike;

export class XiaomiFanCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config: ResolvedFanCardConfig = normalizeCardConfig(DEFAULT_CONFIG);

  @state() private services: ServiceAvailability = { loaded: false, names: new Set() };

  @state() private related: RelatedEntities = {};

  @state() private actionError = "";

  private serviceLoadKey = "";
  private loadRequestId = 0;
  private translatorLanguage = "";
  private translator: Translator = createTranslator();

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./editor");
    return document.createElement("xiaomi-fan-card-editor") as LovelaceCardEditor;
  }

  public static getConfigForm() {
    const booleanField = (name: string) => ({ name, selector: { boolean: {} } });
    const entityField = (name: string, domains: readonly string[]) => ({
      name,
      selector: { entity: { domain: domains } },
    });
    const selectField = (name: string, options: string[]) => ({
      name,
      selector: { select: { options } },
    });
    const relatedEntityField = (name: keyof FanRelatedEntitiesConfig) =>
      entityField(name, RELATED_ENTITY_DOMAINS[name]);

    return {
      schema: [
        entityField("entity", ["fan"]),
        { name: "name", selector: { text: {} } },
        selectField("integration", ["auto", "standard", "xiaomi_miio", "xiaomi_miio_fan", "xiaomi_miot"]),
        {
          type: "expandable",
          name: "header",
          flatten: false,
          schema: [
            booleanField("show"),
            selectField("variant", ["full", "compact"]),
            booleanField("show_eyebrow"),
            booleanField("show_name"),
            booleanField("show_status"),
            booleanField("show_mode"),
            booleanField("show_model"),
          ],
        },
        {
          type: "expandable",
          name: "visual",
          flatten: false,
          schema: [
            booleanField("show"),
            booleanField("show_graphic"),
            booleanField("show_power"),
            booleanField("show_speed"),
            booleanField("show_details"),
            selectField("animation", ["auto", "enabled", "disabled"]),
          ],
        },
        {
          type: "expandable",
          name: "controls",
          flatten: false,
          schema: [
            booleanField("show"),
            booleanField("show_speed_slider"),
            booleanField("show_speed_levels"),
            booleanField("show_modes"),
            booleanField("show_preset_mode"),
            booleanField("show_horizontal_swing"),
            booleanField("show_vertical_swing"),
            booleanField("show_sleep"),
            booleanField("show_cycle"),
            booleanField("show_horizontal_angle"),
            booleanField("show_vertical_angle"),
            booleanField("show_nudge"),
            booleanField("show_direction"),
            booleanField("show_favorite_level"),
            booleanField("show_timer"),
            booleanField("show_child_lock"),
            booleanField("show_led"),
            booleanField("show_buzzer"),
            booleanField("show_ionizer"),
            selectField("selection_mode", ["auto", "buttons", "select"]),
            selectField("timer_mode", ["cycle", "select"]),
          ],
        },
        {
          type: "expandable",
          name: "details",
          flatten: false,
          schema: [
            booleanField("show"),
            booleanField("show_horizontal_angle"),
            booleanField("show_vertical_angle"),
            booleanField("show_timer"),
            booleanField("show_temperature"),
            booleanField("show_humidity"),
          ],
        },
        {
          type: "expandable",
          name: "layout",
          flatten: false,
          schema: [
            selectField("theme", ["auto", "mushroom", "minimal", "glass", "industrial"]),
            selectField("density", ["comfortable", "compact"]),
            selectField("columns", ["auto", "one", "two"]),
          ],
        },
        {
          type: "expandable",
          name: "related_entities",
          flatten: true,
          schema: [
            relatedEntityField("horizontal_angle_entity"),
            relatedEntityField("vertical_swing_entity"),
            relatedEntityField("vertical_angle_entity"),
            relatedEntityField("favorite_level_entity"),
            relatedEntityField("sleep_mode_entity"),
            relatedEntityField("timer_entity"),
            relatedEntityField("child_lock_entity"),
            relatedEntityField("led_entity"),
            relatedEntityField("buzzer_entity"),
            relatedEntityField("ionizer_entity"),
            relatedEntityField("temperature_entity"),
            relatedEntityField("humidity_entity"),
          ],
        },
      ],
    };
  }

  public static getStubConfig(): Partial<FanCardConfig> {
    return {
      ...DEFAULT_CONFIG,
      name: "Xiaomi Fan",
    };
  }

  public setConfig(config: FanCardConfig): void {
    const entity = config?.entity ?? config?.entity_id;
    if (!config || !entity) {
      throw new Error("Missing required fan entity.");
    }

    const nextConfig = normalizeCardConfig({ ...config, entity });
    const loaderChanged =
      this.config.entity !== nextConfig.entity ||
      this.config.integration !== nextConfig.integration ||
      this.relatedConfigKey(this.config) !== this.relatedConfigKey(nextConfig);

    this.config = nextConfig;
    if (loaderChanged) {
      this.serviceLoadKey = "";
      this.related = {};
      this.loadRequestId += 1;
    }
  }

  protected shouldUpdate(changedProperties: PropertyValues): boolean {
    if (!this.config || !this.hass) {
      return false;
    }

    return (
      hasConfigOrEntityChanged(this, changedProperties, false) ||
      changedProperties.has("hass") ||
      changedProperties.has("services") ||
      changedProperties.has("related") ||
      changedProperties.has("actionError")
    );
  }

  protected updated(): void {
    const entityId = this.config.entity;
    const loadKey = `${entityId}:${this.config.integration ?? "auto"}`;
    if (!entityId || !this.hass || this.serviceLoadKey === loadKey) {
      return;
    }

    this.serviceLoadKey = loadKey;
    const hass = asHassLike(this.hass);
    const requestId = ++this.loadRequestId;
    const requestedHass = this.hass;
    const shouldLoadCustomServices = this.config.integration !== "standard";
    const services = shouldLoadCustomServices
      ? loadServiceAvailability(hass)
      : Promise.resolve<ServiceAvailability>({ loaded: true, names: new Set() });
    void Promise.all([services, resolveRelatedEntities(hass, entityId)]).then(([services, discovered]) => {
      if (
        requestId !== this.loadRequestId ||
        this.hass !== requestedHass ||
        this.config.entity !== entityId ||
        this.serviceLoadKey !== loadKey
      ) {
        return;
      }

      this.services = services;
      this.related = this.withConfiguredRelatedEntities(discovered);
    });
  }

  protected render() {
    if (!this.hass || !this.config?.entity) {
      return html`<ha-card><div class="empty">${this.t("chooseFanEntity")}</div></ha-card>`;
    }

    const adapter = createFanAdapter(
      asHassLike(this.hass),
      this.config.entity,
      this.services,
      this.config.integration,
      this.related,
    );
    if (!adapter.state.available) {
      return html`
        <ha-card class="card ${this.themeClass}">
          <div class="empty" role="status">
            <ha-icon icon="mdi:fan-alert"></ha-icon>
            <span>${this.t("fanEntityUnavailable", { entity: this.config.entity })}</span>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card class="card ${this.themeClass}">
        ${this.config.header.show ? this.renderHeader(adapter) : ""}
        ${this.config.visual.show ? this.renderVisual(adapter) : ""}
        ${this.config.controls.show ? this.renderAirflowControls(adapter) : ""}
        ${this.config.controls.show ? this.renderFeatureControls(adapter) : ""}
        ${this.actionError ? html`<div class="action-error" role="alert">${this.actionError}</div>` : ""}
      </ha-card>
    `;
  }

  private get themeClass(): string {
    return [
      `theme-${this.config.layout.theme}`,
      `density-${this.config.layout.density}`,
      `columns-${this.config.layout.columns}`,
      `header-${this.config.header.variant}`,
    ].join(" ");
  }

  private t(key: TranslationKey, values?: TranslationValues): string {
    const language = this.hass?.language ?? "";
    if (language !== this.translatorLanguage) {
      this.translatorLanguage = language;
      this.translator = createTranslator(language);
    }

    return this.translator(key, values);
  }

  private displayTimer(minutes: number | undefined): string {
    if (!minutes) {
      return this.t("off");
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours > 0
      ? remainder > 0
        ? this.t("hoursMinutes", { hours, minutes: remainder })
        : this.t("hoursOnly", { hours })
      : this.t("minutesOnly", { minutes: remainder });
  }

  private withConfiguredRelatedEntities(discovered: RelatedEntities): RelatedEntities {
    return {
      ...discovered,
      sleepMode: this.config.sleep_mode_entity ?? discovered.sleepMode,
      horizontalAngle: this.config.horizontal_angle_entity ?? discovered.horizontalAngle,
      verticalSwing: this.config.vertical_swing_entity ?? discovered.verticalSwing,
      verticalAngle: this.config.vertical_angle_entity ?? discovered.verticalAngle,
      favoriteLevel: this.config.favorite_level_entity ?? discovered.favoriteLevel,
      timer: this.config.timer_entity ?? discovered.timer,
      childLock: this.config.child_lock_entity ?? discovered.childLock,
      led: this.config.led_entity ?? discovered.led,
      buzzer: this.config.buzzer_entity ?? discovered.buzzer,
      ionizer: this.config.ionizer_entity ?? discovered.ionizer,
      temperature: this.config.temperature_entity ?? discovered.temperature,
      humidity: this.config.humidity_entity ?? discovered.humidity,
    };
  }

  private relatedConfigKey(config: Partial<FanCardConfig>): string {
    return [
      config.horizontal_angle_entity,
      config.vertical_swing_entity,
      config.vertical_angle_entity,
      config.favorite_level_entity,
      config.sleep_mode_entity,
      config.timer_entity,
      config.child_lock_entity,
      config.led_entity,
      config.buzzer_entity,
      config.ionizer_entity,
      config.temperature_entity,
      config.humidity_entity,
    ]
      .map((value) => value ?? "")
      .join("|");
  }

  private execute(action: () => Promise<void>): void {
    this.actionError = "";
    void action().catch((error: unknown) => {
      this.actionError = error instanceof Error ? error.message : this.t("fanCommandFailed");
    });
  }

  private renderHeader(adapter: FanAdapter) {
    const state = adapter.state;
    const title = this.config.name || state.friendlyName;
    const modeLabel = state.mode === "natural" ? this.t("naturalBreeze") : this.t("straightAirflow");
    const status = state.isOn ? this.t("running") : this.t("standby");

    return html`
      <header class="header">
        <button class="title-button" @click=${this.onHeaderClick} aria-label=${this.t("open", { title })}>
          ${this.config.header.show_eyebrow ? html`<span class="eyebrow">${this.t("xiaomiAirCirculation")}</span>` : ""}
          ${this.config.header.show_name ? html`<span class="title">${title}</span>` : ""}
          ${
            this.config.header.show_status || this.config.header.show_mode
              ? html`
                  <span class="subtitle">
                    ${
                      this.config.header.show_status
                        ? html`<span class="status-dot ${state.isOn ? "on" : ""}"></span>${status}`
                        : ""
                    }
                    ${this.config.header.show_mode ? html`<span>${modeLabel}</span>` : ""}
                  </span>
                `
              : ""
          }
        </button>
        ${
          this.config.header.show_model && adapter.profile.known
            ? html`<span class="model-badge">${adapter.profile.model?.split(".").at(-1) ?? "XIAOMI"}</span>`
            : ""
        }
      </header>
    `;
  }

  private renderVisual(adapter: FanAdapter) {
    const state = adapter.state;
    const speed = state.isOn ? state.percentage : 0;
    const style = `--speed:${speed}; --spin-duration:${Math.max(1.8, 12 - speed / 11)}s;`;
    const axis = getAirflowAxis(state.horizontalSwing, state.verticalSwing);
    const animationDisabled = this.config.disable_animation || this.config.visual.animation === "disabled";

    return html`
      <section class="visual-section" aria-label=${this.t("fanStatus")}>
        ${
          this.config.visual.show_graphic
            ? html`
                <div
                  class="airflow-visual axis-${axis} ${state.isOn ? "running" : ""} ${
                    animationDisabled ? "no-motion" : ""
                  }"
                  style=${style}
                >
                  <div class="orbit orbit-one"></div>
                  <div class="orbit orbit-two"></div>
                  <div class="wind wind-horizontal"></div>
                  <div class="wind wind-vertical"></div>
                  <div class="rotor" aria-hidden="true">
                    <span class="blade blade-one"></span>
                    <span class="blade blade-two"></span>
                    <span class="blade blade-three"></span>
                    <span class="blade blade-four"></span>
                    <span class="hub"></span>
                  </div>
                  ${
                    this.config.visual.show_power
                      ? html`
                          <button
                            class="power-button ${state.isOn ? "active" : ""}"
                            @click=${() => this.execute(() => adapter.togglePower())}
                            aria-label=${state.isOn ? this.t("turnFanOff") : this.t("turnFanOn")}
                            aria-pressed=${state.isOn}
                          >
                            <ha-icon icon="mdi:power"></ha-icon>
                          </button>
                        `
                      : ""
                  }
                  ${
                    this.config.visual.show_speed
                      ? html`
                          <span class="speed-readout">
                            <strong>${state.percentage}</strong>
                            <small>% ${this.t("airflow")}</small>
                          </span>
                        `
                      : ""
                  }
                </div>
              `
            : ""
        }
        ${this.config.visual.show_details ? this.renderDetails(adapter) : ""}
      </section>
    `;
  }

  private renderDetails(adapter: FanAdapter) {
    const state = adapter.state;
    const details = this.config.details;

    if (!details.show) {
      return "";
    }

    const hasDetails =
      (details.show_horizontal_angle && adapter.capabilities.horizontalAngle) ||
      (details.show_vertical_angle && adapter.capabilities.verticalAngle) ||
      (details.show_timer && adapter.capabilities.timer) ||
      (details.show_temperature && state.temperature !== undefined) ||
      (details.show_humidity && state.humidity !== undefined);
    if (!hasDetails) {
      return "";
    }

    return html`
      <div class="visual-meta">
        ${
          details.show_horizontal_angle
            ? html`
                <span
                  aria-label=${this.t("horizontalAngleValue", {
                    value: state.horizontalAngle ?? this.t("unavailable"),
                  })}
                  >${
                    state.horizontalAngle !== undefined
                      ? this.t("horizontalAngleShort", { value: state.horizontalAngle })
                      : this.t("horizontalAngleUnavailable")
                  }</span
                >
              `
            : ""
        }
        ${
          details.show_vertical_angle
            ? html`
                <span
                  aria-label=${this.t("verticalAngleValue", {
                    value: state.verticalAngle ?? this.t("unavailable"),
                  })}
                  >${
                    state.verticalAngle !== undefined
                      ? this.t("verticalAngleShort", { value: state.verticalAngle })
                      : this.t("verticalAngleUnavailable")
                  }</span
                >
              `
            : ""
        }
        ${
          details.show_timer
            ? html`<span
                >${state.timerMinutes ? this.t("timerOff", { timer: this.displayTimer(state.timerMinutes) }) : this.t("noTimer")}</span
              >`
            : ""
        }
        ${details.show_temperature && state.temperature !== undefined ? html`<span>${state.temperature}°C</span>` : ""}
        ${details.show_humidity && state.humidity !== undefined ? html`<span>${state.humidity}% RH</span>` : ""}
      </div>
    `;
  }

  private renderAirflowControls(adapter: FanAdapter) {
    const state = adapter.state;
    const controls = this.config.controls;
    const levelLabels = Array.from({ length: adapter.capabilities.speedLevels }, (_, index) => index + 1);
    const useSpeedSelect =
      controls.selection_mode === "select" || (controls.selection_mode === "auto" && levelLabels.length > 5);
    const hasSpeedControls = controls.show_speed_slider || controls.show_speed_levels;
    const hasModeControls =
      controls.show_modes &&
      (adapter.capabilities.naturalMode ||
        (controls.show_preset_mode && state.availableModes.some((mode) => mode.toLowerCase() !== "off")));
    const hasChipControls =
      (controls.show_horizontal_swing && adapter.capabilities.horizontalSwing) ||
      (controls.show_vertical_swing && adapter.capabilities.verticalSwing) ||
      (controls.show_sleep && adapter.capabilities.sleepMode) ||
      (controls.show_cycle && adapter.capabilities.horizontalSwing && adapter.capabilities.verticalSwing);

    if (!hasSpeedControls && !hasModeControls && !hasChipControls) {
      return "";
    }

    return html`
      <section class="controls airflow-controls" aria-label=${this.t("airflow")}>
        ${
          controls.show_speed_slider || controls.show_speed_levels
            ? html`
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">${this.t("airflow")}</span>
                    <strong>${this.t("speedLevel", { level: state.level || 0 })}</strong>
                  </div>
                  <span class="value">${state.percentage}%</span>
                </div>
              `
            : ""
        }
        ${
          controls.show_speed_slider
            ? html`
                <input
                  class="speed-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  .value=${String(state.percentage)}
                  @change=${(event: Event) => this.onPercentageChange(event, adapter)}
                  aria-label=${this.t("fanSpeedPercentage")}
                />
              `
            : ""
        }
        ${
          controls.show_speed_levels
            ? useSpeedSelect
              ? this.renderSpeedSelector(adapter, levelLabels)
              : html`
                  <div class="level-row" role="group" aria-label=${this.t("speedLevels")}>
                    ${levelLabels.map(
                      (level) => html`
                        <button
                          class="level-button ${state.level === level ? "selected" : ""}"
                          @click=${() =>
                            this.execute(() =>
                              adapter.setPercentage(Math.round((level / adapter.capabilities.speedLevels) * 100)),
                            )}
                          aria-label=${this.t("setSpeedLevel", { level })}
                          aria-pressed=${state.level === level}
                        >
                          ${level}
                        </button>
                      `,
                    )}
                  </div>
                `
            : ""
        }
        ${controls.show_modes ? this.renderModeControls(adapter) : ""}
        <div class="chip-row">
          ${
            controls.show_horizontal_swing && adapter.capabilities.horizontalSwing
              ? html`
                  <button
                    class="chip ${state.horizontalSwing ? "selected" : ""}"
                    @click=${() => this.execute(() => adapter.setHorizontalSwing(!state.horizontalSwing))}
                    aria-pressed=${state.horizontalSwing}
                  >
                    <ha-icon icon="mdi:rotate-3d-variant"></ha-icon>
                    ${this.t("horizontal")}
                  </button>
                `
              : ""
          }
          ${
            controls.show_vertical_swing && adapter.capabilities.verticalSwing
              ? html`
                  <button
                    class="chip ${state.verticalSwing ? "selected" : ""}"
                    @click=${() => this.execute(() => adapter.setVerticalSwing(!state.verticalSwing))}
                    aria-pressed=${state.verticalSwing}
                  >
                    <ha-icon icon="mdi:swap-vertical"></ha-icon>
                    ${this.t("vertical")}
                  </button>
                `
              : ""
          }
          ${
            controls.show_sleep && adapter.capabilities.sleepMode
              ? html`
                  <button
                    class="chip ${state.sleepMode ? "selected" : ""}"
                    @click=${() => this.execute(() => adapter.setSleepMode(!state.sleepMode))}
                    aria-pressed=${state.sleepMode}
                  >
                    <ha-icon icon="mdi:power-sleep"></ha-icon>
                    ${this.t("sleep")}
                  </button>
                `
              : ""
          }
          ${
            controls.show_cycle && adapter.capabilities.horizontalSwing && adapter.capabilities.verticalSwing
              ? html`
                  <button
                    class="chip ${state.horizontalSwing && state.verticalSwing ? "selected" : ""}"
                    @click=${() => this.execute(() => this.toggleCycle(adapter))}
                    aria-pressed=${state.horizontalSwing && state.verticalSwing}
                  >
                    <ha-icon icon="mdi:autorenew"></ha-icon>
                    ${this.t("cycle")}
                  </button>
                `
              : ""
          }
        </div>
      </section>
    `;
  }

  private renderSpeedSelector(adapter: FanAdapter, levels: number[]) {
    const current = adapter.state.level || levels[0] || 1;
    return html`
      <label class="feature-select speed-select">
        <span>${this.t("speedLevels")}</span>
        <select
          .value=${String(current)}
          aria-label=${this.t("speedLevels")}
          @change=${(event: Event) => {
            const level = Number((event.currentTarget as HTMLSelectElement).value);
            this.execute(() => adapter.setPercentage(Math.round((level / adapter.capabilities.speedLevels) * 100)));
          }}
        >
          ${levels.map(
            (level) =>
              html`<option value=${level} ?selected=${level === current}>${this.t("speedLevel", { level })}</option>`,
          )}
        </select>
      </label>
    `;
  }

  private renderModeControls(adapter: FanAdapter) {
    const state = adapter.state;
    const controls = this.config.controls;
    const availableModes = state.availableModes.filter((mode) => mode.toLowerCase() !== "off");
    const extraModes = availableModes.filter((mode) => {
      const normalized = mode.toLowerCase();
      return !(
        normalized.includes("natural") ||
        normalized.includes("nature") ||
        normalized.includes("normal") ||
        normalized.includes("straight") ||
        normalized.includes("manual") ||
        /^level\s*\d+$/i.test(mode)
      );
    });

    if (adapter.capabilities.naturalMode && controls.show_modes) {
      return html`
        <div class="mode-section">
          <span class="control-label">${this.t("mode")}</span>
          <div class="mode-row" role="group" aria-label=${this.t("mode")}>
            <button
              class="mode-button ${state.mode === "normal" ? "selected" : ""}"
              @click=${() => this.execute(() => adapter.setMode("normal"))}
              aria-pressed=${state.mode === "normal"}
            >
              <span class="mode-icon"><ha-icon icon="mdi:weather-windy"></ha-icon></span>
              <span>${this.t("normal")}</span>
            </button>
            <button
              class="mode-button ${state.mode === "natural" ? "selected" : ""}"
              @click=${() => this.execute(() => adapter.setMode("natural"))}
              aria-pressed=${state.mode === "natural"}
            >
              <span class="mode-icon"><ha-icon icon="mdi:leaf"></ha-icon></span>
              <span>${this.t("natural")}</span>
            </button>
          </div>
        </div>
        ${controls.show_preset_mode && extraModes.length > 0 ? this.renderPresetChoices(adapter, extraModes) : ""}
      `;
    }

    if (!controls.show_preset_mode || availableModes.length === 0) {
      return "";
    }

    return this.renderPresetChoices(adapter, availableModes);
  }

  private renderPresetChoices(adapter: FanAdapter, modes: string[]) {
    const useButtons =
      this.config.controls.selection_mode === "buttons" ||
      (this.config.controls.selection_mode === "auto" && modes.length <= 4);

    if (useButtons) {
      return html`
        <div class="preset-section">
          <span class="control-label">${this.t("presetMode")}</span>
          <div class="preset-row" role="group" aria-label=${this.t("presetMode")}>
            ${modes.map(
              (mode) => html`
                <button
                  class="preset-button ${adapter.state.presetMode === mode ? "selected" : ""}"
                  @click=${() => this.execute(() => adapter.setPresetMode(mode))}
                  aria-pressed=${adapter.state.presetMode === mode}
                >
                  ${mode}
                </button>
              `,
            )}
          </div>
        </div>
      `;
    }

    return this.renderPresetSelector(adapter, modes);
  }

  private renderPresetSelector(adapter: FanAdapter, modes: string[]) {
    const current = adapter.state.presetMode ?? modes[0] ?? "";
    return html`
      <label class="feature-select mode-select">
        <span>${this.t("presetMode")}</span>
        <select
          .value=${current}
          aria-label=${this.t("presetMode")}
          @change=${(event: Event) =>
            this.execute(() => adapter.setPresetMode((event.currentTarget as HTMLSelectElement).value))}
        >
          ${modes.map((mode) => html`<option value=${mode} ?selected=${mode === current}>${mode}</option>`)}
        </select>
      </label>
    `;
  }

  private renderFeatureControls(adapter: FanAdapter) {
    const state = adapter.state;
    const controls = this.config.controls;
    const features: unknown[] = [];

    if (controls.show_horizontal_angle && adapter.capabilities.horizontalAngle) {
      features.push(
        this.renderAngleControl(
          this.t("horizontalAngle"),
          state.horizontalAngle,
          adapter.capabilities.horizontalAngles,
          (angle) => this.execute(() => adapter.setHorizontalAngle(angle)),
        ),
      );
    }

    if (controls.show_vertical_angle && adapter.capabilities.verticalAngle) {
      features.push(
        this.renderAngleControl(
          this.t("verticalAngle"),
          state.verticalAngle,
          adapter.capabilities.verticalAngles,
          (angle) => this.execute(() => adapter.setVerticalAngle(angle)),
        ),
      );
    }

    if (controls.show_nudge && adapter.capabilities.directionNudge) {
      features.push(html`
        <div class="nudge-control">
          <span>${this.t("position")}</span>
          <div class="nudge-grid">
            <button @click=${() => this.execute(() => adapter.nudge("up"))} aria-label=${this.t("moveFanUp")}>
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </button>
            <button @click=${() => this.execute(() => adapter.nudge("left"))} aria-label=${this.t("moveFanLeft")}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button @click=${() => this.execute(() => adapter.nudge("right"))} aria-label=${this.t("moveFanRight")}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
            <button @click=${() => this.execute(() => adapter.nudge("down"))} aria-label=${this.t("moveFanDown")}>
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </button>
          </div>
        </div>
      `);
    }

    if (controls.show_direction && adapter.capabilities.direction && !adapter.capabilities.directionNudge) {
      const direction = state.direction === "reverse" ? "forward" : "reverse";
      features.push(html`
        <button class="feature-button" @click=${() => this.execute(() => adapter.setDirection(direction))}>
          <ha-icon icon="mdi:rotate-orbit"></ha-icon>
          <span>
            <small>${this.t("direction")}</small>
            <strong>${state.direction === "reverse" ? this.t("reverse") : this.t("forward")}</strong>
          </span>
        </button>
      `);
    }

    if (controls.show_favorite_level && adapter.capabilities.favoriteLevel) {
      features.push(html`
        <label class="feature-select">
          <span>${this.t("favoriteLevel")}</span>
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            .value=${String(adapter.state.favoriteLevel ?? adapter.state.level ?? 1)}
            @change=${(event: Event) =>
              this.execute(() => adapter.setFavoriteLevel(Number((event.currentTarget as HTMLInputElement).value)))}
          />
        </label>
      `);
    }

    if (controls.show_timer && adapter.capabilities.timer) {
      features.push(
        controls.timer_mode === "select"
          ? this.renderTimerSelector(adapter, state.timerMinutes, adapter.capabilities.timerSteps ?? TIMER_STEPS)
          : this.renderTimerCycleButton(adapter, state.timerMinutes, adapter.capabilities.timerSteps),
      );
    }

    if (controls.show_child_lock && adapter.capabilities.childLock) {
      features.push(html`
        <button
          class="feature-button ${state.childLock ? "selected" : ""}"
          @click=${() => this.execute(() => adapter.setChildLock(!state.childLock))}
        >
          <ha-icon icon="mdi:lock${state.childLock ? "" : "-open-outline"}"></ha-icon>
          <span>
            <small>${this.t("childLock")}</small><strong>${state.childLock ? this.t("on") : this.t("off")}</strong>
          </span>
        </button>
      `);
    }

    if (controls.show_led && adapter.capabilities.led) {
      features.push(html`
        <button
          class="feature-button ${state.led ? "selected" : ""}"
          @click=${() => this.execute(() => adapter.setLed(!state.led))}
        >
          <ha-icon icon="mdi:led-outline"></ha-icon>
          <span><small>${this.t("led")}</small><strong>${state.led ? this.t("on") : this.t("off")}</strong></span>
        </button>
      `);
    }

    if (controls.show_buzzer && adapter.capabilities.buzzer) {
      features.push(html`
        <button
          class="feature-button ${state.buzzer ? "selected" : ""}"
          @click=${() => this.execute(() => adapter.setBuzzer(!state.buzzer))}
        >
          <ha-icon icon="mdi:bell-outline"></ha-icon>
          <span><small>${this.t("buzzer")}</small><strong>${state.buzzer ? this.t("on") : this.t("off")}</strong></span>
        </button>
      `);
    }

    if (controls.show_ionizer && adapter.capabilities.ionizer) {
      features.push(html`
        <button
          class="feature-button ${state.ionizer ? "selected" : ""}"
          @click=${() => this.execute(() => adapter.setIonizer(!state.ionizer))}
        >
          <ha-icon icon="mdi:air-filter"></ha-icon>
          <span>
            <small>${this.t("ionizer")}</small><strong>${state.ionizer ? this.t("on") : this.t("off")}</strong>
          </span>
        </button>
      `);
    }

    return features.length > 0
      ? html`<section class="controls feature-controls" aria-label=${this.t("fanFeatures")}>${features}</section>`
      : "";
  }

  private renderTimerCycleButton(adapter: FanAdapter, current: number | undefined, steps: number[] | undefined) {
    const nextTimer = this.nextTimer(current, steps);
    return html`
      <button class="feature-button" @click=${() => this.execute(() => adapter.setTimer(nextTimer))}>
        <ha-icon icon="mdi:timer-outline"></ha-icon>
        <span><small>${this.t("timer")}</small><strong>${this.displayTimer(current)}</strong></span>
      </button>
    `;
  }

  private renderTimerSelector(adapter: FanAdapter, current: number | undefined, steps: number[]) {
    const options = steps.includes(current ?? 0) ? steps : [...steps, current ?? 0].sort((left, right) => left - right);
    return html`
      <label class="feature-select timer-select">
        <span>${this.t("timer")}</span>
        <select
          .value=${String(current ?? 0)}
          aria-label=${this.t("timer")}
          @change=${(event: Event) =>
            this.execute(() => adapter.setTimer(Number((event.currentTarget as HTMLSelectElement).value)))}
        >
          ${options.map(
            (minutes) =>
              html`<option value=${minutes} ?selected=${minutes === current}>
                ${minutes === 0 ? this.t("off") : this.displayTimer(minutes)}
              </option>`,
          )}
        </select>
      </label>
    `;
  }

  private renderAngleControl(
    label: string,
    value: number | undefined,
    angles: number[],
    onChange: (angle: number) => void,
  ) {
    const current = value ?? angles[0] ?? 0;
    const options = angles.includes(current) ? angles : [...angles, current].sort((left, right) => left - right);
    return html`
      <label class="feature-select">
        <span>${label}</span>
        ${
          angles.length > 0
            ? html`
                <select
                  .value=${String(current)}
                  aria-label=${label}
                  @change=${(event: Event) => onChange(Number((event.currentTarget as HTMLSelectElement).value))}
                >
                  ${options.map(
                    (angle) => html`<option value=${angle} ?selected=${angle === current}>${angle}°</option>`,
                  )}
                </select>
              `
            : html`
                <input
                  type="number"
                  min="0"
                  max="360"
                  step="1"
                  .value=${String(current)}
                  @change=${(event: Event) => onChange(Number((event.currentTarget as HTMLInputElement).value))}
                  aria-label=${label}
                />
              `
        }
      </label>
    `;
  }

  private nextTimer(current: number | undefined, steps = TIMER_STEPS): number {
    const next = steps.find((step) => step > (current ?? 0));
    return next ?? steps[0] ?? 0;
  }

  private async toggleCycle(adapter: FanAdapter): Promise<void> {
    const enabled = !(adapter.state.horizontalSwing && adapter.state.verticalSwing);
    await adapter.setHorizontalSwing(enabled);
    await adapter.setVerticalSwing(enabled);
  }

  private onPercentageChange(event: Event, adapter: FanAdapter): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    this.execute(() => adapter.setPercentage(value));
  }

  private onHeaderClick = (): void => {
    if (this.hass && this.config) {
      handleAction(this, this.hass, this.config, "tap");
    }
  };

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      container-type: inline-size;
      --fan-accent: var(--state-fan-active-color, var(--state-active-color, #5c8dff));
      --fan-background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      --fan-accent-soft: color-mix(in srgb, var(--fan-accent) 18%, transparent);
      --fan-surface: color-mix(in srgb, var(--fan-background) 88%, var(--fan-accent));
      --fan-panel: color-mix(in srgb, var(--fan-background) 48%, transparent);
      --fan-control-surface: color-mix(in srgb, var(--fan-background) 42%, var(--fan-panel));
      --fan-text: var(--primary-text-color, #f5f7fb);
      --fan-text-muted: var(--secondary-text-color, #8a8f9d);
      --fan-border: color-mix(in srgb, var(--fan-text) 18%, transparent);
      --fan-shadow: var(--ha-card-box-shadow, 0 12px 32px rgb(0 0 0 / 12%));
      --fan-focus: var(--ha-focus-color, var(--primary-color, var(--fan-accent)));
      --fan-radius-card: 28px;
      --fan-radius-panel: 22px;
      --fan-radius-control: 12px;
      --fan-control-height: 44px;
      --fan-control-gap: 10px;
      --fan-panel-padding: 16px;
      --fan-header-padding: 18px 18px 0;
      --fan-visual-size: 310px;
      --fan-display-font: inherit;
    }

    ha-card {
      overflow: hidden;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-card);
      background: var(--fan-surface);
      color: var(--fan-text);
      box-shadow: var(--fan-shadow);
    }

    button,
    select,
    input {
      font: inherit;
    }

    button {
      border: 0;
      cursor: pointer;
    }

    button:focus-visible,
    select:focus-visible,
    input:focus-visible {
      outline: 2px solid var(--fan-focus);
      outline-offset: 2px;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      min-width: 0;
      padding: var(--fan-header-padding);
    }

    .header-compact .header {
      gap: 10px;
      padding-bottom: 0;
    }

    .title-button {
      min-width: 0;
      display: grid;
      gap: 5px;
      padding: 0;
      background: transparent;
      color: inherit;
      text-align: left;
    }

    .eyebrow {
      color: var(--fan-text-muted);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.15em;
    }

    .title {
      min-width: 0;
      overflow: hidden;
      font-size: 18px;
      font-weight: 750;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: -0.02em;
    }

    .subtitle {
      min-width: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      color: var(--fan-text-muted);
      font-size: 12px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--fan-text-muted);
    }

    .status-dot.on {
      background: var(--fan-accent);
      box-shadow: 0 0 0 4px var(--fan-accent-soft);
    }

    .model-badge {
      padding: 7px 10px;
      border: 1px solid var(--fan-border);
      border-radius: 999px;
      color: var(--fan-text-muted);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
    }

    .visual-section {
      padding: 8px 18px 10px;
    }

    .airflow-visual {
      position: relative;
      display: grid;
      place-items: center;
      width: min(100%, var(--fan-visual-size));
      aspect-ratio: 1;
      margin: 0 auto;
      isolation: isolate;
    }

    .airflow-visual::before {
      position: absolute;
      inset: 15%;
      border: 1px solid var(--fan-accent-soft);
      border-radius: 50%;
      content: "";
    }

    .airflow-visual::after {
      position: absolute;
      inset: 7%;
      border: 1px dashed var(--fan-accent-soft);
      border-radius: 50%;
      content: "";
      opacity: 0.8;
    }

    .airflow-visual.no-motion *,
    .airflow-visual.no-motion::before,
    .airflow-visual.no-motion::after {
      animation: none !important;
    }

    .orbit {
      position: absolute;
      border: 1px solid color-mix(in srgb, var(--fan-accent) 24%, transparent);
      border-radius: 50%;
      transform: rotate(18deg);
    }

    .orbit-one {
      width: 76%;
      height: 32%;
    }

    .orbit-two {
      width: 88%;
      height: 46%;
      transform: rotate(-26deg);
    }

    .axis-horizontal .orbit-one,
    .axis-dual .orbit-one {
      animation: orbit-horizontal 8s ease-in-out infinite;
    }

    .axis-vertical .orbit-two,
    .axis-dual .orbit-two {
      animation: orbit-vertical 8s ease-in-out infinite;
    }

    .wind {
      position: absolute;
      width: 42%;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, transparent, var(--fan-accent), transparent);
      opacity: 0;
    }

    .running .wind-horizontal {
      opacity: 0.7;
    }

    .running .wind-vertical {
      opacity: 0.7;
    }

    .wind-horizontal {
      transform: translateY(-44px) rotate(-12deg);
    }

    .wind-vertical {
      transform: translateY(44px) rotate(12deg);
      width: 4px;
      height: 42%;
      background: linear-gradient(180deg, transparent, var(--fan-accent), transparent);
    }

    .axis-horizontal.running .wind-horizontal,
    .axis-dual.running .wind-horizontal {
      animation: wind-horizontal-flow var(--spin-duration) linear infinite;
    }

    .axis-vertical.running .wind-vertical,
    .axis-dual.running .wind-vertical {
      animation: wind-vertical-flow calc(var(--spin-duration) * 1.2) ease-in-out infinite;
      animation-delay: -0.7s;
    }

    .rotor {
      position: relative;
      z-index: 2;
      width: 46%;
      aspect-ratio: 1;
      border: 12px solid color-mix(in srgb, var(--fan-accent) 18%, var(--fan-background));
      border-radius: 50%;
      background: color-mix(in srgb, var(--fan-accent) 7%, var(--fan-background));
      box-shadow:
        inset 0 0 0 1px var(--fan-accent-soft),
        0 18px 40px rgb(0 0 0 / 16%);
    }

    .running .rotor {
      animation: rotor-spin var(--spin-duration) linear infinite;
    }

    .blade {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 39%;
      height: 22%;
      border-radius: 100% 12% 100% 12%;
      background: linear-gradient(135deg, var(--fan-accent), color-mix(in srgb, var(--fan-accent) 40%, white));
      transform-origin: 0 50%;
      opacity: 0.88;
    }

    .blade-one {
      transform: translateY(-50%) rotate(-10deg);
    }

    .blade-two {
      transform: translateY(-50%) rotate(80deg);
    }

    .blade-three {
      transform: translateY(-50%) rotate(170deg);
    }

    .blade-four {
      transform: translateY(-50%) rotate(260deg);
    }

    .hub {
      position: absolute;
      inset: 37%;
      border-radius: 50%;
      background: var(--fan-surface);
      box-shadow: 0 0 0 5px var(--fan-accent-soft);
    }

    .power-button {
      position: absolute;
      z-index: 3;
      display: grid;
      place-items: center;
      width: 58px;
      height: 58px;
      border: 5px solid var(--fan-surface);
      border-radius: 50%;
      background: var(--fan-accent-soft);
      color: var(--fan-text-muted);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    }

    .power-button.active {
      background: var(--fan-accent);
      color: white;
    }

    .power-button ha-icon {
      --mdc-icon-size: 24px;
    }

    .speed-readout {
      position: absolute;
      right: 3%;
      bottom: 19%;
      z-index: 4;
      display: grid;
      justify-items: end;
      color: var(--fan-text-muted);
    }

    .speed-readout strong {
      color: var(--fan-text);
      font-size: 22px;
      line-height: 1;
    }

    .speed-readout small {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.1em;
    }

    .visual-meta {
      display: flex;
      justify-content: center;
      gap: 16px;
      color: var(--fan-text-muted);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .controls {
      margin: 0 14px 14px;
      padding: var(--fan-panel-padding);
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-panel);
      background: var(--fan-panel);
    }

    .section-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
    }

    .section-heading div {
      display: grid;
      gap: 4px;
    }

    .section-heading strong {
      font-size: 16px;
    }

    .value {
      color: var(--fan-accent);
      font-size: 24px;
      font-weight: 800;
    }

    .speed-slider {
      width: 100%;
      margin: 18px 0 10px;
      accent-color: var(--fan-accent);
      cursor: pointer;
    }

    .mode-section {
      display: grid;
      gap: 8px;
      margin: 16px 0;
    }

    .control-label {
      color: var(--fan-text-muted);
      font-size: 12px;
      font-weight: 700;
    }

    .mode-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .mode-button {
      display: grid;
      justify-items: center;
      gap: 7px;
      min-height: var(--fan-control-height);
      padding: 10px 6px;
      border: 1px solid var(--fan-border);
      border-radius: 16px;
      background: transparent;
      color: var(--fan-text-muted);
      font-size: 11px;
    }

    .mode-button.selected {
      border-color: var(--fan-accent-soft);
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .mode-icon {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--fan-text-muted) 20%, transparent);
    }

    .mode-button.selected .mode-icon {
      background: var(--fan-accent);
      color: white;
    }

    .mode-icon ha-icon {
      --mdc-icon-size: 20px;
    }

    .level-row,
    .chip-row,
    .preset-row {
      display: flex;
      gap: 8px;
    }

    .level-row {
      margin-bottom: 14px;
    }

    .level-button,
    .chip,
    .preset-button {
      min-height: var(--fan-control-height);
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-control);
      background: transparent;
      color: var(--fan-text-muted);
    }

    .level-button {
      flex: 1;
      font-size: 13px;
      font-weight: 750;
    }

    .level-button.selected,
    .chip.selected {
      border-color: transparent;
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .chip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex: 1;
      padding: 0 8px;
      font-size: 11px;
      font-weight: 700;
    }

    .chip ha-icon {
      --mdc-icon-size: 16px;
    }

    .feature-controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--fan-control-gap);
    }

    .feature-select,
    .nudge-control,
    .feature-button {
      min-width: 0;
      min-height: var(--fan-control-height);
      color: var(--fan-text);
    }

    .feature-button {
      padding: 11px;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-control);
      background: var(--fan-control-surface);
    }

    .feature-select,
    .nudge-control {
      display: grid;
      gap: 7px;
      color: var(--fan-text-muted);
      font-size: 11px;
      font-weight: 700;
    }

    .feature-select {
      align-self: start;
    }

    .feature-select,
    .nudge-control {
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    .feature-select > span,
    .nudge-control > span {
      color: color-mix(in srgb, var(--fan-text) 72%, transparent);
      font-size: 12px;
      font-weight: 700;
    }

    .feature-select select,
    .feature-select input[type="number"] {
      box-sizing: border-box;
      min-height: var(--fan-control-height);
      width: 100%;
      padding: 0 12px;
      border: 1px solid color-mix(in srgb, var(--fan-text) 36%, transparent);
      border-radius: var(--fan-radius-control);
      outline: none;
      background: var(--fan-control-surface);
      color: var(--input-ink-color, var(--fan-text));
      font-size: 14px;
      font-weight: 750;
    }

    .feature-select select:hover,
    .feature-select input[type="number"]:hover {
      border-color: color-mix(in srgb, var(--fan-accent) 64%, transparent);
    }

    .feature-select select:focus-visible,
    .feature-select input[type="number"]:focus-visible {
      border-color: var(--fan-focus);
    }

    .feature-button {
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }

    .feature-button ha-icon {
      flex: 0 0 auto;
      padding: 8px;
      border-radius: 11px;
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .feature-button span {
      display: grid;
      gap: 2px;
    }

    .feature-button small {
      color: var(--fan-text-muted);
      font-size: 10px;
    }

    .feature-button strong {
      font-size: 13px;
    }

    .feature-button.selected {
      border-color: var(--fan-accent-soft);
      background: var(--fan-accent-soft);
    }

    .nudge-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-areas:
        ". up ."
        "left center right"
        ". down .";
      align-items: center;
      justify-items: center;
      gap: 6px;
      max-width: 180px;
      margin: 0 auto;
      padding: 6px;
      border: 1px solid var(--fan-border);
      border-radius: 16px;
      background: color-mix(in srgb, var(--fan-panel) 72%, transparent);
    }

    .nudge-grid button {
      width: 44px;
      min-height: 44px;
      padding: 0;
      border-radius: 50%;
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .nudge-grid button:nth-child(1) {
      grid-area: up;
    }

    .nudge-grid button:nth-child(2) {
      grid-area: left;
    }

    .nudge-grid button:nth-child(3) {
      grid-area: right;
    }

    .nudge-grid button:nth-child(4) {
      grid-area: down;
    }

    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 120px;
      padding: 20px;
      color: var(--fan-text-muted);
      text-align: center;
    }

    .action-error {
      margin: 0 14px 14px;
      padding: 10px 12px;
      border: 1px solid var(--error-color, #db4437);
      border-radius: 12px;
      color: var(--error-color, #db4437);
      font-size: 12px;
    }

    .theme-minimal {
      --fan-surface: transparent;
      --fan-panel: transparent;
      --fan-radius-card: 12px;
      --fan-radius-panel: 12px;
      --fan-radius-control: 8px;
      --fan-visual-size: 250px;
      --fan-shadow: none;
      box-shadow: none;
    }

    .theme-mushroom {
      --fan-panel: color-mix(in srgb, var(--fan-accent) 8%, var(--fan-background));
      --fan-radius-card: 30px;
      --fan-radius-panel: 24px;
      --fan-radius-control: 14px;
      --fan-visual-size: 270px;
      --fan-shadow: 0 14px 32px rgb(0 0 0 / 10%);
    }

    .theme-glass {
      --fan-panel: color-mix(in srgb, var(--fan-background) 28%, transparent);
      --fan-radius-card: 28px;
      --fan-radius-panel: 20px;
      --fan-radius-control: 14px;
      --fan-shadow: 0 20px 50px rgb(0 0 0 / 18%);
      background: color-mix(in srgb, var(--fan-background) 54%, transparent);
      backdrop-filter: blur(18px);
    }

    .theme-industrial {
      --fan-accent: var(--state-fan-active-color, #e9a23b);
      --fan-radius-card: 8px;
      --fan-radius-panel: 6px;
      --fan-radius-control: 4px;
      --fan-panel: color-mix(in srgb, #e9a23b 5%, var(--fan-background));
      --fan-shadow: none;
      --fan-display-font: ui-monospace, SFMono-Regular, Menlo, monospace;
      --fan-visual-size: 270px;
    }

    .theme-industrial .value,
    .theme-industrial .speed-readout strong,
    .theme-industrial .feature-button strong {
      font-family: var(--fan-display-font);
    }

    @keyframes rotor-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes wind-horizontal-flow {
      0% {
        transform: translateX(-20px) scaleX(0.5);
      }
      50% {
        transform: translateX(20px) scaleX(1);
      }
      100% {
        transform: translateX(65px) scaleX(0.5);
      }
    }

    @keyframes wind-vertical-flow {
      0% {
        transform: translateY(-20px) scaleY(0.5);
      }
      50% {
        transform: translateY(20px) scaleY(1);
      }
      100% {
        transform: translateY(65px) scaleY(0.5);
      }
    }

    @keyframes orbit-horizontal {
      0%,
      100% {
        transform: rotate(18deg) scaleX(1);
      }
      50% {
        transform: rotate(18deg) scaleX(0.7);
      }
    }

    @keyframes orbit-vertical {
      0%,
      100% {
        transform: rotate(-26deg) scaleY(1);
      }
      50% {
        transform: rotate(-26deg) scaleY(0.7);
      }
    }

    .density-compact {
      --fan-control-height: 44px;
      --fan-control-gap: 6px;
      --fan-panel-padding: 12px;
      --fan-header-padding: 12px 12px 0;
    }

    .density-comfortable {
      --fan-control-height: 48px;
    }

    .columns-one .feature-controls {
      grid-template-columns: minmax(0, 1fr);
    }

    .columns-two .feature-controls {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @container (max-width: 419px) {
      .feature-controls {
        grid-template-columns: minmax(0, 1fr);
      }

      .columns-two .feature-controls {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @media (max-width: 419px) {
      .feature-controls {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @container (max-width: 360px) {
      .header {
        padding: 10px 12px 0;
      }

      .visual-meta {
        gap: 8px;
        font-size: 9px;
        flex-wrap: wrap;
      }

      .chip,
      .level-button,
      .preset-button {
        font-size: 10px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .running .rotor,
      .axis-horizontal .orbit-one,
      .axis-vertical .orbit-two,
      .axis-dual .orbit-one,
      .axis-dual .orbit-two,
      .axis-horizontal .wind-horizontal,
      .axis-vertical .wind-vertical,
      .axis-dual .wind-horizontal,
      .axis-dual .wind-vertical {
        animation: none !important;
      }
    }
  `;
}

if (!customElements.get("xiaomi-fan-card")) {
  customElements.define("xiaomi-fan-card", XiaomiFanCard);
}
