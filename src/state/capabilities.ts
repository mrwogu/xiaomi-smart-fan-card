import { getModelProfile, isXiaomiFanModel, resolveSpeedLevels } from "./model-profiles";
import type { FanCapabilities, HassEntity, RelatedEntities, ServiceAvailability } from "../types";

const FAN_FEATURE_SET_SPEED = 1;
const FAN_FEATURE_OSCILLATE = 2;
const FAN_FEATURE_DIRECTION = 4;
const FAN_FEATURE_PRESET_MODE = 8;

const hasAttribute = (entity: HassEntity | undefined, keys: string[]): boolean =>
  entity !== undefined && keys.some((key) => Object.prototype.hasOwnProperty.call(entity.attributes, key));

const hasService = (services: ServiceAvailability, name: string): boolean =>
  services.loaded && services.names.has(name);

const customService = (services: ServiceAvailability, name: string): boolean =>
  hasService(services, `xiaomi_miio_fan.${name}`);

const supportedFeatures = (entity: HassEntity | undefined): number => {
  const value = entity?.attributes["supported_features"];
  if (typeof value === "number") {
    return value;
  }

  return typeof value === "string" && value.trim() !== "" ? Number(value) : Number.NaN;
};

const hasFanFeature = (entity: HassEntity | undefined, bit: number): boolean => {
  const features = supportedFeatures(entity);
  return Number.isInteger(features) && (features & bit) !== 0;
};

const hasFeatureMask = (entity: HassEntity | undefined): boolean => {
  return Number.isInteger(supportedFeatures(entity));
};

const percentageStep = (entity: HassEntity | undefined): number => {
  const step = Number(entity?.attributes["percentage_step"]);
  return Number.isFinite(step) && step > 0 && step <= 100 ? step : 1;
};

export const detectCapabilities = (
  entity: HassEntity | undefined,
  services: ServiceAvailability = { loaded: false, names: new Set() },
  related: RelatedEntities = {},
): FanCapabilities => {
  const model =
    typeof entity?.attributes["model"] === "string"
      ? entity.attributes["model"]
      : typeof entity?.attributes["model_name"] === "string"
        ? entity.attributes["model_name"]
        : typeof entity?.attributes["miot_model"] === "string"
          ? entity.attributes["miot_model"]
          : undefined;
  const profile = getModelProfile(model);
  const isXiaomi = profile.isXiaomi || isXiaomiFanModel(model);
  const explicitFeatureMask = hasFeatureMask(entity);
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
      (value) => {
        if (Array.isArray(value)) {
          return value.some(
            (mode) =>
              typeof mode === "string" &&
              (mode.toLowerCase().includes("natural") || mode.toLowerCase().includes("nature")),
          );
        }

        return (
          typeof value === "string" &&
          (value.toLowerCase().includes("natural") || value.toLowerCase().includes("nature"))
        );
      },
    ) ||
    (typeof entity?.attributes["mode"] === "string" &&
      ["natural", "nature"].some((name) => (entity.attributes["mode"] as string).toLowerCase().includes(name)));
  const hasPresetAttributes = hasAttribute(entity, ["preset_modes", "speed_list", "speed_modes", "preset_mode"]);
  const speed =
    hasFanFeature(entity, FAN_FEATURE_SET_SPEED) ||
    (!explicitFeatureMask &&
      (hasAttribute(entity, ["percentage", "percentage_step", "fan_speed", "speed", "direct_speed", "natural_speed"]) ||
        profile.known));
  const presetMode =
    hasFanFeature(entity, FAN_FEATURE_PRESET_MODE) || (!explicitFeatureMask && (hasPresetAttributes || profile.known));
  const xiaomiCustomModel = isXiaomi;
  // Xiaomi Home has no fan_turn service and exposes the pad as four button
  // entities instead, so all four buttons make the pad actionable on their own.
  const hasNudgeButtons =
    Boolean(related.nudgeLeft) && Boolean(related.nudgeRight) && Boolean(related.nudgeUp) && Boolean(related.nudgeDown);
  return {
    isXiaomi,
    modelLabel: profile.label,
    speed,
    percentageStep: percentageStep(entity),
    speedLevels: resolveSpeedLevels(entity?.attributes ?? {}, profile),
    presetMode,
    direction:
      (!explicitFeatureMask && hasAttribute(entity, ["direction", "current_direction"])) ||
      hasFanFeature(entity, FAN_FEATURE_DIRECTION),
    sleepMode: Boolean(related.sleepMode) || (presetMode && hasSleepPreset),
    favoriteLevel: Boolean(related.favoriteLevel),
    horizontalSwing:
      Boolean(related.horizontalSwing) ||
      (!explicitFeatureMask &&
        hasAttribute(entity, [
          "oscillating",
          "oscillate",
          "horizontal_swing",
          "horizontal_oscillating",
          "horizontal_oscillation",
          "swing_mode",
        ])) ||
      hasFanFeature(entity, FAN_FEATURE_OSCILLATE) ||
      (profile.known &&
        xiaomiCustomModel &&
        !explicitFeatureMask &&
        hasService(services, "fan.oscillate") &&
        profile.model !== "xiaomi.fan.2lite"),
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
    directionNudge: (profile.supportsNudge && customService(services, "fan_turn")) || hasNudgeButtons,
    naturalMode:
      presetMode &&
      (hasNaturalPreset ||
        (!explicitFeatureMask &&
          profile.known &&
          profile.isXiaomi &&
          !hasAttribute(entity, ["preset_modes", "speed_list", "speed_modes"]))),
    timer:
      Boolean(related.timer) ||
      (hasAttribute(entity, ["delay_off_countdown", "delay_time", "power_off_time", "timer"]) &&
        customService(services, "fan_set_delay_off")) ||
      (xiaomiCustomModel && customService(services, "fan_set_delay_off")),
    childLock:
      Boolean(related.childLock) ||
      (hasAttribute(entity, ["child_lock"]) && customService(services, "fan_set_child_lock_on")) ||
      (xiaomiCustomModel && customService(services, "fan_set_child_lock_on")),
    led:
      Boolean(related.led) ||
      (hasAttribute(entity, ["led", "light", "led_brightness", "light_enum"]) &&
        customService(services, "fan_set_led_brightness")) ||
      (xiaomiCustomModel && customService(services, "fan_set_led_brightness")),
    buzzer:
      Boolean(related.buzzer) ||
      (hasAttribute(entity, ["buzzer", "notification_sound"]) &&
        customService(services, "fan_set_buzzer_on") &&
        customService(services, "fan_set_buzzer_off")) ||
      (xiaomiCustomModel &&
        customService(services, "fan_set_buzzer_on") &&
        customService(services, "fan_set_buzzer_off")),
    ionizer:
      Boolean(related.ionizer) ||
      (hasAttribute(entity, ["anion", "ionizer"]) &&
        customService(services, "fan_set_anion_on") &&
        customService(services, "fan_set_anion_off")) ||
      (xiaomiCustomModel &&
        customService(services, "fan_set_anion_on") &&
        customService(services, "fan_set_anion_off")),
  };
};
