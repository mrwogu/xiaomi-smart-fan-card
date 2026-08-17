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

type SchemaField = Record<string, unknown> & { name?: string; type?: string; schema?: SchemaField[] };

const flattenGrids = (schema: SchemaField[]): SchemaField[] =>
  schema.flatMap((field) => (field.type === "grid" && field.schema ? flattenGrids(field.schema) : [field]));

const findPanel = (schema: SchemaField[], name: string): SchemaField => {
  const panel = schema.find((field) => field.name === name);
  if (!panel?.schema) {
    throw new Error(`Missing panel: ${name}`);
  }

  return panel;
};

const panelFields = (schema: SchemaField[], name: string): SchemaField[] =>
  flattenGrids(findPanel(schema, name).schema!);

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
    "sensor.fan_temperature": {
      state: "70.5",
      attributes: { unit_of_measurement: "°F" },
    },
    "sensor.fan_humidity": {
      state: "48",
      attributes: {},
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

  it("uses visibility flags to hide swing chips and angle controls", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      controls: {
        ...baseConfig.controls,
        show_horizontal_swing: false,
        show_vertical_swing: false,
        show_horizontal_angle: false,
        show_vertical_angle: false,
        show_nudge: false,
        show_timer: false,
      },
    });

    expect(card.shadowRoot?.querySelector(".chip-row")).toBeNull();
    expect(card.shadowRoot?.querySelector(".angle-controls")).toBeNull();
  });

  it("bounds the numeric angle input by the related entity range", async () => {
    const { hass } = createHass();
    hass.states["fan.p76"] = {
      state: "on",
      attributes: { friendly_name: "Test fan", percentage: 50 },
    };
    hass.states["number.fan_horizontal"] = {
      state: "60",
      attributes: { min: 0, max: 120, step: 1 },
    };
    const card = new XiaomiFanCard();
    card.hass = hass as unknown as HomeAssistant;
    card.setConfig({
      ...baseConfig,
      controls: {
        ...baseConfig.controls,
        show_vertical_angle: false,
        show_nudge: false,
        show_timer: false,
      },
    });
    document.body.append(card);
    await settle(card);
    const input = card.shadowRoot?.querySelector(".angle-controls input") as HTMLInputElement | null;

    expect(card.shadowRoot?.querySelector(".angle-controls select")).toBeNull();
    expect(input?.getAttribute("min")).toBe("0");
    expect(input?.getAttribute("max")).toBe("120");
    expect(input?.getAttribute("step")).toBe("1");
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
    const schema = XiaomiFanCard.getConfigForm().schema as SchemaField[];
    const entity = schema.find((field) => field.name === "entity") as {
      selector: { entity: { domain: string[] } };
    };
    const related = findPanel(schema, "related_entities");
    const timer = related.schema!.find((field) => field.name === "timer_entity") as {
      selector: { entity: { domain: string[] } };
    };
    const horizontalSwing = related.schema!.find((field) => field.name === "horizontal_swing_entity") as {
      selector: { entity: { domain: string[] } };
    };

    expect(entity.selector.entity.domain).toEqual(["fan"]);
    expect(related.schema).toHaveLength(13);
    expect(horizontalSwing.selector.entity.domain).toEqual(["switch", "input_boolean", "select"]);
    expect(timer.selector.entity.domain).toEqual(["number", "input_number"]);
    expect(panelFields(schema, "details").some((field) => field.name === "show_timer_when_off")).toBe(true);
    expect(panelFields(schema, "header").find((field) => field.name === "show_name")?.visible).toEqual([
      { field: "show", value: true },
    ]);
    expect(panelFields(schema, "visual").find((field) => field.name === "size")?.selector).toEqual({
      number: {
        min: 1,
        max: 480,
        step: 10,
        mode: "box",
        unit_of_measurement: "px",
      },
    });
    expect(panelFields(schema, "visual").find((field) => field.name === "size")?.visible).toEqual([
      { field: "show", value: true },
      { field: "show_graphic", value: true },
    ]);
  });

  it("groups control toggles into flattened sub panels that keep their conditions", () => {
    const schema = XiaomiFanCard.getConfigForm().schema as SchemaField[];
    const controls = findPanel(schema, "controls");
    const groups = controls.schema!.filter((field) => field.type === "expandable");
    const features = panelFields(controls.schema!, "features");

    expect(groups.map((group) => group.name)).toEqual(["speed", "modes", "oscillation", "angles", "features"]);
    expect(groups.every((group) => group.flatten === true)).toBe(true);
    expect(groups.every((group) => typeof group.icon === "string")).toBe(true);
    expect(features.find((field) => field.name === "show_timer")?.visible).toEqual([{ field: "show", value: true }]);
    expect(
      panelFields(controls.schema!, "angles").find((field) => field.name === "show_nudge_with_angles")?.visible,
    ).toEqual([
      { field: "show", value: true },
      { field: "show_nudge", value: true },
    ]);
  });

  it("offers only styling tokens that the stylesheet consumes", () => {
    const schema = XiaomiFanCard.getConfigForm().schema as SchemaField[];
    const styles = findPanel(schema, "styles");
    const tokens = (name: string) => panelFields(styles.schema!, name).map((field) => field.name);

    expect(tokens("card")).not.toContain("size");
    expect(tokens("card")).not.toContain("height");
    expect(tokens("visual")).toContain("size");
    expect(tokens("controls")).toContain("height");
    expect(tokens("details")).toEqual([
      "background",
      "border",
      "border_radius",
      "color",
      "font_size",
      "gap",
      "padding",
      "shadow",
    ]);
  });

  it("reports a layout size for masonry and section dashboards", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      header: { show: true, variant: "full" },
      visual: { show: true, show_graphic: true },
    });

    expect(card.getCardSize()).toBeGreaterThan(4);
    expect(card.getGridOptions()).toEqual({
      columns: 12,
      rows: card.getCardSize(),
      min_columns: 6,
      min_rows: 2,
    });
  });

  const capabilityConfig: FanCardConfig = {
    type: "custom:xiaomi-fan-card",
    entity: "fan.p76",
    integration: "xiaomi_miio_fan",
    header: { show: false },
    visual: { show: false },
  };

  const capabilityStates: Record<string, HassEntity> = {
    "fan.p76": {
      state: "on",
      attributes: { friendly_name: "Test fan", model: "xiaomi.fan.p76", percentage: 50 },
    },
  };

  it("keeps the capability lookup when hass is replaced mid flight", async () => {
    let releaseRegistry = (): void => undefined;
    const gate = new Promise<void>((resolve) => {
      releaseRegistry = resolve;
    });
    const hass = {
      states: capabilityStates,
      callService: vi.fn(async () => undefined),
      callWS: vi.fn(async (message: Record<string, unknown>) => {
        await gate;
        return message.type === "get_services" ? services : [];
      }),
    } as unknown as HassLike;

    const card = new XiaomiFanCard();
    card.hass = hass as unknown as HomeAssistant;
    card.setConfig(capabilityConfig);
    document.body.append(card);
    await settle(card);

    card.hass = { ...hass } as unknown as HomeAssistant;
    await settle(card);
    releaseRegistry();
    await settle(card);

    expect(card.shadowRoot?.querySelector(".angle-controls")).toBeTruthy();
  });

  it("retries the capability lookup after Home Assistant reconnects", async () => {
    vi.useFakeTimers();
    let connected = false;
    const hass = {
      states: capabilityStates,
      callService: vi.fn(async () => undefined),
      callWS: vi.fn(async (message: Record<string, unknown>) => {
        if (!connected) {
          throw new Error("connection lost");
        }

        return message.type === "get_services" ? services : [];
      }),
    } as unknown as HassLike;

    const card = new XiaomiFanCard();
    card.hass = hass as unknown as HomeAssistant;
    card.setConfig(capabilityConfig);
    document.body.append(card);
    await settle(card);

    expect(card.shadowRoot?.querySelector(".angle-controls")).toBeNull();

    connected = true;
    await vi.advanceTimersByTimeAsync(2100);
    await settle(card);

    expect(card.shadowRoot?.querySelector(".angle-controls")).toBeTruthy();
    vi.useRealTimers();
  });

  it("recolors every accent tint from the card style token", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      layout: { theme: "industrial" },
      styles: { card: { accent: "#ff7a59", border_radius: "26px" } },
    });
    const style = card.shadowRoot?.querySelector("ha-card")?.getAttribute("style") ?? "";

    expect(style).toContain("--fan-accent: #ff7a59");
    expect(style).toContain("--fan-card-border-radius: 26px");
  });

  it("applies the configured visual size while preserving CSS overrides", async () => {
    const { card: sizedCard } = await renderCard({
      ...baseConfig,
      visual: { show: true, show_graphic: true, size: 240 },
    });
    const sizedStyle = sizedCard.shadowRoot?.querySelector(".visual-section")?.getAttribute("style") ?? "";

    expect(sizedStyle).toContain("--fan-visual-size: 240px");

    const { card: overriddenCard } = await renderCard({
      ...baseConfig,
      visual: { show: true, show_graphic: true, size: 240 },
      styles: { visual: { size: "min(100%, 180px)" } },
    });
    const overriddenStyle = overriddenCard.shadowRoot?.querySelector(".visual-section")?.getAttribute("style") ?? "";

    expect(overriddenStyle).toContain("--fan-visual-size: min(100%, 180px)");
  });

  it("shows the Xiaomi eyebrow only for a Xiaomi fan", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      header: { show: true, variant: "full" },
    });

    expect(card.shadowRoot?.querySelector(".header .eyebrow")).toBeTruthy();

    const genericHass: HassLike = {
      states: {
        "fan.living_room": {
          state: "on",
          attributes: { friendly_name: "Living Room Fan", percentage: 40, supported_features: 15 },
        },
      },
      callService: vi.fn(async () => undefined),
      callWS: vi.fn(async () => []) as unknown as NonNullable<HassLike["callWS"]>,
    };
    const generic = new XiaomiFanCard();
    generic.hass = genericHass as unknown as HomeAssistant;
    generic.setConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.living_room",
      integration: "standard",
      header: { show: true, variant: "full" },
    });
    document.body.append(generic);
    await settle(generic);

    expect(generic.shadowRoot?.querySelector(".header .eyebrow")).toBeNull();
    expect(generic.shadowRoot?.querySelector(".header .title")?.textContent).toContain("Living Room Fan");
  });

  it("does not render standard controls that an explicit feature mask rejects", async () => {
    const { hass } = createHass();
    hass.states["fan.p76"] = {
      state: "on",
      attributes: {
        friendly_name: "Basic fan",
        percentage: 50,
        preset_modes: ["Normal", "Natural"],
        timer: 120,
        supported_features: 0,
      },
    };
    const card = new XiaomiFanCard();
    card.hass = hass as unknown as HomeAssistant;
    card.setConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.p76",
      integration: "standard",
      visual: { show: true, show_graphic: false, show_details: true },
    });
    document.body.append(card);
    await settle(card);

    expect(card.shadowRoot?.querySelector(".airflow-controls")).toBeNull();
    expect(card.shadowRoot?.querySelector(".visual-meta")).toBeNull();
  });

  it("previews the dragged speed before committing it to the fan", async () => {
    const { card, callService } = await renderCard({
      ...baseConfig,
      controls: { ...baseConfig.controls, show_speed_slider: true },
    });
    const root = card.shadowRoot;
    const slider = root?.querySelector(".speed-slider") as HTMLInputElement;

    slider.value = "80";
    slider.dispatchEvent(new Event("input"));
    await settle(card);

    expect(root?.querySelector(".value")?.textContent).toContain("80%");
    expect(slider.getAttribute("style")).toContain("--fan-speed-progress");
    expect(callService).not.toHaveBeenCalled();

    slider.dispatchEvent(new Event("change"));
    await settle(card);

    expect(callService).toHaveBeenCalledWith("fan", "set_percentage", {
      entity_id: "fan.p76",
      percentage: 80,
    });
  });

  it("honors the speed slider and speed level toggles independently", async () => {
    const withLevels = await renderCard({
      ...baseConfig,
      controls: { ...baseConfig.controls, show_speed_slider: true, show_speed_levels: true },
    });

    expect(withLevels.card.shadowRoot?.querySelector(".level-row")).toBeTruthy();
    expect(withLevels.card.shadowRoot?.querySelector(".speed-slider")).toBeTruthy();

    const withoutLevels = await renderCard({
      ...baseConfig,
      controls: { ...baseConfig.controls, show_speed_slider: true, show_speed_levels: false },
    });

    expect(withoutLevels.card.shadowRoot?.querySelector(".level-row")).toBeNull();
    expect(withoutLevels.card.shadowRoot?.querySelector(".speed-select")).toBeNull();
    expect(withoutLevels.card.shadowRoot?.querySelector(".speed-slider")).toBeTruthy();

    const withoutSlider = await renderCard({
      ...baseConfig,
      controls: { ...baseConfig.controls, show_speed_slider: false, show_speed_levels: true },
    });

    expect(withoutSlider.card.shadowRoot?.querySelector(".speed-slider")).toBeNull();
    expect(withoutSlider.card.shadowRoot?.querySelector(".level-row")).toBeTruthy();
  });

  it("maps non-divisible percentage steps to unique speed levels", async () => {
    const { hass, callService } = createHass();
    hass.states["fan.p76"] = {
      ...hass.states["fan.p76"]!,
      attributes: {
        ...hass.states["fan.p76"]!.attributes,
        percentage_step: 30,
      },
    };
    const card = new XiaomiFanCard();
    card.hass = hass as unknown as HomeAssistant;
    card.setConfig({
      type: "custom:xiaomi-fan-card",
      entity: "fan.p76",
      integration: "standard",
      header: { show: false },
      visual: { show: false },
      controls: {
        show: true,
        show_speed_slider: false,
        show_speed_levels: true,
        show_modes: false,
        show_horizontal_swing: false,
        show_vertical_swing: false,
        show_sleep: false,
        show_cycle: false,
        show_horizontal_angle: false,
        show_vertical_angle: false,
        show_nudge: false,
        show_direction: false,
        show_favorite_level: false,
        show_timer: false,
        show_child_lock: false,
        show_led: false,
        show_buzzer: false,
        show_ionizer: false,
      },
    });
    document.body.append(card);
    await settle(card);

    const levels = [...(card.shadowRoot?.querySelectorAll(".level-button") ?? [])] as HTMLButtonElement[];
    expect(levels).toHaveLength(4);
    levels[2]?.click();
    await Promise.resolve();

    expect(callService).toHaveBeenCalledWith("fan", "set_percentage", {
      entity_id: "fan.p76",
      percentage: 90,
    });
  });

  it("reports zero speed while the fan is off", async () => {
    const { hass } = createHass();
    const entity = hass.states["fan.p76"]!;
    hass.states["fan.p76"] = { ...entity, state: "off" };
    const card = new XiaomiFanCard();
    card.hass = hass as unknown as HomeAssistant;
    card.setConfig({
      ...baseConfig,
      visual: { show: true, show_graphic: true, show_speed: true },
      controls: { ...baseConfig.controls, show_speed_slider: true, show_speed_levels: true },
    });
    document.body.append(card);
    await settle(card);
    const root = card.shadowRoot;

    expect(root?.querySelector(".value")?.textContent?.trim()).toBe("0%");
    expect((root?.querySelector(".speed-slider") as HTMLInputElement).value).toBe("0");
    expect(root?.querySelector(".level-button.selected")).toBeNull();
    expect(root?.querySelector(".speed-readout strong")?.textContent).toBe("0%");
    expect(root?.querySelector(".airflow-visual")?.classList.contains("running")).toBe(false);
  });

  it("renders details as labelled list items with the sensor unit", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      visual: { show: true, show_graphic: false, show_details: true },
      details: {
        show_horizontal_angle: true,
        show_vertical_angle: false,
        show_timer: true,
        show_temperature: true,
        show_humidity: false,
      },
      related_entities: {
        ...baseConfig.related_entities,
        temperature_entity: "sensor.fan_temperature",
      },
    });
    const items = [...(card.shadowRoot?.querySelectorAll(".visual-meta .meta-item") ?? [])];

    expect(card.shadowRoot?.querySelector(".visual-meta")?.getAttribute("role")).toBe("list");
    expect(items.every((item) => item.getAttribute("role") === "listitem")).toBe(true);
    expect(items.every((item) => Boolean(item.querySelector('ha-icon[aria-hidden="true"]')))).toBe(true);
    expect(items.map((item) => item.getAttribute("aria-label"))).toEqual([
      "Horizontal angle 60 degrees",
      "Timer: 2h",
      "Temperature: 70.5°F",
    ]);
    expect(items.at(-1)?.textContent).toContain("70.5°F");
  });

  it("falls back to default units when a related sensor reports none", async () => {
    const { card } = await renderCard({
      ...baseConfig,
      visual: { show: true, show_graphic: false, show_details: true },
      details: {
        show_horizontal_angle: false,
        show_vertical_angle: false,
        show_timer: false,
        show_temperature: false,
        show_humidity: true,
      },
      related_entities: {
        ...baseConfig.related_entities,
        humidity_entity: "sensor.fan_humidity",
      },
    });

    expect(card.shadowRoot?.querySelector(".visual-meta")?.textContent).toContain("48%");
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
    expect(editor.computeLabel({ name: "angles" })).toBe("Kąty i pozycja");
    expect(editor.localizeValue("angle_mode.options.cycle")).toBe("Cykl");
    expect(editor.localizeValue("integration.options.xiaomi_miio_fan")).toBe("Wentylator Xiaomi Miio");
  });

  it("explains ambiguous editor fields with localized helper text", async () => {
    const editor = (await XiaomiFanCard.getConfigElement()) as unknown as {
      hass?: HomeAssistant;
      setConfig: (config: FanCardConfig) => void;
      computeHelper: (schema: { name: string }) => string | undefined;
    };
    editor.hass = { language: "en" } as HomeAssistant;
    editor.setConfig(baseConfig);

    expect(editor.computeHelper({ name: "selection_mode" })).toContain("buttons");
    expect(editor.computeHelper({ name: "styles" })).toContain("CSS");
    expect(editor.computeHelper({ name: "show_led" })).toBeUndefined();
  });
});
