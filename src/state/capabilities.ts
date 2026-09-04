import { getModelProfile, isXiaomiFanModel, resolveSpeedLevels } from "./model-profiles";
import type { FanCapabilities, HassEntity, NudgeDirection, RelatedEntities, ServiceAvailability } from "../types";

const FAN_FEATURE_SET_SPEED = 1;
const FAN_FEATURE_OSCILLATE = 2;
const FAN_FEATURE_DIRECTION = 4;
const FAN_FEATURE_PRESET_MODE = 8;
const FAN_FEATURE_TURN_OFF = 16;
const FAN_FEATURE_TURN_ON = 32;

const hasAttribute = (entity: HassEntity | undefined, keys: string[]): boolean =>
  keys.some((key) => {
    const value = entity?.attributes[key];
    return value !== undefined && value !== null && value !== "" && value !== "unknown" && value !== "unavailable";
  });

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
  const naturalService =
    profile.known &&
    profile.isXiaomi &&
    customService(services, "fan_set_natural_mode_on") &&
    customService(services, "fan_set_natural_mode_off");
  const nudgeDirections: NudgeDirection[] = [];
  if (profile.supportsNudge && customService(services, "fan_turn")) {
    nudgeDirections.push("left", "right");
    if (profile.supportsVerticalSwing) {
      nudgeDirections.push("up", "down");
    }
  }
  if (hasService(services, "button.press")) {
    if (related.nudgeLeft && related.nudgeRight) {
      nudgeDirections.push("left", "right");
    }
    if (related.nudgeUp && related.nudgeDown) {
      nudgeDirections.push("up", "down");
    }
  }
  return {
    isXiaomi,
    modelLabel: profile.label,
    power:
      (entity?.state === "on" || entity?.state === "off") &&
      (!explicitFeatureMask ||
        hasFanFeature(entity, entity.state === "on" ? FAN_FEATURE_TURN_OFF : FAN_FEATURE_TURN_ON)),
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
        isXiaomi &&
        !explicitFeatureMask &&
        hasService(services, "fan.oscillate") &&
        profile.model !== "xiaomi.fan.2lite"),
    horizontalAngle:
      Boolean(related.horizontalAngle) ||
      ((profile.known ? profile.horizontalAngles.length > 0 : hasHorizontalAngle) &&
        customService(services, "fan_set_oscillation_angle")),
    horizontalAngles: profile.horizontalAngles,
    verticalSwing:
      Boolean(related.verticalSwing) ||
      ((profile.known
        ? profile.supportsVerticalSwing
        : hasAttribute(entity, ["vertical_swing", "vertical_oscillate", "vertical_oscillation"])) &&
        customService(services, "fan_set_vertical_oscillation_on") &&
        customService(services, "fan_set_vertical_oscillation_off")),
    verticalAngle:
      Boolean(related.verticalAngle) ||
      ((profile.known ? profile.verticalAngles.length > 0 : hasVerticalAngle) &&
        customService(services, "fan_set_vertical_oscillation_angle")),
    verticalAngles: profile.verticalAngles,
    directionNudge: nudgeDirections.length > 0,
    nudgeDirections: [...new Set(nudgeDirections)],
    naturalMode: (presetMode && hasNaturalPreset) || naturalService,
    timer:
      Boolean(related.timer) ||
      (hasAttribute(entity, ["delay_off_countdown", "delay_time", "power_off_time", "timer"]) &&
        customService(services, "fan_set_delay_off")),
    childLock:
      Boolean(related.childLock) ||
      (hasAttribute(entity, ["child_lock"]) &&
        customService(services, "fan_set_child_lock_on") &&
        customService(services, "fan_set_child_lock_off")),
    led:
      Boolean(related.led) ||
      (hasAttribute(entity, ["led", "light", "led_brightness", "light_enum"]) &&
        customService(services, "fan_set_led_brightness")),
    buzzer:
      Boolean(related.buzzer) ||
      (hasAttribute(entity, ["buzzer", "notification_sound"]) &&
        customService(services, "fan_set_buzzer_on") &&
        customService(services, "fan_set_buzzer_off")),
    ionizer:
      Boolean(related.ionizer) ||
      (hasAttribute(entity, ["anion", "ionizer"]) &&
        customService(services, "fan_set_anion_on") &&
        customService(services, "fan_set_anion_off")),
  };
};
