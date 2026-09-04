import type { LovelaceCardConfig } from "custom-card-helpers";

export type FanMode = "normal" | "natural";

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

export interface RelatedEntities {
  sleepMode?: string;
  horizontalSwing?: string;
  verticalSwing?: string;
  horizontalAngle?: string;
  verticalAngle?: string;
  favoriteLevel?: string;
  timer?: string;
  childLock?: string;
  led?: string;
  buzzer?: string;
  ionizer?: string;
  nudgeLeft?: string;
  nudgeRight?: string;
  nudgeUp?: string;
  nudgeDown?: string;
  temperature?: string;
  humidity?: string;
}

export interface HassLike {
  states: Record<string, HassEntity>;
  callService: (domain: string, service: string, serviceData?: Record<string, unknown>) => void | Promise<void>;
  callWS?: <T>(message: Record<string, unknown>) => Promise<T>;
}

export type ServiceRegistryResponse = Record<string, Record<string, unknown>>;

export interface ServiceAvailability {
  loaded: boolean;
  names: ReadonlySet<string>;
}

export type TimerUnit = "min" | "s";

export interface NumberSpec {
  min: number;
  max: number;
  step: number;
}

export interface TimerSpec extends NumberSpec {
  unit: TimerUnit;
}

export interface FanModelProfile {
  model?: string;
  label: string;
  known: boolean;
  isXiaomi: boolean;
  timerUnit?: TimerUnit;
  speedLevels: number;
  horizontalAngles: number[];
  verticalAngles: number[];
  supportsVerticalSwing: boolean;
  supportsNudge: boolean;
}

export interface FanCapabilities {
  isXiaomi: boolean;
  modelLabel: string;
  speed: boolean;
  percentageStep: number;
  speedLevels: number;
  presetMode: boolean;
  direction: boolean;
  sleepMode: boolean;
  favoriteLevel: boolean;
  horizontalSwing: boolean;
  horizontalAngle: boolean;
  horizontalAngles: number[];
  horizontalAngleSpec?: NumberSpec;
  verticalSwing: boolean;
  verticalAngle: boolean;
  verticalAngles: number[];
  verticalAngleSpec?: NumberSpec;
  directionNudge: boolean;
  naturalMode: boolean;
  timer: boolean;
  favoriteLevelSpec?: NumberSpec;
  timerSteps?: number[];
  timerSpec?: TimerSpec;
  childLock: boolean;
  led: boolean;
  buzzer: boolean;
  ionizer: boolean;
}

export interface NormalizedFanState {
  entityId: string;
  model?: string;
  friendlyName: string;
  available: boolean;
  isOn: boolean;
  percentage: number;
  level: number;
  speedLevels: number;
  mode: FanMode;
  favoriteLevel?: number;
  presetMode?: string;
  availableModes: string[];
  sleepMode?: boolean;
  horizontalSwing?: boolean;
  horizontalAngle?: number;
  verticalSwing?: boolean;
  verticalAngle?: number;
  direction?: "forward" | "reverse";
  timerMinutes?: number;
  childLock?: boolean;
  led?: boolean;
  buzzer?: boolean;
  ionizer?: boolean;
  temperature?: string;
  humidity?: string;
}

export type FanTheme = "auto" | "mushroom" | "minimal" | "glass" | "industrial";
export type FanDensity = "comfortable" | "compact";
export type FanColumns = "auto" | "one" | "two";
export type FanHeaderVariant = "full" | "compact";
export type FanSelectionMode = "auto" | "buttons" | "select";
export type FanTimerMode = "cycle" | "select";
export type FanAngleMode = "cycle" | "select";
export type FanAnimationMode = "auto" | "enabled" | "disabled";
export type FanDetailsPosition = "below" | "side";
export type FanBlock = "header" | "visual" | "airflow" | "position" | "features";

export interface FanStyleBlock {
  accent?: string;
  background?: string;
  border?: string;
  border_radius?: string;
  color?: string;
  font_size?: string;
  gap?: string;
  height?: string;
  padding?: string;
  shadow?: string;
  size?: string;
}

export interface FanStylesConfig {
  card?: FanStyleBlock;
  header?: FanStyleBlock;
  visual?: FanStyleBlock;
  controls?: FanStyleBlock;
  details?: FanStyleBlock;
}

export interface FanHeaderConfig {
  show?: boolean;
  variant?: FanHeaderVariant;
  show_eyebrow?: boolean;
  show_name?: boolean;
  show_status?: boolean;
  show_mode?: boolean;
  show_model?: boolean;
}

export interface FanVisualConfig {
  show?: boolean;
  show_graphic?: boolean;
  size?: number;
  show_power?: boolean;
  show_speed?: boolean;
  show_details?: boolean;
  animation?: FanAnimationMode;
}

export type ResolvedFanVisualConfig = Omit<Required<FanVisualConfig>, "size"> & {
  size?: number;
};

export interface FanControlsConfig {
  show?: boolean;
  show_speed_slider?: boolean;
  show_speed_levels?: boolean;
  show_modes?: boolean;
  show_preset_mode?: boolean;
  show_horizontal_swing?: boolean;
  show_vertical_swing?: boolean;
  show_sleep?: boolean;
  show_cycle?: boolean;
  show_horizontal_angle?: boolean;
  show_vertical_angle?: boolean;
  show_nudge?: boolean;
  show_nudge_with_angles?: boolean;
  show_direction?: boolean;
  show_favorite_level?: boolean;
  show_timer?: boolean;
  show_child_lock?: boolean;
  show_led?: boolean;
  show_buzzer?: boolean;
  show_ionizer?: boolean;
  selection_mode?: FanSelectionMode;
  timer_mode?: FanTimerMode;
  angle_mode?: FanAngleMode;
}

export interface FanDetailsConfig {
  show?: boolean;
  show_horizontal_angle?: boolean;
  show_vertical_angle?: boolean;
  show_timer?: boolean;
  show_timer_when_off?: boolean;
  show_temperature?: boolean;
  show_humidity?: boolean;
  position?: FanDetailsPosition;
}

export interface FanLayoutConfig {
  theme?: FanTheme;
  density?: FanDensity;
  columns?: FanColumns;
  order?: FanBlock[];
}

export interface FanRelatedEntitiesConfig {
  horizontal_swing_entity?: string;
  horizontal_angle_entity?: string;
  vertical_swing_entity?: string;
  vertical_angle_entity?: string;
  timer_entity?: string;
  child_lock_entity?: string;
  led_entity?: string;
  buzzer_entity?: string;
  ionizer_entity?: string;
  sleep_mode_entity?: string;
  favorite_level_entity?: string;
  temperature_entity?: string;
  humidity_entity?: string;
}

export const RELATED_ENTITY_DOMAINS = {
  horizontal_swing_entity: ["switch", "input_boolean", "select"],
  horizontal_angle_entity: ["number", "input_number", "select"],
  vertical_swing_entity: ["switch", "input_boolean", "select"],
  vertical_angle_entity: ["number", "input_number", "select"],
  favorite_level_entity: ["number", "input_number"],
  sleep_mode_entity: ["switch", "input_boolean", "select"],
  timer_entity: ["number", "input_number"],
  child_lock_entity: ["switch", "input_boolean", "select"],
  led_entity: ["switch", "input_boolean", "select", "number", "input_number"],
  buzzer_entity: ["switch", "input_boolean", "select"],
  ionizer_entity: ["switch", "input_boolean", "select"],
  temperature_entity: ["sensor"],
  humidity_entity: ["sensor"],
} as const satisfies Record<keyof FanRelatedEntitiesConfig, readonly string[]>;

export interface FanCardConfig extends LovelaceCardConfig {
  type: string;
  entity: string;
  entity_id?: string;
  name?: string;
  theme?: FanTheme;
  integration?: "auto" | "standard" | "xiaomi_miio" | "xiaomi_miio_fan" | "xiaomi_miot";
  platform?: "default" | "xiaomi_miio" | "xiaomi_miio_fan" | "xiaomi_miot";
  header?: FanHeaderConfig;
  visual?: FanVisualConfig;
  controls?: FanControlsConfig;
  details?: FanDetailsConfig;
  layout?: FanLayoutConfig;
  styles?: FanStylesConfig;
  related_entities?: FanRelatedEntitiesConfig;
  disable_animation?: boolean;
  force_sleep_mode_support?: boolean;
  sleep_mode?: boolean;
  show_sleep?: boolean;
  hide_led_button?: boolean;
  show_timer?: boolean;
  show_child_lock?: boolean;
  show_led?: boolean;
  show_buzzer?: boolean;
  show_ionizer?: boolean;
  horizontal_swing_entity?: string;
  horizontal_angle_entity?: string;
  vertical_swing_entity?: string;
  vertical_angle_entity?: string;
  timer_entity?: string;
  child_lock_entity?: string;
  led_entity?: string;
  buzzer_entity?: string;
  ionizer_entity?: string;
  sleep_mode_entity?: string;
  favorite_level_entity?: string;
  temperature_entity?: string;
  humidity_entity?: string;
}

export interface ResolvedFanCardConfig extends FanCardConfig {
  entity: string;
  integration: NonNullable<FanCardConfig["integration"]>;
  theme: FanTheme;
  disable_animation: boolean;
  show_sleep: boolean;
  show_timer: boolean;
  show_child_lock: boolean;
  show_led: boolean;
  show_buzzer: boolean;
  show_ionizer: boolean;
  header: Required<FanHeaderConfig>;
  visual: ResolvedFanVisualConfig;
  controls: Required<FanControlsConfig>;
  details: Required<FanDetailsConfig>;
  layout: Required<FanLayoutConfig>;
  styles: Required<FanStylesConfig>;
}

export interface FanAdapter {
  readonly state: NormalizedFanState;
  readonly profile: FanModelProfile;
  readonly capabilities: FanCapabilities;
  togglePower(): Promise<void>;
  setPercentage(percentage: number): Promise<void>;
  setMode(mode: FanMode): Promise<void>;
  setPresetMode(preset: string): Promise<void>;
  setSleepMode(enabled: boolean): Promise<void>;
  setFavoriteLevel(level: number): Promise<void>;
  setHorizontalSwing(enabled: boolean): Promise<void>;
  setHorizontalAngle(angle: number): Promise<void>;
  setVerticalSwing(enabled: boolean): Promise<void>;
  setVerticalAngle(angle: number): Promise<void>;
  nudge(direction: "left" | "right" | "up" | "down"): Promise<void>;
  setDirection(direction: "forward" | "reverse"): Promise<void>;
  setTimer(minutes: number): Promise<void>;
  setChildLock(enabled: boolean): Promise<void>;
  setLed(enabled: boolean): Promise<void>;
  setBuzzer(enabled: boolean): Promise<void>;
  setIonizer(enabled: boolean): Promise<void>;
}
