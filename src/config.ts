import type {
  FanAnimationMode,
  FanCardConfig,
  FanColumns,
  FanControlsConfig,
  FanDensity,
  FanDetailsConfig,
  FanHeaderConfig,
  FanHeaderVariant,
  FanLayoutConfig,
  FanSelectionMode,
  FanTheme,
  FanTimerMode,
  FanVisualConfig,
  ResolvedFanCardConfig,
} from "./types";

type RelatedEntitiesConfigKey =
  | "horizontal_angle_entity"
  | "vertical_swing_entity"
  | "vertical_angle_entity"
  | "favorite_level_entity"
  | "sleep_mode_entity"
  | "timer_entity"
  | "child_lock_entity"
  | "led_entity"
  | "buzzer_entity"
  | "ionizer_entity"
  | "temperature_entity"
  | "humidity_entity";

export const DEFAULT_CONFIG = {
  type: "custom:xiaomi-fan-card",
  entity: "",
  theme: "auto",
  integration: "auto",
  header: {
    show: true,
    variant: "compact",
    show_eyebrow: false,
    show_name: true,
    show_status: true,
    show_mode: false,
    show_model: false,
  },
  visual: {
    show: true,
    show_graphic: true,
    show_power: true,
    show_speed: true,
    show_details: true,
    animation: "auto",
  },
  controls: {
    show: true,
    show_speed_slider: true,
    show_speed_levels: true,
    show_modes: true,
    show_preset_mode: true,
    show_horizontal_swing: true,
    show_vertical_swing: true,
    show_sleep: true,
    show_cycle: true,
    show_horizontal_angle: true,
    show_vertical_angle: true,
    show_nudge: true,
    show_direction: true,
    show_favorite_level: true,
    show_timer: true,
    show_child_lock: true,
    show_led: true,
    show_buzzer: true,
    show_ionizer: true,
    selection_mode: "auto",
    timer_mode: "select",
  },
  details: {
    show: true,
    show_horizontal_angle: true,
    show_vertical_angle: true,
    show_timer: true,
    show_temperature: true,
    show_humidity: true,
  },
  layout: {
    theme: "auto",
    density: "comfortable",
    columns: "auto",
  },
  disable_animation: false,
  show_sleep: true,
  show_timer: true,
  show_child_lock: true,
  show_led: true,
  show_buzzer: true,
  show_ionizer: true,
} satisfies Partial<FanCardConfig>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const recordValue = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

const booleanValue = (value: unknown, fallback: boolean): boolean => (typeof value === "boolean" ? value : fallback);

const enumValue = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;

const integrationValue = (value: unknown): NonNullable<FanCardConfig["integration"]> =>
  enumValue(value, ["auto", "standard", "xiaomi_miio", "xiaomi_miio_fan", "xiaomi_miot"], "auto");

const themeValue = (value: unknown): FanTheme =>
  enumValue(value, ["auto", "mushroom", "minimal", "glass", "industrial"], "auto");

const normalizeHeader = (value: unknown): Required<FanHeaderConfig> => {
  const input = recordValue(value);
  const variant = enumValue<FanHeaderVariant>(input.variant, ["full", "compact"], "compact");

  return {
    show: booleanValue(input.show, true),
    variant,
    show_eyebrow: booleanValue(input.show_eyebrow, variant === "full"),
    show_name: booleanValue(input.show_name, true),
    show_status: booleanValue(input.show_status, true),
    show_mode: booleanValue(input.show_mode, variant === "full"),
    show_model: booleanValue(input.show_model, variant === "full"),
  };
};

const normalizeVisual = (value: unknown): Required<FanVisualConfig> => {
  const input = recordValue(value);

  return {
    show: booleanValue(input.show, true),
    show_graphic: booleanValue(input.show_graphic, true),
    show_power: booleanValue(input.show_power, true),
    show_speed: booleanValue(input.show_speed, true),
    show_details: booleanValue(input.show_details, true),
    animation: enumValue<FanAnimationMode>(input.animation, ["auto", "enabled", "disabled"], "auto"),
  };
};

const normalizeControls = (
  value: unknown,
  legacy: {
    showSleep: boolean;
    showTimer: boolean;
    showChildLock: boolean;
    showLed: boolean;
    showBuzzer: boolean;
    showIonizer: boolean;
  },
): Required<FanControlsConfig> => {
  const input = recordValue(value);

  return {
    show: booleanValue(input.show, true),
    show_speed_slider: booleanValue(input.show_speed_slider, true),
    show_speed_levels: booleanValue(input.show_speed_levels, true),
    show_modes: booleanValue(input.show_modes, true),
    show_preset_mode: booleanValue(input.show_preset_mode, true),
    show_horizontal_swing: booleanValue(input.show_horizontal_swing, true),
    show_vertical_swing: booleanValue(input.show_vertical_swing, true),
    show_sleep: booleanValue(input.show_sleep, legacy.showSleep),
    show_cycle: booleanValue(input.show_cycle, true),
    show_horizontal_angle: booleanValue(input.show_horizontal_angle, true),
    show_vertical_angle: booleanValue(input.show_vertical_angle, true),
    show_nudge: booleanValue(input.show_nudge, true),
    show_direction: booleanValue(input.show_direction, true),
    show_favorite_level: booleanValue(input.show_favorite_level, true),
    show_timer: booleanValue(input.show_timer, legacy.showTimer),
    show_child_lock: booleanValue(input.show_child_lock, legacy.showChildLock),
    show_led: booleanValue(input.show_led, legacy.showLed),
    show_buzzer: booleanValue(input.show_buzzer, legacy.showBuzzer),
    show_ionizer: booleanValue(input.show_ionizer, legacy.showIonizer),
    selection_mode: enumValue<FanSelectionMode>(input.selection_mode, ["auto", "buttons", "select"], "auto"),
    timer_mode: enumValue<FanTimerMode>(input.timer_mode, ["cycle", "select"], "select"),
  };
};

const normalizeDetails = (value: unknown): Required<FanDetailsConfig> => {
  const input = recordValue(value);

  return {
    show: booleanValue(input.show, true),
    show_horizontal_angle: booleanValue(input.show_horizontal_angle, true),
    show_vertical_angle: booleanValue(input.show_vertical_angle, true),
    show_timer: booleanValue(input.show_timer, true),
    show_temperature: booleanValue(input.show_temperature, true),
    show_humidity: booleanValue(input.show_humidity, true),
  };
};

const normalizeLayout = (value: unknown, theme: unknown): Required<FanLayoutConfig> => {
  const input = recordValue(value);

  return {
    theme: themeValue(input.theme ?? theme),
    density: enumValue<FanDensity>(input.density, ["comfortable", "compact"], "comfortable"),
    columns: enumValue<FanColumns>(input.columns, ["auto", "one", "two"], "auto"),
  };
};

export const normalizeCardConfig = (raw: Partial<FanCardConfig> | undefined): ResolvedFanCardConfig => {
  const source = recordValue(raw) as Partial<FanCardConfig> & Record<string, unknown>;
  const related = recordValue(source.related_entities);
  const relatedEntity = (key: RelatedEntitiesConfigKey): string | undefined => {
    const direct = source[key];
    return typeof direct === "string" ? direct : typeof related[key] === "string" ? related[key] : undefined;
  };
  const entity = typeof source.entity === "string" && source.entity ? source.entity : (source.entity_id ?? "");
  const integration = integrationValue(
    source.integration ??
      (source.platform === "default"
        ? "standard"
        : source.platform === "xiaomi_miio" ||
            source.platform === "xiaomi_miio_fan" ||
            source.platform === "xiaomi_miot"
          ? source.platform
          : undefined),
  );
  const showSleep = booleanValue(
    source.show_sleep ?? source.sleep_mode ?? source.force_sleep_mode_support,
    DEFAULT_CONFIG.show_sleep,
  );
  const showLed = source.hide_led_button === true ? false : booleanValue(source.show_led, DEFAULT_CONFIG.show_led);
  const showTimer = booleanValue(source.show_timer, DEFAULT_CONFIG.show_timer);
  const showChildLock = booleanValue(source.show_child_lock, DEFAULT_CONFIG.show_child_lock);
  const showBuzzer = booleanValue(source.show_buzzer, DEFAULT_CONFIG.show_buzzer);
  const showIonizer = booleanValue(source.show_ionizer, DEFAULT_CONFIG.show_ionizer);
  const visual = normalizeVisual(source.visual);
  const disableAnimation = booleanValue(source.disable_animation, false) || visual.animation === "disabled";
  const controls = normalizeControls(source.controls, {
    showSleep,
    showTimer,
    showChildLock,
    showLed,
    showBuzzer,
    showIonizer,
  });

  return {
    ...DEFAULT_CONFIG,
    ...source,
    entity,
    integration,
    theme: themeValue(source.theme),
    disable_animation: disableAnimation,
    show_sleep: showSleep,
    show_timer: showTimer,
    show_child_lock: showChildLock,
    show_led: showLed,
    show_buzzer: showBuzzer,
    show_ionizer: showIonizer,
    header: normalizeHeader(source.header),
    visual,
    controls,
    details: normalizeDetails(source.details),
    layout: normalizeLayout(source.layout, source.theme),
    horizontal_angle_entity: relatedEntity("horizontal_angle_entity"),
    vertical_swing_entity: relatedEntity("vertical_swing_entity"),
    vertical_angle_entity: relatedEntity("vertical_angle_entity"),
    favorite_level_entity: relatedEntity("favorite_level_entity"),
    sleep_mode_entity: relatedEntity("sleep_mode_entity"),
    timer_entity: relatedEntity("timer_entity"),
    child_lock_entity: relatedEntity("child_lock_entity"),
    led_entity: relatedEntity("led_entity"),
    buzzer_entity: relatedEntity("buzzer_entity"),
    ionizer_entity: relatedEntity("ionizer_entity"),
    temperature_entity: relatedEntity("temperature_entity"),
    humidity_entity: relatedEntity("humidity_entity"),
  };
};
