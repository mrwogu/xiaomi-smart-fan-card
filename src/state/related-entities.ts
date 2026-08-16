import type { HassLike, RelatedEntities } from "../types";

interface RegistryEntity {
  entity_id: string;
  device_id?: string;
  name?: string;
  original_name?: string;
  device_class?: string;
  original_device_class?: string;
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
 * A translated Home Assistant install names sensors in the user language, so a
 * suffix table would need one entry per locale. The device class is the same
 * in every language and only falls back to the suffix search when missing.
 */
const findSensorByDeviceClass = (
  hass: HassLike,
  entries: RegistryEntity[],
  deviceClass: string,
  fallbackSuffixes: string[],
): string | undefined => {
  const match = entries.find((entry) => {
    if (!entry.entity_id.startsWith("sensor.")) {
      return false;
    }

    const registered = entry.device_class ?? entry.original_device_class;
    return registered === deviceClass || hass.states[entry.entity_id]?.attributes["device_class"] === deviceClass;
  });

  return match?.entity_id ?? findBySuffix(entries, ["sensor"], fallbackSuffixes);
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
    const angle = [...numeric, "select"];
    const boolean = ["switch", "input_boolean"];
    const select = ["select"];

    // The vertical angle resolves first and then drops out of the remaining
    // searches: `_vertical_oscillation_angle` also ends with the horizontal
    // `_oscillation_angle`, and both angle names contain the vertical swing
    // hints once a `select` angle entity is allowed.
    related.verticalAngle = findBySuffix(entries, angle, suffixes.verticalAngle);
    const withoutVerticalAngle = entries.filter((entry) => entry.entity_id !== related.verticalAngle);
    related.horizontalAngle = findBySuffix(withoutVerticalAngle, angle, suffixes.horizontalAngle);
    const withoutAngles = withoutVerticalAngle.filter((entry) => entry.entity_id !== related.horizontalAngle);
    related.sleepMode = findBySuffix(withoutAngles, [...boolean, "select"], suffixes.sleepMode);
    related.verticalSwing = findBySuffix(withoutAngles, [...boolean, "select"], suffixes.verticalSwing);
    related.favoriteLevel = findBySuffix(entries, numeric, suffixes.favoriteLevel);
    related.timer = findBySuffix(entries, numeric, suffixes.timer);
    related.childLock = findBySuffix(entries, [...boolean, ...select], suffixes.childLock);
    related.led = findBySuffix(entries, [...boolean, ...select, ...numeric], suffixes.led);
    related.buzzer = findBySuffix(entries, [...boolean, ...select], suffixes.buzzer);
    related.ionizer = findBySuffix(entries, [...boolean, ...select], suffixes.ionizer);
    related.temperature = findSensorByDeviceClass(hass, entries, "temperature", suffixes.temperature);
    related.humidity = findSensorByDeviceClass(hass, entries, "humidity", suffixes.humidity);

    return related;
  } catch {
    return undefined;
  }
};
