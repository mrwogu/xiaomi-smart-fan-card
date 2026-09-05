import { describe, expect, it } from "vitest";
import { ServiceDispatcher } from "../../src/services/service-dispatcher";
import { p76Hass } from "../fixtures/p76-state";

describe("ServiceDispatcher", () => {
  it("adds entity_id to service payload", async () => {
    const hass = p76Hass();
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };

    const dispatcher = new ServiceDispatcher(hass, "fan.xiaomi_p76", {
      loaded: true,
      names: new Set(["fan.set_percentage"]),
    });

    await dispatcher.standard("set_percentage", { percentage: 50 });

    expect(calls).toEqual([["fan", "set_percentage", { entity_id: "fan.xiaomi_p76", percentage: 50 }]]);
  });

  it("blocks unavailable custom service", async () => {
    const hass = p76Hass();
    let called = false;
    hass.callService = () => {
      called = true;
    };

    const dispatcher = new ServiceDispatcher(hass, "fan.xiaomi_p76", {
      loaded: true,
      names: new Set(),
    });

    await expect(dispatcher.custom("xiaomi_miio_fan", "fan_turn", { direction: "up" })).resolves.toBe(false);
    expect(called).toBe(false);
  });

  it("does not guess custom service availability before the registry loads", async () => {
    const hass = p76Hass();
    const dispatcher = new ServiceDispatcher(hass, "fan.xiaomi_p76", {
      loaded: false,
      names: new Set(["xiaomi_miio_fan.fan_turn"]),
    });

    await expect(dispatcher.custom("xiaomi_miio_fan", "fan_turn", { direction: "up" })).resolves.toBe(false);
  });
});
