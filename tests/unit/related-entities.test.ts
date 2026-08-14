import { describe, expect, it } from "vitest";
import { resolveRelatedEntities } from "../../src/state/related-entities";
import type { HassLike } from "../../src/types";

describe("resolveRelatedEntities", () => {
  it("discovers optional controls across supported entity domains", async () => {
    const hass: HassLike = {
      states: {
        "fan.example": { state: "on", attributes: {} },
      },
      callService: () => undefined,
      callWS: async <T>() =>
        [
          { entity_id: "fan.example", device_id: "device-1" },
          { entity_id: "number.example_timer", device_id: "device-1" },
          { entity_id: "select.example_led", device_id: "device-1" },
          { entity_id: "input_boolean.example_child_lock", device_id: "device-1" },
          { entity_id: "sensor.example_temperature", device_id: "device-1" },
        ] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toEqual({
      timer: "number.example_timer",
      led: "select.example_led",
      childLock: "input_boolean.example_child_lock",
      temperature: "sensor.example_temperature",
    });
  });

  it("reports a failed registry lookup instead of an empty device", async () => {
    const hass: HassLike = {
      states: { "fan.example": { state: "on", attributes: {} } },
      callService: () => undefined,
      callWS: async () => {
        throw new Error("connection lost");
      },
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toBeUndefined();
  });

  it("reports an empty device when the fan has no registry siblings", async () => {
    const hass: HassLike = {
      states: { "fan.example": { state: "on", attributes: {} } },
      callService: () => undefined,
      callWS: async <T>() => [{ entity_id: "fan.example", device_id: "device-1" }] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toEqual({
      buzzer: undefined,
      childLock: undefined,
      favoriteLevel: undefined,
      horizontalAngle: undefined,
      humidity: undefined,
      ionizer: undefined,
      led: undefined,
      sleepMode: undefined,
      temperature: undefined,
      timer: undefined,
      verticalAngle: undefined,
      verticalSwing: undefined,
    });
  });
});
