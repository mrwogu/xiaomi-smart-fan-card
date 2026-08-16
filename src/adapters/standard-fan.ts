import { detectCapabilities } from "../state/capabilities";
import { getModelProfile } from "../state/model-profiles";
import { minutesToTimerValue, normalizeFanState, parseTimerUnit, timerValueToMinutes } from "../state/normalize-state";
import { ServiceDispatcher } from "../services/service-dispatcher";
import type {
  FanAdapter,
  FanCapabilities,
  FanMode,
  FanModelProfile,
  HassEntity,
  HassLike,
  NormalizedFanState,
  RelatedEntities,
  ServiceAvailability,
  TimerSpec,
} from "../types";

const entityParts = (entityId: string): [string, string] => {
  const [domain, objectId] = entityId.split(".");
  return [domain ?? "", objectId ?? ""];
};

const numericOptionValue = (value: unknown): number | undefined => {
  const text = typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
  const match = text.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*(?:°|degrees?)?$/i);
  return match ? Number(match[1]) : undefined;
};

const numericOptions = (options: unknown): number[] | undefined => {
  if (!Array.isArray(options)) {
    return undefined;
  }

  const angles = [
    ...new Set(options.map(numericOptionValue).filter((value): value is number => value !== undefined)),
  ].sort((left, right) => left - right);
  return angles.length > 0 ? angles : undefined;
};

const numericAngleOptions = (entity: HassEntity | undefined): number[] | undefined =>
  numericOptions(entity?.attributes["options"]);

export class StandardFanAdapter implements FanAdapter {
  public readonly state: NormalizedFanState;
  public readonly profile: FanModelProfile;
  public readonly capabilities: FanCapabilities;

  protected readonly dispatcher: ServiceDispatcher;

  constructor(
    protected readonly hass: HassLike,
    protected readonly entityId: string,
    protected readonly services: ServiceAvailability,
    protected readonly related: RelatedEntities = {},
  ) {
    const actionableRelated = this.actionableRelatedEntities();
    const timerSpec = this.readTimerSpec(this.related.timer);
    this.state = normalizeFanState(entityId, this.entityWithRelatedAttributes(this.related, timerSpec));
    this.profile = getModelProfile(this.state.model);
    const detectedCapabilities = detectCapabilities(hass.states[entityId], services, actionableRelated);
    this.capabilities = {
      ...detectedCapabilities,
      horizontalAngles:
        this.readAngleOptions(actionableRelated.horizontalAngle) ??
        (detectedCapabilities.horizontalAngles.length > 0
          ? detectedCapabilities.horizontalAngles
          : (this.readNumberSteps(this.readTimerSpec(actionableRelated.horizontalAngle)) ?? [])),
      verticalAngles:
        this.readAngleOptions(actionableRelated.verticalAngle) ??
        (detectedCapabilities.verticalAngles.length > 0
          ? detectedCapabilities.verticalAngles
          : (this.readNumberSteps(this.readTimerSpec(actionableRelated.verticalAngle)) ?? [])),
      timerSteps: this.readNumberSteps(actionableRelated.timer ? timerSpec : undefined),
      timerSpec: actionableRelated.timer ? timerSpec : undefined,
    };
    this.dispatcher = new ServiceDispatcher(hass, entityId, services);
  }

  private actionableRelatedEntities(): RelatedEntities {
    const actionable = { ...this.related };

    for (const key of Object.keys(actionable) as Array<keyof RelatedEntities>) {
      const entityId = actionable[key];
      const state = entityId ? this.hass.states[entityId] : undefined;
      if (
        !state ||
        state.state === "unknown" ||
        state.state === "unavailable" ||
        ((key === "horizontalAngle" || key === "verticalAngle") &&
          this.isSelectEntity(entityId) &&
          numericAngleOptions(state) === undefined)
      ) {
        delete actionable[key];
      }
    }

    return actionable;
  }

  private isSelectEntity(entityId: string | undefined): boolean {
    return entityId !== undefined && entityParts(entityId)[0] === "select";
  }

  private readAngleOptions(entityId: string | undefined): number[] | undefined {
    return numericAngleOptions(entityId ? this.hass.states[entityId] : undefined);
  }

  private readTimerSpec(entityId: string | undefined): TimerSpec | undefined {
    const timerEntity = entityId ? this.hass.states[entityId] : undefined;
    const minimum = Number(timerEntity?.attributes["min"]);
    const maximum = Number(timerEntity?.attributes["max"]);
    const step = Number(timerEntity?.attributes["step"]);
    if (
      !Number.isFinite(minimum) ||
      !Number.isFinite(maximum) ||
      !Number.isFinite(step) ||
      step <= 0 ||
      maximum < minimum ||
      (maximum - minimum) / step > 100
    ) {
      return undefined;
    }

    const unit = parseTimerUnit(timerEntity?.attributes["unit_of_measurement"]);
    return { unit, min: minimum, max: maximum, step };
  }

  private readNumberSteps(spec: TimerSpec | undefined): number[] | undefined {
    if (!spec) {
      return undefined;
    }

    return Array.from(
      { length: Math.floor((spec.max - spec.min) / spec.step) + 1 },
      (_, index) => Math.round(timerValueToMinutes(spec.min + index * spec.step, spec.unit) * 100) / 100,
    );
  }

  private entityWithRelatedAttributes(
    related: RelatedEntities,
    timerSpec: TimerSpec | undefined,
  ): HassEntity | undefined {
    const entity = this.hass.states[this.entityId];
    if (!entity) {
      return undefined;
    }

    const attributes = { ...entity.attributes };
    const relatedValues: Array<[keyof RelatedEntities, string]> = [
      ["horizontalAngle", "horizontal_swing_angle"],
      ["sleepMode", "sleep_mode"],
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
          attributes[attributeKey] = this.readRelatedLedState(relatedEntityId, relatedState);
          delete attributes["led_brightness"];
          continue;
        }

        const value = Number(relatedState.state);
        attributes[attributeKey] =
          relatedKey === "timer" && Number.isFinite(value) && timerSpec
            ? timerValueToMinutes(value, timerSpec.unit)
            : relatedState.state;
      } else if (relatedState) {
        delete attributes[attributeKey];
        if (relatedKey === "led") {
          delete attributes["led_brightness"];
        }
      } else if (attributes[attributeKey] !== undefined && attributes[attributeKey] !== null) {
        continue;
      }
    }

    return { ...entity, attributes };
  }

  private readRelatedLedState(entityId: string, entity: HassEntity): string | boolean {
    const [domain] = entityParts(entityId);
    const current = numericOptionValue(entity.state);

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
    if (percentage <= 0) {
      await this.dispatcher.standard("turn_off");
      return;
    }

    // A stopped fan needs turn_on to carry the speed; set_percentage alone is
    // not guaranteed to start it.
    if (!this.state.isOn) {
      await this.dispatcher.standard("turn_on", { percentage });
      return;
    }

    await this.dispatcher.standard("set_percentage", { percentage });
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
    if (await this.setRelatedBoolean(this.related.sleepMode, enabled)) {
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
    if (!(await this.setRelatedValue(this.related.favoriteLevel, level))) {
      throw new Error("This fan does not expose a favorite level entity.");
    }
  }

  public async setHorizontalSwing(enabled: boolean): Promise<void> {
    await this.dispatcher.standard("oscillate", { oscillating: enabled });
  }

  public async setHorizontalAngle(angle: number): Promise<void> {
    await this.startSwing("horizontal");

    if (await this.setRelatedAngle(this.related.horizontalAngle, angle)) {
      return;
    }

    await this.callCustom("fan_set_oscillation_angle", { angle });
  }

  public async setVerticalSwing(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.related.verticalSwing, enabled)) {
      return;
    }

    await this.callCustom(enabled ? "fan_set_vertical_oscillation_on" : "fan_set_vertical_oscillation_off");
  }

  public async setVerticalAngle(angle: number): Promise<void> {
    await this.startSwing("vertical");

    if (await this.setRelatedAngle(this.related.verticalAngle, angle)) {
      return;
    }

    await this.callCustom("fan_set_vertical_oscillation_angle", {
      vertical_angle: angle,
    });
  }

  public async nudge(direction: "left" | "right" | "up" | "down"): Promise<void> {
    // Aiming the head only holds while the fan is not sweeping.
    await this.stopSwing();
    await this.callCustom("fan_turn", { direction });
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
    const timerSpec = this.readTimerSpec(this.related.timer);
    if (await this.setRelatedValue(this.related.timer, minutesToTimerValue(minutes, timerSpec?.unit ?? "min"))) {
      return;
    }

    await this.callCustom("fan_set_delay_off", { delay_off_countdown: minutes });
  }

  public async setChildLock(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.related.childLock, enabled)) {
      return;
    }

    await this.callCustom(enabled ? "fan_set_child_lock_on" : "fan_set_child_lock_off");
  }

  public async setLed(enabled: boolean): Promise<void> {
    if (await this.setRelatedLedBrightness(this.related.led, enabled)) {
      return;
    }

    if (await this.setRelatedBoolean(this.related.led, enabled)) {
      return;
    }

    await this.callCustom("fan_set_led_brightness", { brightness: enabled ? 0 : 2 });
  }

  public async setBuzzer(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.related.buzzer, enabled)) {
      return;
    }

    await this.callCustom(enabled ? "fan_set_buzzer_on" : "fan_set_buzzer_off");
  }

  public async setIonizer(enabled: boolean): Promise<void> {
    if (await this.setRelatedBoolean(this.related.ionizer, enabled)) {
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

    const options = state.attributes["options"];
    if (!Array.isArray(options)) {
      return false;
    }

    const option = options.find((candidate) => numericOptionValue(candidate) === angle);
    if (option === undefined) {
      return false;
    }

    await this.hass.callService("select", "select_option", {
      entity_id: entityId,
      option: typeof option === "string" || typeof option === "number" ? String(option) : option,
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
      const options = this.hass.states[entityId]?.attributes["options"];
      const availableOptions = Array.isArray(options) ? options.map(String) : [];
      const enabledOptions = ["on", "true", "enable", "sleep", "bright", "active", "oscillate", "swing"];
      const disabledOptions = ["off", "false", "disable", "normal", "none", "dim", "fixed", "static"];
      const option = enabled
        ? (availableOptions.find((candidate) =>
            enabledOptions.some((token) => candidate.toLowerCase().includes(token)),
          ) ?? "on")
        : (availableOptions.find((candidate) =>
            disabledOptions.some((token) => candidate.toLowerCase().includes(token)),
          ) ?? "off");
      if (availableOptions.length === 0) {
        throw new Error(`Related select ${entityId} has no valid options.`);
      }
      if (!availableOptions.includes(option)) {
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
      const options = state.attributes["options"];
      const availableOptions = Array.isArray(options) ? options.map(String) : [];
      const numericTarget = enabled ? 0 : 2;
      const option =
        availableOptions.find((candidate) => numericOptionValue(candidate) === numericTarget) ??
        availableOptions.find((candidate) =>
          (enabled
            ? ["on", "true", "enable", "bright", "active"]
            : ["off", "false", "disable", "dim", "inactive"]
          ).some((token) => candidate.toLowerCase().includes(token)),
        );
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
