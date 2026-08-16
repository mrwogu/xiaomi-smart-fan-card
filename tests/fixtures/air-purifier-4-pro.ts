import type { HassLike } from "../../src/types";

const registry = [
  { entity_id: "fan.air_purifier_4_pro", device_id: "device-air-purifier-4-pro" },
  { entity_id: "number.air_purifier_4_pro_fan_level", device_id: "device-air-purifier-4-pro" },
  { entity_id: "number.air_purifier_4_pro_favorite_level", device_id: "device-air-purifier-4-pro" },
  { entity_id: "select.air_purifier_4_pro_led_brightness", device_id: "device-air-purifier-4-pro" },
  { entity_id: "sensor.air_purifier_4_pro_filter_life_remaining", device_id: "device-air-purifier-4-pro" },
  { entity_id: "sensor.air_purifier_4_pro_filter_lifetime_remaining", device_id: "device-air-purifier-4-pro" },
  { entity_id: "sensor.air_purifier_4_pro_filter_use", device_id: "device-air-purifier-4-pro" },
  { entity_id: "sensor.air_purifier_4_pro_luchtvochtigheid", device_id: "device-air-purifier-4-pro" },
  { entity_id: "sensor.air_purifier_4_pro_motor_speed", device_id: "device-air-purifier-4-pro" },
  { entity_id: "sensor.air_purifier_4_pro_pm10", device_id: "device-air-purifier-4-pro" },
  { entity_id: "sensor.air_purifier_4_pro_pm2_5", device_id: "device-air-purifier-4-pro" },
  { entity_id: "sensor.air_purifier_4_pro_temperatuur", device_id: "device-air-purifier-4-pro" },
  { entity_id: "switch.air_purifier_4_pro_buzzer", device_id: "device-air-purifier-4-pro" },
  { entity_id: "switch.air_purifier_4_pro_child_lock", device_id: "device-air-purifier-4-pro" },
  { entity_id: "switch.air_purifier_4_pro_ionizer", device_id: "device-air-purifier-4-pro" },
  { entity_id: "device_tracker.air_purifier_pro", device_id: "device-air-purifier-4-pro" },
];

const services = {
  fan: {
    toggle: {},
    turn_on: {},
    turn_off: {},
    set_percentage: {},
    set_preset_mode: {},
    oscillate: {},
  },
  number: {
    set_value: {},
  },
  select: {
    select_option: {},
  },
  switch: {
    turn_on: {},
    turn_off: {},
  },
};

export const airPurifier4ProHass = (): HassLike => ({
  states: {
    "fan.air_purifier_4_pro": {
      state: "on",
      attributes: {
        friendly_name: "Xiaomi Smart Air Purifier 4 Pro",
        percentage: 50,
        preset_mode: "Auto",
        preset_modes: ["Auto", "Silent", "Favorite", "Fan"],
        supported_features: 8,
      },
    },
    "number.air_purifier_4_pro_fan_level": {
      state: "50",
      attributes: {
        min: 0,
        max: 100,
        step: 1,
      },
    },
    "number.air_purifier_4_pro_favorite_level": {
      state: "35",
      attributes: {
        min: 0,
        max: 100,
        step: 1,
      },
    },
    "select.air_purifier_4_pro_led_brightness": {
      state: "0",
      attributes: {
        options: ["0", "1", "2"],
      },
    },
    "sensor.air_purifier_4_pro_filter_life_remaining": {
      state: "87",
      attributes: {
        unit_of_measurement: "%",
      },
    },
    "sensor.air_purifier_4_pro_filter_lifetime_remaining": {
      state: "365",
      attributes: {
        unit_of_measurement: "d",
      },
    },
    "sensor.air_purifier_4_pro_filter_use": {
      state: "12",
      attributes: {
        unit_of_measurement: "d",
      },
    },
    "sensor.air_purifier_4_pro_luchtvochtigheid": {
      state: "46",
      attributes: {
        unit_of_measurement: "%",
      },
    },
    "sensor.air_purifier_4_pro_motor_speed": {
      state: "850",
      attributes: {
        unit_of_measurement: "rpm",
      },
    },
    "sensor.air_purifier_4_pro_pm10": {
      state: "4",
      attributes: {
        unit_of_measurement: "µg/m³",
      },
    },
    "sensor.air_purifier_4_pro_pm2_5": {
      state: "3",
      attributes: {
        unit_of_measurement: "µg/m³",
      },
    },
    "sensor.air_purifier_4_pro_temperatuur": {
      state: "23.5",
      attributes: {
        unit_of_measurement: "°C",
      },
    },
    "switch.air_purifier_4_pro_buzzer": {
      state: "off",
      attributes: {},
    },
    "switch.air_purifier_4_pro_child_lock": {
      state: "off",
      attributes: {},
    },
    "switch.air_purifier_4_pro_ionizer": {
      state: "on",
      attributes: {},
    },
    "device_tracker.air_purifier_pro": {
      state: "home",
      attributes: {},
    },
  },
  callService: () => undefined,
  callWS: async <T>(message: Record<string, unknown>) => {
    if (message.type === "config/entity_registry/list") {
      return registry as T;
    }

    if (message.type === "get_services") {
      return services as T;
    }

    return {} as T;
  },
});
