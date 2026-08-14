import { DEFAULT_BLOCK_ORDER } from "./config";
import { RELATED_ENTITY_DOMAINS } from "./types";
import type { FanRelatedEntitiesConfig } from "./types";

export const getConfigForm = () => {
  const withVisibility = <T extends object>(field: T, parents?: string | readonly string[]) => {
    if (!parents) {
      return field;
    }

    const names = typeof parents === "string" ? [parents] : parents;
    return {
      ...field,
      visible: names.map((field) => ({ field, value: true })),
    };
  };
  const booleanField = (name: string, parents?: string | readonly string[]) =>
    withVisibility({ name, selector: { boolean: {} } }, parents);
  const entityField = (name: string, domains: readonly string[]) => ({
    name,
    selector: { entity: { domain: domains } },
  });
  const selectField = (name: string, options: string[], parents?: string | readonly string[]) =>
    withVisibility({ name, selector: { select: { options, translation_key: name } } }, parents);
  const styleGroup = (name: string) => ({
    type: "expandable",
    name,
    flatten: false,
    schema: [
      { name: "background", selector: { text: {} } },
      { name: "border", selector: { text: {} } },
      { name: "border_radius", selector: { text: {} } },
      { name: "color", selector: { text: {} } },
      { name: "font_size", selector: { text: {} } },
      { name: "gap", selector: { text: {} } },
      { name: "height", selector: { text: {} } },
      { name: "padding", selector: { text: {} } },
      { name: "shadow", selector: { text: {} } },
      { name: "size", selector: { text: {} } },
    ],
  });
  const relatedEntityField = (name: keyof FanRelatedEntitiesConfig) => entityField(name, RELATED_ENTITY_DOMAINS[name]);

  return {
    schema: [
      entityField("entity", ["fan"]),
      { name: "name", selector: { text: {} } },
      selectField("integration", ["auto", "standard", "xiaomi_miio", "xiaomi_miio_fan", "xiaomi_miot"]),
      {
        type: "expandable",
        name: "header",
        flatten: false,
        schema: [
          booleanField("show"),
          selectField("variant", ["full", "compact"], "show"),
          booleanField("show_eyebrow", "show"),
          booleanField("show_name", "show"),
          booleanField("show_status", "show"),
          booleanField("show_mode", "show"),
          booleanField("show_model", "show"),
        ],
      },
      {
        type: "expandable",
        name: "visual",
        flatten: false,
        schema: [
          booleanField("show"),
          booleanField("show_graphic", "show"),
          booleanField("show_power", ["show", "show_graphic"]),
          booleanField("show_speed", ["show", "show_graphic"]),
          booleanField("show_details", "show"),
          selectField("animation", ["auto", "enabled", "disabled"], "show"),
        ],
      },
      {
        type: "expandable",
        name: "controls",
        flatten: false,
        schema: [
          booleanField("show"),
          booleanField("show_speed_slider", "show"),
          booleanField("show_speed_levels", "show"),
          booleanField("show_modes", "show"),
          booleanField("show_preset_mode", "show"),
          booleanField("show_horizontal_swing", "show"),
          booleanField("show_vertical_swing", "show"),
          booleanField("show_sleep", "show"),
          booleanField("show_cycle", "show"),
          booleanField("show_horizontal_angle", "show"),
          booleanField("show_vertical_angle", "show"),
          booleanField("show_nudge", "show"),
          booleanField("show_nudge_with_angles", ["show", "show_nudge"]),
          booleanField("show_direction", "show"),
          booleanField("show_favorite_level", "show"),
          booleanField("show_timer", "show"),
          booleanField("show_child_lock", "show"),
          booleanField("show_led", "show"),
          booleanField("show_buzzer", "show"),
          booleanField("show_ionizer", "show"),
          selectField("selection_mode", ["auto", "buttons", "select"], "show"),
          selectField("timer_mode", ["cycle", "select"], "show"),
          selectField("angle_mode", ["select", "cycle"], "show"),
        ],
      },
      {
        type: "expandable",
        name: "details",
        flatten: false,
        schema: [
          booleanField("show"),
          booleanField("show_horizontal_angle", "show"),
          booleanField("show_vertical_angle", "show"),
          booleanField("show_timer", "show"),
          booleanField("show_timer_when_off", ["show", "show_timer"]),
          booleanField("show_temperature", "show"),
          booleanField("show_humidity", "show"),
          selectField("position", ["below", "side"], "show"),
        ],
      },
      {
        type: "expandable",
        name: "layout",
        flatten: false,
        schema: [
          selectField("theme", ["auto", "mushroom", "minimal", "glass", "industrial"]),
          selectField("density", ["comfortable", "compact"]),
          selectField("columns", ["auto", "one", "two"]),
          {
            name: "order",
            selector: {
              select: {
                multiple: true,
                translation_key: "order",
                options: [...DEFAULT_BLOCK_ORDER],
              },
            },
          },
        ],
      },
      {
        type: "expandable",
        name: "styles",
        flatten: false,
        schema: [
          styleGroup("card"),
          styleGroup("header"),
          styleGroup("visual"),
          styleGroup("controls"),
          styleGroup("details"),
        ],
      },
      {
        type: "expandable",
        name: "related_entities",
        flatten: true,
        schema: [
          relatedEntityField("horizontal_angle_entity"),
          relatedEntityField("vertical_swing_entity"),
          relatedEntityField("vertical_angle_entity"),
          relatedEntityField("favorite_level_entity"),
          relatedEntityField("sleep_mode_entity"),
          relatedEntityField("timer_entity"),
          relatedEntityField("child_lock_entity"),
          relatedEntityField("led_entity"),
          relatedEntityField("buzzer_entity"),
          relatedEntityField("ionizer_entity"),
          relatedEntityField("temperature_entity"),
          relatedEntityField("humidity_entity"),
        ],
      },
    ],
  };
};
