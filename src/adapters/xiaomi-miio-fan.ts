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
}
