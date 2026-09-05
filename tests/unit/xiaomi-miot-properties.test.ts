import { describe, expect, it, vi } from "vitest";
import { createFanAdapter } from "../../src/adapters";
import { loadServiceAvailability, ServiceDispatcher } from "../../src/services/service-dispatcher";
import { resolveRelatedEntities } from "../../src/state/related-entities";
import type { FanCardConfig, HassLike } from "../../src/types";
import { xiaomiMiotP76InfoHass } from "../fixtures/xiaomi-miot-p76";

const createAdapter = async (
  hass = xiaomiMiotP76InfoHass(),
  integration: FanCardConfig["integration"] = "xiaomi_miot",
) => {
  const services = await loadServiceAvailability(hass);
  const related = await resolveRelatedEntities(hass, "fan.xiaomi_p76");
  const callService = vi.fn();
  hass.callService = callService;
  const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, integration, related);
  return { adapter, callService, hass, services, related };
};

describe("Xiaomi Miot P76 property controls", () => {
  it("reads swing and angle properties from the same-device Info entity", async () => {
    const { adapter } = await createAdapter();

    expect(adapter.state.model).toBe("xiaomi.fan.p76");
    expect(adapter.state.horizontalSwing).toBe(true);
    expect(adapter.state.verticalSwing).toBe(true);
    expect(adapter.state.horizontalAngle).toBe(30);
    expect(adapter.state.verticalAngle).toBe(30);
    expect(adapter.state.available).toBe(true);
    expect(adapter.capabilities.verticalSwing).toBe(true);
    expect(adapter.capabilities.horizontalAngle).toBe(true);
    expect(adapter.capabilities.verticalAngle).toBe(true);
    expect(adapter.capabilities.horizontalAngles).toEqual([30, 60, 90, 120]);
    expect(adapter.capabilities.verticalAngles).toEqual([30, 60, 90, 100]);
    expect(adapter.capabilities.directionNudge).toBe(false);
  });

  it("writes the exact exposed field names through Xiaomi Miot", async () => {
    const { adapter, callService } = await createAdapter();

    await adapter.setVerticalSwing(false);
    await adapter.setHorizontalAngle(90);
    await adapter.setVerticalAngle(60);

    expect(callService.mock.calls).toEqual([
      ["xiaomi_miot", "set_property", { entity_id: "fan.xiaomi_p76", field: "fan.vertical_swing", value: false }],
      [
        "xiaomi_miot",
        "set_property",
        { entity_id: "fan.xiaomi_p76", field: "horizontal_swing_included_angle-2-7", value: 90 },
      ],
      [
        "xiaomi_miot",
        "set_property",
        { entity_id: "fan.xiaomi_p76", field: "vertical_swing_included_angle-2-9", value: 60 },
      ],
    ]);
  });

  it("enables vertical swing before setting its angle", async () => {
    const hass = xiaomiMiotP76InfoHass();
    hass.states["button.xiaomi_p76_info"]!.attributes["fan.vertical_swing"] = false;
    const { adapter, callService } = await createAdapter(hass);

    await adapter.setVerticalAngle(100);

    expect(callService.mock.calls).toEqual([
      ["xiaomi_miot", "set_property", { entity_id: "fan.xiaomi_p76", field: "fan.vertical_swing", value: true }],
      [
        "xiaomi_miot",
        "set_property",
        { entity_id: "fan.xiaomi_p76", field: "vertical_swing_included_angle-2-9", value: 100 },
      ],
    ]);
  });

  it("keeps property controls hidden without the registered property service", async () => {
    const hass = xiaomiMiotP76InfoHass();
    const { related } = await createAdapter(hass);
    const adapter = createFanAdapter(
      hass,
      "fan.xiaomi_p76",
      { loaded: true, names: new Set(["fan.oscillate"]) },
      "xiaomi_miot",
      related,
    );

    expect(adapter.capabilities.verticalSwing).toBe(false);
    expect(adapter.capabilities.horizontalAngle).toBe(false);
    expect(adapter.capabilities.verticalAngle).toBe(false);
    await expect(adapter.setVerticalSwing(true)).rejects.toThrow("writable Xiaomi Miot");
    await expect(adapter.setHorizontalAngle(90)).rejects.toThrow("writable Xiaomi Miot");
    await expect(adapter.setVerticalAngle(60)).rejects.toThrow("writable Xiaomi Miot");
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("does not use an Info entity from another device", async () => {
    const hass = xiaomiMiotP76InfoHass();
    const callWS = hass.callWS!;
    hass.callWS = async <T>(message: Record<string, unknown>) => {
      if (message.type === "config/entity_registry/list") {
        return [
          { entity_id: "fan.xiaomi_p76", device_id: "device-miot-p76", platform: "xiaomi_miot" },
          { entity_id: "button.xiaomi_p76_info", device_id: "other-device", platform: "xiaomi_miot" },
        ] as T;
      }
      return callWS<T>(message);
    };
    const { adapter } = await createAdapter(hass);

    expect(adapter.capabilities.verticalSwing).toBe(false);
    expect(adapter.capabilities.horizontalAngle).toBe(false);
    expect(adapter.capabilities.verticalAngle).toBe(false);
  });

  it("does not invent properties from the model alone", async () => {
    const hass: HassLike = xiaomiMiotP76InfoHass();
    hass.states["button.xiaomi_p76_info"]!.attributes = {
      "button.info": "Xiaomi Fan",
      model: "xiaomi.fan.p76",
      miot_type: "urn:miot-spec-v2:device:fan:0000A005:xiaomi-p76:1:0000D062",
    };
    const { adapter } = await createAdapter(hass);

    expect(adapter.capabilities.verticalSwing).toBe(false);
    expect(adapter.capabilities.horizontalAngle).toBe(false);
    expect(adapter.capabilities.verticalAngle).toBe(false);
  });

  it.each(["auto", "standard", "xiaomi_miio", "xiaomi_miio_fan"] as const)(
    "does not opt %s into Xiaomi Miot property services",
    async (integration) => {
      const { adapter } = await createAdapter(xiaomiMiotP76InfoHass(), integration);
      expect(adapter.capabilities.verticalSwing).toBe(false);
      expect(adapter.capabilities.horizontalAngle).toBe(false);
      expect(adapter.capabilities.verticalAngle).toBe(false);
    },
  );

  it("accepts fully qualified angle properties on the primary fan without Info discovery", async () => {
    const hass = xiaomiMiotP76InfoHass();
    hass.states["fan.xiaomi_p76"]!.attributes = {
      model: "xiaomi.fan.p76",
      supported_features: 1,
      "fan.horizontal_swing": true,
      "fan.vertical_swing": true,
      "fan.horizontal_swing_included_angle": 30,
      "fan.vertical_swing_included_angle": 60,
    };
    const { services, callService } = await createAdapter(hass);
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miot");

    expect(adapter.state.horizontalAngle).toBe(30);
    expect(adapter.state.verticalAngle).toBe(60);
    await adapter.setHorizontalSwing(false);
    await adapter.setHorizontalAngle(120);
    await adapter.setVerticalAngle(90);

    expect(callService.mock.calls).toEqual([
      ["xiaomi_miot", "set_property", { entity_id: "fan.xiaomi_p76", field: "fan.horizontal_swing", value: false }],
      [
        "xiaomi_miot",
        "set_property",
        { entity_id: "fan.xiaomi_p76", field: "fan.horizontal_swing_included_angle", value: 120 },
      ],
      [
        "xiaomi_miot",
        "set_property",
        { entity_id: "fan.xiaomi_p76", field: "fan.vertical_swing_included_angle", value: 90 },
      ],
    ]);
  });

  it("preserves standard fan oscillation when enabling a horizontal angle", async () => {
    const hass = xiaomiMiotP76InfoHass();
    hass.states["fan.xiaomi_p76"]!.attributes["oscillating"] = false;
    const { adapter, callService } = await createAdapter(hass);

    await adapter.setHorizontalAngle(90);

    expect(callService.mock.calls).toEqual([
      ["fan", "oscillate", { entity_id: "fan.xiaomi_p76", oscillating: true }],
      [
        "xiaomi_miot",
        "set_property",
        { entity_id: "fan.xiaomi_p76", field: "horizontal_swing_included_angle-2-7", value: 90 },
      ],
    ]);
  });

  it("prefers actionable related entities and their angle options over raw properties", async () => {
    const { hass, services, related, callService } = await createAdapter();
    hass.states["select.p76_horizontal_angle"] = { state: "45°", attributes: { options: ["15°", "45°"] } };
    hass.states["select.p76_vertical_angle"] = { state: "75°", attributes: { options: ["45°", "75°"] } };
    hass.states["switch.p76_vertical_swing"] = { state: "off", attributes: {} };
    const adapter = createFanAdapter(hass, "fan.xiaomi_p76", services, "xiaomi_miot", {
      ...related,
      horizontalAngle: "select.p76_horizontal_angle",
      verticalAngle: "select.p76_vertical_angle",
      verticalSwing: "switch.p76_vertical_swing",
    });

    expect(adapter.state.horizontalAngle).toBe(45);
    expect(adapter.state.verticalAngle).toBe(75);
    expect(adapter.state.verticalSwing).toBe(false);
    expect(adapter.capabilities.horizontalAngles).toEqual([15, 45]);
    expect(adapter.capabilities.verticalAngles).toEqual([45, 75]);
    await adapter.setHorizontalAngle(15);
    await adapter.setVerticalAngle(45);

    expect(callService.mock.calls).toEqual([
      ["select", "select_option", { entity_id: "select.p76_horizontal_angle", option: "15°" }],
      ["switch", "turn_on", { entity_id: "switch.p76_vertical_swing" }],
      ["select", "select_option", { entity_id: "select.p76_vertical_angle", option: "45°" }],
    ]);
  });

  it.each([
    ["horizontal", false, 120, 90],
    ["vertical", true, 100, 60],
  ] as const)(
    "uses live Info values when %s related controls are unavailable",
    async (axis, swing, currentAngle, targetAngle) => {
      const hass = xiaomiMiotP76InfoHass();
      const info = hass.states["button.xiaomi_p76_info"]!;
      const angleField =
        axis === "horizontal" ? "horizontal_swing_included_angle-2-7" : "vertical_swing_included_angle-2-9";
      const swingField = axis === "horizontal" ? "fan.horizontal_swing" : "fan.vertical_swing";
      const angleCapability = axis === "horizontal" ? "horizontalAngle" : "verticalAngle";
      const anglesCapability = axis === "horizontal" ? "horizontalAngles" : "verticalAngles";
      const swingCapability = axis === "horizontal" ? "horizontalSwing" : "verticalSwing";
      const angleState = axis === "horizontal" ? "select.p76_horizontal_angle" : "select.p76_vertical_angle";
      const swingState = axis === "horizontal" ? "switch.p76_horizontal_swing" : "switch.p76_vertical_swing";

      info.attributes[swingField] = swing;
      info.attributes[angleField] = currentAngle;
      if (axis === "horizontal") {
        hass.states["fan.xiaomi_p76"]!.attributes["supported_features"] = 1;
        delete hass.states["fan.xiaomi_p76"]!.attributes["oscillating"];
      }

      const { services, related, callService } = await createAdapter(hass);
      hass.states[angleState] = {
        state: "unavailable",
        attributes: { options: ["30", "60", "90", "100", "120"] },
      };
      hass.states[swingState] = { state: "unavailable", attributes: {} };
      const adapter = createFanAdapter(
        hass,
        "fan.xiaomi_p76",
        services,
        "xiaomi_miot",
        axis === "horizontal"
          ? { ...related, horizontalAngle: angleState, horizontalSwing: swingState }
          : { ...related, verticalAngle: angleState, verticalSwing: swingState },
      );

      expect(adapter.state[axis === "horizontal" ? "horizontalAngle" : "verticalAngle"]).toBe(currentAngle);
      expect(adapter.state[axis === "horizontal" ? "horizontalSwing" : "verticalSwing"]).toBe(swing);
      expect(adapter.capabilities[angleCapability]).toBe(true);
      expect(adapter.capabilities[swingCapability]).toBe(true);
      expect(adapter.capabilities[anglesCapability]).toEqual(
        axis === "horizontal" ? [30, 60, 90, 120] : [30, 60, 90, 100],
      );

      if (axis === "horizontal") {
        await adapter.setHorizontalAngle(targetAngle);
      } else {
        await adapter.setVerticalAngle(targetAngle);
      }

      expect(callService.mock.calls).toEqual(
        swing
          ? [["xiaomi_miot", "set_property", { entity_id: "fan.xiaomi_p76", field: angleField, value: targetAngle }]]
          : [
              ["xiaomi_miot", "set_property", { entity_id: "fan.xiaomi_p76", field: swingField, value: true }],
              ["xiaomi_miot", "set_property", { entity_id: "fan.xiaomi_p76", field: angleField, value: targetAngle }],
            ],
      );
    },
  );

  it("rejects unsupported angles before starting either swing axis", async () => {
    const hass = xiaomiMiotP76InfoHass();
    hass.states["fan.xiaomi_p76"]!.attributes["oscillating"] = false;
    hass.states["button.xiaomi_p76_info"]!.attributes["fan.vertical_swing"] = false;
    const { adapter, callService } = await createAdapter(hass);

    await expect(adapter.setHorizontalAngle(140)).rejects.toThrow("Unsupported Xiaomi Miot horizontal angle");
    await expect(adapter.setVerticalAngle(45)).rejects.toThrow("Unsupported Xiaomi Miot vertical angle");
    await expect(adapter.setVerticalAngle(Number.NaN)).rejects.toThrow("Unsupported Xiaomi Miot vertical angle");
    expect(callService).not.toHaveBeenCalled();
  });

  it.each(["unavailable", "unknown"])("does not enable property writes for an %s primary fan", async (state) => {
    const hass = xiaomiMiotP76InfoHass();
    hass.states["fan.xiaomi_p76"]!.state = state;
    const { adapter, callService } = await createAdapter(hass);

    expect(adapter.capabilities.verticalAngle).toBe(false);
    await expect(adapter.setVerticalAngle(60)).rejects.toThrow("writable Xiaomi Miot");
    expect(callService).not.toHaveBeenCalled();
  });

  it("does not call property services until service discovery succeeds", async () => {
    const { hass, related, callService } = await createAdapter();
    const adapter = createFanAdapter(
      hass,
      "fan.xiaomi_p76",
      { loaded: false, names: new Set(["xiaomi_miot.set_property"]) },
      "xiaomi_miot",
      related,
    );

    expect(adapter.capabilities.verticalAngle).toBe(false);
    await expect(adapter.setVerticalAngle(60)).rejects.toThrow("writable Xiaomi Miot");
    expect(callService).not.toHaveBeenCalled();
  });

  it("propagates service failures without calling another integration", async () => {
    const { adapter, callService } = await createAdapter();
    callService.mockRejectedValue(new Error("Write failed"));

    await expect(adapter.setVerticalSwing(false)).rejects.toThrow("Write failed");
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService.mock.calls[0]?.[0]).toBe("xiaomi_miot");
  });

  it("reports a property service rejected by the dispatcher without falling back", async () => {
    const { adapter, callService } = await createAdapter();
    const dispatch = vi.spyOn(ServiceDispatcher.prototype, "custom").mockResolvedValue(false);
    try {
      await expect(adapter.setVerticalSwing(false)).rejects.toThrow("xiaomi_miot.set_property is unavailable");
      expect(callService).not.toHaveBeenCalled();
    } finally {
      dispatch.mockRestore();
    }
  });
});
