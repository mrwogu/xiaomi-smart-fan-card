import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";
import { fireEvent } from "custom-card-helpers";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { DEFAULT_CONFIG } from "./config";
import type { FanCardConfig } from "./types";

export class XiaomiFanCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config: Partial<FanCardConfig> = {};

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
          <span>Fan entity</span>
          <select .value=${config.entity} @change=${this.onEntityChange}>
            <option value="">Select fan entity</option>
            ${entityIds.map(
              (entityId) =>
                html`<option value=${entityId} ?selected=${entityId === config.entity}>${entityId}</option>`,
            )}
          </select>
        </label>
        <label>
          <span>Card name</span>
          <input
            value=${config.name ?? ""}
            placeholder="Xiaomi Fan"
            @change=${(event: Event) => this.onTextChange(event, "name")}
          />
        </label>
        <label>
          <span>Visual theme</span>
          <select .value=${config.theme} @change=${(event: Event) => this.onTextChange(event, "theme")}>
            <option value="auto">Auto</option>
            <option value="mushroom">Mushroom</option>
            <option value="minimal">Minimal</option>
            <option value="glass">Glass</option>
            <option value="industrial">Industrial</option>
          </select>
        </label>
        <label>
          <span>Integration</span>
          <select .value=${config.integration} @change=${(event: Event) => this.onTextChange(event, "integration")}>
            <option value="auto">Auto detect</option>
            <option value="standard">Standard fan</option>
            <option value="xiaomi_miio">Native Xiaomi Home (xiaomi_miio)</option>
            <option value="xiaomi_miio_fan">Xiaomi Miio fan</option>
            <option value="xiaomi_miot">Xiaomi Miot</option>
          </select>
        </label>
        ${this.booleanField("disable_animation", "Disable animation", config.disable_animation)}
        ${this.booleanField("show_timer", "Show timer", config.show_timer)}
        ${this.booleanField("show_child_lock", "Show child lock", config.show_child_lock)}
        ${this.booleanField("show_led", "Show LED", config.show_led)}
        ${this.booleanField("show_buzzer", "Show buzzer", config.show_buzzer)}
        ${this.booleanField("show_ionizer", "Show ionizer", config.show_ionizer)}
      </div>
    `;
  }

  private booleanField(key: keyof FanCardConfig, label: string, checked: boolean | undefined) {
    return html`
      <label class="checkbox">
        <input
          type="checkbox"
          .checked=${checked === true}
          @change=${(event: Event) => this.onBooleanChange(event, key)}
        />
        <span>${label}</span>
      </label>
    `;
  }

  private onEntityChange = (event: Event): void => {
    this.updateConfig("entity", (event.currentTarget as HTMLSelectElement).value);
  };

  private onTextChange = (event: Event, key: "name" | "theme" | "integration"): void => {
    this.updateConfig(key, (event.currentTarget as HTMLInputElement | HTMLSelectElement).value);
  };

  private onBooleanChange = (event: Event, key: keyof FanCardConfig): void => {
    this.updateConfig(key, (event.currentTarget as HTMLInputElement).checked);
  };

  private updateConfig(key: keyof FanCardConfig, value: unknown): void {
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
