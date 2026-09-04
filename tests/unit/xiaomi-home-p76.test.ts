import { describe, expect, it } from "vitest";
import { createFanAdapter } from "../../src/adapters";
import { readServiceAvailability } from "../../src/services/service-dispatcher";
import { detectCapabilities } from "../../src/state/capabilities";
import { resolveRelatedEntities } from "../../src/state/related-entities";
import { xiaomiHomeP76Hass } from "../fixtures/xiaomi-home-p76";

describe("native Xiaomi Home P76", () => {
  it("discovers the position pad buttons from their MIoT action ids", async () => {
    const hass = xiaomiHomeP76Hass();

    await expect(resolveRelatedEntities(hass, "fan.xiaomi_sg_000000000000_p76_s_2_fan")).resolves.toMatchObject({
      nudgeLeft: "button.xiaomi_sg_000000000000_p76_turn_left_a_2_4",
      nudgeRight: "button.xiaomi_sg_000000000000_p76_turn_right_a_2_5",
      nudgeUp: "button.xiaomi_sg_000000000000_p76_turn_upward_a_2_6",
      nudgeDown: "button.xiaomi_sg_000000000000_p76_turn_downward_a_2_7",
    });
  });

  it("reports the pad as actionable without the fan_turn service", async () => {
    const hass = xiaomiHomeP76Hass();
    const services = readServiceAvailability({
      fan: { turn_on: {}, turn_off: {}, set_percentage: {}, set_preset_mode: {} },
      button: { press: {} },
    });
    const related = await resolveRelatedEntities(hass, "fan.xiaomi_sg_000000000000_p76_s_2_fan");
    const capabilities = detectCapabilities(hass.states["fan.xiaomi_sg_000000000000_p76_s_2_fan"], services, related);

    expect(capabilities.directionNudge).toBe(true);
  });

  it("keeps the pad hidden when only some directions exist", async () => {
    const hass = xiaomiHomeP76Hass();
    const related = await resolveRelatedEntities(hass, "fan.xiaomi_sg_000000000000_p76_s_2_fan");
    const capabilities = detectCapabilities(hass.states["fan.xiaomi_sg_000000000000_p76_s_2_fan"], undefined, {
      ...related,
      nudgeDown: undefined,
    });

    expect(capabilities.directionNudge).toBe(false);
  });

  it("presses the matching button instead of a vendor service", async () => {
    const hass = xiaomiHomeP76Hass();
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };
    const services = readServiceAvailability({
      fan: { turn_on: {}, turn_off: {}, set_percentage: {}, set_preset_mode: {} },
      button: { press: {} },
    });
    const related = await resolveRelatedEntities(hass, "fan.xiaomi_sg_000000000000_p76_s_2_fan");
    const adapter = createFanAdapter(hass, "fan.xiaomi_sg_000000000000_p76_s_2_fan", services, "auto", related);

    expect(adapter.capabilities.directionNudge).toBe(true);

    await adapter.nudge("up");
    await adapter.nudge("left");

    expect(calls).toEqual([
      ["button", "press", { entity_id: "button.xiaomi_sg_000000000000_p76_turn_upward_a_2_6" }],
      ["button", "press", { entity_id: "button.xiaomi_sg_000000000000_p76_turn_left_a_2_4" }],
    ]);
  });
});
