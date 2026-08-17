import { describe, expect, it } from "vitest";
import { normalizeFanState } from "../../src/state/normalize-state";
import { p76Hass } from "../fixtures/p76-state";

describe("normalizeFanState", () => {
  it("normalizes P76 attributes", () => {
    const hass = p76Hass();
    const state = normalizeFanState("fan.xiaomi_p76", hass.states["fan.xiaomi_p76"]);

    expect(state.model).toBe("xiaomi.fan.p76");
    expect(state.percentage).toBe(50);
    expect(state.level).toBe(2);
    expect(state.horizontalSwing).toBe(true);
    expect(state.verticalSwing).toBe(true);
    expect(state.timerMinutes).toBe(60);
  });

  it("treats missing and unavailable entities safely", () => {
    const state = normalizeFanState("fan.missing");

    expect(state.available).toBe(false);
    expect(state.isOn).toBe(false);
    expect(state.percentage).toBe(0);
    expect(state.level).toBe(0);
  });

  it("recognizes natural mode from operation mode", () => {
    const state = normalizeFanState("fan.natural", {
      state: "on",
      attributes: {
        mode: "Natural",
        fan_speed: "75",
      },
    });

    expect(state.mode).toBe("natural");
    expect(state.percentage).toBe(75);
  });

  it("derives speed level count from live attributes", () => {
    const state = normalizeFanState("fan.three-level", {
      state: "on",
      attributes: {
        percentage: 100,
        speed_list: ["1", "2", "3"],
      },
    });

    expect(state.speedLevels).toBe(3);
    expect(state.level).toBe(3);
  });

  it("normalizes timer seconds and LED brightness safely", () => {
    const state = normalizeFanState("fan.timer", {
      state: "on",
      attributes: {
        timer: 3180,
        timer_unit: "s",
        led_brightness: 2,
      },
    });

    expect(state.timerMinutes).toBe(53);
    expect(state.led).toBe(false);
  });

  it("prefers LED brightness over a stale LED flag", () => {
    const state = normalizeFanState("fan.led", {
      state: "on",
      attributes: {
        led: true,
        led_brightness: 2,
      },
    });

    expect(state.led).toBe(false);
  });

  it("reads angles written as decorated select labels", () => {
    const state = normalizeFanState("fan.angles", {
      state: "on",
      attributes: {
        horizontal_swing_angle: "90°",
        vertical_swing_angle: "60 degrees",
      },
    });

    expect(state.horizontalAngle).toBe(90);
    expect(state.verticalAngle).toBe(60);
  });

  it("uses the Smartmi Fan 3 timer seconds profile when no unit is reported", () => {
    const state = normalizeFanState("fan.za5", {
      state: "on",
      attributes: {
        model: "zhimi.fan.za5",
        delay_off_countdown: 120,
      },
    });

    expect(state.timerMinutes).toBe(2);
  });
});
