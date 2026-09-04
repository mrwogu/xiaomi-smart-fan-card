import type { FanMode, HassEntity, NormalizedFanState } from "../types";
import { getModelProfile, resolveSpeedLevels, speedLevelForPercentage } from "./model-profiles";
import type { TimerUnit } from "../types";

export const parseTimerUnit = (value: unknown): TimerUnit => {
  if (typeof value === "string" && ["s", "sec", "second", "seconds"].includes(value.trim().toLowerCase())) {
    return "s";
  }

  return "min";
};

export const timerValueToMinutes = (value: number, unit: TimerUnit): number => (unit === "s" ? value / 60 : value);

export const minutesToTimerValue = (minutes: number, unit: TimerUnit): number =>
  unit === "s" ? minutes * 60 : minutes;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const numberValue = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

/**
 * Integrations expose numbers bare or wrapped in a unit label such as `90°`
 * and `60 degrees`, which is how select options usually arrive.
 */
export const numericLabel = (value: unknown): number | undefined => {
  const numeric = numberValue(value);
  if (numeric !== undefined) {
    return numeric;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.trim().match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*(?:°|degrees?)?$/i);
  return match ? Number(match[1]) : undefined;
};

const booleanValue = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1") {
    return true;
  }

  if (value === 0 || value === "0") {
    return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      ["on", "true", "yes", "enabled", "active", "bright", "sleep", "oscillate", "oscillating", "swing"].includes(
        normalized,
      )
    ) {
      return true;
    }

    if (["off", "false", "no", "disabled", "inactive", "dim", "normal", "fixed", "static"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const stringValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
};

const firstNumber = (attributes: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = numberValue(attributes[key]);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
};

const firstAngle = (attributes: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = numericLabel(attributes[key]);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
};

const firstBoolean = (attributes: Record<string, unknown>, keys: string[]): boolean | undefined => {
  for (const key of keys) {
    const value = booleanValue(attributes[key]);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
};

const timerMinutes = (attributes: Record<string, unknown>, timerUnit: "min" | "s" | undefined): number | undefined => {
  const value = firstNumber(attributes, ["delay_off_countdown", "delay_time", "power_off_time", "timer"]);
  if (value === undefined) {
    return undefined;
  }

  const unit = parseTimerUnit(
    attributes["timer_unit"] ?? attributes["delay_time_unit"] ?? attributes["unit_of_measurement"] ?? timerUnit,
  );
  return timerValueToMinutes(value, unit);
};

const ledState = (attributes: Record<string, unknown>): boolean | undefined => {
  const brightness = firstNumber(attributes, ["led_brightness"]);
  if (brightness !== undefined) {
    return brightness < 2;
  }

  const direct = firstBoolean(attributes, ["led", "light", "light_enum"]);
  if (direct !== undefined) {
    return direct;
  }

  const fallbackBrightness = firstNumber(attributes, ["light", "led"]);
  return fallbackBrightness === undefined ? undefined : fallbackBrightness < 2;
};

const readPresetModes = (...values: unknown[]): string[] => {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return value.map(String);
    }
  }

  return [];
};

export const normalizeFanState = (entityId: string, entity?: HassEntity): NormalizedFanState => {
  const attributes = entity?.attributes ?? {};
  const model = stringValue(attributes["model"] ?? attributes["model_name"] ?? attributes["miot_model"]);
  const profile = getModelProfile(model);
  const speedLevels = resolveSpeedLevels(attributes, profile);
  const directPercentage = firstNumber(attributes, ["percentage", "direct_speed", "natural_speed"]);
  const rawSpeed = firstNumber(attributes, ["fan_speed", "speed", "raw_speed"]);
  const rawSpeedPercentage =
    rawSpeed !== undefined && rawSpeed <= speedLevels ? (rawSpeed / speedLevels) * 100 : rawSpeed;
  const percentage = clamp(directPercentage ?? rawSpeedPercentage ?? 0, 0, 100);
  const presetMode = stringValue(attributes["preset_mode"])?.toLowerCase() ?? "";
  const operationMode = stringValue(attributes["mode"] ?? attributes["operation_mode"])?.toLowerCase() ?? "";
  const isNatural = (value: string): boolean => value.includes("natural") || value.includes("nature");
  const mode: FanMode =
    isNatural(presetMode) ||
    isNatural(operationMode) ||
    (operationMode === "" && (firstNumber(attributes, ["natural_speed"]) ?? 0) > 0)
      ? "natural"
      : "normal";
  const presetModes = readPresetModes(attributes["preset_modes"], attributes["speed_list"], attributes["speed_modes"]);
  const directionValue = stringValue(attributes["direction"] ?? attributes["current_direction"])?.toLowerCase();
  const sleepMode = booleanValue(attributes["sleep_mode"]) ?? presetMode.includes("sleep");
  const level = speedLevelForPercentage(percentage, speedLevels, Number(attributes["percentage_step"]));
  const friendlyName = stringValue(attributes["friendly_name"]) ?? entityId;

  return {
    entityId,
    model,
    friendlyName,
    available: entity !== undefined && entity.state !== "unavailable" && entity.state !== "unknown",
    isOn: entity?.state === "on",
    percentage,
    level,
    speedLevels,
    mode,
    favoriteLevel: firstNumber(attributes, ["favorite_level", "favorite_speed"]),
    presetMode: stringValue(attributes["preset_mode"]),
    availableModes: presetModes,
    sleepMode,
    direction: directionValue === "forward" || directionValue === "reverse" ? directionValue : undefined,
    horizontalSwing: firstBoolean(attributes, [
      "oscillating",
      "oscillate",
      "horizontal_swing",
      "horizontal_oscillating",
      "horizontal_oscillation",
      "swing_mode",
    ]),
    horizontalAngle: firstAngle(attributes, [
      "horizontal_swing_angle",
      "horizontal_angle",
      "swing_mode_angle",
      "angle",
    ]),
    verticalSwing: firstBoolean(attributes, ["vertical_swing", "vertical_oscillate", "vertical_oscillation"]),
    verticalAngle: firstAngle(attributes, ["vertical_swing_angle", "vertical_oscillation_angle", "vertical_angle"]),
    timerMinutes: timerMinutes(attributes, profile.timerUnit),
    childLock: booleanValue(attributes["child_lock"]),
    led: ledState(attributes),
    buzzer: firstBoolean(attributes, ["buzzer", "notification_sound"]),
    ionizer: firstBoolean(attributes, ["anion", "ionizer"]),
    temperature: stringValue(attributes["temperature"]),
    humidity: stringValue(attributes["humidity"]),
  };
};
