import { describe, expect, it } from "vitest";
import {
  getModelProfile,
  percentageForSpeedLevel,
  resolveSpeedLevels,
  speedLevelForPercentage,
} from "../../src/state/model-profiles";

describe("Xiaomi fan model profiles", () => {
  it.each(["zhimi.fan.v2", "dmaker.fan.1c", "xiaomi.fan.p45", "xiaomi.fan.p76", "xiaomi.fan.p85"])(
    "recognizes %s",
    (model) => {
      const profile = getModelProfile(model);

      expect(profile.known).toBe(true);
      expect(profile.isXiaomi).toBe(true);
      expect(profile.speedLevels).toBeGreaterThan(0);
    },
  );

  it("keeps unknown Xiaomi fan models safe and generic", () => {
    const profile = getModelProfile("xiaomi.fan.future");

    expect(profile.known).toBe(false);
    expect(profile.isXiaomi).toBe(true);
    expect(profile.horizontalAngles).toEqual([]);
  });

  it("records the Smartmi Fan 3 timer protocol unit", () => {
    expect(getModelProfile("zhimi.fan.za5").timerUnit).toBe("s");
  });

  it("derives speed levels from a percentage step", () => {
    expect(
      resolveSpeedLevels({
        percentage: 40,
        percentage_step: 20,
      }),
    ).toBe(5);
  });

  it("keeps percentage-step speed levels aligned in both directions", () => {
    expect(percentageForSpeedLevel(3, 4, 30)).toBe(90);
    expect(percentageForSpeedLevel(4, 4, 30)).toBe(100);
    expect(speedLevelForPercentage(90, 4, 30)).toBe(3);
    expect(speedLevelForPercentage(100, 4, 30)).toBe(4);
  });
});
