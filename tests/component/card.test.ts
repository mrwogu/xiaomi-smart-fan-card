// @vitest-environment happy-dom

import type { HomeAssistant } from "custom-card-helpers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { XiaomiFanCard } from "../../src/card";
import type { FanCardConfig, HassEntity, HassLike } from "../../src/types";

const services = {
  xiaomi_miio_fan: {
    fan_set_delay_off: {},
    fan_set_oscillation_angle: {},
    fan_set_vertical_oscillation_angle: {},
    fan_set_vertical_oscillation_on: {},
    fan_set_vertical_oscillation_off: {},
    fan_turn: {},
  },
};

const createHass = (timerValue = "120", verticalAngleValue = "30") => {
  const callService = vi.fn(
    async (_domain: string, _service: string, _serviceData?: Record<string, unknown>): Promise<void> => undefined,
  );
  const callWS = vi.fn(async (message: Record<string, unknown>) => {
    return message.type === "get_services" ? services : [];
  });
  const states: Record<string, HassEntity> = {
    "fan.p76": {
      state: "on",
      attributes: {
        friendly_name: "Test fan",
        model: "xiaomi.fan.p76",
        percentage: 50,
        preset_mode: "Normal",
        preset_modes: ["Normal", "Natural"],
        temperature: 21.5,
        humidity: 45,
      },
    },
    "number.fan_horizontal": {
      state: "60",
      attributes: { min: 30, max: 120, step: 30 },
    },
    "number.fan_vertical": {
      state: verticalAngleValue,
      attributes: { min: 30, max: 100, step: 10 },
    },
    "number.fan_timer": {
      state: timerValue,
      attributes: { min: 0, max: 480, step: 60, unit_of_measurement: "min" },
    },
  };
  const hass: HassLike = {
    states,
    callService,
    callWS: callWS as NonNullable<HassLike["callWS"]>,
  };

  return { hass, callService };
};

const baseConfig: FanCardConfig = {
  type: "custom:xiaomi-fan-card",
  entity: "fan.p76",
  integration: "xiaomi_miio_fan",
  header: { show: false },
  visual: { show: false },
  controls: {
    show: true,
    show_speed_slider: false,
    show_speed_levels: false,
    show_modes: false,
    show_preset_mode: false,
    show_horizontal_swing: false,
    show_vertical_swing: false,
    show_sleep: false,
    show_cycle: false,
    show_horizontal_angle: true,
    show_vertical_angle: true,
    show_nudge: true,
    show_nudge_with_angles: true,
    show_direction: false,
    show_favorite_level: false,
    show_timer: true,
    show_child_lock: false,
    show_led: false,
    show_buzzer: false,
    show_ionizer: false,
    timer_mode: "select",
    angle_mode: "select",
  },
  related_entities: {
    horizontal_angle_entity: "number.fan_horizontal",
    vertical_angle_entity: "number.fan_vertical",
    timer_entity: "number.fan_timer",
  },
};

const settle = async (card: XiaomiFanCard): Promise<void> => {
  for (let index = 0; index < 4; index += 1) {
    await card.updateComplete;
    await Promise.resolve();
  }
};

const renderCard = async (
  config: FanCardConfig,
  timerValue = "120",
  verticalAngleValue = "30",
): Promise<{ card: XiaomiFanCard; callService: ReturnType<typeof vi.fn> }> => {
  const { hass, callService } = createHass(timerValue, verticalAngleValue);
  const card = new XiaomiFanCard();
  card.hass = hass as unknown as HomeAssistant;
  card.setConfig(config);
  document.body.append(card);
  await settle(card);
  return { card, callService };
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("XiaomiFanCard", () => {
  it("renders active timer and angle selectors in separate columns", async () => {
    const { card } = await renderCard(baseConfig);
    const root = card.shadowRoot;

    expect(root?.querySelector(".timer-select")?.classList.contains("selected")).toBe(true);
    expect(root?.querySelectorAll(".angle-controls select")).toHaveLength(2);
    expect(root?.querySelector(".angle-layout.two-column > .angle-controls")).toBeTruthy();
    expect(root?.querySelector(".angle-layout > .nudge-controls")).toBeTruthy();
    expect(root?.querySelectorAll(".nudge-controls .nudge-grid button")).toHaveLength(4);
  });

  it("renders cycle angle controls and advances the selected angle", async () => {
    const { card, callService } = await renderCard({
      ...baseConfig,
      controls: { ...baseConfig.controls, angle_mode: "cycle" },
    });
    const root = card.shadowRoot;
    const horizontalButton = root?.querySelector(".angle-cycle-button") as HTMLButtonElement | null;

    expect(root?.querySelectorAll(".angle-cycle-button")).toHaveLength(2);
    expect(root?.querySelectorAll(".angle-controls select")).toHaveLength(0);
    expect(horizontalButton?.textContent).toContain("60°");

    horizontalButton?.click();
    await Promise.resolve();

    expect(callService).toHaveBeenCalledWith("number", "set_value", {
      entity_id: "number.fan_horizontal",
      value: 90,
    });
  });

  it("hides nudge controls when angle controls are active by default", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      controls: { ...baseConfig.controls, show_nudge_with_angles: false },
    });

    expect(card.shadowRoot?.querySelector(".nudge-controls")).toBeNull();

    const { card: angleOnlyCard } = await renderCard({
      ...baseConfig,
      controls: {
        ...baseConfig.controls,
        show_horizontal_angle: false,
        show_vertical_angle: false,
        show_nudge_with_angles: false,
      },
    });
    const upButton = angleOnlyCard.shadowRoot?.querySelector('[aria-label="Move fan up"]') as HTMLButtonElement | null;

    expect(upButton).toBeTruthy();
  });

  it("allows nudge controls with angles when explicitly enabled", async () => {
    const { card, callService } = await renderCard({
      ...baseConfig,
      controls: { ...baseConfig.controls, show_nudge_with_angles: true },
    });
    const upButton = card.shadowRoot?.querySelector('[aria-label="Move fan up"]') as HTMLButtonElement | null;

    upButton?.click();
    await Promise.resolve();

    expect(callService).toHaveBeenCalledWith("xiaomi_miio_fan", "fan_turn", {
      entity_id: "fan.p76",
      direction: "up",
    });
  });

  it("marks the active timer cycle button as selected", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      controls: { ...baseConfig.controls, timer_mode: "cycle" },
    });
    const timerButton = card.shadowRoot?.querySelector(".feature-controls .feature-button");

    expect(timerButton?.classList.contains("selected")).toBe(true);
    expect(timerButton?.textContent).toContain("2h");
  });

  it("orders the card blocks from the normalized layout order", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      header: { show: true },
      visual: { show: true, show_graphic: false, show_details: false },
      controls: { ...baseConfig.controls, show_speed_levels: true },
      layout: { order: ["features", "visual", "header", "airflow", "position"] },
    });
    const cardRoot = card.shadowRoot?.querySelector("ha-card");
    const blocks = [...(cardRoot?.children ?? [])].map((element) => element.className);

    expect(blocks).toEqual([
      "controls feature-controls",
      "visual-section details-below details-only",
      "header",
      "controls airflow-controls",
      "angle-layout two-column",
    ]);
  });

  it("hides the inactive timer detail when configured", async () => {
    const { card } = await renderCard(
      {
        ...baseConfig,
        visual: { show: true, show_graphic: false, show_details: true },
        details: {
          show_horizontal_angle: false,
          show_vertical_angle: false,
          show_timer: true,
          show_timer_when_off: false,
          show_temperature: false,
          show_humidity: false,
        },
      },
      "0",
    );

    expect(card.shadowRoot?.querySelector(".visual-meta")).toBeNull();
  });

  it("hides unavailable angle details", async () => {
    const { card } = await renderCard(
      {
        ...baseConfig,
        visual: { show: true, show_graphic: false, show_details: true },
        details: {
          show_horizontal_angle: false,
          show_vertical_angle: true,
          show_timer: false,
          show_temperature: false,
          show_humidity: false,
        },
      },
      "0",
      "unavailable",
    );

    expect(card.shadowRoot?.querySelector(".visual-meta")).toBeNull();
  });

  it("keeps active timer details and supports side placement", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      visual: { show: true, show_graphic: true, show_details: true },
      details: {
        show_horizontal_angle: false,
        show_vertical_angle: false,
        show_timer: true,
        show_timer_when_off: false,
        show_temperature: true,
        show_humidity: true,
        position: "side",
      },
      styles: {
        card: { border: "2px solid red" },
        details: { gap: "8px" },
      },
    });

    expect(card.shadowRoot?.querySelector(".visual-section.details-side.details-with-graphic")).toBeTruthy();
    expect(card.shadowRoot?.querySelector(".visual-meta")?.textContent).toContain("2h");
    expect(card.shadowRoot?.querySelector(".visual-meta")?.textContent).toContain("21.5°C");
    expect(card.shadowRoot?.querySelector(".visual-meta")?.textContent).toContain("45% RH");
    expect(card.shadowRoot?.querySelector("ha-card")?.getAttribute("style")).toContain("--fan-card-border");
    expect(card.shadowRoot?.querySelector(".visual-meta")?.getAttribute("style")).toContain("--fan-details-gap");
  });

  it("exposes native entity selectors through the config form", () => {
    const schema = XiaomiFanCard.getConfigForm().schema as Array<Record<string, unknown>>;
    const entity = schema.find((field) => field.name === "entity") as {
      selector: { entity: { domain: string[] } };
    };
    const related = schema.find((field) => field.name === "related_entities") as {
      schema: Array<Record<string, unknown>>;
    };
    const details = schema.find((field) => field.name === "details") as {
      schema: Array<Record<string, unknown>>;
    };
    const timer = related.schema.find((field) => field.name === "timer_entity") as {
      selector: { entity: { domain: string[] } };
    };
    const header = schema.find((field) => field.name === "header") as {
      schema: Array<Record<string, unknown>>;
    };
    const controls = schema.find((field) => field.name === "controls") as {
      schema: Array<Record<string, unknown>>;
    };

    expect(entity.selector.entity.domain).toEqual(["fan"]);
    expect(related.schema).toHaveLength(12);
    expect(timer.selector.entity.domain).toEqual(["number", "input_number"]);
    expect(details.schema.some((field) => field.name === "show_timer_when_off")).toBe(true);
    expect(header.schema.find((field) => field.name === "show_name")?.visible).toEqual([
      { field: "show", value: true },
    ]);
    expect(controls.schema.find((field) => field.name === "show_timer")?.visible).toEqual([
      { field: "show", value: true },
    ]);
  });

  it("localizes native editor labels and option values", async () => {
    const editor = (await XiaomiFanCard.getConfigElement()) as unknown as {
      hass?: HomeAssistant;
      setConfig: (config: FanCardConfig) => void;
      computeLabel: (schema: { name: string }) => string;
      localizeValue: (key: string) => string;
    };
    editor.hass = { language: "pl" } as HomeAssistant;
    editor.setConfig(baseConfig);

    expect(editor.computeLabel({ name: "header" })).toBe("Nagłówek");
    expect(editor.computeLabel({ name: "show_horizontal_angle" })).toBe("Kąt poziomy");
    expect(editor.localizeValue("angle_mode.options.cycle")).toBe("Cykl");
    expect(editor.localizeValue("integration.options.xiaomi_miio_fan")).toBe("Wentylator Xiaomi Miio");
  });
});
