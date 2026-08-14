import { describe, expect, it } from "vitest";
import { createFanAdapter } from "../../src/adapters";
import { readServiceAvailability } from "../../src/services/service-dispatcher";
import { p76Hass } from "../fixtures/p76-state";

const services = readServiceAvailability({
  fan: {
    set_percentage: {},
    set_preset_mode: {},
    oscillate: {},
    toggle: {},
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
});

describe("XiaomiMiioP76Adapter", () => {
  it("dispatches P76 dual-axis controls through integration services", async () => {
    const hass = p76Hass();
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.setVerticalSwing(false);
    await adapter.setVerticalAngle(100);
    await adapter.nudge("up");
    await adapter.setTimer(120);

    expect(calls).toEqual([
      ["xiaomi_miio_fan", "fan_set_vertical_oscillation_off", { entity_id: "fan.xiaomi_p76" }],
      ["xiaomi_miio_fan", "fan_set_vertical_oscillation_angle", { entity_id: "fan.xiaomi_p76", vertical_angle: 100 }],
      ["xiaomi_miio_fan", "fan_turn", { entity_id: "fan.xiaomi_p76", direction: "up" }],
      ["xiaomi_miio_fan", "fan_set_delay_off", { entity_id: "fan.xiaomi_p76", delay_off_countdown: 120 }],
    ]);
  });

  it("maps mode changes to current P76 level", async () => {
    const hass = p76Hass();
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.setMode("natural");

    expect(calls).toEqual([["fan", "set_preset_mode", { entity_id: "fan.xiaomi_p76", preset_mode: "Natural 2" }]]);
  });
});
