import type { HassLike } from "../../src/types";

export const nativeXiaomiMiioHass = (): HassLike => ({
  states: {
    "fan.xiaomi_native": {
      state: "on",
      attributes: {
        friendly_name: "Native Xiaomi Standing Fan",
        model: "dmaker.fan.p5",
        percentage: 50,
        preset_mode: "Normal",
        preset_modes: ["Normal", "Nature"],
        oscillating: false,
        direction: "forward",
      },
    },
    "switch.xiaomi_native_led": {
      state: "on",
      attributes: {},
    },
    "switch.xiaomi_native_buzzer": {
      state: "off",
      attributes: {},
    },
    "switch.xiaomi_native_child_lock": {
      state: "off",
      attributes: {},
    },
    "number.xiaomi_native_delay_off_countdown": {
      state: "60",
      attributes: {
        min: 0,
        max: 480,
        step: 60,
      },
    },
    "number.xiaomi_native_favorite_level": {
      state: "40",
      attributes: {
        min: 1,
        max: 100,
        step: 1,
      },
    },
    "sensor.xiaomi_native_temperature": {
      state: "24.5",
      attributes: {},
    },
    "sensor.xiaomi_native_humidity": {
      state: "45",
      attributes: {},
    },
  },
  callService: () => undefined,
  callWS: async <T>() =>
    [
      { entity_id: "fan.xiaomi_native", device_id: "device-native" },
      { entity_id: "switch.xiaomi_native_led", device_id: "device-native" },
      { entity_id: "switch.xiaomi_native_buzzer", device_id: "device-native" },
      { entity_id: "switch.xiaomi_native_child_lock", device_id: "device-native" },
      { entity_id: "number.xiaomi_native_delay_off_countdown", device_id: "device-native" },
      { entity_id: "number.xiaomi_native_favorite_level", device_id: "device-native" },
      { entity_id: "sensor.xiaomi_native_temperature", device_id: "device-native" },
      { entity_id: "sensor.xiaomi_native_humidity", device_id: "device-native" },
    ] as T,
});
