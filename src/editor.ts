import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";
import { fireEvent } from "custom-card-helpers";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { DEFAULT_CONFIG } from "./config";
import { createTranslator, type TranslationKey, type TranslationValues, type Translator } from "./translations";
import type { FanCardConfig } from "./types";

type BooleanConfigKey =
  "disable_animation" | "show_timer" | "show_child_lock" | "show_led" | "show_buzzer" | "show_ionizer";

export class XiaomiFanCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config: Partial<FanCardConfig> = {};
  private translatorLanguage = "";
  private translator: Translator = createTranslator();

  public setConfig(config: FanCardConfig): void {
    this.config = config;
  }

  protected render() {
    if (!this.hass) {
      return html``;
    }

    const entityIds = Object.keys(this.hass.states).filter((entityId) => entityId.startsWith("fan."));
    const config = { ...DEFAULT_CONFIG, ...this.config };

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
          <span>${this.t("visualTheme")}</span>
          <select .value=${config.theme} @change=${(event: Event) => this.onTextChange(event, "theme")}>
            <option value="auto">${this.t("auto")}</option>
            <option value="mushroom">${this.t("mushroom")}</option>
            <option value="minimal">${this.t("minimal")}</option>
            <option value="glass">${this.t("glass")}</option>
            <option value="industrial">${this.t("industrial")}</option>
          </select>
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
        ${this.booleanField("disable_animation", "disableAnimation", config.disable_animation)}
        ${this.booleanField("show_timer", "showTimer", config.show_timer)}
        ${this.booleanField("show_child_lock", "showChildLock", config.show_child_lock)}
        ${this.booleanField("show_led", "showLed", config.show_led)}
        ${this.booleanField("show_buzzer", "showBuzzer", config.show_buzzer)}
        ${this.booleanField("show_ionizer", "showIonizer", config.show_ionizer)}
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

  private booleanField(key: BooleanConfigKey, labelKey: TranslationKey, checked: boolean | undefined) {
    return html`
      <label class="checkbox">
        <input
          type="checkbox"
          .checked=${checked === true}
          @change=${(event: Event) => this.onBooleanChange(event, key)}
        />
        <span>${this.t(labelKey)}</span>
      </label>
    `;
  }

  private onEntityChange = (event: Event): void => {
    this.updateConfig("entity", (event.currentTarget as HTMLSelectElement).value);
  };

  private onTextChange = <K extends "name" | "theme" | "integration">(event: Event, key: K): void => {
    const value = (event.currentTarget as HTMLInputElement | HTMLSelectElement).value as FanCardConfig[K];
    this.updateConfig(key, value);
  };

  private onBooleanChange = (event: Event, key: BooleanConfigKey): void => {
    this.updateConfig(key, (event.currentTarget as HTMLInputElement).checked);
  };

  private updateConfig<K extends keyof FanCardConfig>(key: K, value: FanCardConfig[K]): void {
    const next = { ...this.config, [key]: value };
    if (value === DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG]) {
      delete next[key];
    }
    this.config = next;
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
