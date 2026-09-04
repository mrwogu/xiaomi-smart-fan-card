import type { HassLike } from "../../src/types";

const registry = [
  { entity_id: "fan.xiaomi_sg_000000000000_p76_s_2_fan", device_id: "device-xiaomi-home-p76" },
  { entity_id: "button.xiaomi_sg_000000000000_p76_turn_left_a_2_4", device_id: "device-xiaomi-home-p76" },
  { entity_id: "button.xiaomi_sg_000000000000_p76_turn_right_a_2_5", device_id: "device-xiaomi-home-p76" },
  { entity_id: "button.xiaomi_sg_000000000000_p76_turn_upward_a_2_6", device_id: "device-xiaomi-home-p76" },
  { entity_id: "button.xiaomi_sg_000000000000_p76_turn_downward_a_2_7", device_id: "device-xiaomi-home-p76" },
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
  button: {
    press: {},
  },
};

export const xiaomiHomeP76Hass = (): HassLike => ({
  states: {
    "fan.xiaomi_sg_000000000000_p76_s_2_fan": {
      state: "on",
      attributes: {
        friendly_name: "Xiaomi Smart Fan",
        model: "xiaomi.fan.p76",
        percentage: 50,
        preset_mode: "Level 2",
        preset_modes: ["off", "Level 1", "Level 2", "Level 3", "Level 4", "Nature 1", "Nature 2"],
      },
    },
    // Xiaomi Home action buttons stay `unknown` until their first press.
    "button.xiaomi_sg_000000000000_p76_turn_left_a_2_4": { state: "unknown", attributes: {} },
    "button.xiaomi_sg_000000000000_p76_turn_right_a_2_5": { state: "unknown", attributes: {} },
    "button.xiaomi_sg_000000000000_p76_turn_upward_a_2_6": { state: "unknown", attributes: {} },
    "button.xiaomi_sg_000000000000_p76_turn_downward_a_2_7": { state: "unknown", attributes: {} },
  },
  callService: () => undefined,
  callWS: async <T>(message: Record<string, unknown>) =>
    message.type === "get_services" ? (services as T) : (registry as T),
});
