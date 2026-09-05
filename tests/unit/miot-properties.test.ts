import { describe, expect, it } from "vitest";
import { resolveMiotFanProperties, withMiotInfo } from "../../src/state/miot-properties";
import { xiaomiMiotP76InfoHass } from "../fixtures/xiaomi-miot-p76";

describe("Xiaomi Miot property metadata", () => {
  it("copies only model and supported property attributes without changing the original entity", () => {
    const hass = xiaomiMiotP76InfoHass();
    const fan = hass.states["fan.xiaomi_p76"]!;
    const info = hass.states["button.xiaomi_p76_info"]!;
    const original = structuredClone(fan);
    info.attributes["unrelated_metadata"] = "ignore";
    const merged = withMiotInfo(fan, info)!;

    expect(merged).not.toBe(fan);
    expect(merged.state).toBe(fan.state);
    expect(merged.attributes).toMatchObject({
      model: "xiaomi.fan.p76",
      friendly_name: "Test fan",
      "fan.vertical_swing": true,
      "vertical_swing_included_angle-2-9": 30,
    });
    expect(merged.attributes["button.info"]).toBeUndefined();
    expect(merged.attributes["unrelated_metadata"]).toBeUndefined();
    expect(fan).toEqual(original);
  });

  it("keeps live primary properties authoritative over Info values", () => {
    const hass = xiaomiMiotP76InfoHass();
    const fan = hass.states["fan.xiaomi_p76"]!;
    fan.attributes["fan.vertical_swing"] = false;
    fan.attributes["vertical_swing_included_angle-2-9"] = 100;
    const merged = withMiotInfo(fan, hass.states["button.xiaomi_p76_info"])!;

    expect(merged.attributes["fan.vertical_swing"]).toBe(false);
    expect(merged.attributes["vertical_swing_included_angle-2-9"]).toBe(100);
  });

  it("does not recreate a missing primary entity from Info metadata", () => {
    const hass = xiaomiMiotP76InfoHass();
    expect(withMiotInfo(undefined, hass.states["button.xiaomi_p76_info"])).toBeUndefined();
    expect(withMiotInfo(hass.states["fan.xiaomi_p76"], undefined)).toBe(hass.states["fan.xiaomi_p76"]);
  });

  it.each(["unavailable", "offline", "missing-marker", "different-model"])("ignores %s Info metadata", (condition) => {
    const hass = xiaomiMiotP76InfoHass();
    const fan = hass.states["fan.xiaomi_p76"]!;
    const info = hass.states["button.xiaomi_p76_info"]!;
    if (condition === "unavailable") info.state = "unavailable";
    if (condition === "offline") info.attributes["available"] = false;
    if (condition === "missing-marker") delete info.attributes["button.info"];
    if (condition === "different-model") fan.attributes["model"] = "xiaomi.fan.p70";

    expect(withMiotInfo(fan, info)).toBe(fan);
  });

  it("resolves the exact exposed P76 property names", () => {
    const hass = xiaomiMiotP76InfoHass();
    expect(resolveMiotFanProperties(hass.states["button.xiaomi_p76_info"])).toEqual({
      horizontalSwing: "fan.horizontal_swing",
      horizontalAngle: "horizontal_swing_included_angle-2-7",
      verticalSwing: "fan.vertical_swing",
      verticalAngle: "vertical_swing_included_angle-2-9",
    });
  });

  it.each(["model", "model_name", "miot_model"])("recognizes a primary %s model attribute", (key) => {
    expect(
      resolveMiotFanProperties({
        state: "on",
        attributes: { [key]: "xiaomi.fan.p76", "fan.vertical_swing": false },
      }),
    ).toEqual({ verticalSwing: "fan.vertical_swing" });
  });

  it("does not extrapolate writable properties to other models", () => {
    expect(resolveMiotFanProperties(undefined)).toEqual({});
    expect(
      resolveMiotFanProperties({
        state: "on",
        attributes: { model: "xiaomi.fan.p70", "fan.vertical_swing": true },
      }),
    ).toEqual({});
  });

  it.each([undefined, null, "30", "unknown", 0, 45, Number.NaN])(
    "does not expose invalid angle property value %s",
    (value) => {
      expect(
        resolveMiotFanProperties({
          state: "on",
          attributes: { model: "xiaomi.fan.p76", "vertical_swing_included_angle-2-9": value },
        }),
      ).toEqual({});
    },
  );

  it.each([undefined, null, "false", 0])("does not expose invalid swing property value %s", (value) => {
    expect(
      resolveMiotFanProperties({
        state: "on",
        attributes: { model: "xiaomi.fan.p76", "fan.vertical_swing": value },
      }),
    ).toEqual({});
  });
});
