import { StandardFanAdapter } from "./standard-fan";
import type { FanMode, HassLike, RelatedEntities, ServiceAvailability } from "../types";

export class XiaomiMiioFanAdapter extends StandardFanAdapter {
  constructor(
    hass: HassLike,
    entityId: string,
    services: ServiceAvailability,
    related: RelatedEntities = {},
    private readonly nativeXiaomiHome = false,
  ) {
    super(hass, entityId, services, related);
  }

  public override async setMode(mode: FanMode): Promise<void> {
    const hasNaturalPreset = this.state.availableModes.some((preset) => /natur(?:al|e)/i.test(preset));
    if (
      !hasNaturalPreset &&
      !this.nativeXiaomiHome &&
      this.profile.known &&
      this.profile.isXiaomi &&
      this.dispatcher.canCallCustom("xiaomi_miio_fan", "fan_set_natural_mode_on") &&
      this.dispatcher.canCallCustom("xiaomi_miio_fan", "fan_set_natural_mode_off")
    ) {
      await this.callCustom(mode === "natural" ? "fan_set_natural_mode_on" : "fan_set_natural_mode_off");
      return;
    }

    const level = this.state.level || 1;
    const prefix = mode === "natural" ? "Natural" : "Level";
    const requested = `${prefix} ${level}`;
    const requestedLower = requested.toLowerCase();
    const available =
      this.state.availableModes.find((candidate) => candidate.toLowerCase() === requestedLower) ??
      this.state.availableModes.find((candidate) => {
        const normalized = candidate.toLowerCase();
        return mode === "natural"
          ? normalized.includes("natural") || normalized.includes("nature")
          : normalized.includes("normal") || normalized.includes("straight") || normalized.includes("manual");
      });

    const fallback = this.nativeXiaomiHome ? (mode === "natural" ? "Nature" : "Normal") : requested;
    const firstAvailable = this.state.availableModes.find((candidate) => candidate.toLowerCase() !== "off");
    await this.setPresetMode(available ?? firstAvailable ?? fallback);
  }

  public override async setSleepMode(enabled: boolean): Promise<void> {
    if (
      !enabled &&
      !this.related.sleepMode &&
      this.state.availableModes.every((preset) => preset.toLowerCase() === "sleep") &&
      !this.nativeXiaomiHome &&
      this.profile.known &&
      this.profile.isXiaomi &&
      this.dispatcher.canCallCustom("xiaomi_miio_fan", "fan_set_natural_mode_off")
    ) {
      await this.callCustom("fan_set_natural_mode_off");
      return;
    }
    await super.setSleepMode(enabled);
  }
}
