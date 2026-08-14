import type { LovelaceCardConfig } from "custom-card-helpers";

export type FanMode = "normal" | "natural";

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

export interface RelatedEntities {
  sleepMode?: string;
  verticalSwing?: string;
  horizontalAngle?: string;
  verticalAngle?: string;
  favoriteLevel?: string;
  timer?: string;
  childLock?: string;
  led?: string;
  buzzer?: string;
  ionizer?: string;
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

export interface FanModelProfile {
  model?: string;
  label: string;
  known: boolean;
  isXiaomi: boolean;
  speedLevels: number;
  horizontalAngles: number[];
  verticalAngles: number[];
  supportsVerticalSwing: boolean;
  supportsNudge: boolean;
}

export interface FanCapabilities {
  isXiaomi: boolean;
  modelLabel: string;
  speedLevels: number;
  direction: boolean;
  sleepMode: boolean;
  favoriteLevel: boolean;
  horizontalSwing: boolean;
  horizontalAngle: boolean;
  horizontalAngles: number[];
  verticalSwing: boolean;
  verticalAngle: boolean;
  verticalAngles: number[];
  directionNudge: boolean;
  naturalMode: boolean;
  timer: boolean;
  timerSteps?: number[];
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

export interface FanCardConfig extends LovelaceCardConfig {
  type: string;
  entity: string;
  entity_id?: string;
  name?: string;
  theme?: "auto" | "mushroom" | "minimal" | "glass" | "industrial";
  integration?: "auto" | "standard" | "xiaomi_miio" | "xiaomi_miio_fan" | "xiaomi_miot";
  platform?: "default" | "xiaomi_miio" | "xiaomi_miio_fan" | "xiaomi_miot";
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
