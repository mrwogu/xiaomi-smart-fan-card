import { describe, expect, it } from "vitest";
import { normalizeCardConfig } from "../../src/config";

describe("normalizeCardConfig", () => {
  it("keeps legacy aliases and resolves the default full header", () => {
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
    expect(config.header.variant).toBe("full");
    expect(config.header.show_eyebrow).toBe(true);
    expect(config.header.show_mode).toBe(true);
    expect(config.header.show_model).toBe(true);
    expect(config.controls.timer_mode).toBe("cycle");
    expect(config.controls.angle_mode).toBe("cycle");
  });

  it("collapses the compact header metadata", () => {
    const config = normalizeCardConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.example",
      header: { variant: "compact" },
    });

    expect(config.header.variant).toBe("compact");
    expect(config.header.show_eyebrow).toBe(false);
    expect(config.header.show_mode).toBe(false);
    expect(config.header.show_model).toBe(false);
  });

  it("normalizes the visual size within the supported range", () => {
    expect(
      normalizeCardConfig({
        type: "custom:xiaomi-fan-card",
        entity: "fan.example",
      }).visual.size,
    ).toBeUndefined();
    expect(
      normalizeCardConfig({
        type: "custom:xiaomi-fan-card",
        entity: "fan.example",
        visual: { size: 240 },
      }).visual.size,
    ).toBe(240);
    expect(
      normalizeCardConfig({
        type: "custom:xiaomi-fan-card",
        entity: "fan.example",
        visual: { size: 80 },
      }).visual.size,
    ).toBe(120);
    expect(
      normalizeCardConfig({
        type: "custom:xiaomi-fan-card",
        entity: "fan.example",
        visual: { size: "invalid" as never },
      }).visual.size,
    ).toBe(300);
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
        angle_mode: "cycle",
        show_nudge_with_angles: true,
      },
      details: {
        show: false,
        show_temperature: false,
        show_timer_when_off: false,
        position: "side",
      },
      layout: {
        theme: "industrial",
        density: "compact",
        columns: "one",
        order: ["features", "visual", "features", "unknown"] as never,
      },
      styles: {
        card: {
          border: "1px solid red",
          unknown: "ignored",
        } as never,
        details: {
          gap: "8px",
        },
      },
    });

    expect(config.controls.show_timer).toBe(true);
    expect(config.controls.show_led).toBe(true);
    expect(config.details.show).toBe(false);
    expect(config.details.show_temperature).toBe(false);
    expect(config.details.show_timer_when_off).toBe(false);
    expect(config.details.position).toBe("side");
    expect(config.controls.selection_mode).toBe("select");
    expect(config.controls.timer_mode).toBe("cycle");
    expect(config.controls.angle_mode).toBe("cycle");
    expect(config.controls.show_nudge_with_angles).toBe(true);
    expect(config.layout.theme).toBe("industrial");
    expect(config.layout.density).toBe("compact");
    expect(config.layout.columns).toBe("one");
    expect(config.layout.order).toEqual(["features", "visual", "header", "airflow", "position"]);
    expect(config.styles.card.border).toBe("1px solid red");
    expect(config.styles.details.gap).toBe("8px");
    expect("unknown" in config.styles.card).toBe(false);
  });

  it("keeps only the styling tokens each block consumes", () => {
    const config = normalizeCardConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.example",
      styles: {
        card: { size: "40px", height: "40px", padding: "20px", accent: "#ff7a59" },
        visual: { size: "220px", accent: "#ff7a59" },
        controls: { height: "52px" },
        details: { height: "40px" },
      },
    });

    expect(config.styles.card).toEqual({ padding: "20px", accent: "#ff7a59" });
    expect("accent" in config.styles.visual).toBe(false);
    expect(config.styles.visual.size).toBe("220px");
    expect(config.styles.controls.height).toBe("52px");
    expect(config.styles.details).toEqual({});
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
      controls: { selection_mode: "grid" as never, angle_mode: "grid" as never, timer_mode: "grid" as never },
      details: { position: "inline" as never },
      layout: { density: "dense" as never },
    });

    expect(config.theme).toBe("auto");
    expect(config.integration).toBe("auto");
    expect(config.header.variant).toBe("full");
    expect(config.controls.selection_mode).toBe("auto");
    expect(config.controls.angle_mode).toBe("cycle");
    expect(config.controls.timer_mode).toBe("cycle");
    expect(config.controls.show_nudge_with_angles).toBe(false);
    expect(config.details.position).toBe("below");
    expect(config.details.show_timer_when_off).toBe(true);
    expect(config.layout.density).toBe("comfortable");
    expect(config.layout.order).toEqual(["header", "visual", "airflow", "position", "features"]);
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
