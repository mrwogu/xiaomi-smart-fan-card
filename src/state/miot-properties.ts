import { getModelProfile } from "./model-profiles";
import type { HassEntity } from "../types";

export const MIOT_FAN_PROPERTY_ATTRIBUTES = {
  horizontalSwing: ["fan.horizontal_swing"],
  horizontalAngle: ["fan.horizontal_swing_included_angle", "horizontal_swing_included_angle-2-7"],
  verticalSwing: ["fan.vertical_swing"],
  verticalAngle: ["fan.vertical_swing_included_angle", "vertical_swing_included_angle-2-9"],
} as const;

export type MiotFanProperty = keyof typeof MIOT_FAN_PROPERTY_ATTRIBUTES;
export type MiotFanProperties = Partial<Record<MiotFanProperty, string>>;

const entityModel = (entity: HassEntity): unknown =>
  entity.attributes["model"] ?? entity.attributes["model_name"] ?? entity.attributes["miot_model"];

export const withMiotInfo = (entity: HassEntity | undefined, info: HassEntity | undefined): HassEntity | undefined => {
  if (
    !entity ||
    !info ||
    info.state === "unavailable" ||
    info.attributes["available"] === false ||
    typeof info.attributes["button.info"] !== "string"
  ) {
    return entity;
  }

  const primaryModel = entityModel(entity);
  const infoModel = entityModel(info);
  if (primaryModel !== undefined && primaryModel !== infoModel) {
    return entity;
  }

  const attributes = { ...entity.attributes };
  if (primaryModel === undefined && typeof infoModel === "string") {
    attributes["model"] = infoModel;
  }

  // Info carries device diagnostics too; only copy the fan fields we use.
  for (const keys of Object.values(MIOT_FAN_PROPERTY_ATTRIBUTES)) {
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(attributes, key) && info.attributes[key] !== undefined) {
        attributes[key] = info.attributes[key];
      }
    }
  }

  return { ...entity, attributes };
};

export const resolveMiotFanProperties = (entity: HassEntity | undefined): MiotFanProperties => {
  if (!entity) {
    return {};
  }

  const model = entityModel(entity);
  const profile = getModelProfile(typeof model === "string" ? model : undefined);
  // P76's spec confirms these properties are writable; other models need their own evidence.
  if (profile.model !== "xiaomi.fan.p76") {
    return {};
  }

  const properties: MiotFanProperties = {};
  for (const property of Object.keys(MIOT_FAN_PROPERTY_ATTRIBUTES) as MiotFanProperty[]) {
    const field = MIOT_FAN_PROPERTY_ATTRIBUTES[property].find((key) => {
      const value = entity.attributes[key];
      if (property === "horizontalSwing" || property === "verticalSwing") {
        return typeof value === "boolean";
      }

      const angles = property === "horizontalAngle" ? profile.horizontalAngles : profile.verticalAngles;
      return typeof value === "number" && angles.includes(value);
    });
    if (field !== undefined) {
      properties[property] = field;
    }
  }

  return properties;
};
