// Source-derived examples, not device captures. See docs/integration-contracts.md.
export const upstreamVersions = {
  checkedOn: "2026-09-04",
  homeAssistant: {
    repository: "home-assistant/core",
    version: "2026.9.0",
    commit: "dfb5a9e690daaf204b542896e4b595e61a11a401",
  },
  xiaomiMiioFan: {
    repository: "syssi/xiaomi_fan",
    version: "2026.8.0.0",
    commit: "7ed5456d4bfce62422ee60e777255b7bf21ebcfc",
  },
  xiaomiMiot: {
    repository: "al-one/hass-xiaomi-miot",
    version: "v1.1.4",
    commit: "4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6",
  },
  pythonMiio: {
    repository: "rytilahti/python-miio",
    version: "0.5.12",
    commit: "ecdabcd963d77526a84b0a3df4023595de22a657",
  },
} as const;

// fan.py SERVICE_TO_METHOD registers every service for every model.
export const syssiServices = {
  fan_set_buzzer_on: {},
  fan_set_buzzer_off: {},
  fan_set_child_lock_on: {},
  fan_set_child_lock_off: {},
  fan_set_led_brightness: {},
  fan_set_raw_led_brightness: {},
  fan_set_oscillation_angle: {},
  fan_set_delay_off: {},
  fan_set_natural_mode_on: {},
  fan_set_natural_mode_off: {},
  fan_set_anion_on: {},
  fan_set_anion_off: {},
  fan_set_vertical_oscillation_on: {},
  fan_set_vertical_oscillation_off: {},
  fan_turn: {},
  fan_set_vertical_oscillation_angle: {},
};

const levels = ["off", "Level 1", "Level 2", "Level 3", "Level 4"];
const naturalLevels = [...levels, "Natural 1", "Natural 2", "Natural 3", "Natural 4"];

export interface SyssiContract {
  models: string[];
  implementation: string;
  sourceLine: number;
  supportedFeatures: number;
  presetModes: string[];
  percentageStep: number;
  attributes: Record<string, unknown>;
  horizontalAngles: number[];
  verticalAngles: number[];
  nudgeDirections: Array<"left" | "right" | "up" | "down">;
  naturalService: boolean;
  timerReadUnit: "minutes" | "seconds" | "unverified";
  timerMax: number;
}

const pedestalAttributes = {
  mode: "normal",
  oscillate: true,
  angle: 60,
  delay_off_countdown: 120,
  led: true,
  buzzer: false,
  child_lock: false,
  raw_speed: 50,
};

const pedestal: SyssiContract = {
  models: ["dmaker.fan.p5"],
  implementation: "XiaomiFanP5",
  sourceLine: 1313,
  supportedFeatures: 63,
  presetModes: levels,
  percentageStep: 1,
  attributes: pedestalAttributes,
  horizontalAngles: [30, 60, 90, 120, 140],
  verticalAngles: [],
  nudgeDirections: [],
  naturalService: true,
  // FanStatusP5 says seconds, but its setter sends minutes. No device capture.
  timerReadUnit: "unverified",
  timerMax: 600,
};

const modern: SyssiContract = {
  ...pedestal,
  models: ["xiaomi.fan.p30"],
  implementation: "XiaomiFanXiaomiP30",
  sourceLine: 3997,
  supportedFeatures: 59,
  presetModes: naturalLevels,
  attributes: { ...pedestalAttributes, mode: "Straight" },
  nudgeDirections: ["left", "right"],
  timerMax: 480,
  timerReadUnit: "minutes",
};

// Each group follows an actual async_setup_platform dispatch branch.
export const syssiContracts: SyssiContract[] = [
  {
    ...pedestal,
    models: ["zhimi.fan.v2", "zhimi.fan.v3", "zhimi.fan.sa1", "zhimi.fan.za1", "zhimi.fan.za3", "zhimi.fan.za4"],
    implementation: "XiaomiFan",
    sourceLine: 1069,
    attributes: {
      oscillate: true,
      angle: 60,
      direct_speed: 50,
      natural_speed: 0,
      delay_off_countdown: 7200,
      buzzer: false,
      child_lock: false,
      led_brightness: 0,
      raw_speed: 800,
    },
    horizontalAngles: [30, 60, 90, 120],
    timerReadUnit: "seconds",
  },
  pedestal,
  {
    ...pedestal,
    models: ["dmaker.fan.p9"],
    implementation: "XiaomiFanMiot",
    sourceLine: 1462,
    horizontalAngles: [30, 60, 90, 120, 150],
    timerMax: 480,
    timerReadUnit: "minutes",
  },
  {
    ...pedestal,
    models: ["dmaker.fan.p10", "dmaker.fan.p18", "dmaker.fan.p30"],
    implementation: "XiaomiFanMiot",
    sourceLine: 1462,
    timerMax: 480,
    timerReadUnit: "minutes",
  },
  {
    ...pedestal,
    models: ["dmaker.fan.p11", "dmaker.fan.p15"],
    implementation: "XiaomiFanMiot",
    sourceLine: 1462,
    timerMax: 480,
    timerReadUnit: "minutes",
  },
  {
    ...pedestal,
    models: ["dmaker.fan.p33"],
    implementation: "XiaomiFanP33",
    sourceLine: 2275,
    attributes: { ...pedestalAttributes, mode: "Normal" },
    timerMax: 480,
    timerReadUnit: "minutes",
  },
  {
    ...pedestal,
    models: ["dmaker.fan.p39"],
    implementation: "XiaomiFanP39",
    sourceLine: 2606,
    attributes: {
      mode: "Normal",
      oscillate: true,
      angle: 60,
      delay_off_countdown: 120,
      child_lock: false,
      raw_speed: 50,
      // Parent initialization leaves unsupported attributes present but null.
      led: null,
      led_brightness: null,
      buzzer: null,
    },
    timerMax: 480,
    timerReadUnit: "minutes",
  },
  {
    ...pedestal,
    models: ["dmaker.fan.1c", "dmaker.fan.p8"],
    implementation: "XiaomiFan1C",
    sourceLine: 1612,
    supportedFeatures: 59,
    presetModes: ["off", "Level 1", "Level 2", "Level 3"],
    percentageStep: 100 / 3,
    attributes: {
      ...pedestalAttributes,
      angle: null,
      raw_speed: 2,
    },
    horizontalAngles: [],
    timerMax: 480,
    timerReadUnit: "minutes",
  },
  {
    ...pedestal,
    models: ["zhimi.fan.za5"],
    implementation: "XiaomiFanZA5",
    sourceLine: 1806,
    attributes: {
      angle: 60,
      oscillate: true,
      direct_speed: 50,
      natural_speed: 50,
      mode: "Normal",
      delay_off_countdown: 7200,
      led_brightness: 0,
      raw_led_brightness: 100,
      buzzer: false,
      child_lock: false,
      anion: true,
      temperature: 24,
      humidity: 45,
      raw_speed: 800,
    },
    horizontalAngles: [30, 60, 90, 120],
    timerReadUnit: "seconds",
  },
  {
    ...pedestal,
    models: ["leshow.fan.ss4"],
    implementation: "XiaomiFanLeshow",
    sourceLine: 1468,
    supportedFeatures: 59,
    presetModes: ["Manual", "Sleep", "Strong", "Natural"],
    attributes: {
      mode: 0,
      raw_speed: 50,
      buzzer: false,
      oscillate: true,
      delay_off_countdown: 120,
      error_detected: false,
    },
    horizontalAngles: [],
    naturalService: false,
    timerMax: 540,
    timerReadUnit: "minutes",
  },
  modern,
  {
    ...modern,
    models: ["xiaomi.fan.p45"],
    implementation: "XiaomiFanP45",
    sourceLine: 3131,
    presetModes: [...naturalLevels, "Sleep"],
    horizontalAngles: [30, 60, 90, 120, 150],
  },
  {
    ...modern,
    models: ["xiaomi.fan.p76"],
    implementation: "XiaomiFanP76",
    sourceLine: 3559,
    supportedFeatures: 63,
    attributes: {
      ...modern.attributes,
      vertical_oscillate: false,
      vertical_angle: 90,
      direction: "reverse",
    },
    horizontalAngles: [30, 60, 90, 120],
    verticalAngles: [30, 60, 90, 100],
    nudgeDirections: ["left", "right", "up", "down"],
  },
  {
    ...modern,
    models: ["xiaomi.fan.p70"],
    implementation: "XiaomiFanP70",
    sourceLine: 4399,
    supportedFeatures: 63,
    presetModes: levels,
    attributes: {
      ...modern.attributes,
      vertical_oscillate: false,
      vertical_angle: 90,
      direction: "reverse",
    },
    horizontalAngles: [30, 60, 90, 120],
    verticalAngles: [30, 60, 90, 100],
    nudgeDirections: ["left", "right", "up", "down"],
  },
  {
    ...modern,
    models: ["xiaomi.fan.p85"],
    implementation: "XiaomiFanP85",
    sourceLine: 4997,
    horizontalAngles: [30, 60, 90],
  },
  {
    ...modern,
    models: ["xiaomi.fan.p43"],
    implementation: "XiaomiFanP43",
    sourceLine: 5234,
    horizontalAngles: [30, 60, 90],
  },
  {
    ...modern,
    models: ["xiaomi.fan.2lite"],
    implementation: "XiaomiFan2Lite",
    sourceLine: 4757,
    presetModes: ["Sleep"],
    percentageStep: 100 / 3,
    attributes: {
      mode: "Straight",
      oscillate: true,
      delay_off_countdown: 120,
      led: true,
      buzzer: false,
      child_lock: false,
    },
    horizontalAngles: [],
    nudgeDirections: [],
  },
];

// Core const.py MODELS_FAN_MIIO / MODELS_FAN_MIOT, not syssi's model list.
export const nativeMiioModels = [
  "zhimi.fan.v2",
  "zhimi.fan.v3",
  "zhimi.fan.sa1",
  "zhimi.fan.za1",
  "zhimi.fan.za3",
  "zhimi.fan.za4",
  "zhimi.fan.za5",
  "dmaker.fan.p5",
  "dmaker.fan.p9",
  "dmaker.fan.p10",
  "dmaker.fan.p11",
  "dmaker.fan.p18",
  "dmaker.fan.p33",
  "dmaker.fan.1c",
];

export const standardFeatureContracts = [
  { name: "no features", mask: 0 },
  { name: "power only", mask: 48 },
  { name: "speed", mask: 49 },
  { name: "oscillation", mask: 50 },
  { name: "direction", mask: 52 },
  { name: "presets", mask: 56 },
  { name: "all features", mask: 63 },
];

export const standardPowerContracts = [
  { name: "no power features", mask: 0, on: false, off: false },
  { name: "turn off only", mask: 16, on: true, off: false },
  { name: "turn on only", mask: 32, on: false, off: true },
  { name: "both power actions", mask: 48, on: true, off: true },
  { name: "speed without power", mask: 1, on: false, off: false },
  { name: "legacy without a mask", mask: undefined, on: true, off: true },
];

export const miotP76Spec = {
  urn: "urn:miot-spec-v2:device:fan:0000A005:xiaomi-p76:1:0000D062",
  sha256: "3634c4391771572d1c46ef62803f6484ff948c2c4d5259eda2e58a6153b1dbde",
};

// v1.1.4 GLOBAL_CONVERTERS plus *.fan.* defaults. No optional angle entities.
// Entity suffixes follow MiotSpec.generate_entity_id, with a synthetic suffix.
export const miotP76DefaultStates = {
  "fan.xiaomi_p76_example_fan": {
    state: "on",
    attributes: {
      friendly_name: "Contract fan",
      supported_features: 59,
      percentage: 50,
      percentage_step: 1,
      preset_mode: "Straight Wind",
      preset_modes: ["Straight Wind", "Natural Wind"],
      oscillating: true,
      "fan.on": true,
      "fan.mode": 0,
      "fan.fan_level": 1,
      "fan-2.stepless_fan_level": 50,
      "fan.horizontal_swing": true,
      "fan.vertical_swing": false,
    },
  },
  "light.xiaomi_p76_example_indicator_light": {
    state: "on",
    attributes: { supported_color_modes: ["onoff"], color_mode: "onoff" },
  },
  "switch.xiaomi_p76_example_alarm": {
    state: "off",
    attributes: { alarm: false },
  },
  "switch.xiaomi_p76_example_child_lock": {
    state: "off",
    attributes: { physical_controls_locked: false },
  },
  "button.xiaomi_p76_example_turn_left": {
    state: "unknown",
    attributes: {},
  },
  "button.xiaomi_p76_example_turn_right": {
    state: "unknown",
    attributes: {},
  },
};

// Explicit integration customizations, not the v1.1.4 default entity set.
// Property value-lists, units and write access checked against miotP76Spec.
export const miotP76CustomizedStates = {
  ...miotP76DefaultStates,
  "switch.xiaomi_p76_example_vertical_swing": {
    state: "off",
    attributes: { "fan.vertical_swing": false },
  },
  "select.xiaomi_p76_example_horizontal_swing_included_angle": {
    state: "60",
    attributes: { options: ["30", "60", "90", "120"] },
  },
  "select.xiaomi_p76_example_vertical_swing_included_angle": {
    state: "90",
    attributes: { options: ["30", "60", "90", "100"] },
  },
  "number.xiaomi_p76_example_delay_time": {
    state: "120",
    attributes: { min: 0, max: 480, step: 1, unit_of_measurement: "minutes" },
  },
  "button.xiaomi_p76_example_turn_upward": {
    state: "unknown",
    attributes: {},
  },
  "button.xiaomi_p76_example_turn_downward": {
    state: "unknown",
    attributes: {},
  },
};

// dmaker.fan.* exposes these through number_select_properties / number_properties.
export const miotP18RelatedStates = {
  "fan.dmaker_p18_example_fan": {
    state: "on",
    attributes: {
      supported_features: 59,
      percentage: 50,
      percentage_step: 1,
      preset_mode: "Straight Wind",
      preset_modes: ["Straight Wind", "Natural Wind"],
      oscillating: true,
    },
  },
  "select.dmaker_p18_example_horizontal_angle": {
    state: "60",
    attributes: { options: ["30", "60", "90", "120", "140"] },
  },
  "number.dmaker_p18_example_off_delay_time": {
    state: "120",
    attributes: { min: 0, max: 480, step: 1, unit_of_measurement: "minutes" },
  },
  "switch.dmaker_p18_example_alarm": {
    state: "off",
    attributes: { "fan.alarm": false },
  },
  "switch.dmaker_p18_example_brightness": {
    state: "on",
    attributes: { "fan.brightness": true },
  },
};
