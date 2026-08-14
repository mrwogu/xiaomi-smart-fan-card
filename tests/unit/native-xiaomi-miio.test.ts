import { describe, expect, it } from "vitest";
import { createFanAdapter } from "../../src/adapters";
import { readServiceAvailability } from "../../src/services/service-dispatcher";
import { resolveRelatedEntities } from "../../src/state/related-entities";
import { nativeXiaomiMiioHass } from "../fixtures/native-xiaomi-miio";

const services = readServiceAvailability({
  fan: {
    toggle: {},
    set_percentage: {},
    set_preset_mode: {},
    oscillate: {},
    set_direction: {},
  },
  switch: {
    turn_on: {},
    turn_off: {},
  },
  number: {
    set_value: {},
  },
});

describe("native xiaomi_miio adapter", () => {
  it("uses standard fan actions and related entities", async () => {
    const hass = nativeXiaomiMiioHass();
    const related = await resolveRelatedEntities(hass, "fan.xiaomi_native");
    const calls: unknown[][] = [];
    hass.callService = (...args) => {
      calls.push(args);
    };

    const adapter = createFanAdapter(hass, "fan.xiaomi_native", services, "xiaomi_miio", related);

    expect(adapter.capabilities.isXiaomi).toBe(true);
    expect(adapter.capabilities.naturalMode).toBe(true);
    expect(adapter.capabilities.led).toBe(true);
    expect(adapter.capabilities.timer).toBe(true);
    expect(adapter.capabilities.favoriteLevel).toBe(true);
    expect(adapter.state.temperature).toBe("24.5");
    expect(adapter.state.humidity).toBe("45");

    await adapter.setMode("natural");
    await adapter.setLed(false);
    await adapter.setTimer(120);
    await adapter.setFavoriteLevel(60);

    expect(calls).toEqual([
      ["fan", "set_preset_mode", { entity_id: "fan.xiaomi_native", preset_mode: "Nature" }],
      ["switch", "turn_off", { entity_id: "switch.xiaomi_native_led" }],
      ["number", "set_value", { entity_id: "number.xiaomi_native_delay_off_countdown", value: 120 }],
      ["number", "set_value", { entity_id: "number.xiaomi_native_favorite_level", value: 60 }],
    ]);
  });
});
