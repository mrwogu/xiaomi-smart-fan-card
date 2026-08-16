import { describe, expect, it } from "vitest";
import { detectCapabilities } from "../../src/state/capabilities";
import { p76Hass } from "../fixtures/p76-state";
import { readServiceAvailability } from "../../src/services/service-dispatcher";

describe("detectCapabilities", () => {
  it("detects all dual-axis controls when custom services exist", () => {
    const hass = p76Hass();
    const services = readServiceAvailability({
      xiaomi_miio_fan: {
        fan_set_oscillation_angle: {},
        fan_set_vertical_oscillation_on: {},
        fan_set_vertical_oscillation_off: {},
        fan_set_vertical_oscillation_angle: {},
        fan_turn: {},
        fan_set_delay_off: {},
        fan_set_child_lock_on: {},
        fan_set_led_brightness: {},
        fan_set_buzzer_on: {},
        fan_set_buzzer_off: {},
      },
    });

    const capabilities = detectCapabilities(hass.states["fan.xiaomi_p76"], services);

    expect(capabilities.isXiaomi).toBe(true);
    expect(capabilities.verticalSwing).toBe(true);
    expect(capabilities.verticalAngle).toBe(true);
    expect(capabilities.directionNudge).toBe(true);
    expect(capabilities.buzzer).toBe(true);
  });

  it("hides custom controls when service registry says unavailable", () => {
    const hass = p76Hass();
    const services = readServiceAvailability({ fan: { toggle: {} } });
    const capabilities = detectCapabilities(hass.states["fan.xiaomi_p76"], services);

    expect(capabilities.verticalAngle).toBe(false);
    expect(capabilities.directionNudge).toBe(false);
    expect(capabilities.timer).toBe(false);
    expect(capabilities.childLock).toBe(false);
  });

  it("does not treat preset-only feature bit as swing support", () => {
    const capabilities = detectCapabilities({
      state: "on",
      attributes: { supported_features: 8 },
    });

    expect(capabilities.horizontalSwing).toBe(false);
    expect(capabilities.verticalSwing).toBe(false);
    expect(capabilities.horizontalAngle).toBe(false);
    expect(capabilities.verticalAngle).toBe(false);
  });

  it("honors the official oscillation and direction feature bits", () => {
    const capabilities = detectCapabilities({
      state: "on",
      attributes: { supported_features: 6 },
    });

    expect(capabilities.horizontalSwing).toBe(true);
    expect(capabilities.direction).toBe(true);
  });
});
