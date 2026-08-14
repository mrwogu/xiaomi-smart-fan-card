import type { HassLike } from "../../src/types";

/**
 * Attribute names as reported by a live P76 through the custom Xiaomi fan
 * integration. They differ from the canonical names used by the other fixture,
 * which is why regressions in attribute resolution only show up here.
 */
export const p76LiveHass = (): HassLike => ({
  states: {
    "fan.xiaomi_p76": {
      state: "on",
      attributes: {
        friendly_name: "Xiaomi Smart Standing Air Circulation Fan",
        model: "xiaomi.fan.p76",
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
        direction: "forward",
        oscillating: false,
        percentage: 3,
        percentage_step: 1,
        preset_mode: "Level 1",
        mode: "Straight",
        oscillate: false,
        angle: 30,
        vertical_oscillate: true,
        vertical_angle: 100,
        delay_off_countdown: 0,
        led: true,
        buzzer: false,
        child_lock: false,
        raw_speed: 3,
        supported_features: 63,
      },
    },
  },
  callService: () => undefined,
  callWS: async <T>() =>
    ({
      fan: {
        toggle: {},
        turn_on: {},
        turn_off: {},
        set_percentage: {},
        set_preset_mode: {},
        oscillate: {},
        set_direction: {},
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
