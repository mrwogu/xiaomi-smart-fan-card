import { StandardFanAdapter } from "./standard-fan";
import { resolveMiotFanProperties, withMiotInfo } from "../state/miot-properties";
import type { MiotFanProperties, MiotFanProperty } from "../state/miot-properties";
import type { HassLike, RelatedEntities, ServiceAvailability } from "../types";

export class XiaomiMiotFanAdapter extends StandardFanAdapter {
  private readonly properties: MiotFanProperties;
  private readonly standardHorizontalSwing: boolean;

  constructor(hass: HassLike, entityId: string, services: ServiceAvailability, related: RelatedEntities = {}) {
    super(
      hass,
      entityId,
      services,
      related,
      withMiotInfo(hass.states[entityId], related.miotInfo ? hass.states[related.miotInfo] : undefined),
    );
    this.standardHorizontalSwing = this.capabilities.horizontalSwing;
    this.properties =
      this.state.available && services.loaded && services.names.has("xiaomi_miot.set_property")
        ? resolveMiotFanProperties(this.fanEntity)
        : {};
    for (const property of Object.keys(this.properties) as MiotFanProperty[]) {
      this.capabilities[property] = true;
      if (!this.actionableRelated[property] && this.state[property] === undefined) {
        // An unavailable related entity must not erase a working property fallback.
        const value = this.fanEntity?.attributes[this.properties[property]!];
        if (property === "horizontalSwing" || property === "verticalSwing") {
          if (typeof value === "boolean") this.state[property] = value;
        } else if (typeof value === "number") {
          this.state[property] = value;
        }
      }
    }
  }

  public override async setHorizontalSwing(enabled: boolean): Promise<void> {
    if (this.standardHorizontalSwing) {
      await super.setHorizontalSwing(enabled);
      return;
    }

    await this.setProperty("horizontalSwing", enabled);
  }

  public override async setVerticalSwing(enabled: boolean): Promise<void> {
    if (this.actionableRelated.verticalSwing) {
      await super.setVerticalSwing(enabled);
      return;
    }

    await this.setProperty("verticalSwing", enabled);
  }

  public override async setHorizontalAngle(angle: number): Promise<void> {
    if (this.actionableRelated.horizontalAngle) {
      await super.setHorizontalAngle(angle);
      return;
    }

    await this.setAngle("horizontal", angle);
  }

  public override async setVerticalAngle(angle: number): Promise<void> {
    if (this.actionableRelated.verticalAngle) {
      await super.setVerticalAngle(angle);
      return;
    }

    await this.setAngle("vertical", angle);
  }

  private propertyField(property: MiotFanProperty): string {
    const field = this.properties[property];
    if (field === undefined) {
      throw new Error(`This fan does not expose a writable Xiaomi Miot ${property} property.`);
    }
    return field;
  }

  private async setAngle(axis: "horizontal" | "vertical", angle: number): Promise<void> {
    const property = axis === "horizontal" ? "horizontalAngle" : "verticalAngle";
    this.propertyField(property);
    const angles = axis === "horizontal" ? this.profile.horizontalAngles : this.profile.verticalAngles;
    if (!angles.includes(angle)) {
      throw new Error(`Unsupported Xiaomi Miot ${axis} angle.`);
    }

    await this.startSwing(axis);
    await this.setProperty(property, angle);
  }

  private async setProperty(property: MiotFanProperty, value: boolean | number): Promise<void> {
    const field = this.propertyField(property);
    if (!(await this.dispatcher.custom("xiaomi_miot", "set_property", { field, value }))) {
      throw new Error("xiaomi_miot.set_property is unavailable.");
    }
  }
}
