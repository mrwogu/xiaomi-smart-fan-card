import type { HassLike } from "../../src/types";

export const p76Hass = (): HassLike => ({
  states: {
    "fan.xiaomi_p76": {
      state: "on",
      attributes: {
        friendly_name: "Xiaomi Smart Standing Air Circulation Fan",
        model: "xiaomi.fan.p76",
        percentage: 50,
        preset_mode: "Level 2",
        preset_modes: [
          "off",
          "Level 1",
          "Level 2",
          "Level 3",
          "Level 4",
          "Natural 1",
          "Natural 2",
          "Natural 3",
          "Natural 4",
        ],
        horizontal_swing: true,
        horizontal_swing_angle: 120,
        vertical_swing: true,
        vertical_swing_angle: 90,
        delay_time: 60,
        child_lock: false,
        led: true,
        buzzer: false,
      },
    },
  },
  callService: () => undefined,
  callWS: async <T>() =>
    ({
      fan: {
        toggle: {},
        set_percentage: {},
        set_preset_mode: {},
        oscillate: {},
      },
      xiaomi_miio_fan: {
        fan_set_oscillation_angle: {},
        fan_set_vertical_oscillation_on: {},
        fan_set_vertical_oscillation_off: {},
        fan_set_vertical_oscillation_angle: {},
        fan_turn: {},
        fan_set_delay_off: {},
        fan_set_child_lock_on: {},
        fan_set_child_lock_off: {},
        fan_set_led_brightness: {},
        fan_set_buzzer_on: {},
        fan_set_buzzer_off: {},
      },
    }) as T,
});
