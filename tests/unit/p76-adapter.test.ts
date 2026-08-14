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

  it("uses the Xiaomi LED brightness contract", async () => {
    const hass = p76Hass();
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.setLed(true);
    await adapter.setLed(false);

    expect(calls).toEqual([
      ["xiaomi_miio_fan", "fan_set_led_brightness", { entity_id: "fan.xiaomi_p76", brightness: 0 }],
      ["xiaomi_miio_fan", "fan_set_led_brightness", { entity_id: "fan.xiaomi_p76", brightness: 2 }],
    ]);
  });

  it("prefers current related angles over stale primary attributes", () => {
    const hass = p76Hass();
    hass.states["number.p76_horizontal_angle"] = {
      state: "45",
      attributes: { min: 30, max: 120, step: 30 },
    };
    hass.states["number.p76_vertical_angle"] = {
      state: "30",
      attributes: { min: 30, max: 100, step: 10 },
    };

    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan", {
      horizontalAngle: "number.p76_horizontal_angle",
      verticalAngle: "number.p76_vertical_angle",
    });

    expect(adapter.state.horizontalAngle).toBe(45);
    expect(adapter.state.verticalAngle).toBe(30);
  });

  it("does not preserve stale primary angles when related entities are unavailable", () => {
    const hass = p76Hass();
    hass.states["number.p76_horizontal_angle"] = {
      state: "unavailable",
      attributes: { min: 30, max: 120, step: 30 },
    };

    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan", {
      horizontalAngle: "number.p76_horizontal_angle",
    });

    expect(adapter.state.horizontalAngle).toBeUndefined();
  });

  it("converts related timer seconds to canonical minutes", async () => {
    const hass = p76Hass();
    hass.states["number.p76_timer"] = {
      state: "3180",
      attributes: {
        min: 0,
        max: 3600,
        step: 60,
        unit_of_measurement: "s",
      },
    };
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };

    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan", {
      timer: "number.p76_timer",
    });

    expect(adapter.state.timerMinutes).toBe(53);
    expect(adapter.capabilities.timerSteps?.slice(0, 3)).toEqual([0, 1, 2]);
    expect(adapter.capabilities.timerSteps?.at(-1)).toBe(60);

    await adapter.setTimer(53);
    expect(calls).toEqual([["number", "set_value", { entity_id: "number.p76_timer", value: 3180 }]]);
  });

  it("supports a related P76 LED brightness number", async () => {
    const hass = p76Hass();
    hass.states["number.p76_led_brightness"] = {
      state: "2",
      attributes: { min: 0, max: 2, step: 1 },
    };
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };

    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan", {
      led: "number.p76_led_brightness",
    });

    expect(adapter.state.led).toBe(false);
    await adapter.setLed(true);
    await adapter.setLed(false);

    expect(calls).toEqual([
      ["number", "set_value", { entity_id: "number.p76_led_brightness", value: 0 }],
      ["number", "set_value", { entity_id: "number.p76_led_brightness", value: 2 }],
    ]);
  });
});
