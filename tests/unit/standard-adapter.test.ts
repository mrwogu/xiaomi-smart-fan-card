import { describe, expect, it } from "vitest";
import { StandardFanAdapter } from "../../src/adapters/standard-fan";
import { readServiceAvailability } from "../../src/services/service-dispatcher";
import type { HassLike } from "../../src/types";

const services = readServiceAvailability({
  fan: {
    oscillate: {},
  },
  xiaomi_miio_fan: {
    fan_set_oscillation_angle: {},
    fan_set_vertical_oscillation_angle: {},
  },
});

const createHass = (horizontalOptions: unknown[], verticalOptions: unknown[]) => {
  const calls: unknown[][] = [];
  const hass: HassLike = {
    states: {
      "fan.example": {
        state: "on",
        attributes: { friendly_name: "Example fan" },
      },
      "select.example_horizontal_angle": {
        state: "30°",
        attributes: { options: horizontalOptions },
      },
      "select.example_vertical_angle": {
        state: "60 degrees",
        attributes: { options: verticalOptions },
      },
    },
    callService: (...args) => {
      calls.push(args);
    },
  };

  return { hass, calls };
};

describe("StandardFanAdapter", () => {
  it("dispatches numeric angle options through select entities", async () => {
    const { hass, calls } = createHass(["0", "30°", "60"], ["30", "60 degrees", "90"]);
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      horizontalAngle: "select.example_horizontal_angle",
      verticalAngle: "select.example_vertical_angle",
    });

    expect(adapter.state.horizontalAngle).toBe(30);
    expect(adapter.state.verticalAngle).toBe(60);
    expect(adapter.capabilities.horizontalAngles).toEqual([0, 30, 60]);
    expect(adapter.capabilities.verticalAngles).toEqual([30, 60, 90]);

    await adapter.setHorizontalAngle(30);
    await adapter.setVerticalAngle(60);

    expect(calls).toEqual([
      ["select", "select_option", { entity_id: "select.example_horizontal_angle", option: "30°" }],
      ["select", "select_option", { entity_id: "select.example_vertical_angle", option: "60 degrees" }],
    ]);
  });

  it("sorts numeric angle options for cycle controls", () => {
    const { hass } = createHass(["90", "30°", "60"], ["90", "30", "60"]);
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      horizontalAngle: "select.example_horizontal_angle",
      verticalAngle: "select.example_vertical_angle",
    });

    expect(adapter.capabilities.horizontalAngles).toEqual([30, 60, 90]);
    expect(adapter.capabilities.verticalAngles).toEqual([30, 60, 90]);
  });

  it("keeps generic numeric LED state and actions aligned", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["number.example_led"] = {
      state: "0",
      attributes: { min: 0, max: 100, step: 1 },
    };

    const offAdapter = new StandardFanAdapter(hass, "fan.example", services, {
      led: "number.example_led",
    });
    expect(offAdapter.state.led).toBe(false);
    await offAdapter.setLed(true);

    hass.states["number.example_led"] = {
      state: "100",
      attributes: { min: 0, max: 100, step: 1 },
    };
    const onAdapter = new StandardFanAdapter(hass, "fan.example", services, {
      led: "number.example_led",
    });
    expect(onAdapter.state.led).toBe(true);
    await onAdapter.setLed(false);

    expect(calls).toEqual([
      ["number", "set_value", { entity_id: "number.example_led", value: 100 }],
      ["number", "set_value", { entity_id: "number.example_led", value: 0 }],
    ]);
  });

  it("dispatches semantic LED select options", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["select.example_led"] = {
      state: "off",
      attributes: { options: ["off", "on"] },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      led: "select.example_led",
    });

    expect(adapter.state.led).toBe(false);
    await adapter.setLed(true);

    expect(calls).toEqual([["select", "select_option", { entity_id: "select.example_led", option: "on" }]]);
  });

  it("uses a related horizontal oscillation entity when one is exposed", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["switch.example_horizontal_swing"] = {
      state: "off",
      attributes: {},
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      horizontalSwing: "switch.example_horizontal_swing",
    });

    expect(adapter.capabilities.horizontalSwing).toBe(true);
    await adapter.setHorizontalSwing(true);

    expect(calls).toEqual([["switch", "turn_on", { entity_id: "switch.example_horizontal_swing" }]]);
  });

  it("drops stale primary oscillation state when the related entity is unavailable", () => {
    const { hass } = createHass([], []);
    hass.states["fan.example"] = {
      state: "on",
      attributes: { friendly_name: "Example fan", oscillating: true },
    };
    hass.states["switch.example_horizontal_swing"] = {
      state: "unavailable",
      attributes: {},
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      horizontalSwing: "switch.example_horizontal_swing",
    });

    expect(adapter.state.horizontalSwing).toBeUndefined();
  });

  it("supports numeric boolean select options used by MIoT entities", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["select.example_vertical_swing"] = {
      state: "0",
      attributes: { options: ["0", "1"] },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      verticalSwing: "select.example_vertical_swing",
    });

    expect(adapter.capabilities.verticalSwing).toBe(true);
    await adapter.setVerticalSwing(true);

    expect(calls).toEqual([["select", "select_option", { entity_id: "select.example_vertical_swing", option: "1" }]]);
  });

  it("clamps favorite level values to the related number range", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["number.example_favorite_level"] = {
      state: "40",
      attributes: { min: 10, max: 90, step: 5 },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      favoriteLevel: "number.example_favorite_level",
    });

    await adapter.setFavoriteLevel(97);

    expect(calls).toEqual([["number", "set_value", { entity_id: "number.example_favorite_level", value: 90 }]]);
  });

  it("snaps percentage actions to the integration step", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["fan.example"] = {
      state: "on",
      attributes: { friendly_name: "Example fan", percentage: 25, percentage_step: 25 },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services);

    await adapter.setPercentage(42);

    expect(calls).toEqual([["fan", "set_percentage", { entity_id: "fan.example", percentage: 50 }]]);
  });
  it("falls back to the existing custom angle service when select options do not match", async () => {
    const { hass, calls } = createHass(["0", "15 degrees"], ["30", "60 degrees"]);
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      horizontalAngle: "select.example_horizontal_angle",
      verticalAngle: "select.example_vertical_angle",
    });

    await adapter.setHorizontalAngle(30);

    expect(calls).toEqual([["xiaomi_miio_fan", "fan_set_oscillation_angle", { entity_id: "fan.example", angle: 30 }]]);
  });

  it("keeps the primary angle attribute when a mode select is matched as an angle entity", () => {
    const { hass } = createHass(["Auto", "Manual"], ["Auto", "Manual"]);
    hass.states["fan.example"] = {
      state: "on",
      attributes: { horizontal_swing_angle: 60, vertical_swing_angle: 30 },
    };
    hass.states["select.example_horizontal_angle"] = {
      state: "Auto",
      attributes: { options: ["Auto", "Manual"] },
    };
    hass.states["select.example_vertical_angle"] = {
      state: "Manual",
      attributes: { options: ["Auto", "Manual"] },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      horizontalAngle: "select.example_horizontal_angle",
      verticalAngle: "select.example_vertical_angle",
    });

    expect(adapter.state.horizontalAngle).toBe(60);
    expect(adapter.state.verticalAngle).toBe(30);
  });

  it("turns an LED brightness select off instead of dimming it", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["select.example_led_brightness"] = {
      state: "Bright",
      attributes: { options: ["Bright", "Dim", "Off"] },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      led: "select.example_led_brightness",
    });

    expect(adapter.state.led).toBe(true);
    await adapter.setLed(false);
    await adapter.setLed(true);

    expect(calls).toEqual([
      ["select", "select_option", { entity_id: "select.example_led_brightness", option: "Off" }],
      ["select", "select_option", { entity_id: "select.example_led_brightness", option: "Bright" }],
    ]);
  });

  it("reads a dimmed LED select as lit", () => {
    const { hass } = createHass([], []);
    hass.states["select.example_led_brightness"] = {
      state: "Dim",
      attributes: { options: ["Bright", "Dim", "Off"] },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      led: "select.example_led_brightness",
    });

    expect(adapter.state.led).toBe(true);
  });

  it("does not pick an unrelated option that merely contains a boolean token", async () => {
    const { hass } = createHass([], []);
    hass.states["select.example_sleep_mode"] = {
      state: "None",
      attributes: { options: ["None", "Constant"] },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      sleepMode: "select.example_sleep_mode",
    });

    expect(adapter.capabilities.sleepMode).toBe(false);
    await expect(adapter.setSleepMode(true)).rejects.toThrow("does not expose a sleep preset");
  });

  it("sets and clears a primary sleep preset", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["fan.example"] = {
      state: "on",
      attributes: {
        friendly_name: "Example fan",
        preset_mode: "Normal",
        preset_modes: ["Normal", "Sleep"],
      },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services);

    await adapter.setSleepMode(true);
    await adapter.setSleepMode(false);

    expect(calls).toEqual([
      ["fan", "set_preset_mode", { entity_id: "fan.example", preset_mode: "Sleep" }],
      ["fan", "set_preset_mode", { entity_id: "fan.example", preset_mode: "Normal" }],
    ]);
  });

  it("dispatches standard mode selections", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["fan.example"] = {
      state: "on",
      attributes: {
        friendly_name: "Example fan",
        preset_mode: "Normal",
        preset_modes: ["Normal", "Natural"],
      },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services);

    await adapter.setMode("natural");
    await adapter.setMode("normal");

    expect(calls).toEqual([
      ["fan", "set_preset_mode", { entity_id: "fan.example", preset_mode: "Natural" }],
      ["fan", "set_preset_mode", { entity_id: "fan.example", preset_mode: "Normal" }],
    ]);
  });

  it("dispatches a related sleep switch", async () => {
    const { hass, calls } = createHass([], []);
    hass.states["switch.example_sleep_mode"] = {
      state: "off",
      attributes: {},
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      sleepMode: "switch.example_sleep_mode",
    });

    await adapter.setSleepMode(true);

    expect(calls).toEqual([["switch", "turn_on", { entity_id: "switch.example_sleep_mode" }]]);
  });

  it("rejects sleep actions when no sleep preset exists", async () => {
    const { hass } = createHass([], []);
    hass.states["fan.example"] = {
      state: "on",
      attributes: { friendly_name: "Example fan", preset_modes: ["Normal"] },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services);

    await expect(adapter.setSleepMode(true)).rejects.toThrow("does not expose a sleep preset");
  });

  it("reports an angle spec instead of an unusable preset list for a fine-grained number", () => {
    const { hass } = createHass([], []);
    hass.states["number.example_horizontal_angle"] = {
      state: "60",
      attributes: { min: 0, max: 120, step: 1, unit_of_measurement: "°" },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      horizontalAngle: "number.example_horizontal_angle",
    });

    expect(adapter.capabilities.horizontalAngles).toEqual([]);
    expect(adapter.capabilities.horizontalAngleSpec).toEqual({ min: 0, max: 120, step: 1 });
  });

  it("keeps angle steps free of timer unit conversion", () => {
    const { hass } = createHass([], []);
    hass.states["number.example_vertical_angle"] = {
      state: "60",
      attributes: { min: 0, max: 120, step: 30, unit_of_measurement: "s" },
    };
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      verticalAngle: "number.example_vertical_angle",
    });

    expect(adapter.capabilities.verticalAngles).toEqual([0, 30, 60, 90, 120]);
  });
});
