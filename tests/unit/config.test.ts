import { describe, expect, it } from "vitest";
import { normalizeCardConfig } from "../../src/config";

describe("normalizeCardConfig", () => {
  it("keeps legacy aliases and resolves a compact header", () => {
    const config = normalizeCardConfig({
      type: "custom:xiaomi-fan-card",
      entity_id: "fan.p76",
      platform: "xiaomi_miio_fan",
      sleep_mode: false,
      hide_led_button: true,
    });

    expect(config.entity).toBe("fan.p76");
    expect(config.integration).toBe("xiaomi_miio_fan");
    expect(config.controls.show_sleep).toBe(false);
    expect(config.controls.show_led).toBe(false);
    expect(config.header.variant).toBe("compact");
    expect(config.header.show_eyebrow).toBe(false);
    expect(config.header.show_mode).toBe(false);
    expect(config.header.show_model).toBe(false);
  });

  it("gives nested visibility settings precedence over legacy fields", () => {
    const config = normalizeCardConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.example",
      show_timer: false,
      show_led: false,
      controls: {
        show_timer: true,
        show_led: true,
        selection_mode: "select",
        timer_mode: "cycle",
      },
      details: {
        show: false,
        show_temperature: false,
      },
      layout: {
        theme: "industrial",
        density: "compact",
        columns: "one",
      },
    });

    expect(config.controls.show_timer).toBe(true);
    expect(config.controls.show_led).toBe(true);
    expect(config.details.show).toBe(false);
    expect(config.details.show_temperature).toBe(false);
    expect(config.controls.selection_mode).toBe("select");
    expect(config.controls.timer_mode).toBe("cycle");
    expect(config.layout.theme).toBe("industrial");
    expect(config.layout.density).toBe("compact");
    expect(config.layout.columns).toBe("one");
  });

  it("expands the full header defaults", () => {
    const config = normalizeCardConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.example",
      header: { variant: "full" },
    });

    expect(config.header.variant).toBe("full");
    expect(config.header.show_eyebrow).toBe(true);
    expect(config.header.show_mode).toBe(true);
    expect(config.header.show_model).toBe(true);
  });

  it("falls back safely for invalid enum values", () => {
    const config = normalizeCardConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.example",
      theme: "unknown" as never,
      integration: "unknown" as never,
      header: { variant: "large" as never },
      controls: { selection_mode: "grid" as never },
      layout: { density: "dense" as never },
    });

    expect(config.theme).toBe("auto");
    expect(config.integration).toBe("auto");
    expect(config.header.variant).toBe("compact");
    expect(config.controls.selection_mode).toBe("auto");
    expect(config.layout.density).toBe("comfortable");
  });

  it("accepts related entity groups from editor schemas", () => {
    const config = normalizeCardConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.example",
      related_entities: {
        timer_entity: "number.fan_timer",
        led_entity: "select.fan_led",
      },
    });

    expect(config.timer_entity).toBe("number.fan_timer");
    expect(config.led_entity).toBe("select.fan_led");
  });
});
