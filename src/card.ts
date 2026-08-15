import { LitElement, css, html, type CSSResultGroup, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  handleAction,
  hasConfigOrEntityChanged,
  type HomeAssistant,
  type LovelaceCardEditor,
} from "custom-card-helpers";
import { createFanAdapter } from "./adapters";
import { DEFAULT_CONFIG, normalizeCardConfig } from "./config";
import "./editor";
import { getConfigForm } from "./editor-schema";
import { loadServiceAvailability } from "./services/service-dispatcher";
import { resolveRelatedEntities } from "./state/related-entities";
import { getAirflowAxis } from "./state/visual-state";
import { createTranslator, type TranslationKey, type TranslationValues, type Translator } from "./translations";
import type {
  FanAdapter,
  FanCardConfig,
  FanBlock,
  HassLike,
  RelatedEntities,
  ResolvedFanCardConfig,
  ServiceAvailability,
  FanStyleBlock,
} from "./types";

const TIMER_STEPS = [0, 60, 120, 180, 240, 300, 360, 420, 480];
const STYLE_VARIABLES: Record<keyof FanStyleBlock, string> = {
  accent: "accent",
  background: "background",
  border: "border",
  border_radius: "border-radius",
  color: "color",
  font_size: "font-size",
  gap: "gap",
  height: "height",
  padding: "padding",
  shadow: "shadow",
  size: "size",
};

/**
 * Accent drives every tint through color-mix, so it has to land on the shared
 * variable instead of a block scoped one, and inline styles are what lets it
 * win over a theme class.
 */
const GLOBAL_STYLE_VARIABLES: Partial<Record<keyof FanStyleBlock, string>> = {
  accent: "--fan-accent",
};

const asHassLike = (hass: HomeAssistant): HassLike => hass as unknown as HassLike;

const styleMapFor = (group: FanStyleBlock, prefix: string): Record<string, string> =>
  Object.entries(group).reduce<Record<string, string>>((styles, [key, value]) => {
    const token = key as keyof FanStyleBlock;
    const variable = STYLE_VARIABLES[token];
    if (variable && typeof value === "string") {
      styles[GLOBAL_STYLE_VARIABLES[token] ?? `--${prefix}-${variable}`] = value;
    }
    return styles;
  }, {});

export class XiaomiFanCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config: ResolvedFanCardConfig = normalizeCardConfig(DEFAULT_CONFIG);

  @state() private services: ServiceAvailability = { loaded: false, names: new Set() };

  @state() private related: RelatedEntities = {};

  @state() private actionError = "";

  @state() private speedPreview?: number;

  private speedDragging = false;
  private serviceLoadKey = "";
  private loadRequestId = 0;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private retryDelay = 0;
  private translatorLanguage = "";
  private translator: Translator = createTranslator();

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement("xiaomi-fan-card-editor") as LovelaceCardEditor;
  }

  public static getConfigForm() {
    return getConfigForm();
  }

  public static getStubConfig(): Partial<FanCardConfig> {
    return {
      ...DEFAULT_CONFIG,
      name: "Xiaomi Fan",
    };
  }

  public getCardSize(): number {
    return this.estimatedRows();
  }

  public getGridOptions(): { columns: number; rows: number; min_columns: number; min_rows: number } {
    const rows = this.estimatedRows();
    return { columns: 12, rows, min_columns: 6, min_rows: Math.min(rows, 2) };
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
      changedProperties.has("actionError") ||
      changedProperties.has("speedPreview")
    );
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("hass") && this.speedPreview !== undefined && !this.speedDragging) {
      this.speedPreview = undefined;
    }

    const entityId = this.config.entity;
    const loadKey = `${entityId}:${this.config.integration ?? "auto"}`;
    if (!entityId || !this.hass || this.serviceLoadKey === loadKey) {
      return;
    }

    this.serviceLoadKey = loadKey;
    void this.loadCapabilities(entityId, loadKey);
  }

  public connectedCallback(): void {
    super.connectedCallback();
    // A card that comes back from a suspended tab or a rebuilt view has to look
    // the service registry up again instead of trusting a stale lookup.
    this.serviceLoadKey = "";
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearCapabilityRetry();
  }

  private async loadCapabilities(entityId: string, loadKey: string): Promise<void> {
    const hass = asHassLike(this.hass);
    const requestId = ++this.loadRequestId;
    const shouldLoadCustomServices = this.config.integration !== "standard";
    const [services, discovered] = await Promise.all([
      shouldLoadCustomServices
        ? loadServiceAvailability(hass)
        : Promise.resolve<ServiceAvailability>({ loaded: true, names: new Set() }),
      resolveRelatedEntities(hass, entityId),
    ]);

    // hass is replaced on every state update, so only the request, the entity,
    // and the loader key decide whether this answer is still wanted.
    if (requestId !== this.loadRequestId || this.config.entity !== entityId || this.serviceLoadKey !== loadKey) {
      return;
    }

    if (!services.loaded || discovered === undefined) {
      // Home Assistant was unreachable. Keeping the previous capabilities stops
      // the card from degrading to a plain fan until the retry succeeds.
      this.scheduleCapabilityRetry(entityId, loadKey);
      return;
    }

    this.clearCapabilityRetry();
    this.services = services;
    this.related = this.withConfiguredRelatedEntities(discovered);
  }

  private scheduleCapabilityRetry(entityId: string, loadKey: string): void {
    if (this.retryTimer !== undefined) {
      return;
    }

    this.retryDelay = Math.min(this.retryDelay === 0 ? 2000 : this.retryDelay * 2, 30000);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      if (this.config.entity !== entityId || this.serviceLoadKey !== loadKey || !this.hass) {
        return;
      }

      void this.loadCapabilities(entityId, loadKey);
    }, this.retryDelay);
  }

  private clearCapabilityRetry(): void {
    if (this.retryTimer !== undefined) {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }

    this.retryDelay = 0;
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

    const sections: Record<FanBlock, TemplateResult | string> = {
      header: this.config.header.show ? this.renderHeader(adapter) : html``,
      visual: this.config.visual.show ? this.renderVisual(adapter) : html``,
      airflow: this.config.controls.show ? this.renderAirflowControls(adapter) : html``,
      position: this.config.controls.show ? this.renderPositionControls(adapter) : html``,
      features: this.config.controls.show ? this.renderFeatureControls(adapter) : html``,
    };

    return html`
      <ha-card class="card ${this.themeClass}" style=${styleMap(styleMapFor(this.config.styles.card, "fan-card"))}>
        ${this.config.layout.order.map((section) => sections[section])}
        ${
          this.actionError
            ? html`<div class="action-error" role="alert">
                <ha-icon icon="mdi:alert-circle-outline" aria-hidden="true"></ha-icon>
                <span>${this.actionError}</span>
              </div>`
            : ""
        }
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

  private estimatedRows(): number {
    const { header, visual, controls } = this.config;
    let rows = 1;

    if (header.show) {
      rows += header.variant === "full" ? 2 : 1;
    }

    if (visual.show && visual.show_graphic) {
      rows += 5;
    } else if (visual.show && visual.show_details) {
      rows += 1;
    }

    if (controls.show) {
      if (controls.show_speed_slider || controls.show_speed_levels) {
        rows += 3;
      }

      if (controls.show_modes) {
        rows += 2;
      }

      rows += 2;
    }

    return rows;
  }

  private relatedUnit(kind: "temperature" | "humidity", fallback: string): string {
    const entityId =
      kind === "temperature"
        ? (this.config.temperature_entity ?? this.related.temperature)
        : (this.config.humidity_entity ?? this.related.humidity);
    const unit = entityId ? this.hass?.states[entityId]?.attributes["unit_of_measurement"] : undefined;
    return typeof unit === "string" && unit.trim() !== "" ? unit : fallback;
  }

  private relatedAngleValue(axis: "horizontal" | "vertical", fallback: number | undefined): number | undefined {
    const entityId =
      axis === "horizontal"
        ? (this.config.horizontal_angle_entity ?? this.related.horizontalAngle)
        : (this.config.vertical_angle_entity ?? this.related.verticalAngle);
    const raw = entityId ? this.hass?.states[entityId]?.state : undefined;
    if (typeof raw !== "string" || raw.trim() === "") {
      return fallback;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
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
      <header class="header" style=${styleMap(styleMapFor(this.config.styles.header, "fan-header"))}>
        <button class="title-button" @click=${this.onHeaderClick} aria-label=${this.t("open", { title })}>
          ${
            // The eyebrow names a Xiaomi product line, so a generic fan entity
            // must never claim it even when the full header is active.
            this.config.header.show_eyebrow && adapter.capabilities.isXiaomi
              ? html`<span class="eyebrow">${this.t("xiaomiAirCirculation")}</span>`
              : ""
          }
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
    const speed = this.speedPreview ?? (state.isOn ? state.percentage : 0);
    const style = `--speed:${speed}; --spin-duration:${Math.max(1.8, 12 - speed / 11)}s;`;
    const axis = getAirflowAxis(state.horizontalSwing, state.verticalSwing);
    const animationDisabled = this.config.disable_animation || this.config.visual.animation === "disabled";

    return html`
      <section
        class="visual-section details-${this.config.details.position} ${
          this.config.visual.show_graphic ? "details-with-graphic" : "details-only"
        }"
        aria-label=${this.t("fanStatus")}
        style=${styleMap({
          ...(this.config.visual.size === undefined ? {} : { "--fan-visual-size": `${this.config.visual.size}px` }),
          ...styleMapFor(this.config.styles.visual, "fan-visual"),
        })}
      >
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
                  <div class="speed-ring" aria-hidden="true"></div>
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
                            <strong>${speed}%</strong>
                            <small>${this.t("airflow")}</small>
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
    const horizontalAngle = this.relatedAngleValue("horizontal", state.horizontalAngle);
    const verticalAngle = this.relatedAngleValue("vertical", state.verticalAngle);

    if (!details.show) {
      return "";
    }

    const hasDetails =
      (details.show_horizontal_angle && adapter.capabilities.horizontalAngle && horizontalAngle !== undefined) ||
      (details.show_vertical_angle && adapter.capabilities.verticalAngle && verticalAngle !== undefined) ||
      (details.show_timer &&
        adapter.capabilities.timer &&
        (details.show_timer_when_off || Boolean(state.timerMinutes))) ||
      (details.show_temperature && state.temperature !== undefined) ||
      (details.show_humidity && state.humidity !== undefined);
    if (!hasDetails) {
      return "";
    }

    const temperatureUnit = this.relatedUnit("temperature", "°C");
    const humidityUnit = this.relatedUnit("humidity", "%");

    return html`
      <div class="visual-meta" role="list" style=${styleMap(styleMapFor(this.config.styles.details, "fan-details"))}>
        ${
          details.show_horizontal_angle && adapter.capabilities.horizontalAngle && horizontalAngle !== undefined
            ? this.renderMetaItem(
                "mdi:arrow-left-right",
                `${horizontalAngle}°`,
                this.t("horizontalAngleValue", { value: horizontalAngle }),
              )
            : ""
        }
        ${
          details.show_vertical_angle && adapter.capabilities.verticalAngle && verticalAngle !== undefined
            ? this.renderMetaItem(
                "mdi:swap-vertical",
                `${verticalAngle}°`,
                this.t("verticalAngleValue", { value: verticalAngle }),
              )
            : ""
        }
        ${
          details.show_timer && (details.show_timer_when_off || Boolean(state.timerMinutes))
            ? this.renderMetaItem(
                "mdi:timer-outline",
                this.displayTimer(state.timerMinutes),
                `${this.t("timer")}: ${this.displayTimer(state.timerMinutes)}`,
                Boolean(state.timerMinutes),
              )
            : ""
        }
        ${
          details.show_temperature && state.temperature !== undefined
            ? this.renderMetaItem(
                "mdi:thermometer",
                `${state.temperature}${temperatureUnit}`,
                `${this.t("temperature")}: ${state.temperature}${temperatureUnit}`,
              )
            : ""
        }
        ${
          details.show_humidity && state.humidity !== undefined
            ? this.renderMetaItem(
                "mdi:water-percent",
                `${state.humidity}${humidityUnit} RH`,
                `${this.t("humidity")}: ${state.humidity}${humidityUnit}`,
              )
            : ""
        }
      </div>
    `;
  }

  private renderMetaItem(icon: string, value: string, label: string, active = false) {
    return html`
      <span class="meta-item ${active ? "active" : ""}" role="listitem" aria-label=${label}>
        <ha-icon icon=${icon} aria-hidden="true"></ha-icon>
        <span class="meta-value">${value}</span>
      </span>
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

    // A stopped fan reports its last speed, which would otherwise make the
    // slider jump back to that value right after it was dragged to zero.
    const displayPercentage = this.speedPreview ?? (state.isOn ? state.percentage : 0);
    const displayLevel =
      this.speedPreview === undefined
        ? (state.isOn ? state.level : 0) || 0
        : Math.round((this.speedPreview / 100) * adapter.capabilities.speedLevels);

    return html`
      <section
        class="controls airflow-controls"
        aria-label=${this.t("airflow")}
        style=${styleMap(styleMapFor(this.config.styles.controls, "fan-control"))}
      >
        ${
          controls.show_speed_slider || controls.show_speed_levels
            ? html`
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">${this.t("airflow")}</span>
                    <strong>${this.t("speedLevel", { level: displayLevel })}</strong>
                  </div>
                  <span class="value">${displayPercentage}%</span>
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
                  .value=${String(displayPercentage)}
                  style=${styleMap({ "--fan-speed-progress": String(displayPercentage) })}
                  @input=${this.onPercentagePreview}
                  @change=${(event: Event) => this.onPercentageChange(event, adapter)}
                  aria-label=${this.t("fanSpeedPercentage")}
                  aria-valuetext="${displayPercentage}%"
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
                          class="level-button ${displayLevel === level ? "selected" : ""}"
                          @click=${() =>
                            this.execute(() =>
                              adapter.setPercentage(Math.round((level / adapter.capabilities.speedLevels) * 100)),
                            )}
                          aria-label=${this.t("setSpeedLevel", { level })}
                          aria-pressed=${displayLevel === level}
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
        <div class="chip-row" ?hidden=${!hasChipControls} role="group" aria-label=${this.t("swing")}>
          ${
            controls.show_horizontal_swing && adapter.capabilities.horizontalSwing
              ? html`
                  <button
                    class="chip ${state.horizontalSwing ? "selected" : ""}"
                    @click=${() => this.execute(() => adapter.setHorizontalSwing(!state.horizontalSwing))}
                    aria-pressed=${state.horizontalSwing}
                  >
                    <ha-icon icon="mdi:arrow-left-right"></ha-icon>
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

  private renderPositionControls(adapter: FanAdapter) {
    const state = adapter.state;
    const controls = this.config.controls;
    const horizontalAngle = this.relatedAngleValue("horizontal", state.horizontalAngle);
    const verticalAngle = this.relatedAngleValue("vertical", state.verticalAngle);
    const angleFeatures: unknown[] = [];
    const nudgeFeatures: unknown[] = [];

    if (controls.show_horizontal_angle && adapter.capabilities.horizontalAngle) {
      const angles = adapter.capabilities.horizontalAngles;
      angleFeatures.push(
        controls.angle_mode === "cycle" && angles.length > 0
          ? this.renderAngleCycleButton(
              this.t("horizontalAngle"),
              horizontalAngle,
              angles,
              (angle) => this.execute(() => adapter.setHorizontalAngle(angle)),
              "mdi:arrow-left-right",
            )
          : this.renderAngleControl(this.t("horizontalAngle"), horizontalAngle, angles, (angle) =>
              this.execute(() => adapter.setHorizontalAngle(angle)),
            ),
      );
    }

    if (controls.show_vertical_angle && adapter.capabilities.verticalAngle) {
      const angles = adapter.capabilities.verticalAngles;
      angleFeatures.push(
        controls.angle_mode === "cycle" && angles.length > 0
          ? this.renderAngleCycleButton(
              this.t("verticalAngle"),
              verticalAngle,
              angles,
              (angle) => this.execute(() => adapter.setVerticalAngle(angle)),
              "mdi:swap-vertical",
            )
          : this.renderAngleControl(this.t("verticalAngle"), verticalAngle, angles, (angle) =>
              this.execute(() => adapter.setVerticalAngle(angle)),
            ),
      );
    }

    const hasAutomaticAngle =
      (controls.show_horizontal_angle && adapter.capabilities.horizontalAngle) ||
      (controls.show_vertical_angle && adapter.capabilities.verticalAngle);
    if (
      controls.show_nudge &&
      adapter.capabilities.directionNudge &&
      (!hasAutomaticAngle || controls.show_nudge_with_angles)
    ) {
      nudgeFeatures.push(html`
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

    if (angleFeatures.length === 0 && nudgeFeatures.length === 0) {
      return "";
    }

    const hasTwoColumns = angleFeatures.length > 0 && nudgeFeatures.length > 0;
    return html`
      <div
        class="angle-layout ${hasTwoColumns ? "two-column" : "single-column"}"
        style=${styleMap(styleMapFor(this.config.styles.controls, "fan-control"))}
      >
        ${
          angleFeatures.length > 0
            ? html`<section class="controls angle-controls" aria-label=${this.t("angleMode")}>
                ${angleFeatures}
              </section>`
            : ""
        }
        ${
          nudgeFeatures.length > 0
            ? html`<section class="controls nudge-controls" aria-label=${this.t("position")}>${nudgeFeatures}</section>`
            : ""
        }
      </div>
    `;
  }

  private renderFeatureControls(adapter: FanAdapter) {
    const state = adapter.state;
    const controls = this.config.controls;
    const features: unknown[] = [];

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
      ? html`<section
          class="controls feature-controls"
          aria-label=${this.t("fanFeatures")}
          style=${styleMap(styleMapFor(this.config.styles.controls, "fan-control"))}
        >
          ${features}
        </section>`
      : "";
  }

  private renderTimerCycleButton(adapter: FanAdapter, current: number | undefined, steps: number[] | undefined) {
    const nextTimer = this.nextTimer(current, steps);
    return html`
      <button
        class="feature-button ${current ? "selected" : ""}"
        @click=${() => this.execute(() => adapter.setTimer(nextTimer))}
      >
        <ha-icon icon="mdi:timer-outline"></ha-icon>
        <span><small>${this.t("timer")}</small><strong>${this.displayTimer(current)}</strong></span>
      </button>
    `;
  }

  private renderAngleCycleButton(
    label: string,
    current: number | undefined,
    angles: number[],
    onChange: (angle: number) => void,
    icon: string,
  ) {
    const nextAngle = this.nextAngle(current, angles);
    return html`
      <button class="feature-button angle-cycle-button" @click=${() => onChange(nextAngle)}>
        <ha-icon icon=${icon}></ha-icon>
        <span>
          <small>${label}</small>
          <strong>${current !== undefined ? `${current}°` : this.t("unavailable")}</strong>
        </span>
      </button>
    `;
  }

  private nextAngle(current: number | undefined, angles: number[]): number {
    return angles.find((angle) => angle > (current ?? -Infinity)) ?? angles[0] ?? current ?? 0;
  }

  private renderTimerSelector(adapter: FanAdapter, current: number | undefined, steps: number[]) {
    const options = steps.includes(current ?? 0) ? steps : [...steps, current ?? 0].sort((left, right) => left - right);
    return html`
      <label class="feature-select timer-select ${current ? "selected" : ""}">
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

  private onPercentagePreview = (event: Event): void => {
    this.speedDragging = true;
    this.speedPreview = Number((event.currentTarget as HTMLInputElement).value);
  };

  private onPercentageChange(event: Event, adapter: FanAdapter): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    this.speedDragging = false;
    this.speedPreview = value;
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

      /* Theme inputs */
      --fan-accent: var(--state-fan-active-color, var(--state-active-color, var(--primary-color, #5c8dff)));
      --fan-background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      --fan-text: var(--primary-text-color, #f5f7fb);
      --fan-text-muted: var(--secondary-text-color, #9aa0ab);
      --fan-focus: var(--ha-focus-color, var(--primary-color, var(--fan-accent)));
      --fan-error: var(--error-color, #db4437);

      /* Geometry */
      --fan-radius-card: var(--ha-card-border-radius, 24px);
      --fan-radius-panel: 18px;
      --fan-radius-control: 12px;
      --fan-radius-pill: 999px;
      --fan-gutter: 16px;
      --fan-block-gap: 12px;
      --fan-panel-padding: 16px;
      --fan-control-height: 48px;
      --fan-control-gap: 10px;
      --fan-visual-size: 300px;

      /* Type scale */
      --fan-font-micro: 11px;
      --fan-font-small: 12px;
      --fan-font-body: 14px;
      --fan-font-title: 18px;
      --fan-font-metric: 24px;
      --fan-tracking-micro: 0.08em;
      --fan-display-font: inherit;
      --fan-label-transform: none;

      /* Motion */
      --fan-transition: 160ms cubic-bezier(0.2, 0, 0.2, 1);
    }

    [hidden] {
      display: none !important;
    }

    /*
     * Derived colors live on ha-card, not :host, so a theme class on the same
     * element can override --fan-accent and every tint recomputes with it.
     */
    ha-card {
      --fan-accent-soft: color-mix(in srgb, var(--fan-accent) 16%, transparent);
      --fan-accent-hover: color-mix(in srgb, var(--fan-accent) 26%, transparent);
      --fan-surface: var(--fan-background);
      --fan-panel: color-mix(in srgb, var(--fan-text) 5%, transparent);
      --fan-panel-hover: color-mix(in srgb, var(--fan-text) 9%, transparent);
      --fan-control-surface: color-mix(in srgb, var(--fan-text) 7%, transparent);
      --fan-border: color-mix(in srgb, var(--fan-text) 14%, transparent);
      --fan-border-strong: color-mix(in srgb, var(--fan-text) 26%, transparent);
      --fan-shadow: var(--ha-card-box-shadow, 0 10px 28px rgb(0 0 0 / 12%));

      display: flex;
      flex-direction: column;
      gap: var(--fan-card-gap, var(--fan-block-gap));
      overflow: hidden;
      padding: var(--fan-card-padding, var(--fan-gutter));
      border: var(--fan-card-border, 1px solid var(--fan-border));
      border-radius: var(--fan-card-border-radius, var(--fan-radius-card));
      background: var(--fan-card-background, var(--fan-surface));
      color: var(--fan-card-color, var(--fan-text));
      font-size: var(--fan-card-font-size, inherit);
      box-shadow: var(--fan-card-shadow, var(--fan-shadow));
    }

    button,
    select,
    input {
      font: inherit;
      color: inherit;
    }

    button {
      border: 0;
      cursor: pointer;
      touch-action: manipulation;
    }

    button:focus-visible,
    select:focus-visible,
    input:focus-visible {
      outline: 2px solid var(--fan-focus);
      outline-offset: 2px;
    }

    /* Header */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fan-header-gap, 12px);
      min-width: 0;
      padding: var(--fan-header-padding, 0);
      border: var(--fan-header-border, 0 solid transparent);
      border-radius: var(--fan-header-border-radius, 0);
      background: var(--fan-header-background, transparent);
      color: var(--fan-header-color, inherit);
      font-size: var(--fan-header-font-size, inherit);
      box-shadow: var(--fan-header-shadow, none);
    }

    .header-full .header {
      margin: 0 calc(-1 * var(--fan-gutter));
      padding: var(--fan-header-padding, 0 var(--fan-gutter) 14px);
      border-bottom: 1px solid var(--fan-border);
    }

    .header-full .title {
      font-size: 20px;
    }

    .header-full .eyebrow {
      color: var(--fan-accent);
    }

    .title-button {
      display: grid;
      gap: 4px;
      min-width: 0;
      min-height: 44px;
      align-content: center;
      padding: 0;
      border-radius: var(--fan-radius-control);
      background: transparent;
      color: inherit;
      text-align: left;
      transition: opacity var(--fan-transition);
    }

    .eyebrow {
      color: var(--fan-text-muted);
      font-size: var(--fan-font-micro);
      font-weight: 700;
      letter-spacing: var(--fan-tracking-micro);
      text-transform: uppercase;
    }

    .title {
      min-width: 0;
      overflow: hidden;
      font-size: var(--fan-font-title);
      font-weight: 700;
      letter-spacing: -0.01em;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .subtitle {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      min-width: 0;
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--fan-text-muted);
      transition: background-color var(--fan-transition);
    }

    .status-dot.on {
      background: var(--fan-accent);
      box-shadow: 0 0 0 4px var(--fan-accent-soft);
    }

    .model-badge {
      flex: 0 0 auto;
      padding: 6px 10px;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-pill);
      color: var(--fan-text-muted);
      font-size: var(--fan-font-micro);
      font-weight: 700;
      letter-spacing: var(--fan-tracking-micro);
    }

    /* Visual status */
    .visual-section {
      display: grid;
      gap: var(--fan-visual-gap, var(--fan-block-gap));
      padding: var(--fan-visual-padding, 0);
      border: var(--fan-visual-border, 0 solid transparent);
      border-radius: var(--fan-visual-border-radius, 0);
      background: var(--fan-visual-background, transparent);
      color: var(--fan-visual-color, inherit);
      box-shadow: var(--fan-visual-shadow, none);
    }

    .details-side.details-with-graphic {
      grid-template-columns: minmax(0, 1fr) minmax(112px, auto);
      align-items: center;
    }

    .details-side.details-with-graphic .visual-meta {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
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
      inset: 14%;
      border: 1px solid var(--fan-accent-soft);
      border-radius: 50%;
      content: "";
    }

    .speed-ring {
      position: absolute;
      inset: 6%;
      border-radius: 50%;
      background:
        conic-gradient(from -90deg, var(--fan-accent) calc(var(--speed, 0) * 1%), transparent 0),
        color-mix(in srgb, var(--fan-text) 10%, transparent);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px));
      opacity: 0.9;
      transition: background var(--fan-transition);
    }

    .orbit {
      position: absolute;
      border: 1px solid color-mix(in srgb, var(--fan-accent) 22%, transparent);
      border-radius: 50%;
      transform: rotate(18deg);
    }

    .orbit-one {
      width: 74%;
      height: 30%;
    }

    .orbit-two {
      width: 86%;
      height: 44%;
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
      width: 40%;
      height: 4px;
      border-radius: var(--fan-radius-pill);
      background: linear-gradient(90deg, transparent, var(--fan-accent), transparent);
      opacity: 0;
      transition: opacity var(--fan-transition);
    }

    .running .wind-horizontal,
    .running .wind-vertical {
      opacity: 0.65;
    }

    .wind-horizontal {
      transform: translateY(-44px) rotate(-12deg);
    }

    .wind-vertical {
      width: 4px;
      height: 40%;
      background: linear-gradient(180deg, transparent, var(--fan-accent), transparent);
      transform: translateY(44px) rotate(12deg);
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
      border: 12px solid color-mix(in srgb, var(--fan-accent) 16%, var(--fan-background));
      border-radius: 50%;
      background: color-mix(in srgb, var(--fan-accent) 7%, var(--fan-background));
      box-shadow:
        inset 0 0 0 1px var(--fan-accent-soft),
        0 16px 36px rgb(0 0 0 / 16%);
    }

    .running .rotor {
      animation: rotor-spin var(--spin-duration) linear infinite;
    }

    .airflow-visual:not(.running) .rotor {
      opacity: 0.55;
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

    .airflow-visual.no-motion *,
    .airflow-visual.no-motion::before {
      animation: none !important;
    }

    .power-button {
      position: absolute;
      z-index: 3;
      display: grid;
      place-items: center;
      width: 60px;
      height: 60px;
      border: 5px solid var(--fan-background);
      border-radius: 50%;
      /* Opaque so the icon keeps card-level contrast over the lit blades. */
      background: var(--fan-background);
      color: var(--fan-text);
      box-shadow:
        0 0 0 1px var(--fan-border),
        0 8px 24px rgb(0 0 0 / 18%);
      transition:
        background-color var(--fan-transition),
        color var(--fan-transition),
        transform var(--fan-transition);
    }

    .power-button.active {
      background: var(--fan-accent);
      color: var(--text-primary-color, #fff);
    }

    .power-button:active {
      transform: scale(0.94);
    }

    .power-button ha-icon {
      --mdc-icon-size: 26px;
    }

    .speed-readout {
      position: absolute;
      right: 2%;
      bottom: 6%;
      z-index: 4;
      display: grid;
      justify-items: end;
      gap: 2px;
      padding: 6px 10px;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-control);
      background: color-mix(in srgb, var(--fan-background) 88%, var(--fan-text));
      color: var(--fan-text-muted);
    }

    .speed-readout strong {
      color: var(--fan-text);
      font-family: var(--fan-display-font);
      font-size: 22px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .speed-readout small {
      font-size: var(--fan-font-micro);
      font-weight: 700;
      letter-spacing: var(--fan-tracking-micro);
    }

    /* Detail chips */
    .visual-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--fan-details-gap, 8px);
      padding: var(--fan-details-padding, 0);
      border: var(--fan-details-border, 0 solid transparent);
      border-radius: var(--fan-details-border-radius, 0);
      background: var(--fan-details-background, transparent);
      box-shadow: var(--fan-details-shadow, none);
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: var(--fan-radius-pill);
      background: var(--fan-panel);
      color: var(--fan-details-color, var(--fan-text-muted));
      font-size: var(--fan-details-font-size, var(--fan-font-small));
      font-weight: 600;
      white-space: nowrap;
    }

    .meta-item ha-icon {
      --mdc-icon-size: 15px;
      flex: 0 0 auto;
    }

    .meta-item.active {
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    /* Control panels */
    .controls {
      padding: var(--fan-control-padding, var(--fan-panel-padding));
      border: var(--fan-control-border, 1px solid var(--fan-border));
      border-radius: var(--fan-control-border-radius, var(--fan-radius-panel));
      background: var(--fan-control-background, var(--fan-panel));
      color: var(--fan-control-color, var(--fan-text));
      font-size: var(--fan-control-font-size, inherit);
      box-shadow: var(--fan-control-shadow, none);
    }

    .airflow-controls {
      display: grid;
      gap: 12px;
    }

    .section-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 12px;
    }

    .section-heading div {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .section-heading strong {
      font-size: var(--fan-font-body);
      font-weight: 700;
    }

    .value {
      color: var(--fan-accent);
      font-family: var(--fan-display-font);
      font-size: var(--fan-font-metric);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    /* Speed slider */
    .speed-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 44px;
      margin: 0;
      background: transparent;
      cursor: pointer;
    }

    .speed-slider::-webkit-slider-runnable-track {
      height: 12px;
      border-radius: var(--fan-radius-pill);
      background: linear-gradient(
        to right,
        var(--fan-accent) 0 calc(var(--fan-speed-progress, 0) * 1%),
        color-mix(in srgb, var(--fan-text) 12%, transparent) calc(var(--fan-speed-progress, 0) * 1%) 100%
      );
    }

    .speed-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      margin-top: -5px;
      border: 3px solid var(--fan-accent);
      border-radius: 50%;
      background: var(--fan-surface);
      box-shadow: 0 2px 8px rgb(0 0 0 / 24%);
      transition: box-shadow var(--fan-transition);
    }

    .speed-slider::-moz-range-track {
      height: 12px;
      border-radius: var(--fan-radius-pill);
      background: color-mix(in srgb, var(--fan-text) 12%, transparent);
    }

    .speed-slider::-moz-range-progress {
      height: 12px;
      border-radius: var(--fan-radius-pill);
      background: var(--fan-accent);
    }

    .speed-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border: 3px solid var(--fan-accent);
      border-radius: 50%;
      background: var(--fan-surface);
    }

    .speed-slider:focus-visible {
      outline: none;
    }

    .speed-slider:focus-visible::-webkit-slider-thumb {
      box-shadow: 0 0 0 4px var(--fan-accent-hover);
    }

    .speed-slider:focus-visible::-moz-range-thumb {
      box-shadow: 0 0 0 4px var(--fan-accent-hover);
    }

    /* Segmented rows */
    .level-row,
    .chip-row,
    .preset-row,
    .mode-row {
      display: grid;
      gap: 8px;
    }

    .level-row {
      grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
    }

    .chip-row {
      grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
    }

    .preset-row {
      grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    }

    .mode-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .level-button,
    .chip,
    .preset-button,
    .mode-button {
      min-height: max(44px, var(--fan-control-height));
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-control);
      background: transparent;
      color: var(--fan-text-muted);
      transition:
        background-color var(--fan-transition),
        border-color var(--fan-transition),
        color var(--fan-transition),
        transform var(--fan-transition);
    }

    .level-button {
      font-size: var(--fan-font-body);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .chip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 10px;
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .chip ha-icon {
      --mdc-icon-size: 17px;
      flex: 0 0 auto;
    }

    .preset-button {
      padding: 0 10px;
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .mode-button {
      display: grid;
      justify-items: center;
      gap: 6px;
      padding: 8px 6px;
      border-radius: var(--fan-radius-panel);
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .mode-icon {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--fan-panel-hover);
      transition:
        background-color var(--fan-transition),
        color var(--fan-transition);
    }

    .mode-icon ha-icon {
      --mdc-icon-size: 20px;
    }

    .level-button.selected,
    .chip.selected,
    .preset-button.selected,
    .mode-button.selected {
      border-color: color-mix(in srgb, var(--fan-accent) 45%, transparent);
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .mode-button.selected .mode-icon {
      background: var(--fan-accent);
      color: var(--text-primary-color, #fff);
    }

    .mode-section,
    .preset-section {
      display: grid;
      gap: 8px;
    }

    .control-label {
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
      font-weight: 600;
      letter-spacing: var(--fan-label-tracking, normal);
      text-transform: var(--fan-label-transform);
    }

    /* Position and feature panels */
    .angle-layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--fan-control-gap, 10px);
    }

    .angle-layout.single-column {
      grid-template-columns: minmax(0, 1fr);
    }

    .angle-controls,
    .feature-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
      gap: var(--fan-control-gap, 10px);
      align-content: start;
    }

    .angle-controls {
      grid-template-columns: minmax(0, 1fr);
    }

    .nudge-controls {
      display: grid;
      align-content: center;
      justify-items: center;
    }

    .nudge-control {
      display: grid;
      gap: 8px;
      justify-items: center;
      width: 100%;
    }

    .feature-select,
    .nudge-control {
      min-width: 0;
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .feature-select {
      position: relative;
      display: grid;
      gap: 6px;
      align-self: start;
    }

    .feature-select > span,
    .nudge-control > span {
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
      font-weight: 600;
      letter-spacing: var(--fan-label-tracking, normal);
      text-transform: var(--fan-label-transform);
    }

    .feature-select.selected > span {
      color: var(--fan-accent);
    }

    .feature-select select,
    .feature-select input[type="number"] {
      box-sizing: border-box;
      width: 100%;
      min-height: max(44px, var(--fan-control-height));
      padding: 0 12px;
      border: 1px solid var(--fan-border-strong);
      border-radius: var(--fan-radius-control);
      outline: none;
      background: var(--fan-control-surface);
      color: var(--fan-text);
      font-size: var(--fan-font-body);
      font-weight: 600;
      transition:
        border-color var(--fan-transition),
        background-color var(--fan-transition),
        color var(--fan-transition);
    }

    .feature-select select {
      -webkit-appearance: none;
      appearance: none;
      padding-right: 32px;
    }

    .feature-select:has(select)::after {
      position: absolute;
      right: 14px;
      bottom: calc(max(44px, var(--fan-control-height)) / 2 - 5px);
      width: 7px;
      height: 7px;
      border-right: 2px solid var(--fan-text-muted);
      border-bottom: 2px solid var(--fan-text-muted);
      content: "";
      pointer-events: none;
      transform: rotate(45deg);
    }

    .feature-select.selected:has(select)::after {
      border-color: var(--fan-accent);
    }

    .feature-select select:focus-visible,
    .feature-select input[type="number"]:focus-visible {
      border-color: var(--fan-focus);
      outline: 2px solid var(--fan-focus);
      outline-offset: 1px;
    }

    .feature-select.selected select,
    .feature-select.selected input[type="number"] {
      border-color: color-mix(in srgb, var(--fan-accent) 55%, transparent);
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .feature-button {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      min-height: max(44px, var(--fan-control-height));
      padding: 10px 12px;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-control);
      background: var(--fan-control-surface);
      color: var(--fan-text);
      text-align: left;
      transition:
        background-color var(--fan-transition),
        border-color var(--fan-transition),
        transform var(--fan-transition);
    }

    .feature-button ha-icon {
      --mdc-icon-size: 20px;
      flex: 0 0 auto;
      padding: 7px;
      border-radius: 10px;
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .feature-button span {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    .feature-button small {
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
      font-weight: 600;
      letter-spacing: var(--fan-label-tracking, normal);
      text-transform: var(--fan-label-transform);
    }

    .feature-button strong {
      overflow: hidden;
      font-size: var(--fan-font-body);
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .feature-button.selected {
      border-color: color-mix(in srgb, var(--fan-accent) 45%, transparent);
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
      border-radius: var(--fan-radius-panel);
      background: var(--fan-panel);
    }

    .nudge-grid button {
      display: grid;
      place-items: center;
      width: 44px;
      min-height: 44px;
      padding: 0;
      border-radius: 50%;
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
      transition:
        background-color var(--fan-transition),
        transform var(--fan-transition);
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

    /* Hover and press feedback */
    @media (hover: hover) {
      .title-button:hover {
        opacity: 0.75;
      }

      .level-button:hover,
      .chip:hover,
      .preset-button:hover,
      .mode-button:hover,
      .feature-button:hover {
        border-color: var(--fan-border-strong);
        background: var(--fan-panel-hover);
        color: var(--fan-text);
      }

      .level-button.selected:hover,
      .chip.selected:hover,
      .preset-button.selected:hover,
      .mode-button.selected:hover,
      .feature-button.selected:hover {
        background: var(--fan-accent-hover);
        color: var(--fan-accent);
      }

      .nudge-grid button:hover {
        background: var(--fan-accent-hover);
      }

      .power-button:hover {
        background: color-mix(in srgb, var(--fan-background) 74%, var(--fan-accent));
      }

      .power-button.active:hover {
        background: color-mix(in srgb, var(--fan-accent) 88%, black);
      }

      .feature-select select:hover,
      .feature-select input[type="number"]:hover {
        border-color: color-mix(in srgb, var(--fan-accent) 60%, transparent);
      }
    }

    .level-button:active,
    .chip:active,
    .preset-button:active,
    .mode-button:active,
    .feature-button:active,
    .nudge-grid button:active {
      transform: scale(0.97);
    }

    /* Empty and error states */
    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 96px;
      color: var(--fan-text-muted);
      text-align: center;
    }

    .action-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border: 1px solid color-mix(in srgb, var(--fan-error) 55%, transparent);
      border-radius: var(--fan-radius-control);
      background: color-mix(in srgb, var(--fan-error) 12%, transparent);
      color: var(--fan-error);
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .action-error ha-icon {
      --mdc-icon-size: 18px;
      flex: 0 0 auto;
    }

    /* Themes */
    .theme-minimal {
      --fan-surface: transparent;
      --fan-panel: transparent;
      --fan-radius-card: 14px;
      --fan-radius-panel: 12px;
      --fan-radius-control: 10px;
      --fan-visual-size: 250px;
      --fan-shadow: none;
      --fan-card-border: 0 solid transparent;
      --fan-control-border: 0 solid transparent;
      --fan-panel-padding: 0;
      --fan-block-gap: 16px;
    }

    .theme-minimal .controls + .controls,
    .theme-minimal .angle-layout > .controls {
      border-top: 0;
    }

    .theme-mushroom {
      --fan-surface: color-mix(in srgb, var(--fan-background) 92%, var(--fan-accent));
      --fan-panel: color-mix(in srgb, var(--fan-accent) 10%, transparent);
      --fan-radius-card: 26px;
      --fan-radius-panel: 22px;
      --fan-radius-control: 14px;
      --fan-visual-size: 270px;
      --fan-shadow: 0 12px 30px rgb(0 0 0 / 10%);
      --fan-card-border: 0 solid transparent;
      --fan-control-border: 0 solid transparent;
    }

    .theme-mushroom .chip,
    .theme-mushroom .preset-button,
    .theme-mushroom .level-button {
      border-radius: var(--fan-radius-pill);
    }

    .theme-glass {
      --fan-surface: color-mix(in srgb, var(--fan-background) 58%, transparent);
      --fan-panel: color-mix(in srgb, var(--fan-text) 8%, transparent);
      --fan-border: color-mix(in srgb, var(--fan-text) 22%, transparent);
      --fan-radius-card: 26px;
      --fan-radius-panel: 20px;
      --fan-radius-control: 14px;
      --fan-shadow: 0 18px 44px rgb(0 0 0 / 20%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      backdrop-filter: blur(18px) saturate(140%);
    }

    .theme-industrial {
      /* Amber is this theme's identity, so it does not follow the Home
         Assistant fan color, which is usually the default accent. */
      --fan-accent: var(--fan-industrial-accent, #e9a23b);
      --fan-radius-card: 6px;
      --fan-radius-panel: 6px;
      --fan-radius-control: 4px;
      --fan-radius-pill: 4px;
      --fan-panel: color-mix(in srgb, var(--fan-accent) 6%, transparent);
      --fan-shadow: none;
      --fan-display-font: ui-monospace, SFMono-Regular, Menlo, monospace;
      --fan-label-transform: uppercase;
      --fan-label-tracking: 0.06em;
      --fan-visual-size: 270px;
    }

    /* Density */
    .density-compact {
      --fan-control-height: 44px;
      --fan-control-gap: 8px;
      --fan-panel-padding: 12px;
      --fan-block-gap: 8px;
      --fan-gutter: 12px;
      --fan-visual-size: 240px;
    }

    /* Column overrides */
    .columns-one .feature-controls,
    .columns-one .angle-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .columns-two .feature-controls {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .columns-two .angle-layout.two-column {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    /* Responsive behavior driven by the card width */
    @container (max-width: 460px) {
      .details-side.details-with-graphic {
        grid-template-columns: minmax(0, 1fr);
      }

      .details-side.details-with-graphic .visual-meta {
        flex-direction: row;
        justify-content: center;
      }

      .feature-controls,
      .columns-two .feature-controls,
      .angle-layout,
      .columns-two .angle-layout.two-column {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @container (max-width: 360px) {
      :host {
        --fan-gutter: 12px;
        --fan-panel-padding: 12px;
      }

      .chip-row {
        grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
      }

      .value {
        font-size: 20px;
      }

      .speed-readout strong {
        font-size: 18px;
      }
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

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation: none !important;
        transition-duration: 1ms !important;
      }

      .level-button:active,
      .chip:active,
      .preset-button:active,
      .mode-button:active,
      .feature-button:active,
      .nudge-grid button:active,
      .power-button:active {
        transform: none;
      }
    }

    @media (forced-colors: active) {
      ha-card,
      .controls,
      .level-button,
      .chip,
      .preset-button,
      .mode-button,
      .feature-button,
      .nudge-grid,
      .meta-item,
      .feature-select select,
      .feature-select input[type="number"] {
        border: 1px solid CanvasText;
      }

      .level-button.selected,
      .chip.selected,
      .preset-button.selected,
      .mode-button.selected,
      .feature-button.selected,
      .feature-select.selected select {
        outline: 2px solid Highlight;
        outline-offset: -2px;
      }

      .status-dot.on {
        background: Highlight;
      }
    }
  `;
}

if (!customElements.get("xiaomi-fan-card")) {
  customElements.define("xiaomi-fan-card", XiaomiFanCard);
}
