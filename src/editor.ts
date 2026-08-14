import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";
import type { TemplateResult } from "lit";
import { fireEvent } from "custom-card-helpers";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { DEFAULT_CONFIG, normalizeCardConfig } from "./config";
import {
  createTranslator,
  TRANSLATIONS,
  type TranslationKey,
  type TranslationValues,
  type Translator,
} from "./translations";
import { RELATED_ENTITY_DOMAINS } from "./types";
import type { FanCardConfig, FanRelatedEntitiesConfig, ResolvedFanCardConfig } from "./types";

type NestedGroup = "header" | "visual" | "controls" | "details" | "layout";

export class XiaomiFanCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config: ResolvedFanCardConfig = normalizeCardConfig(DEFAULT_CONFIG);
  private translatorLanguage = "";
  private translator: Translator = createTranslator();

  public setConfig(config: FanCardConfig): void {
    this.config = normalizeCardConfig(config);
  }

  protected render() {
    if (!this.hass) {
      return html``;
    }

    const entityIds = Object.keys(this.hass.states).filter((entityId) => entityId.startsWith("fan."));
    const config = this.config;

    return html`
      <div class="form">
        <label>
          <span>${this.t("editorFanEntity")}</span>
          <select .value=${config.entity} @change=${this.onEntityChange}>
            <option value="">${this.t("selectFanEntity")}</option>
            ${entityIds.map(
              (entityId) =>
                html`<option value=${entityId} ?selected=${entityId === config.entity}>${entityId}</option>`,
            )}
          </select>
        </label>
        <label>
          <span>${this.t("cardName")}</span>
          <input
            value=${config.name ?? ""}
            placeholder=${this.t("xiaomiFan")}
            @change=${(event: Event) => this.onTextChange(event, "name")}
          />
        </label>
        <label>
          <span>${this.t("integration")}</span>
          <select .value=${config.integration} @change=${(event: Event) => this.onTextChange(event, "integration")}>
            <option value="auto">${this.t("autoDetect")}</option>
            <option value="standard">${this.t("standardFan")}</option>
            <option value="xiaomi_miio">${this.t("nativeXiaomiHome")}</option>
            <option value="xiaomi_miio_fan">${this.t("xiaomiMiioFan")}</option>
            <option value="xiaomi_miot">${this.t("xiaomiMiot")}</option>
          </select>
        </label>
        <fieldset>
          <legend>${this.t("header")}</legend>
          ${this.nestedBooleanField("header", "show", "header", config.header.show)}
          ${this.nestedSelectField("header", "variant", "header", config.header.variant, ["full", "compact"])}
          ${this.nestedBooleanField("header", "show_eyebrow", "eyebrow", config.header.show_eyebrow)}
          ${this.nestedBooleanField("header", "show_name", "name", config.header.show_name)}
          ${this.nestedBooleanField("header", "show_status", "status", config.header.show_status)}
          ${this.nestedBooleanField("header", "show_mode", "mode", config.header.show_mode)}
          ${this.nestedBooleanField("header", "show_model", "model", config.header.show_model)}
        </fieldset>
        <fieldset>
          <legend>${this.t("visual")}</legend>
          ${this.nestedBooleanField("visual", "show", "visual", config.visual.show)}
          ${this.nestedBooleanField("visual", "show_graphic", "graphic", config.visual.show_graphic)}
          ${this.nestedBooleanField("visual", "show_power", "power", config.visual.show_power)}
          ${this.nestedBooleanField("visual", "show_speed", "speed", config.visual.show_speed)}
          ${this.nestedBooleanField("visual", "show_details", "details", config.visual.show_details)}
          ${this.nestedSelectField("visual", "animation", "animation", config.visual.animation, [
            "auto",
            "enabled",
            "disabled",
          ])}
        </fieldset>
        <fieldset>
          <legend>${this.t("controls")}</legend>
          ${this.nestedBooleanField("controls", "show", "controls", config.controls.show)}
          ${this.nestedBooleanField("controls", "show_speed_slider", "slider", config.controls.show_speed_slider)}
          ${this.nestedBooleanField("controls", "show_speed_levels", "levels", config.controls.show_speed_levels)}
          ${this.nestedBooleanField("controls", "show_modes", "modes", config.controls.show_modes)}
          ${this.nestedBooleanField("controls", "show_preset_mode", "preset", config.controls.show_preset_mode)}
          ${this.nestedBooleanField("controls", "show_horizontal_swing", "horizontal", config.controls.show_horizontal_swing)}
          ${this.nestedBooleanField("controls", "show_vertical_swing", "vertical", config.controls.show_vertical_swing)}
          ${this.nestedBooleanField("controls", "show_sleep", "sleep", config.controls.show_sleep)}
          ${this.nestedBooleanField("controls", "show_cycle", "cycle", config.controls.show_cycle)}
          ${this.nestedBooleanField("controls", "show_horizontal_angle", "horizontalAngle", config.controls.show_horizontal_angle)}
          ${this.nestedBooleanField("controls", "show_vertical_angle", "verticalAngle", config.controls.show_vertical_angle)}
          ${this.nestedBooleanField("controls", "show_nudge", "nudge", config.controls.show_nudge)}
          ${this.nestedBooleanField("controls", "show_direction", "direction", config.controls.show_direction)}
          ${this.nestedBooleanField("controls", "show_favorite_level", "favorite", config.controls.show_favorite_level)}
          ${this.nestedBooleanField("controls", "show_timer", "showTimer", config.controls.show_timer)}
          ${this.nestedBooleanField("controls", "show_child_lock", "showChildLock", config.controls.show_child_lock)}
          ${this.nestedBooleanField("controls", "show_led", "showLed", config.controls.show_led)}
          ${this.nestedBooleanField("controls", "show_buzzer", "showBuzzer", config.controls.show_buzzer)}
          ${this.nestedBooleanField("controls", "show_ionizer", "showIonizer", config.controls.show_ionizer)}
          ${this.nestedSelectField("controls", "selection_mode", "selectionMode", config.controls.selection_mode, [
            "auto",
            "buttons",
            "select",
          ])}
          ${this.nestedSelectField("controls", "timer_mode", "timerMode", config.controls.timer_mode, [
            "cycle",
            "select",
          ])}
        </fieldset>
        <fieldset>
          <legend>${this.t("details")}</legend>
          ${this.nestedBooleanField("details", "show", "details", config.details.show)}
          ${this.nestedBooleanField("details", "show_horizontal_angle", "horizontalAngle", config.details.show_horizontal_angle)}
          ${this.nestedBooleanField("details", "show_vertical_angle", "verticalAngle", config.details.show_vertical_angle)}
          ${this.nestedBooleanField("details", "show_timer", "showTimer", config.details.show_timer)}
          ${this.nestedBooleanField("details", "show_temperature", "temperature", config.details.show_temperature)}
          ${this.nestedBooleanField("details", "show_humidity", "humidity", config.details.show_humidity)}
        </fieldset>
        <fieldset>
          <legend>${this.t("layout")}</legend>
          ${this.nestedSelectField("layout", "theme", "visualTheme", config.layout.theme, [
            "auto",
            "mushroom",
            "minimal",
            "glass",
            "industrial",
          ])}
          ${this.nestedSelectField("layout", "density", "density", config.layout.density, ["comfortable", "compact"])}
          ${this.nestedSelectField("layout", "columns", "columns", config.layout.columns, ["auto", "one", "two"])}
        </fieldset>
        <fieldset>
          <legend>${this.t("relatedEntities")}</legend>
          ${this.relatedEntityField("horizontal_angle_entity", config.horizontal_angle_entity)}
          ${this.relatedEntityField("vertical_swing_entity", config.vertical_swing_entity)}
          ${this.relatedEntityField("vertical_angle_entity", config.vertical_angle_entity)}
          ${this.relatedEntityField("favorite_level_entity", config.favorite_level_entity)}
          ${this.relatedEntityField("sleep_mode_entity", config.sleep_mode_entity)}
          ${this.relatedEntityField("timer_entity", config.timer_entity)}
          ${this.relatedEntityField("child_lock_entity", config.child_lock_entity)}
          ${this.relatedEntityField("led_entity", config.led_entity)}
          ${this.relatedEntityField("buzzer_entity", config.buzzer_entity)}
          ${this.relatedEntityField("ionizer_entity", config.ionizer_entity)}
          ${this.relatedEntityField("temperature_entity", config.temperature_entity)}
          ${this.relatedEntityField("humidity_entity", config.humidity_entity)}
        </fieldset>
      </div>
    `;
  }

  private t(key: TranslationKey, values?: TranslationValues): string {
    const language = this.hass?.language ?? "";
    if (language !== this.translatorLanguage) {
      this.translatorLanguage = language;
      this.translator = createTranslator(language);
    }

    return this.translator(key, values);
  }

  private nestedBooleanField(
    group: NestedGroup,
    key: string,
    labelKey: TranslationKey,
    checked: boolean,
  ): TemplateResult {
    return html`
      <label class="checkbox">
        <input
          type="checkbox"
          .checked=${checked}
          @change=${(event: Event) => this.onNestedBooleanChange(event, group, key)}
        />
        <span>${this.t(labelKey)}</span>
      </label>
    `;
  }

  private nestedSelectField(
    group: NestedGroup,
    key: string,
    labelKey: TranslationKey,
    value: string,
    options: string[],
  ): TemplateResult {
    return html`
      <label>
        <span>${this.t(labelKey)}</span>
        <select .value=${value} @change=${(event: Event) => this.onNestedSelectChange(event, group, key)}>
          ${options.map(
            (option) =>
              html`<option value=${option} ?selected=${option === value}>${this.optionLabel(option)}</option>`,
          )}
        </select>
      </label>
    `;
  }

  private optionLabel(option: string): string {
    const key = option as TranslationKey;
    return key in TRANSLATIONS.en ? this.t(key) : option;
  }

  private relatedEntityField(key: keyof FanRelatedEntitiesConfig, value: string | undefined): TemplateResult {
    const labels: Record<keyof FanRelatedEntitiesConfig, TranslationKey> = {
      horizontal_angle_entity: "horizontalAngle",
      vertical_swing_entity: "vertical",
      vertical_angle_entity: "verticalAngle",
      favorite_level_entity: "favoriteLevel",
      sleep_mode_entity: "sleep",
      timer_entity: "timer",
      child_lock_entity: "childLock",
      led_entity: "led",
      buzzer_entity: "buzzer",
      ionizer_entity: "ionizer",
      temperature_entity: "temperature",
      humidity_entity: "humidity",
    };
    const entityIds = Object.keys(this.hass?.states ?? {})
      .filter((entityId) => RELATED_ENTITY_DOMAINS[key].some((domain) => domain === (entityId.split(".")[0] ?? "")))
      .sort();

    return html`
      <label>
        <span>${this.t(labels[key])}</span>
        <select .value=${value ?? ""} @change=${(event: Event) => this.onRelatedEntityChange(event, key)}>
          <option value="">${this.t("autoDetect")}</option>
          ${entityIds.map(
            (entityId) => html`<option value=${entityId} ?selected=${entityId === value}>${entityId}</option>`,
          )}
        </select>
      </label>
    `;
  }

  private onEntityChange = (event: Event): void => {
    this.updateConfig("entity", (event.currentTarget as HTMLSelectElement).value);
  };

  private onTextChange = <K extends "name" | "integration">(event: Event, key: K): void => {
    const value = (event.currentTarget as HTMLInputElement | HTMLSelectElement).value as FanCardConfig[K];
    this.updateConfig(key, value);
  };

  private onNestedBooleanChange = (event: Event, group: NestedGroup, key: string): void => {
    this.updateNestedConfig(group, key, (event.currentTarget as HTMLInputElement).checked);
  };

  private onNestedSelectChange = (event: Event, group: NestedGroup, key: string): void => {
    this.updateNestedConfig(group, key, (event.currentTarget as HTMLSelectElement).value);
  };

  private onRelatedEntityChange = (event: Event, key: keyof FanRelatedEntitiesConfig): void => {
    this.updateConfig(key, (event.currentTarget as HTMLSelectElement).value || undefined);
  };

  private updateNestedConfig(group: NestedGroup, key: string, value: boolean | string): void {
    const next = {
      ...this.config,
      [group]: {
        ...(this.config[group] ?? {}),
        [key]: value,
      },
    };
    this.config = normalizeCardConfig(next);
    fireEvent(this, "config-changed", { config: this.config });
  }

  private updateConfig<K extends keyof FanCardConfig>(key: K, value: FanCardConfig[K]): void {
    const next = { ...this.config, [key]: value };
    if (value === DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG]) {
      delete next[key];
    }
    this.config = normalizeCardConfig(next);
    fireEvent(this, "config-changed", { config: this.config });
  }

  static styles = css`
    :host {
      display: block;
    }

    .form {
      display: grid;
      gap: 16px;
    }

    fieldset {
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 12px;
    }

    legend {
      padding: 0 6px;
      color: var(--primary-text-color);
      font-weight: 600;
    }

    label {
      display: grid;
      gap: 6px;
      color: var(--primary-text-color);
      font-size: 14px;
    }

    select,
    input:not([type="checkbox"]) {
      box-sizing: border-box;
      width: 100%;
      min-height: 42px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    .checkbox {
      display: flex;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 10px;
    }
  `;
}

if (!customElements.get("xiaomi-fan-card-editor")) {
  customElements.define("xiaomi-fan-card-editor", XiaomiFanCardEditor);
}
