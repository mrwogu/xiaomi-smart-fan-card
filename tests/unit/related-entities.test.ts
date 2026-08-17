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
          { entity_id: "select.example_horizontal_angle", device_id: "device-1" },
          { entity_id: "select.example_vertical_angle", device_id: "device-1" },
          { entity_id: "select.example_led", device_id: "device-1" },
          { entity_id: "input_boolean.example_child_lock", device_id: "device-1" },
          { entity_id: "sensor.example_temperature", device_id: "device-1" },
        ] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toEqual({
      horizontalAngle: "select.example_horizontal_angle",
      timer: "number.example_timer",
      led: "select.example_led",
      childLock: "input_boolean.example_child_lock",
      temperature: "sensor.example_temperature",
      verticalAngle: "select.example_vertical_angle",
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

  it("discovers localized sensors through their device class", async () => {
    const hass: HassLike = {
      states: {
        "fan.example": { state: "on", attributes: {} },
        "sensor.example_luchtvochtigheid": { state: "46", attributes: { device_class: "humidity" } },
      },
      callService: () => undefined,
      callWS: async <T>() =>
        [
          { entity_id: "fan.example", device_id: "device-1" },
          { entity_id: "sensor.example_temperatuur", device_id: "device-1", original_device_class: "temperature" },
          { entity_id: "sensor.example_luchtvochtigheid", device_id: "device-1" },
        ] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toEqual({
      humidity: "sensor.example_luchtvochtigheid",
      temperature: "sensor.example_temperatuur",
    });
  });

  it("falls back to the English suffix when no sensor declares a device class", async () => {
    const hass: HassLike = {
      states: { "fan.example": { state: "on", attributes: {} } },
      callService: () => undefined,
      callWS: async <T>() =>
        [
          { entity_id: "fan.example", device_id: "device-1" },
          { entity_id: "sensor.example_temperature", device_id: "device-1" },
          { entity_id: "sensor.example_humidity", device_id: "device-1" },
        ] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toEqual({
      humidity: "sensor.example_humidity",
      temperature: "sensor.example_temperature",
    });
  });

  it("keeps vertical angle selects out of horizontal angle and swing roles", async () => {
    const hass: HassLike = {
      states: { "fan.example": { state: "on", attributes: {} } },
      callService: () => undefined,
      callWS: async <T>() =>
        [
          { entity_id: "fan.example", device_id: "device-1" },
          { entity_id: "select.example_vertical_oscillation_angle", device_id: "device-1" },
        ] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toMatchObject({
      horizontalAngle: undefined,
      verticalSwing: undefined,
      verticalAngle: "select.example_vertical_oscillation_angle",
    });
  });

  it("discovers a same-device horizontal oscillation entity", async () => {
    const hass: HassLike = {
      states: {
        "fan.example": { state: "on", attributes: {} },
        "switch.example_oscillating": { state: "off", attributes: {} },
      },
      callService: () => undefined,
      callWS: async <T>() =>
        [
          { entity_id: "fan.example", device_id: "device-1" },
          { entity_id: "switch.example_oscillating", device_id: "device-1" },
        ] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toMatchObject({
      horizontalSwing: "switch.example_oscillating",
    });
  });

  it("does not assign vertical oscillation to the horizontal role", async () => {
    const hass: HassLike = {
      states: {
        "fan.example": { state: "on", attributes: {} },
        "switch.example_oscillating": { state: "off", attributes: {} },
        "switch.example_vertical_oscillating": { state: "off", attributes: {} },
      },
      callService: () => undefined,
      callWS: async <T>() =>
        [
          { entity_id: "fan.example", device_id: "device-1" },
          { entity_id: "switch.example_vertical_oscillating", device_id: "device-1" },
          { entity_id: "switch.example_oscillating", device_id: "device-1" },
        ] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toMatchObject({
      horizontalSwing: "switch.example_oscillating",
      verticalSwing: "switch.example_vertical_oscillating",
    });
  });

  it("keeps hint-matched vertical swing modes out of the horizontal role", async () => {
    const hass: HassLike = {
      states: {
        "fan.example": { state: "on", attributes: {} },
        "select.example_vertical_swing_mode": {
          state: "off",
          attributes: { options: ["off", "on"] },
        },
      },
      callService: () => undefined,
      callWS: async <T>() =>
        [
          { entity_id: "fan.example", device_id: "device-1" },
          { entity_id: "select.example_vertical_swing_mode", device_id: "device-1" },
        ] as T,
    };

    await expect(resolveRelatedEntities(hass, "fan.example")).resolves.toMatchObject({
      horizontalSwing: undefined,
      verticalSwing: "select.example_vertical_swing_mode",
    });
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
