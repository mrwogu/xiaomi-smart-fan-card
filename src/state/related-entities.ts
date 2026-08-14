import type { HassLike, RelatedEntities } from "../types";

interface RegistryEntity {
  entity_id: string;
  device_id?: string;
  name?: string;
  original_name?: string;
}

const suffixes: Record<keyof RelatedEntities, string[]> = {
  sleepMode: ["_sleep_mode"],
  verticalSwing: ["_vertical_swing", "_vertical_oscillate", "_vertical_oscillation"],
  horizontalAngle: ["_oscillation_angle", "_horizontal_swing_angle", "_swing_mode_angle", "_horizontal_angle"],
  verticalAngle: ["_vertical_oscillation_angle", "_vertical_swing_angle", "_vertical_angle"],
  favoriteLevel: ["_favorite_level", "_favorite_speed"],
  timer: ["_delay_off_countdown", "_delay_time", "_power_off_time", "_timer"],
  childLock: ["_child_lock"],
  led: ["_led", "_led_brightness", "_light"],
  buzzer: ["_buzzer", "_notification_sound"],
  ionizer: ["_anion", "_ionizer"],
  temperature: ["_temperature"],
  humidity: ["_humidity"],
};

const findBySuffix = (
  entries: RegistryEntity[],
  allowedDomains: string[],
  wantedSuffixes: string[],
): string | undefined => {
  const candidates = entries.filter((entry) => {
    const [domain] = entry.entity_id.split(".");
    return domain !== undefined && allowedDomains.includes(domain);
  });
  const exact = candidates.find((entry) => wantedSuffixes.some((suffix) => entry.entity_id.endsWith(suffix)));
  if (exact) {
    return exact.entity_id;
  }

  const hintGroups = wantedSuffixes.map((suffix) => suffix.split("_").filter((part) => part.length > 2));
  return candidates.find((entry) => {
    const searchable = `${entry.entity_id} ${entry.name ?? ""} ${entry.original_name ?? ""}`.toLowerCase();
    return hintGroups.some((hints) => hints.every((hint) => searchable.includes(hint.toLowerCase())));
  })?.entity_id;
};

/**
 * Resolves to undefined when the registry lookup itself failed, which is what
 * a reconnecting Home Assistant looks like. Callers keep their previous result
 * in that case instead of collapsing to an empty device.
 */
export const resolveRelatedEntities = async (
  hass: HassLike,
  entityId: string,
): Promise<RelatedEntities | undefined> => {
  if (!hass.callWS) {
    return {};
  }

  try {
    const registry = await hass.callWS<RegistryEntity[]>({ type: "config/entity_registry/list" });
    const primary = registry.find((entry) => entry.entity_id === entityId);
    if (!primary?.device_id) {
      return {};
    }

    const entries = registry.filter((entry) => entry.device_id === primary.device_id);

    const related: RelatedEntities = {};
    const numeric = ["number", "input_number"];
    const boolean = ["switch", "input_boolean"];
    const select = ["select"];

    related.horizontalAngle = findBySuffix(entries, numeric, suffixes.horizontalAngle);
    related.sleepMode = findBySuffix(entries, [...boolean, "select"], suffixes.sleepMode);
    related.verticalSwing = findBySuffix(entries, [...boolean, "select"], suffixes.verticalSwing);
    related.verticalAngle = findBySuffix(entries, numeric, suffixes.verticalAngle);
    related.favoriteLevel = findBySuffix(entries, numeric, suffixes.favoriteLevel);
    related.timer = findBySuffix(entries, numeric, suffixes.timer);
    related.childLock = findBySuffix(entries, [...boolean, ...select], suffixes.childLock);
    related.led = findBySuffix(entries, [...boolean, ...select, ...numeric], suffixes.led);
    related.buzzer = findBySuffix(entries, [...boolean, ...select], suffixes.buzzer);
    related.ionizer = findBySuffix(entries, [...boolean, ...select], suffixes.ionizer);
    related.temperature = findBySuffix(entries, ["sensor"], suffixes.temperature);
    related.humidity = findBySuffix(entries, ["sensor"], suffixes.humidity);

    return related;
  } catch {
    return undefined;
  }
};
