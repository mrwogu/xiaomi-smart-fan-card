import { StandardFanAdapter } from "./standard-fan";
import { XiaomiMiioFanAdapter } from "./xiaomi-miio-fan";
import { XiaomiMiotFanAdapter } from "./xiaomi-miot-fan";
import type { FanAdapter, FanCardConfig, HassLike, RelatedEntities, ServiceAvailability } from "../types";

export const createFanAdapter = (
  hass: HassLike,
  entityId: string,
  services: ServiceAvailability,
  integration: FanCardConfig["integration"] = "auto",
  related: RelatedEntities = {},
): FanAdapter => {
  const useXiaomiAdapter = integration === "xiaomi_miio" || integration === "xiaomi_miio_fan";
  const scopedServices: ServiceAvailability =
    integration === "xiaomi_miio_fan" || (integration === "auto" && useXiaomiAdapter)
      ? services
      : {
          loaded: services.loaded,
          names: new Set([...services.names].filter((name) => !name.startsWith("xiaomi_miio_fan."))),
        };

  if (integration === "xiaomi_miot") {
    return new XiaomiMiotFanAdapter(hass, entityId, scopedServices, related);
  }

  return useXiaomiAdapter
    ? new XiaomiMiioFanAdapter(hass, entityId, scopedServices, related, integration === "xiaomi_miio")
    : new StandardFanAdapter(hass, entityId, scopedServices, related);
};
