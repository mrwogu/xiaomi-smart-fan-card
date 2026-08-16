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

  it("falls back to the existing custom angle service when select options do not match", async () => {
    const { hass, calls } = createHass(["0", "15 degrees"], ["30", "60 degrees"]);
    const adapter = new StandardFanAdapter(hass, "fan.example", services, {
      horizontalAngle: "select.example_horizontal_angle",
      verticalAngle: "select.example_vertical_angle",
    });

    await adapter.setHorizontalAngle(30);

    expect(calls).toEqual([["xiaomi_miio_fan", "fan_set_oscillation_angle", { entity_id: "fan.example", angle: 30 }]]);
  });
});
