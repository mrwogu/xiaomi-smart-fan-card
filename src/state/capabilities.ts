import { getModelProfile, isXiaomiFanModel, resolveSpeedLevels } from "./model-profiles";
import type { FanCapabilities, HassEntity, RelatedEntities, ServiceAvailability } from "../types";

const hasAttribute = (entity: HassEntity | undefined, keys: string[]): boolean =>
  entity !== undefined && keys.some((key) => Object.prototype.hasOwnProperty.call(entity.attributes, key));

const hasService = (services: ServiceAvailability, name: string): boolean =>
  services.loaded && services.names.has(name);

const customService = (services: ServiceAvailability, name: string): boolean =>
  hasService(services, `xiaomi_miio_fan.${name}`);

const hasFanFeature = (entity: HassEntity | undefined, bit: number): boolean => {
  const supportedFeatures = Number(entity?.attributes["supported_features"]);
  return Number.isInteger(supportedFeatures) && (supportedFeatures & bit) !== 0;
};

export const detectCapabilities = (
  entity: HassEntity | undefined,
  services: ServiceAvailability = { loaded: false, names: new Set() },
  related: RelatedEntities = {},
): FanCapabilities => {
  const model = typeof entity?.attributes["model"] === "string" ? entity.attributes["model"] : undefined;
  const profile = getModelProfile(model);
  const isXiaomi = profile.isXiaomi || isXiaomiFanModel(model);
  const hasHorizontalAngle = hasAttribute(entity, [
    "horizontal_swing_angle",
    "horizontal_angle",
    "swing_mode_angle",
    "angle",
  ]);
  const hasVerticalAngle = hasAttribute(entity, [
    "vertical_swing_angle",
    "vertical_oscillation_angle",
    "vertical_angle",
  ]);
  const hasSleepPreset = [
    entity?.attributes["preset_modes"],
    entity?.attributes["speed_list"],
    entity?.attributes["speed_modes"],
  ].some(
    (value) =>
      Array.isArray(value) && value.some((mode) => typeof mode === "string" && mode.toLowerCase().includes("sleep")),
  );
  const hasNaturalPreset =
    [entity?.attributes["preset_modes"], entity?.attributes["speed_list"], entity?.attributes["speed_modes"]].some(
      (value) =>
        Array.isArray(value) &&
        value.some(
          (mode) =>
            typeof mode === "string" &&
            (mode.toLowerCase().includes("natural") || mode.toLowerCase().includes("nature")),
        ),
    ) ||
    (typeof entity?.attributes["mode"] === "string" &&
      ["natural", "nature"].some((name) => (entity.attributes["mode"] as string).toLowerCase().includes(name)));

  return {
    isXiaomi,
    modelLabel: profile.label,
    speedLevels: resolveSpeedLevels(entity?.attributes ?? {}, profile),
    direction:
      hasAttribute(entity, ["direction", "current_direction"]) ||
      hasFanFeature(entity, 16) ||
      hasService(services, "fan.set_direction"),
    sleepMode: Boolean(related.sleepMode) || hasSleepPreset,
    favoriteLevel: Boolean(related.favoriteLevel),
    horizontalSwing:
      hasAttribute(entity, ["oscillating", "oscillate", "horizontal_swing", "swing_mode"]) ||
      hasFanFeature(entity, 8) ||
      (profile.known && profile.isXiaomi && profile.model !== "xiaomi.fan.2lite"),
    horizontalAngle:
      Boolean(related.horizontalAngle) ||
      (hasHorizontalAngle && customService(services, "fan_set_oscillation_angle")) ||
      (profile.horizontalAngles.length > 0 && customService(services, "fan_set_oscillation_angle")),
    horizontalAngles: profile.horizontalAngles,
    verticalSwing:
      Boolean(related.verticalSwing) ||
      (hasAttribute(entity, ["vertical_swing", "vertical_oscillate", "vertical_oscillation"]) &&
        customService(services, "fan_set_vertical_oscillation_on") &&
        customService(services, "fan_set_vertical_oscillation_off")) ||
      (profile.supportsVerticalSwing &&
        customService(services, "fan_set_vertical_oscillation_on") &&
        customService(services, "fan_set_vertical_oscillation_off")),
    verticalAngle:
      Boolean(related.verticalAngle) ||
      (hasVerticalAngle && customService(services, "fan_set_vertical_oscillation_angle")) ||
      (profile.verticalAngles.length > 0 && customService(services, "fan_set_vertical_oscillation_angle")),
    verticalAngles: profile.verticalAngles,
    directionNudge: profile.supportsNudge && customService(services, "fan_turn"),
    naturalMode:
      hasNaturalPreset || (profile.known && profile.isXiaomi && !hasAttribute(entity, ["preset_modes", "speed_list"])),
    timer:
      Boolean(related.timer) ||
      (hasAttribute(entity, ["delay_off_countdown", "delay_time", "power_off_time", "timer"]) &&
        customService(services, "fan_set_delay_off")) ||
      (isXiaomi && customService(services, "fan_set_delay_off")),
    childLock:
      Boolean(related.childLock) ||
      (hasAttribute(entity, ["child_lock"]) && customService(services, "fan_set_child_lock_on")) ||
      (isXiaomi && customService(services, "fan_set_child_lock_on")),
    led:
      Boolean(related.led) ||
      (hasAttribute(entity, ["led", "light", "led_brightness", "light_enum"]) &&
        customService(services, "fan_set_led_brightness")) ||
      (isXiaomi && customService(services, "fan_set_led_brightness")),
    buzzer:
      Boolean(related.buzzer) ||
      (hasAttribute(entity, ["buzzer", "notification_sound"]) &&
        customService(services, "fan_set_buzzer_on") &&
        customService(services, "fan_set_buzzer_off")) ||
      (isXiaomi && customService(services, "fan_set_buzzer_on") && customService(services, "fan_set_buzzer_off")),
    ionizer:
      Boolean(related.ionizer) ||
      (hasAttribute(entity, ["anion", "ionizer"]) &&
        customService(services, "fan_set_anion_on") &&
        customService(services, "fan_set_anion_off")) ||
      (isXiaomi && customService(services, "fan_set_anion_on") && customService(services, "fan_set_anion_off")),
  };
};
