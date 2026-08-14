import { describe, expect, it } from "vitest";
import { createFanAdapter } from "../../src/adapters";
import { readServiceAvailability } from "../../src/services/service-dispatcher";
import { normalizeFanState } from "../../src/state/normalize-state";
import { detectCapabilities } from "../../src/state/capabilities";
import { p76LiveHass } from "../fixtures/p76-live-state";
import type { HassLike } from "../../src/types";

const services = readServiceAvailability({
  fan: {
    turn_on: {},
    turn_off: {},
    toggle: {},
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
});

const recorded = (hass: HassLike): unknown[][] => {
  const calls: unknown[][] = [];
  hass.callService = (...args) => {
    calls.push(args);
  };
  return calls;
};

describe("live P76 attributes", () => {
  it("reads live oscillation and angle attribute names", () => {
    const hass = p76LiveHass();
    const state = normalizeFanState("fan.xiaomi_p76", hass.states["fan.xiaomi_p76"]);

    expect(state.horizontalSwing).toBe(false);
    expect(state.horizontalAngle).toBe(30);
    expect(state.verticalSwing).toBe(true);
    expect(state.verticalAngle).toBe(100);
    expect(state.speedLevels).toBe(4);
    expect(state.percentage).toBe(3);
    expect(state.timerMinutes).toBe(0);
    expect(state.direction).toBe("forward");
    expect(state.mode).toBe("normal");
  });

  it("detects dual-axis capabilities from live attribute names", () => {
    const hass = p76LiveHass();
    const capabilities = detectCapabilities(hass.states["fan.xiaomi_p76"], services);

    expect(capabilities.horizontalAngle).toBe(true);
    expect(capabilities.verticalAngle).toBe(true);
    expect(capabilities.verticalSwing).toBe(true);
    expect(capabilities.directionNudge).toBe(true);
    expect(capabilities.verticalAngles).toContain(100);
  });

  it("enables the matching swing axis before applying an angle", async () => {
    const hass = p76LiveHass();
    const calls = recorded(hass);
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.setHorizontalAngle(60);

    expect(calls).toEqual([
      ["fan", "oscillate", { entity_id: "fan.xiaomi_p76", oscillating: true }],
      ["xiaomi_miio_fan", "fan_set_oscillation_angle", { entity_id: "fan.xiaomi_p76", angle: 60 }],
    ]);
  });

  it("keeps an already running swing axis untouched", async () => {
    const hass = p76LiveHass();
    const calls = recorded(hass);
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.setVerticalAngle(60);

    expect(calls).toEqual([
      ["xiaomi_miio_fan", "fan_set_vertical_oscillation_angle", { entity_id: "fan.xiaomi_p76", vertical_angle: 60 }],
    ]);
  });

  it("stops running swing axes before nudging the fan", async () => {
    const hass = p76LiveHass();
    const calls = recorded(hass);
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.nudge("left");

    expect(calls).toEqual([
      ["xiaomi_miio_fan", "fan_set_vertical_oscillation_off", { entity_id: "fan.xiaomi_p76" }],
      ["xiaomi_miio_fan", "fan_turn", { entity_id: "fan.xiaomi_p76", direction: "left" }],
    ]);
  });

  it("turns the fan off instead of setting a zero percentage", async () => {
    const hass = p76LiveHass();
    const calls = recorded(hass);
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.setPercentage(0);

    expect(calls).toEqual([["fan", "turn_off", { entity_id: "fan.xiaomi_p76" }]]);
  });

  it("turns the fan on with the requested percentage when it is off", async () => {
    const hass = p76LiveHass();
    const entity = hass.states["fan.xiaomi_p76"]!;
    hass.states["fan.xiaomi_p76"] = { ...entity, state: "off" };
    const calls = recorded(hass);
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.setPercentage(40);

    expect(calls).toEqual([["fan", "turn_on", { entity_id: "fan.xiaomi_p76", percentage: 40 }]]);
  });

  it("sets the percentage directly while the fan runs", async () => {
    const hass = p76LiveHass();
    const calls = recorded(hass);
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miio_fan");

    await adapter.setPercentage(40);

    expect(calls).toEqual([["fan", "set_percentage", { entity_id: "fan.xiaomi_p76", percentage: 40 }]]);
  });
});
