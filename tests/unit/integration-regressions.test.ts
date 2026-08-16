import { describe, expect, it } from "vitest";
import { createFanAdapter } from "../../src/adapters";
import { StandardFanAdapter } from "../../src/adapters/standard-fan";
import { loadServiceAvailability } from "../../src/services/service-dispatcher";
import { resolveRelatedEntities } from "../../src/state/related-entities";
import type { HassLike } from "../../src/types";
import { airPurifier4ProHass } from "../fixtures/air-purifier-4-pro";
import { xiaomiMiotP76Hass } from "../fixtures/xiaomi-miot-p76";

describe("integration regression fixtures", () => {
  it("discovers MIoT P76 controls and dispatches standard and select services", async () => {
    const hass = xiaomiMiotP76Hass();
    const services = await loadServiceAvailability(hass);
    const related = await resolveRelatedEntities(hass, "fan.xiaomi_p76");

    expect(related).toEqual({
      sleepMode: undefined,
      verticalSwing: "select.xiaomi_p76_vertical_swing",
      horizontalAngle: "select.xiaomi_p76_horizontal_swing_angle",
      verticalAngle: "select.xiaomi_p76_vertical_swing_angle",
      favoriteLevel: undefined,
      timer: undefined,
      childLock: undefined,
      led: undefined,
      buzzer: undefined,
      ionizer: undefined,
      temperature: undefined,
      humidity: undefined,
    });
    expect([...services.names].some((name) => name.startsWith("xiaomi_miio_fan."))).toBe(false);

    const withoutRelated = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miot");
    expect(withoutRelated.capabilities.verticalSwing).toBe(false);
    expect(withoutRelated.capabilities.horizontalAngle).toBe(false);
    expect(withoutRelated.capabilities.verticalAngle).toBe(false);

    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miot", related);
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };

    expect(adapter.capabilities.verticalSwing).toBe(true);
    expect(adapter.capabilities.horizontalAngle).toBe(true);
    expect(adapter.capabilities.verticalAngle).toBe(true);
    expect(adapter.capabilities.horizontalAngles).toEqual([30, 60, 90, 120]);
    expect(adapter.capabilities.verticalAngles).toEqual([30, 60, 90, 100]);

    await adapter.setHorizontalAngle(90);
    await adapter.setVerticalAngle(60);
    await adapter.setVerticalSwing(false);
    await adapter.setPercentage(75);
    await adapter.setPresetMode("Natural 2");

    expect(calls).toEqual([
      ["fan", "oscillate", { entity_id: "fan.xiaomi_p76", oscillating: true }],
      ["select", "select_option", { entity_id: "select.xiaomi_p76_horizontal_swing_angle", option: "90°" }],
      ["select", "select_option", { entity_id: "select.xiaomi_p76_vertical_swing_angle", option: "60 degrees" }],
      ["select", "select_option", { entity_id: "select.xiaomi_p76_vertical_swing", option: "off" }],
      ["fan", "set_percentage", { entity_id: "fan.xiaomi_p76", percentage: 75 }],
      ["fan", "set_preset_mode", { entity_id: "fan.xiaomi_p76", preset_mode: "Natural 2" }],
    ]);
    expect(calls.some(([domain]) => domain === "xiaomi_miio_fan")).toBe(false);
  });

  it("discovers purifier extras without inventing swing or angle controls", async () => {
    const hass = airPurifier4ProHass();
    const services = await loadServiceAvailability(hass);
    const related = await resolveRelatedEntities(hass, "fan.air_purifier_4_pro");

    expect(related).toEqual({
      sleepMode: undefined,
      verticalSwing: undefined,
      horizontalAngle: undefined,
      verticalAngle: undefined,
      favoriteLevel: "number.air_purifier_4_pro_favorite_level",
      timer: undefined,
      childLock: "switch.air_purifier_4_pro_child_lock",
      led: "select.air_purifier_4_pro_led_brightness",
      buzzer: "switch.air_purifier_4_pro_buzzer",
      ionizer: "switch.air_purifier_4_pro_ionizer",
      temperature: "sensor.air_purifier_4_pro_temperatuur",
      humidity: "sensor.air_purifier_4_pro_luchtvochtigheid",
    });

    const adapter = createFanAdapter(hass, "fan.air_purifier_4_pro", services, "standard", related);
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };

    expect(adapter).toBeInstanceOf(StandardFanAdapter);
    expect(adapter.capabilities.horizontalSwing).toBe(false);
    expect(adapter.capabilities.horizontalAngle).toBe(false);
    expect(adapter.capabilities.verticalSwing).toBe(false);
    expect(adapter.capabilities.verticalAngle).toBe(false);
    expect(adapter.capabilities.favoriteLevel).toBe(true);
    expect(adapter.capabilities.led).toBe(true);
    expect(adapter.capabilities.buzzer).toBe(true);
    expect(adapter.capabilities.childLock).toBe(true);
    expect(adapter.capabilities.ionizer).toBe(true);
    expect(adapter.state.led).toBe(true);
    expect(adapter.state.temperature).toBe("23.5");
    expect(adapter.state.humidity).toBe("46");

    await adapter.setLed(false);
    await adapter.setLed(true);
    expect(calls).toEqual([
      ["select", "select_option", { entity_id: "select.air_purifier_4_pro_led_brightness", option: "2" }],
      ["select", "select_option", { entity_id: "select.air_purifier_4_pro_led_brightness", option: "0" }],
    ]);
  });

  it("does not advertise angle controls for non-numeric select options", async () => {
    const hass: HassLike = {
      states: {
        "fan.invalid_angles": {
          state: "on",
          attributes: {
            supported_features: 0,
          },
        },
        "select.invalid_horizontal_angle": {
          state: "Auto",
          attributes: {
            options: ["Auto", "Manual"],
          },
        },
        "select.invalid_vertical_angle": {
          state: "Fixed",
          attributes: {
            options: ["Fixed", "Oscillating"],
          },
        },
      },
      callService: () => undefined,
    };
    const services = await loadServiceAvailability(hass);
    const adapter = new StandardFanAdapter(hass, "fan.invalid_angles", services, {
      horizontalAngle: "select.invalid_horizontal_angle",
      verticalAngle: "select.invalid_vertical_angle",
    });

    expect(adapter.capabilities.horizontalAngle).toBe(false);
    expect(adapter.capabilities.verticalAngle).toBe(false);
    expect(adapter.capabilities.horizontalAngles).toEqual([]);
    expect(adapter.capabilities.verticalAngles).toEqual([]);
  });
});
