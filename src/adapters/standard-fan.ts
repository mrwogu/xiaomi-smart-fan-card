import { detectCapabilities } from "../state/capabilities";
import { getModelProfile } from "../state/model-profiles";
import {
  minutesToTimerValue,
  normalizeFanState,
  numericLabel,
  parseTimerUnit,
  timerValueToMinutes,
} from "../state/normalize-state";
import { ServiceDispatcher } from "../services/service-dispatcher";
import type {
  FanAdapter,
  FanCapabilities,
  FanMode,
  FanModelProfile,
  HassEntity,
  HassLike,
  NormalizedFanState,
  NumberSpec,
  RelatedEntities,
  ServiceAvailability,
  TimerSpec,
} from "../types";

/**
 * A dropdown turns unusable well before a fine-grained angle entity runs out of
 * steps, so a wider range reports its raw spec instead of a preset list.
 */
const MAX_ANGLE_STEPS = 24;

const MAX_TIMER_STEPS = 100;

const entityParts = (entityId: string): [string, string] => {
  const [domain, objectId] = entityId.split(".");
  return [domain ?? "", objectId ?? ""];
};

const numericOptions = (options: unknown): number[] | undefined => {
  if (!Array.isArray(options)) {
    return undefined;
  }

  const angles = [...new Set(options.map(numericLabel).filter((value): value is number => value !== undefined))].sort(
    (left, right) => left - right,
  );
  return angles.length > 0 ? angles : undefined;
};

const numericAngleOptions = (entity: HassEntity | undefined): number[] | undefined =>
  numericOptions(entity?.attributes["options"]);

const selectOptions = (entity: HassEntity | undefined): string[] => {
  const options = entity?.attributes["options"];
  return Array.isArray(options) ? options.map(String) : [];
};

const RELATED_ENTITY_DOMAINS: Record<keyof RelatedEntities, readonly string[]> = {
  sleepMode: ["switch", "input_boolean", "select"],
  horizontalSwing: ["switch", "input_boolean", "select"],
  verticalSwing: ["switch", "input_boolean", "select"],
  horizontalAngle: ["number", "input_number", "select"],
  verticalAngle: ["number", "input_number", "select"],
  favoriteLevel: ["number", "input_number"],
  timer: ["number", "input_number"],
  childLock: ["switch", "input_boolean", "select"],
  led: ["switch", "input_boolean", "select", "number", "input_number"],
  buzzer: ["switch", "input_boolean", "select"],
  ionizer: ["switch", "input_boolean", "select"],
  nudgeLeft: ["button"],
  nudgeRight: ["button"],
  nudgeUp: ["button"],
  nudgeDown: ["button"],
  temperature: ["sensor"],
  humidity: ["sensor"],
};

/**
 * Exact labels win over substring hints because a substring search returns the
 * first matching option rather than the closest one: `Dim` would answer a
 * request for `Off`, and `on` hides inside words such as `None`.
 */
const selectOptionFor = (options: string[], exact: readonly string[], hints: readonly string[]): string | undefined => {
  const normalized = options.map((option) => ({ option, key: option.trim().toLowerCase() }));

  for (const label of exact) {
    const match = normalized.find((entry) => entry.key === label);
    if (match) {
      return match.option;
    }
  }

  for (const hint of hints) {
    const match = normalized.find((entry) => entry.key.includes(hint));
    if (match) {
      return match.option;
    }
  }

  return undefined;
};

const rawSteps = (spec: NumberSpec): number[] =>
  Array.from({ length: Math.floor((spec.max - spec.min) / spec.step) + 1 }, (_, index) => spec.min + index * spec.step);

const roundStep = (value: number): number => Math.round(value * 100) / 100;

const snapNumber = (value: number, spec: NumberSpec): number => {
  const clamped = Math.min(spec.max, Math.max(spec.min, value));
  const snapped = spec.min + Math.round((clamped - spec.min) / spec.step) * spec.step;
  return Number(Math.min(spec.max, Math.max(spec.min, snapped)).toPrecision(12));
};

const snapPercentage = (value: number, step: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value <= 0) {
    return 0;
  }

  if (value >= 100) {
    return 100;
  }

  return Number(Math.min(100, Math.max(0, Math.round(value / step) * step)).toFixed(6));
};

const BOOLEAN_SELECT_LABELS = {
  enabledExact: ["on", "true", "yes", "enable", "enabled", "1"],
  enabledHints: ["bright", "enable", "active", "sleep", "oscillate", "swing", "true"],
  disabledExact: ["off", "false", "no", "disable", "disabled", "0"],
  disabledHints: ["off", "disable", "inactive", "false", "none", "normal", "fixed", "static", "dim"],
} as const;

const isDisabledLabel = (value: string): boolean =>
  selectOptionFor([value], BOOLEAN_SELECT_LABELS.disabledExact, ["off", "disable", "inactive"]) !== undefined;

const booleanSelectOption = (options: string[], enabled: boolean): string | undefined =>
  enabled
    ? selectOptionFor(options, BOOLEAN_SELECT_LABELS.enabledExact, BOOLEAN_SELECT_LABELS.enabledHints)
    : selectOptionFor(options, BOOLEAN_SELECT_LABELS.disabledExact, BOOLEAN_SELECT_LABELS.disabledHints);

export class StandardFanAdapter implements FanAdapter {
  public readonly state: NormalizedFanState;
  public readonly profile: FanModelProfile;
  public readonly capabilities: FanCapabilities;

  protected readonly dispatcher: ServiceDispatcher;
  private readonly actionableRelated: RelatedEntities;

  constructor(
    protected readonly hass: HassLike,
    protected readonly entityId: string,
    protected readonly services: ServiceAvailability,
    protected readonly related: RelatedEntities = {},
  ) {
    const actionableRelated = this.actionableRelatedEntities();
    this.actionableRelated = actionableRelated;
    const timerSpec = this.readTimerSpec(actionableRelated.timer);
    const timerUnit = this.readTimerUnit(actionableRelated.timer);
    this.state = normalizeFanState(
      entityId,
      this.entityWithRelatedAttributes(this.stateRelatedEntities(actionableRelated), timerSpec, timerUnit),
    );
    this.profile = getModelProfile(this.state.model);
    const detectedCapabilities = detectCapabilities(hass.states[entityId], services, actionableRelated);
    this.capabilities = {
      ...detectedCapabilities,
      horizontalAngles:
        this.readAngleOptions(actionableRelated.horizontalAngle) ??
        (detectedCapabilities.horizontalAngles.length > 0
          ? detectedCapabilities.horizontalAngles
          : (this.readAngleSteps(actionableRelated.horizontalAngle) ?? [])),
      horizontalAngleSpec: this.readNumberSpec(actionableRelated.horizontalAngle),
      favoriteLevelSpec: this.readNumberSpec(actionableRelated.favoriteLevel),
      verticalAngles:
        this.readAngleOptions(actionableRelated.verticalAngle) ??
        (detectedCapabilities.verticalAngles.length > 0
          ? detectedCapabilities.verticalAngles
          : (this.readAngleSteps(actionableRelated.verticalAngle) ?? [])),
      verticalAngleSpec: this.readNumberSpec(actionableRelated.verticalAngle),
      timerSteps: this.readNumberSteps(actionableRelated.timer ? timerSpec : undefined),
      timerSpec: actionableRelated.timer ? timerSpec : undefined,
    };
    this.dispatcher = new ServiceDispatcher(hass, entityId, services);
  }

  private actionableRelatedEntities(): RelatedEntities {
    const actionable = { ...this.related };
    const booleanKeys: ReadonlySet<keyof RelatedEntities> = new Set([
      "sleepMode",
      "horizontalSwing",
      "verticalSwing",
      "childLock",
      "buzzer",
      "ionizer",
    ]);
    // Momentary buttons report `unknown` until their first press, which would
    // otherwise drop a fully working position pad.
    const momentaryKeys: ReadonlySet<keyof RelatedEntities> = new Set([
      "nudgeLeft",
      "nudgeRight",
      "nudgeUp",
      "nudgeDown",
    ]);

    for (const key of Object.keys(actionable) as Array<keyof RelatedEntities>) {
      const entityId = actionable[key];
      const state = entityId ? this.hass.states[entityId] : undefined;
      const [domain] = entityId ? entityParts(entityId) : [""];
      if (
        !state ||
        state.state === "unavailable" ||
        (state.state === "unknown" && !momentaryKeys.has(key)) ||
        !RELATED_ENTITY_DOMAINS[key].includes(domain) ||
        ((key === "horizontalAngle" || key === "verticalAngle") &&
          this.isSelectEntity(entityId) &&
          numericAngleOptions(state) === undefined) ||
        (booleanKeys.has(key) && this.isSelectEntity(entityId) && !this.hasBooleanSelectOptions(state))
      ) {
        delete actionable[key];
      }
    }

    return actionable;
  }

  private stateRelatedEntities(actionable: RelatedEntities): RelatedEntities {
    const stateRelated = { ...actionable };

    for (const key of Object.keys(this.related) as Array<keyof RelatedEntities>) {
      if (stateRelated[key] !== undefined) {
        continue;
      }

      const entityId = this.related[key];
      const state = entityId ? this.hass.states[entityId] : undefined;
      const [domain] = entityId ? entityParts(entityId) : [""];
      if (
        state &&
        (state.state === "unknown" || state.state === "unavailable") &&
        RELATED_ENTITY_DOMAINS[key].includes(domain)
      ) {
        stateRelated[key] = entityId;
      }
    }

    return stateRelated;
  }

  private isSelectEntity(entityId: string | undefined): boolean {
    return entityId !== undefined && entityParts(entityId)[0] === "select";
  }

  private hasBooleanSelectOptions(entity: HassEntity): boolean {
    const options = selectOptions(entity);
    return booleanSelectOption(options, true) !== undefined && booleanSelectOption(options, false) !== undefined;
  }

  private readAngleOptions(entityId: string | undefined): number[] | undefined {
    return numericAngleOptions(entityId ? this.hass.states[entityId] : undefined);
  }

  private readNumberSpec(entityId: string | undefined): NumberSpec | undefined {
    const entity = entityId ? this.hass.states[entityId] : undefined;
    const minimum = Number(entity?.attributes["min"]);
    const maximum = Number(entity?.attributes["max"]);
    const step = Number(entity?.attributes["step"]);
    if (
      !Number.isFinite(minimum) ||
      !Number.isFinite(maximum) ||
      !Number.isFinite(step) ||
      step <= 0 ||
      maximum < minimum
    ) {
      return undefined;
    }

    return { min: minimum, max: maximum, step };
  }

  private readTimerSpec(entityId: string | undefined): TimerSpec | undefined {
    const spec = this.readNumberSpec(entityId);
    if (!spec || (spec.max - spec.min) / spec.step > MAX_TIMER_STEPS) {
      return undefined;
    }

    return { ...spec, unit: this.readTimerUnit(entityId) };
  }

  private readTimerUnit(entityId: string | undefined): TimerSpec["unit"] {
    const entity = entityId ? this.hass.states[entityId] : undefined;
    return parseTimerUnit(entity?.attributes["unit_of_measurement"]);
  }

  /**
   * Angles carry no timer unit, so they never go through the timer conversion.
   * A range too wide for a dropdown reports no presets and leaves the card on
   * the bounded numeric input built from the same spec.
   */
  private readAngleSteps(entityId: string | undefined): number[] | undefined {
    const spec = this.readNumberSpec(entityId);
    if (!spec || (spec.max - spec.min) / spec.step > MAX_ANGLE_STEPS) {
      return undefined;
    }

    return rawSteps(spec).map(roundStep);
  }

  private readNumberSteps(spec: TimerSpec | undefined): number[] | undefined {
    if (!spec) {
      return undefined;
    }

    return rawSteps(spec).map((value) => roundStep(timerValueToMinutes(value, spec.unit)));
  }

  private entityWithRelatedAttributes(
    related: RelatedEntities,
    timerSpec: TimerSpec | undefined,
    timerUnit: TimerSpec["unit"],
  ): HassEntity | undefined {
    const entity = this.hass.states[this.entityId];
    if (!entity) {
      return undefined;
    }

    const attributes = { ...entity.attributes };
    const attributeAliases: Partial<Record<keyof RelatedEntities, readonly string[]>> = {
      horizontalAngle: ["horizontal_swing_angle", "horizontal_angle", "swing_mode_angle", "angle"],
      horizontalSwing: [
        "oscillating",
        "oscillate",
        "horizontal_swing",
        "horizontal_oscillating",
        "horizontal_oscillation",
        "swing_mode",
      ],
      favoriteLevel: ["favorite_level", "favorite_speed"],
      verticalAngle: ["vertical_swing_angle", "vertical_oscillation_angle", "vertical_angle"],
      verticalSwing: ["vertical_swing", "vertical_oscillate", "vertical_oscillation"],
      timer: ["delay_off_countdown", "delay_time", "power_off_time", "timer", "timer_unit", "delay_time_unit"],
      led: ["led", "light", "led_brightness", "light_enum"],
      buzzer: ["buzzer", "notification_sound"],
      ionizer: ["anion", "ionizer"],
    };
    const clearAliases = (key: keyof RelatedEntities): void => {
      for (const alias of attributeAliases[key] ?? []) {
        delete attributes[alias];
      }
    };
    const relatedValues: Array<[keyof RelatedEntities, string]> = [
      ["horizontalAngle", "horizontal_swing_angle"],
      ["sleepMode", "sleep_mode"],
      ["horizontalSwing", "horizontal_swing"],
      ["verticalAngle", "vertical_swing_angle"],
      ["favoriteLevel", "favorite_level"],
      ["verticalSwing", "vertical_swing"],
      ["timer", "delay_time"],
      ["childLock", "child_lock"],
      ["led", "led"],
      ["buzzer", "buzzer"],
      ["ionizer", "ionizer"],
      ["temperature", "temperature"],
      ["humidity", "humidity"],
    ];

    for (const [relatedKey, attributeKey] of relatedValues) {
      const relatedEntityId = related[relatedKey];
      const relatedState = relatedEntityId ? this.hass.states[relatedEntityId] : undefined;
      if (relatedEntityId && relatedState && relatedState.state !== "unknown" && relatedState.state !== "unavailable") {
        if (relatedKey === "led") {
          clearAliases(relatedKey);
          attributes[attributeKey] = this.readRelatedLedState(relatedEntityId, relatedState);
          continue;
        }

        // A mode selector matched as an angle entity carries no angle, so the
        // primary attribute stays authoritative instead of being overwritten.
        if (
          (relatedKey === "horizontalAngle" || relatedKey === "verticalAngle") &&
          numericLabel(relatedState.state) === undefined
        ) {
          continue;
        }

        clearAliases(relatedKey);
        const value = Number(relatedState.state);
        attributes[attributeKey] =
          relatedKey === "timer" && Number.isFinite(value)
            ? timerValueToMinutes(value, timerSpec?.unit ?? timerUnit)
            : relatedState.state;
        if (relatedKey === "timer") {
          attributes["timer_unit"] = "min";
        }
      } else if (relatedState) {
        clearAliases(relatedKey);
        delete attributes[attributeKey];
      } else if (attributes[attributeKey] !== undefined && attributes[attributeKey] !== null) {
        continue;
      }
    }

    return { ...entity, attributes };
  }

  private readRelatedLedState(entityId: string, entity: HassEntity): string | boolean {
    const [domain] = entityParts(entityId);
    const current = numericLabel(entity.state);

    if (domain === "number" || domain === "input_number") {
      const minimum = Number(entity.attributes["min"]);
      const maximum = Number(entity.attributes["max"]);
      if (current !== undefined && Number.isFinite(minimum) && Number.isFinite(maximum) && maximum >= minimum) {
        return this.isCustomLedBrightnessMapping(entityId, minimum, maximum) ? current < 2 : current > minimum;
      }
    }

    if (domain === "select") {
      const options = numericOptions(entity.attributes["options"]) ?? [];
      if (current !== undefined && options.includes(0) && options.includes(2)) {
        return current < 2;
      }

      // A dimmed LED is still lit, so only an explicit off label reads as off.
      return !isDisabledLabel(entity.state);
    }

    return entity.state;
  }

  private isCustomLedBrightnessMapping(entityId: string, minimum: number, maximum: number): boolean {
    return entityId.endsWith("_led_brightness") && minimum === 0 && maximum === 2;
  }

  public async togglePower(): Promise<void> {
    await this.dispatcher.standard("toggle");
  }

  public async setPercentage(percentage: number): Promise<void> {
    const requestedPercentage = snapPercentage(percentage, this.capabilities.percentageStep);
    if (requestedPercentage <= 0) {
      await this.dispatcher.standard("turn_off");
      return;
    }

    // A stopped fan needs turn_on to carry the speed; set_percentage alone is
    // not guaranteed to start it.
    if (!this.state.isOn) {
      await this.dispatcher.standard("turn_on", { percentage: requestedPercentage });
      return;
    }

    await this.dispatcher.standard("set_percentage", { percentage: requestedPercentage });
  }

  public async setMode(mode: FanMode): Promise<void> {
    const preferred =
      mode === "natural" ? ["natural", "nature", "natural 1"] : ["normal", "straight", "manual", "level 1"];
    const preset =
      this.state.availableModes.find((candidate) => preferred.includes(candidate.toLowerCase())) ??
      this.state.availableModes.find((candidate) => {
        const normalized = candidate.toLowerCase();
        return mode === "natural"
          ? normalized.includes("natural") || normalized.includes("nature")
          : normalized.includes("normal") || normalized.includes("straight") || normalized.includes("manual");
      }) ??
      (mode === "natural" ? "Natural" : "Normal");
    await this.setPresetMode(preset);
  }

  public async setPresetMode(preset: string): Promise<void> {
    await this.dispatcher.standard("set_preset_mode", { preset_mode: preset });
  }

  public async setSleepMode(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.actionableRelated.sleepMode, enabled)) {
      return;
    }

    const sleepPreset = this.state.availableModes.find((preset) => preset.toLowerCase().includes("sleep"));
    if (!sleepPreset) {
      throw new Error("This fan does not expose a sleep preset.");
    }

    if (enabled) {
      await this.setPresetMode(sleepPreset);
      return;
    }

    const current = this.state.presetMode?.toLowerCase();
    const normalPreset = this.state.availableModes.find(
      (preset) => !preset.toLowerCase().includes("sleep") && preset.toLowerCase().includes("normal"),
    );
    const fallbackPreset = this.state.availableModes.find(
      (preset) => preset.toLowerCase() !== "off" && !preset.toLowerCase().includes("sleep"),
    );
    await this.setPresetMode(
      current && !current.includes("sleep") ? this.state.presetMode! : (normalPreset ?? fallbackPreset ?? "Normal"),
    );
  }

  public async setFavoriteLevel(level: number): Promise<void> {
    const spec = this.capabilities.favoriteLevelSpec;
    const value = spec === undefined ? level : snapNumber(level, spec);
    if (!(await this.setRelatedValue(this.actionableRelated.favoriteLevel, value))) {
      throw new Error("This fan does not expose a favorite level entity.");
    }
  }

  public async setHorizontalSwing(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.actionableRelated.horizontalSwing, enabled)) {
      return;
    }

    await this.dispatcher.standard("oscillate", { oscillating: enabled });
  }

  public async setHorizontalAngle(angle: number): Promise<void> {
    await this.startSwing("horizontal");

    if (await this.setRelatedAngle(this.actionableRelated.horizontalAngle, angle)) {
      return;
    }

    await this.callCustom("fan_set_oscillation_angle", { angle });
  }

  public async setVerticalSwing(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.actionableRelated.verticalSwing, enabled)) {
      return;
    }

    await this.callCustom(enabled ? "fan_set_vertical_oscillation_on" : "fan_set_vertical_oscillation_off");
  }

  public async setVerticalAngle(angle: number): Promise<void> {
    await this.startSwing("vertical");

    if (await this.setRelatedAngle(this.actionableRelated.verticalAngle, angle)) {
      return;
    }

    await this.callCustom("fan_set_vertical_oscillation_angle", {
      vertical_angle: angle,
    });
  }

  public async nudge(direction: "left" | "right" | "up" | "down"): Promise<void> {
    const button = this.nudgeButton(direction);
    if (button) {
      // Xiaomi Home exposes each pad direction as a momentary button entity.
      await this.hass.callService("button", "press", { entity_id: button });
      return;
    }

    // Aiming the head only holds while the fan is not sweeping.
    await this.stopSwing();
    await this.callCustom("fan_turn", { direction });
  }

  private nudgeButton(direction: "left" | "right" | "up" | "down"): string | undefined {
    const buttons: Record<"left" | "right" | "up" | "down", string | undefined> = {
      left: this.actionableRelated.nudgeLeft,
      right: this.actionableRelated.nudgeRight,
      up: this.actionableRelated.nudgeUp,
      down: this.actionableRelated.nudgeDown,
    };
    return buttons[direction];
  }

  /**
   * An angle only takes effect on a sweeping axis, so selecting one implies
   * starting that axis. An unknown swing state is left alone.
   */
  private async startSwing(axis: "horizontal" | "vertical"): Promise<void> {
    if (axis === "horizontal") {
      if (this.capabilities.horizontalSwing && this.state.horizontalSwing === false) {
        await this.setHorizontalSwing(true);
      }
      return;
    }

    if (this.capabilities.verticalSwing && this.state.verticalSwing === false) {
      await this.setVerticalSwing(true);
    }
  }

  private async stopSwing(): Promise<void> {
    if (this.capabilities.horizontalSwing && this.state.horizontalSwing === true) {
      await this.setHorizontalSwing(false);
    }

    if (this.capabilities.verticalSwing && this.state.verticalSwing === true) {
      await this.setVerticalSwing(false);
    }
  }

  public async setDirection(direction: "forward" | "reverse"): Promise<void> {
    await this.dispatcher.standard("set_direction", { direction });
  }

  public async setTimer(minutes: number): Promise<void> {
    const timerSpec = this.readTimerSpec(this.actionableRelated.timer);
    const timerUnit = timerSpec?.unit ?? this.readTimerUnit(this.actionableRelated.timer);
    if (await this.setRelatedValue(this.actionableRelated.timer, minutesToTimerValue(minutes, timerUnit))) {
      return;
    }

    await this.callCustom("fan_set_delay_off", {
      delay_off_countdown: minutesToTimerValue(minutes, this.profile.timerUnit ?? "min"),
    });
  }

  public async setChildLock(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.actionableRelated.childLock, enabled)) {
      return;
    }

    await this.callCustom(enabled ? "fan_set_child_lock_on" : "fan_set_child_lock_off");
  }

  public async setLed(enabled: boolean): Promise<void> {
    if (await this.setRelatedLedBrightness(this.actionableRelated.led, enabled)) {
      return;
    }

    if (await this.setRelatedBoolean(this.actionableRelated.led, enabled)) {
      return;
    }

    await this.callCustom("fan_set_led_brightness", { brightness: enabled ? 0 : 2 });
  }

  public async setBuzzer(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.actionableRelated.buzzer, enabled)) {
      return;
    }

    await this.callCustom(enabled ? "fan_set_buzzer_on" : "fan_set_buzzer_off");
  }

  public async setIonizer(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.actionableRelated.ionizer, enabled)) {
      return;
    }

    await this.callCustom(enabled ? "fan_set_anion_on" : "fan_set_anion_off");
  }

  protected async callCustom(service: string, data: Record<string, unknown> = {}): Promise<void> {
    if (!(await this.dispatcher.custom("xiaomi_miio_fan", service, data))) {
      throw new Error(`xiaomi_miio_fan.${service} is unavailable.`);
    }
  }

  protected async setRelatedValue(entityId: string | undefined, value: number): Promise<boolean> {
    if (!entityId) {
      return false;
    }

    const state = this.hass.states[entityId];
    if (!state || state.state === "unknown" || state.state === "unavailable") {
      return false;
    }

    const [domain] = entityParts(entityId);
    if (domain !== "number" && domain !== "input_number") {
      return false;
    }

    await this.hass.callService(domain, "set_value", { entity_id: entityId, value });
    return true;
  }

  private async setRelatedAngle(entityId: string | undefined, angle: number): Promise<boolean> {
    if (!entityId) {
      return false;
    }

    const state = this.hass.states[entityId];
    if (!state || state.state === "unknown" || state.state === "unavailable") {
      return false;
    }

    const [domain] = entityParts(entityId);
    if (domain === "number" || domain === "input_number") {
      return this.setRelatedValue(entityId, angle);
    }

    if (domain !== "select") {
      return false;
    }

    const option = selectOptions(state).find((candidate) => numericLabel(candidate) === angle);
    if (option === undefined) {
      return false;
    }

    await this.hass.callService("select", "select_option", {
      entity_id: entityId,
      option,
    });
    return true;
  }

  protected async setRelatedBoolean(entityId: string | undefined, enabled: boolean): Promise<boolean> {
    if (!entityId) {
      return false;
    }

    const state = this.hass.states[entityId];
    if (!state || state.state === "unknown" || state.state === "unavailable") {
      return false;
    }

    const [domain] = entityParts(entityId);
    if (domain === "switch" || domain === "input_boolean") {
      await this.hass.callService(domain, enabled ? "turn_on" : "turn_off", { entity_id: entityId });
      return true;
    }

    if (domain === "select") {
      const availableOptions = selectOptions(state);
      if (availableOptions.length === 0) {
        throw new Error(`Related select ${entityId} has no valid options.`);
      }

      const option = booleanSelectOption(availableOptions, enabled);
      if (option === undefined) {
        throw new Error(`Related select ${entityId} has no matching boolean option.`);
      }

      await this.hass.callService(domain, "select_option", {
        entity_id: entityId,
        option,
      });
      return true;
    }

    return false;
  }

  private async setRelatedLedBrightness(entityId: string | undefined, enabled: boolean): Promise<boolean> {
    if (!entityId) {
      return false;
    }

    const [domain] = entityParts(entityId);
    const state = this.hass.states[entityId];
    if (!state || state.state === "unknown" || state.state === "unavailable") {
      return false;
    }

    if (domain === "select") {
      const availableOptions = selectOptions(state);
      const numericTarget = enabled ? 0 : 2;
      const option =
        availableOptions.find((candidate) => numericLabel(candidate) === numericTarget) ??
        booleanSelectOption(availableOptions, enabled);
      if (option === undefined) {
        return false;
      }

      await this.hass.callService("select", "select_option", {
        entity_id: entityId,
        option,
      });
      return true;
    }

    if (domain !== "number" && domain !== "input_number") {
      return false;
    }

    const minimum = Number(state?.attributes["min"]);
    const maximum = Number(state?.attributes["max"]);
    if (
      !state ||
      state.state === "unknown" ||
      state.state === "unavailable" ||
      !Number.isFinite(minimum) ||
      !Number.isFinite(maximum) ||
      maximum < minimum
    ) {
      return false;
    }

    const customBrightnessMapping = this.isCustomLedBrightnessMapping(entityId, minimum, maximum);
    await this.hass.callService(domain, "set_value", {
      entity_id: entityId,
      value: enabled ? (customBrightnessMapping ? minimum : maximum) : customBrightnessMapping ? maximum : minimum,
    });
    return true;
  }
}
