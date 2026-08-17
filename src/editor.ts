import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";
import { fireEvent, type HomeAssistant, type LovelaceCardEditor } from "custom-card-helpers";
import { DEFAULT_CONFIG, normalizeCardConfig } from "./config";
import { getConfigForm } from "./editor-schema";
import { createTranslator, type TranslationKey, type Translator } from "./translations";
import type { FanCardConfig, ResolvedFanCardConfig } from "./types";

type FormSchema = { name: string };

const FIELD_TRANSLATIONS: Record<string, TranslationKey> = {
  entity: "editorFanEntity",
  name: "cardName",
  integration: "integration",
  header: "header",
  visual: "visual",
  controls: "controls",
  details: "details",
  layout: "layout",
  styles: "styles",
  related_entities: "relatedEntities",
  speed: "speed",
  modes: "modes",
  oscillation: "swing",
  angles: "angles",
  features: "fanFeatures",
  show: "show",
  variant: "variant",
  show_eyebrow: "eyebrow",
  show_name: "name",
  show_status: "status",
  show_mode: "mode",
  show_model: "model",
  show_graphic: "graphic",
  show_power: "power",
  show_speed: "speed",
  show_details: "details",
  animation: "animation",
  show_speed_slider: "slider",
  show_speed_levels: "levels",
  show_modes: "modes",
  show_preset_mode: "preset",
  show_horizontal_swing: "swing",
  show_vertical_swing: "swing",
  show_sleep: "sleep",
  show_cycle: "cycle",
  show_horizontal_angle: "horizontalAngle",
  show_vertical_angle: "verticalAngle",
  show_nudge: "nudge",
  show_nudge_with_angles: "nudgeWithAngles",
  show_direction: "direction",
  show_favorite_level: "favorite",
  show_timer: "showTimer",
  show_timer_when_off: "showTimerWhenOff",
  show_child_lock: "showChildLock",
  show_led: "showLed",
  show_buzzer: "showBuzzer",
  show_ionizer: "showIonizer",
  selection_mode: "selectionMode",
  timer_mode: "timerMode",
  angle_mode: "angleMode",
  position: "position",
  show_temperature: "temperature",
  show_humidity: "humidity",
  theme: "visualTheme",
  density: "density",
  columns: "columns",
  order: "order",
  card: "card",
  accent: "accent",
  background: "background",
  border: "border",
  border_radius: "borderRadius",
  color: "color",
  font_size: "fontSize",
  gap: "gap",
  height: "height",
  padding: "padding",
  shadow: "shadow",
  size: "size",
  horizontal_swing_entity: "horizontalSwingEntity",
  horizontal_angle_entity: "horizontalAngleEntity",
  vertical_swing_entity: "verticalSwingEntity",
  vertical_angle_entity: "verticalAngleEntity",
  favorite_level_entity: "favoriteLevelEntity",
  sleep_mode_entity: "sleepModeEntity",
  timer_entity: "timerEntity",
  child_lock_entity: "childLockEntity",
  led_entity: "ledEntity",
  buzzer_entity: "buzzerEntity",
  ionizer_entity: "ionizerEntity",
  temperature_entity: "temperatureEntity",
  humidity_entity: "humidityEntity",
};

const FIELD_HELPERS: Record<string, TranslationKey> = {
  integration: "helperIntegration",
  selection_mode: "helperSelectionMode",
  timer_mode: "helperTimerMode",
  angle_mode: "helperAngleMode",
  show_nudge_with_angles: "helperNudgeWithAngles",
  theme: "helperTheme",
  density: "helperDensity",
  columns: "helperColumns",
  order: "helperOrder",
  styles: "helperStyles",
};

const OPTION_TRANSLATIONS: Record<string, TranslationKey> = {
  "integration.auto": "autoDetect",
  "integration.standard": "standardFan",
  "integration.xiaomi_miio": "nativeXiaomiHome",
  "integration.xiaomi_miio_fan": "xiaomiMiioFan",
  "integration.xiaomi_miot": "xiaomiMiot",
  "variant.full": "full",
  "variant.compact": "compact",
  "animation.auto": "auto",
  "animation.enabled": "enabled",
  "animation.disabled": "disabled",
  "selection_mode.auto": "auto",
  "selection_mode.buttons": "buttons",
  "selection_mode.select": "select",
  "timer_mode.cycle": "cycle",
  "timer_mode.select": "select",
  "angle_mode.cycle": "cycle",
  "angle_mode.select": "select",
  "position.below": "below",
  "position.side": "side",
  "theme.auto": "auto",
  "theme.mushroom": "mushroom",
  "theme.minimal": "minimal",
  "theme.glass": "glass",
  "theme.industrial": "industrial",
  "density.comfortable": "comfortable",
  "density.compact": "compact",
  "columns.auto": "auto",
  "columns.one": "one",
  "columns.two": "two",
  "order.header": "header",
  "order.visual": "visual",
  "order.airflow": "airflowControls",
  "order.position": "positionControls",
  "order.features": "fanFeatures",
};

export class XiaomiFanCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config: ResolvedFanCardConfig = normalizeCardConfig(DEFAULT_CONFIG);

  private translatorLanguage = "";
  private translator: Translator = createTranslator();

  public setConfig(config: FanCardConfig): void {
    this.config = normalizeCardConfig(config);
  }

  protected render() {
    const { schema } = getConfigForm();
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${schema}
        .computeLabel=${this.computeLabel}
        .computeHelper=${this.computeHelper}
        .localizeValue=${this.localizeValue}
        @value-changed=${this.handleValueChanged}
      ></ha-form>
    `;
  }

  private computeLabel = (schema: FormSchema): string => {
    const key = FIELD_TRANSLATIONS[schema.name];
    return key ? this.t(key) : schema.name;
  };

  private computeHelper = (schema: FormSchema): string | undefined => {
    const key = FIELD_HELPERS[schema.name];
    return key ? this.t(key) : undefined;
  };

  private localizeValue = (key: string): string => {
    const match = /^(.+)\.options\.([^.]*)$/.exec(key);
    if (!match) {
      return "";
    }

    const translationKey = OPTION_TRANSLATIONS[`${match[1]}.${match[2]}`];
    return translationKey ? this.t(translationKey) : "";
  };

  private t(key: TranslationKey): string {
    const language = this.hass?.language ?? "";
    if (language !== this.translatorLanguage) {
      this.translatorLanguage = language;
      this.translator = createTranslator(language);
    }
    return this.translator(key);
  }

  private handleValueChanged = (event: CustomEvent<{ value: FanCardConfig }>): void => {
    event.stopPropagation();
    fireEvent(this, "config-changed", { config: event.detail.value });
  };
}

if (!customElements.get("xiaomi-fan-card-editor")) {
  customElements.define("xiaomi-fan-card-editor", XiaomiFanCardEditor);
}
