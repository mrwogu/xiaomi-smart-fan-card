import type { HassLike } from "../../src/types";

const registry = [
  { entity_id: "fan.xiaomi_p76", device_id: "device-miot-p76" },
  { entity_id: "select.xiaomi_p76_horizontal_swing_angle", device_id: "device-miot-p76" },
  { entity_id: "select.xiaomi_p76_vertical_swing_angle", device_id: "device-miot-p76" },
  { entity_id: "select.xiaomi_p76_vertical_swing", device_id: "device-miot-p76" },
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
  select: {
    select_option: {},
  },
};

export const xiaomiMiotP76Hass = (): HassLike => ({
  states: {
    "fan.xiaomi_p76": {
      state: "on",
      attributes: {
        friendly_name: "Xiaomi Smart Standing Air Circulation Fan",
        model: "xiaomi.fan.p76",
        percentage: 50,
        preset_mode: "Level 2",
        preset_modes: ["off", "Level 1", "Level 2", "Level 3", "Level 4", "Natural 1", "Natural 2"],
        oscillating: false,
      },
    },
    "select.xiaomi_p76_horizontal_swing_angle": {
      state: "60",
      attributes: {
        options: ["30", "60", "90", "120"],
      },
    },
    "select.xiaomi_p76_vertical_swing_angle": {
      state: "30",
      attributes: {
        options: ["30", "60", "90", "100"],
      },
    },
    "select.xiaomi_p76_vertical_swing": {
      state: "on",
      attributes: {
        options: ["off", "on"],
      },
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

export const xiaomiMiotP76InfoHass = (): HassLike => ({
  states: {
    "fan.xiaomi_p76": {
      state: "on",
      attributes: {
        friendly_name: "Test fan",
        // SET_SPEED | OSCILLATE | PRESET_MODE | TURN_OFF | TURN_ON
        supported_features: 59,
        percentage: 100,
        percentage_step: 1,
        preset_mode: "Straight Wind",
        preset_modes: ["Straight Wind", "Natural Wind"],
        oscillating: true,
      },
    },
    "button.xiaomi_p76_info": {
      state: "unknown",
      attributes: {
        "button.info": "Xiaomi Fan",
        model: "xiaomi.fan.p76",
        miot_type: "urn:miot-spec-v2:device:fan:0000A005:xiaomi-p76:1:0000D062",
        available: true,
        "fan.on": true,
        "fan.horizontal_swing": true,
        "horizontal_swing_included_angle-2-7": 30,
        "fan.vertical_swing": true,
        "vertical_swing_included_angle-2-9": 30,
      },
    },
  },
  callService: () => undefined,
  callWS: async <T>(message: Record<string, unknown>) => {
    if (message.type === "config/entity_registry/list") {
      return [
        { entity_id: "fan.xiaomi_p76", device_id: "device-miot-p76", platform: "xiaomi_miot" },
        { entity_id: "button.xiaomi_p76_info", device_id: "device-miot-p76", platform: "xiaomi_miot" },
      ] as T;
    }

    if (message.type === "get_services") {
      return {
        fan: services.fan,
        xiaomi_miot: { set_property: {} },
      } as T;
    }

    return {} as T;
  },
});
