import { describe, expect, it } from "vitest";
import { getModelProfile } from "../../src/state/model-profiles";

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
});
