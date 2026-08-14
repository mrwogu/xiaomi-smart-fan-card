import { DEFAULT_BLOCK_ORDER, STYLE_TOKENS } from "./config";
import { RELATED_ENTITY_DOMAINS } from "./types";
import type { FanRelatedEntitiesConfig } from "./types";

const STYLE_ICONS: Record<keyof typeof STYLE_TOKENS, string> = {
  card: "mdi:credit-card-outline",
  header: "mdi:card-text-outline",
  visual: "mdi:fan",
  controls: "mdi:tune-variant",
  details: "mdi:information-outline",
};

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
  const grid = (schema: object[], columnMinWidth = "200px") => ({
    type: "grid",
    column_min_width: columnMinWidth,
    schema,
  });
  const panel = (name: string, icon: string, schema: object[], flatten = false) => ({
    type: "expandable",
    name,
    icon,
    flatten,
    schema,
  });
  const styleGroup = (name: keyof typeof STYLE_TOKENS) =>
    panel(
      name,
      STYLE_ICONS[name],
      STYLE_TOKENS[name].map((token) => ({ name: token, selector: { text: {} } })),
    );
  const relatedEntityField = (name: keyof FanRelatedEntitiesConfig) => entityField(name, RELATED_ENTITY_DOMAINS[name]);

  return {
    schema: [
      entityField("entity", ["fan"]),
      { name: "name", selector: { text: {} } },
      selectField("integration", ["auto", "standard", "xiaomi_miio", "xiaomi_miio_fan", "xiaomi_miot"]),
      panel("header", "mdi:card-text-outline", [
        booleanField("show"),
        selectField("variant", ["full", "compact"], "show"),
        grid(
          [
            booleanField("show_name", "show"),
            booleanField("show_status", "show"),
            booleanField("show_mode", "show"),
            booleanField("show_model", "show"),
            booleanField("show_eyebrow", "show"),
          ],
          "180px",
        ),
      ]),
      panel("visual", "mdi:fan", [
        booleanField("show"),
        selectField("animation", ["auto", "enabled", "disabled"], "show"),
        grid(
          [
            booleanField("show_graphic", "show"),
            booleanField("show_power", ["show", "show_graphic"]),
            booleanField("show_speed", ["show", "show_graphic"]),
            booleanField("show_details", "show"),
          ],
          "180px",
        ),
      ]),
      panel("controls", "mdi:tune-variant", [
        booleanField("show"),
        grid([
          selectField("selection_mode", ["auto", "buttons", "select"], "show"),
          selectField("timer_mode", ["cycle", "select"], "show"),
          selectField("angle_mode", ["select", "cycle"], "show"),
        ]),
        panel(
          "speed",
          "mdi:speedometer",
          [grid([booleanField("show_speed_slider", "show"), booleanField("show_speed_levels", "show")], "180px")],
          true,
        ),
        panel(
          "modes",
          "mdi:weather-windy",
          [grid([booleanField("show_modes", "show"), booleanField("show_preset_mode", "show")], "180px")],
          true,
        ),
        panel(
          "oscillation",
          "mdi:arrow-oscillating",
          [
            grid(
              [
                booleanField("show_horizontal_swing", "show"),
                booleanField("show_vertical_swing", "show"),
                booleanField("show_cycle", "show"),
                booleanField("show_sleep", "show"),
              ],
              "180px",
            ),
          ],
          true,
        ),
        panel(
          "angles",
          "mdi:angle-acute",
          [
            grid(
              [
                booleanField("show_horizontal_angle", "show"),
                booleanField("show_vertical_angle", "show"),
                booleanField("show_nudge", "show"),
                booleanField("show_direction", "show"),
              ],
              "180px",
            ),
            booleanField("show_nudge_with_angles", ["show", "show_nudge"]),
          ],
          true,
        ),
        panel(
          "features",
          "mdi:toggle-switch-outline",
          [
            grid(
              [
                booleanField("show_timer", "show"),
                booleanField("show_favorite_level", "show"),
                booleanField("show_child_lock", "show"),
                booleanField("show_led", "show"),
                booleanField("show_buzzer", "show"),
                booleanField("show_ionizer", "show"),
              ],
              "180px",
            ),
          ],
          true,
        ),
      ]),
      panel("details", "mdi:information-outline", [
        booleanField("show"),
        selectField("position", ["below", "side"], "show"),
        grid(
          [
            booleanField("show_horizontal_angle", "show"),
            booleanField("show_vertical_angle", "show"),
            booleanField("show_timer", "show"),
            booleanField("show_timer_when_off", ["show", "show_timer"]),
            booleanField("show_temperature", "show"),
            booleanField("show_humidity", "show"),
          ],
          "180px",
        ),
      ]),
      panel("layout", "mdi:view-dashboard-outline", [
        selectField("theme", ["auto", "mushroom", "minimal", "glass", "industrial"]),
        grid([selectField("density", ["comfortable", "compact"]), selectField("columns", ["auto", "one", "two"])]),
        {
          name: "order",
          selector: {
            select: {
              multiple: true,
              reorder: true,
              translation_key: "order",
              options: [...DEFAULT_BLOCK_ORDER],
            },
          },
        },
      ]),
      panel("styles", "mdi:palette-outline", [
        styleGroup("card"),
        styleGroup("header"),
        styleGroup("visual"),
        styleGroup("controls"),
        styleGroup("details"),
      ]),
      {
        type: "expandable",
        name: "related_entities",
        icon: "mdi:link-variant",
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
