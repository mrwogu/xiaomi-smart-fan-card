import type { HassLike, ServiceAvailability, ServiceRegistryResponse } from "../types";

export const serviceName = (domain: string, service: string): string => `${domain}.${service}`;

export const readServiceAvailability = (response: ServiceRegistryResponse): ServiceAvailability => {
  const names = new Set<string>();

  for (const [domain, services] of Object.entries(response)) {
    for (const service of Object.keys(services)) {
      names.add(serviceName(domain, service));
    }
  }

  return { loaded: true, names };
};

export const loadServiceAvailability = async (hass: HassLike): Promise<ServiceAvailability> => {
  if (!hass.callWS) {
    return { loaded: false, names: new Set() };
  }

  try {
    const response = await hass.callWS<ServiceRegistryResponse>({ type: "get_services" });
    return readServiceAvailability(response);
  } catch {
    return { loaded: false, names: new Set() };
  }
};

export class ServiceDispatcher {
  constructor(
    private readonly hass: HassLike,
    private readonly entityId: string,
    private readonly availability: ServiceAvailability,
  ) {}

  public canCallCustom(domain: string, service: string): boolean {
    return !this.availability.loaded || this.availability.names.has(serviceName(domain, service));
  }

  public async standard(service: string, data: Record<string, unknown> = {}): Promise<void> {
    await this.hass.callService("fan", service, { entity_id: this.entityId, ...data });
  }

  public async custom(domain: string, service: string, data: Record<string, unknown> = {}): Promise<boolean> {
    if (!this.canCallCustom(domain, service)) {
      return false;
    }

    await this.hass.callService(domain, service, { entity_id: this.entityId, ...data });
    return true;
  }
}
