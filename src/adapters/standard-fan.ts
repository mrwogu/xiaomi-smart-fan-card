import { detectCapabilities } from "../state/capabilities";
import { getModelProfile } from "../state/model-profiles";
import { normalizeFanState } from "../state/normalize-state";
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
} from "../types";

const entityParts = (entityId: string): [string, string] => {
  const [domain, objectId] = entityId.split(".");
  return [domain ?? "", objectId ?? ""];
};

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
    this.state = normalizeFanState(entityId, this.entityWithRelatedAttributes());
    this.profile = getModelProfile(this.state.model);
    const detectedCapabilities = detectCapabilities(hass.states[entityId], services, related);
    this.capabilities = {
      ...detectedCapabilities,
      horizontalAngles:
        detectedCapabilities.horizontalAngles.length > 0
          ? detectedCapabilities.horizontalAngles
          : (this.readNumberSteps(this.related.horizontalAngle) ?? []),
      verticalAngles:
        detectedCapabilities.verticalAngles.length > 0
          ? detectedCapabilities.verticalAngles
          : (this.readNumberSteps(this.related.verticalAngle) ?? []),
      timerSteps: this.readNumberSteps(this.related.timer),
    };
    this.dispatcher = new ServiceDispatcher(hass, entityId, services);
  }

  private readNumberSteps(entityId: string | undefined): number[] | undefined {
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

    return Array.from(
      { length: Math.floor((maximum - minimum) / step) + 1 },
      (_, index) => Math.round((minimum + index * step) * 100) / 100,
    );
  }

  private entityWithRelatedAttributes(): HassEntity | undefined {
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
      if (attributes[attributeKey] !== undefined && attributes[attributeKey] !== null) {
        continue;
      }

      const relatedEntityId = this.related[relatedKey];
      const relatedState = relatedEntityId ? this.hass.states[relatedEntityId] : undefined;
      if (relatedState && relatedState.state !== "unknown" && relatedState.state !== "unavailable") {
        attributes[attributeKey] = relatedState.state;
      }
    }

    return { ...entity, attributes };
  }

  public async togglePower(): Promise<void> {
    await this.dispatcher.standard("toggle");
  }

  public async setPercentage(percentage: number): Promise<void> {
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
    if (await this.setRelatedValue(this.related.horizontalAngle, angle)) {
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
    if (await this.setRelatedValue(this.related.verticalAngle, angle)) {
      return;
    }

    await this.callCustom("fan_set_vertical_oscillation_angle", {
      vertical_angle: angle,
    });
  }

  public async nudge(direction: "left" | "right" | "up" | "down"): Promise<void> {
    await this.callCustom("fan_turn", { direction });
  }

  public async setDirection(direction: "forward" | "reverse"): Promise<void> {
    await this.dispatcher.standard("set_direction", { direction });
  }

  public async setTimer(minutes: number): Promise<void> {
    if (await this.setRelatedValue(this.related.timer, minutes)) {
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
    if (await this.setRelatedBoolean(this.related.led, enabled)) {
      return;
    }

    await this.callCustom("fan_set_led_brightness", { brightness: enabled ? 2 : 0 });
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

    const [domain] = entityParts(entityId);
    if (domain !== "number" && domain !== "input_number") {
      return false;
    }

    await this.hass.callService(domain, "set_value", { entity_id: entityId, value });
    return true;
  }

  protected async setRelatedBoolean(entityId: string | undefined, enabled: boolean): Promise<boolean> {
    if (!entityId) {
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
}
