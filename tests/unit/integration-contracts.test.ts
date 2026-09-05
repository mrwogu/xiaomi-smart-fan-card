import { describe, expect, it, vi, type Mock } from "vitest";
import { createFanAdapter } from "../../src/adapters";
import { readServiceAvailability } from "../../src/services/service-dispatcher";
import { getModelProfile } from "../../src/state/model-profiles";
import { resolveRelatedEntities } from "../../src/state/related-entities";
import type { HassEntity, HassLike } from "../../src/types";
import {
  miotP18RelatedStates,
  miotP76CustomizedStates,
  miotP76DefaultStates,
  nativeMiioModels,
  standardFeatureContracts,
  standardPowerContracts,
  syssiContracts,
  syssiServices,
  upstreamVersions,
  type SyssiContract,
} from "../fixtures/integration-contracts";

const fanServices = {
  toggle: {},
  turn_on: {},
  turn_off: {},
  set_percentage: {},
  set_preset_mode: {},
  oscillate: {},
  set_direction: {},
};
const allServices = readServiceAvailability({
  fan: fanServices,
  xiaomi_miio_fan: syssiServices,
  xiaomi_miot: { set_property: {}, set_miot_property: {}, call_action: {} },
  light: { turn_on: {}, turn_off: {} },
  switch: { turn_on: {}, turn_off: {} },
  select: { select_option: {} },
  number: { set_value: {} },
  button: { press: {} },
});

const createHass = (states: Record<string, HassEntity>): HassLike & { callService: Mock<HassLike["callService"]> } => ({
  states: structuredClone(states),
  callService: vi.fn<HassLike["callService"]>(),
  callWS: async <T>() =>
    Object.keys(states).map((entity_id) => ({
      entity_id,
      device_id: "contract-device",
    })) as T,
});

const syssiFan = (contract: SyssiContract, model: string) =>
  createHass({
    "fan.contract": {
      state: "on",
      attributes: {
        ...contract.attributes,
        model,
        percentage: contract.percentageStep > 1 ? 66 : 50,
        percentage_step: contract.percentageStep,
        supported_features: contract.supportedFeatures,
        preset_modes: contract.presetModes,
        preset_mode: contract.presetModes.includes("Level 2")
          ? "Level 2"
          : contract.presetModes.includes("Manual")
            ? "Manual"
            : null,
        oscillating: true,
      },
    },
  });

describe("pinned upstream integration contracts", () => {
  it("records immutable source versions and covers every syssi dispatch model", () => {
    for (const source of [
      upstreamVersions.homeAssistant,
      upstreamVersions.xiaomiMiioFan,
      upstreamVersions.xiaomiMiot,
      upstreamVersions.pythonMiio,
    ]) {
      expect(source.commit).toMatch(/^[a-f0-9]{40}$/);
    }
    const models = syssiContracts.flatMap((contract) => contract.models);
    expect(models).toHaveLength(26);
    expect(new Set(models).size).toBe(26);
    expect(nativeMiioModels).toHaveLength(14);
    expect(Object.keys(syssiServices)).toHaveLength(16);
  });

  describe.each(syssiContracts.flatMap((contract) => contract.models.map((model) => ({ model, contract }))))(
    "xiaomi_miio_fan $model",
    ({ model, contract }) => {
      it("exposes only model-supported controls despite the global service registry", () => {
        const hass = syssiFan(contract, model);
        const adapter = createFanAdapter(hass, "fan.contract", allServices, "xiaomi_miio_fan");
        const hasValue = (...keys: string[]) =>
          keys.some((key) => contract.attributes[key] !== undefined && contract.attributes[key] !== null);

        expect(adapter.capabilities).toMatchObject({
          speed: true,
          presetMode: true,
          horizontalSwing: true,
          horizontalAngle: contract.horizontalAngles.length > 0,
          horizontalAngles: contract.horizontalAngles,
          verticalSwing: contract.verticalAngles.length > 0,
          verticalAngle: contract.verticalAngles.length > 0,
          verticalAngles: contract.verticalAngles,
          direction: (contract.supportedFeatures & 4) !== 0,
          directionNudge: contract.nudgeDirections.length > 0,
          nudgeDirections: contract.nudgeDirections,
          naturalMode: true,
          timer: true,
          childLock: hasValue("child_lock"),
          buzzer: hasValue("buzzer"),
          led: hasValue("led", "led_brightness"),
          ionizer: hasValue("anion"),
        });
        expect(getModelProfile(model).horizontalAngles).toEqual(contract.horizontalAngles);
        expect(getModelProfile(model).speedLevels).toBe(contract.percentageStep > 1 ? 3 : 4);
        expect(adapter.capabilities.percentageStep).toBe(contract.percentageStep);
      });

      it("keeps custom timer writes in minutes, independently of readback units", async () => {
        const hass = syssiFan(contract, model);
        const adapter = createFanAdapter(hass, "fan.contract", allServices, "xiaomi_miio_fan");
        if (contract.timerReadUnit !== "unverified") {
          expect(adapter.state.timerMinutes).toBe(120);
        }

        await adapter.setTimer(2);
        expect(hass.callService).toHaveBeenLastCalledWith("xiaomi_miio_fan", "fan_set_delay_off", {
          entity_id: "fan.contract",
          delay_off_countdown: 2,
        });
      });

      it("dispatches model-supported angle payloads and rejects unsupported nudge axes", async () => {
        const hass = syssiFan(contract, model);
        const adapter = createFanAdapter(hass, "fan.contract", allServices, "xiaomi_miio_fan");
        for (const angle of contract.horizontalAngles) {
          await adapter.setHorizontalAngle(angle);
          expect(hass.callService).toHaveBeenLastCalledWith("xiaomi_miio_fan", "fan_set_oscillation_angle", {
            entity_id: "fan.contract",
            angle,
          });
        }
        for (const vertical_angle of contract.verticalAngles) {
          await adapter.setVerticalAngle(vertical_angle);
          expect(hass.callService).toHaveBeenLastCalledWith("xiaomi_miio_fan", "fan_set_vertical_oscillation_angle", {
            entity_id: "fan.contract",
            vertical_angle,
          });
        }
        for (const direction of ["left", "right", "up", "down"] as const) {
          hass.callService.mockClear();
          if (contract.nudgeDirections.includes(direction)) {
            await adapter.nudge(direction);
            expect(hass.callService).toHaveBeenLastCalledWith("xiaomi_miio_fan", "fan_turn", {
              entity_id: "fan.contract",
              direction,
            });
          } else {
            await expect(adapter.nudge(direction)).rejects.toThrow();
            expect(hass.callService).not.toHaveBeenCalled();
          }
        }
      });

      it("uses natural-mode services when presets contain only speed levels or Sleep", async () => {
        const hass = syssiFan(contract, model);
        const adapter = createFanAdapter(hass, "fan.contract", allServices, "xiaomi_miio_fan");
        await adapter.setMode("natural");
        if (contract.presetModes.some((preset) => preset.includes("Natural"))) {
          const call = hass.callService.mock.lastCall;
          expect(call?.slice(0, 2)).toEqual(["fan", "set_preset_mode"]);
          expect(contract.presetModes).toContain(call?.[2]?.["preset_mode"]);
          expect(call?.[2]?.["preset_mode"]).toContain("Natural");
        } else {
          expect(hass.callService).toHaveBeenLastCalledWith("xiaomi_miio_fan", "fan_set_natural_mode_on", {
            entity_id: "fan.contract",
          });
        }
      });

      it("dispatches only the advertised device toggles using exact service payloads", async () => {
        const hass = syssiFan(contract, model);
        const adapter = createFanAdapter(hass, "fan.contract", allServices, "xiaomi_miio_fan");
        for (const enabled of [true, false]) {
          if (adapter.capabilities.childLock) {
            await adapter.setChildLock(enabled);
            expect(hass.callService).toHaveBeenLastCalledWith(
              "xiaomi_miio_fan",
              enabled ? "fan_set_child_lock_on" : "fan_set_child_lock_off",
              { entity_id: "fan.contract" },
            );
          }
          if (adapter.capabilities.buzzer) {
            await adapter.setBuzzer(enabled);
            expect(hass.callService).toHaveBeenLastCalledWith(
              "xiaomi_miio_fan",
              enabled ? "fan_set_buzzer_on" : "fan_set_buzzer_off",
              { entity_id: "fan.contract" },
            );
          }
          if (adapter.capabilities.ionizer) {
            await adapter.setIonizer(enabled);
            expect(hass.callService).toHaveBeenLastCalledWith(
              "xiaomi_miio_fan",
              enabled ? "fan_set_anion_on" : "fan_set_anion_off",
              { entity_id: "fan.contract" },
            );
          }
          if (adapter.capabilities.led) {
            await adapter.setLed(enabled);
            expect(hass.callService).toHaveBeenLastCalledWith("xiaomi_miio_fan", "fan_set_led_brightness", {
              entity_id: "fan.contract",
              brightness: enabled ? 0 : 2,
            });
          }
        }
      });
    },
  );

  it.each(["auto", "standard", "xiaomi_miio", "xiaomi_miot"] as const)(
    "%s never borrows syssi services from another integration",
    (integration) => {
      const hass = syssiFan(
        syssiContracts.find((contract) => contract.models.includes("xiaomi.fan.p76"))!,
        "xiaomi.fan.p76",
      );
      const adapter = createFanAdapter(hass, "fan.contract", allServices, integration);
      expect(adapter.capabilities).toMatchObject({
        horizontalAngle: false,
        verticalAngle: false,
        verticalSwing: false,
        directionNudge: false,
        timer: false,
        childLock: false,
        led: false,
        buzzer: false,
        ionizer: false,
      });
    },
  );

  it("does not expose vendor actions from null attributes on an unknown model", () => {
    const hass = createHass({
      "fan.contract": {
        state: "on",
        attributes: {
          model: "xiaomi.fan.unverified",
          supported_features: 48,
          angle: null,
          vertical_angle: null,
          child_lock: null,
          led_brightness: null,
          buzzer: null,
          anion: null,
          delay_off_countdown: null,
        },
      },
    });
    expect(createFanAdapter(hass, "fan.contract", allServices, "xiaomi_miio_fan").capabilities).toMatchObject({
      horizontalAngle: false,
      verticalAngle: false,
      verticalSwing: false,
      directionNudge: false,
      timer: false,
      childLock: false,
      led: false,
      buzzer: false,
      ionizer: false,
    });
  });

  it("requires both child-lock services for a toggle", () => {
    const hass = syssiFan(syssiContracts[0]!, "zhimi.fan.v2");
    const services = readServiceAvailability({ xiaomi_miio_fan: { fan_set_child_lock_on: {} } });
    expect(createFanAdapter(hass, "fan.contract", services, "xiaomi_miio_fan").capabilities.childLock).toBe(false);
  });

  it("exits the 2 Lite Sleep preset through the actual normal-mode service", async () => {
    const contract = syssiContracts.find((candidate) => candidate.models.includes("xiaomi.fan.2lite"))!;
    const hass = syssiFan(contract, "xiaomi.fan.2lite");
    const adapter = createFanAdapter(hass, "fan.contract", allServices, "xiaomi_miio_fan");
    await adapter.setSleepMode(true);
    await adapter.setSleepMode(false);
    expect(hass.callService.mock.calls).toEqual([
      ["fan", "set_preset_mode", { entity_id: "fan.contract", preset_mode: "Sleep" }],
      ["xiaomi_miio_fan", "fan_set_natural_mode_off", { entity_id: "fan.contract" }],
    ]);
  });
});

describe("Home Assistant standard fan feature contracts", () => {
  it.each(["on", "off"])("uses only SET_SPEED actions without power features while %s", async (state) => {
    const hass = createHass({
      "fan.contract": { state, attributes: { supported_features: 1, percentage_step: 1 } },
    });
    const adapter = createFanAdapter(hass, "fan.contract", allServices, "standard");
    await adapter.setPercentage(50);
    await adapter.setPercentage(0);
    expect(hass.callService.mock.calls).toEqual([
      ["fan", "set_percentage", { entity_id: "fan.contract", percentage: 50 }],
      ["fan", "set_percentage", { entity_id: "fan.contract", percentage: 0 }],
    ]);
  });

  it("rejects percentage actions when SET_SPEED is absent", async () => {
    const hass = createHass({
      "fan.contract": { state: "on", attributes: { supported_features: 48, percentage: 50 } },
    });
    const adapter = createFanAdapter(hass, "fan.contract", allServices, "standard");
    await expect(adapter.setPercentage(0)).rejects.toThrow("does not support percentage control");
    expect(hass.callService).not.toHaveBeenCalled();
  });

  for (const state of ["on", "off"] as const) {
    it.each(standardPowerContracts)(`honors $name while the fan is ${state}`, async (contract) => {
      const hass = createHass({
        "fan.contract": { state, attributes: { supported_features: contract.mask } },
      });
      const adapter = createFanAdapter(hass, "fan.contract", allServices, "standard");
      expect(adapter.capabilities.power).toBe(contract[state]);
      if (contract[state]) {
        await adapter.togglePower();
        expect(hass.callService).toHaveBeenCalledWith("fan", state === "on" ? "turn_off" : "turn_on", {
          entity_id: "fan.contract",
        });
      } else {
        await expect(adapter.togglePower()).rejects.toThrow("does not support changing power");
        expect(hass.callService).not.toHaveBeenCalled();
      }
    });
  }

  it.each(standardFeatureContracts)("honors $name even with stale optional attributes", ({ mask }) => {
    const hass = createHass({
      "fan.contract": {
        state: "on",
        attributes: {
          supported_features: mask,
          percentage: 50,
          percentage_step: 1,
          preset_modes: ["Normal", "Natural"],
          preset_mode: "Normal",
          oscillating: true,
          direction: "forward",
        },
      },
    });
    expect(createFanAdapter(hass, "fan.contract", allServices, "standard").capabilities).toMatchObject({
      power: (mask & 16) !== 0,
      speed: (mask & 1) !== 0,
      horizontalSwing: (mask & 2) !== 0,
      direction: (mask & 4) !== 0,
      presetMode: (mask & 8) !== 0,
      horizontalAngle: false,
      verticalAngle: false,
      directionNudge: false,
    });
  });
});

describe("native xiaomi_miio fan contracts", () => {
  it.each(nativeMiioModels)("uses core fan actions and actual related number ranges for %s", async (model) => {
    const legacy = model.startsWith("zhimi.") && model !== "zhimi.fan.za5";
    const oneC = model === "dmaker.fan.1c";
    const za5 = model === "zhimi.fan.za5";
    const angle = legacy
      ? { min: 1, max: 120, step: 1 }
      : { min: 30, max: model === "dmaker.fan.p9" ? 150 : za5 ? 120 : 140, step: 30 };
    const presets = legacy ? ["nature", "normal"] : za5 ? ["Nature", "Normal"] : ["Normal", "Nature"];
    const states: Record<string, HassEntity> = {
      "fan.contract": {
        state: "on",
        attributes: {
          supported_features: oneC ? 59 : 63,
          percentage: oneC ? 66 : 50,
          percentage_step: oneC ? 100 / 3 : 1,
          preset_modes: presets,
          preset_mode: legacy ? "normal" : "Normal",
          oscillating: false,
        },
      },
      "number.contract_delay_off_countdown": {
        state: "120",
        attributes: { min: 0, max: 480, step: 1, unit_of_measurement: "min" },
      },
      "switch.contract_child_lock": { state: "off", attributes: {} },
      "switch.contract_buzzer": { state: "off", attributes: {} },
    };
    if (!oneC) {
      states["number.contract_oscillation_angle"] = { state: "60", attributes: angle };
    }
    if (legacy) {
      states["select.contract_led_brightness"] = {
        state: "Bright",
        attributes: { options: ["Bright", "Dim", "Off"] },
      };
    } else if (za5) {
      states["number.contract_led_brightness"] = { state: "100", attributes: { min: 0, max: 100, step: 1 } };
      states["switch.contract_ionizer"] = { state: "on", attributes: {} };
    } else {
      states["switch.contract_led"] = { state: "on", attributes: {} };
    }
    const hass = createHass(states);
    const related = await resolveRelatedEntities(hass, "fan.contract");
    const adapter = createFanAdapter(hass, "fan.contract", allServices, "xiaomi_miio", related);
    expect(adapter.capabilities).toMatchObject({
      horizontalAngle: !oneC,
      horizontalAngleSpec: oneC ? undefined : angle,
      direction: !oneC,
      verticalSwing: false,
      verticalAngle: false,
      timer: true,
      childLock: true,
      led: true,
      buzzer: true,
      ionizer: za5,
    });
    await adapter.setMode("natural");
    expect(hass.callService).toHaveBeenLastCalledWith("fan", "set_preset_mode", {
      entity_id: "fan.contract",
      preset_mode: legacy ? "nature" : "Nature",
    });
    await adapter.setTimer(2);
    expect(hass.callService).toHaveBeenLastCalledWith("number", "set_value", {
      entity_id: "number.contract_delay_off_countdown",
      value: 2,
    });
    await adapter.setLed(false);
    expect(hass.callService.mock.calls.some(([domain]) => domain === "xiaomi_miio_fan")).toBe(false);
  });
});

describe("Xiaomi MIoT source-derived entity contracts", () => {
  it("supports default P76 light, alarm, child lock and horizontal action buttons only", async () => {
    const hass = createHass(miotP76DefaultStates);
    const entityId = "fan.xiaomi_p76_example_fan";
    const related = await resolveRelatedEntities(hass, entityId);
    const adapter = createFanAdapter(hass, entityId, allServices, "xiaomi_miot", related);
    expect(related).toMatchObject({
      led: "light.xiaomi_p76_example_indicator_light",
      buzzer: "switch.xiaomi_p76_example_alarm",
      childLock: "switch.xiaomi_p76_example_child_lock",
    });
    expect(adapter.capabilities).toMatchObject({
      horizontalSwing: true,
      verticalSwing: false,
      horizontalAngle: false,
      verticalAngle: false,
      timer: false,
      led: true,
      buzzer: true,
      childLock: true,
      directionNudge: true,
      nudgeDirections: ["left", "right"],
    });
    expect(adapter.state.led).toBe(true);
    await adapter.setLed(false);
    await adapter.setBuzzer(true);
    await adapter.nudge("left");
    expect(hass.callService.mock.calls).toEqual([
      ["light", "turn_off", { entity_id: "light.xiaomi_p76_example_indicator_light" }],
      ["switch", "turn_on", { entity_id: "switch.xiaomi_p76_example_alarm" }],
      ["button", "press", { entity_id: "button.xiaomi_p76_example_turn_left" }],
    ]);
  });

  it("uses configured MIoT angle entities without inferring raw property setters", async () => {
    const hass = createHass(miotP76CustomizedStates);
    const entityId = "fan.xiaomi_p76_example_fan";
    const related = await resolveRelatedEntities(hass, entityId);
    const adapter = createFanAdapter(hass, entityId, allServices, "xiaomi_miot", related);
    expect(adapter.capabilities).toMatchObject({
      horizontalAngles: [30, 60, 90, 120],
      verticalAngles: [30, 60, 90, 100],
      horizontalAngle: true,
      verticalAngle: true,
      verticalSwing: true,
      timer: true,
      nudgeDirections: ["left", "right", "up", "down"],
    });
    await adapter.setVerticalAngle(100);
    await adapter.setHorizontalAngle(120);
    await adapter.setTimer(2);
    expect(hass.callService.mock.calls).toEqual([
      ["switch", "turn_on", { entity_id: "switch.xiaomi_p76_example_vertical_swing" }],
      [
        "select",
        "select_option",
        { entity_id: "select.xiaomi_p76_example_vertical_swing_included_angle", option: "100" },
      ],
      [
        "select",
        "select_option",
        { entity_id: "select.xiaomi_p76_example_horizontal_swing_included_angle", option: "120" },
      ],
      ["number", "set_value", { entity_id: "number.xiaomi_p76_example_delay_time", value: 2 }],
    ]);
  });

  it("discovers MIoT off_delay_time, alarm and brightness property names", async () => {
    const hass = createHass(miotP18RelatedStates);
    const entityId = "fan.dmaker_p18_example_fan";
    const related = await resolveRelatedEntities(hass, entityId);
    const adapter = createFanAdapter(hass, entityId, allServices, "xiaomi_miot", related);
    expect(adapter.capabilities).toMatchObject({
      horizontalAngles: [30, 60, 90, 120, 140],
      timer: true,
      buzzer: true,
      led: true,
    });
    expect(adapter.state.timerMinutes).toBe(120);
    await adapter.setTimer(2);
    expect(hass.callService).toHaveBeenLastCalledWith("number", "set_value", {
      entity_id: "number.dmaker_p18_example_off_delay_time",
      value: 2,
    });
  });

  it("does not advertise buttons when button.press is absent", async () => {
    const hass = createHass(miotP76DefaultStates);
    const entityId = "fan.xiaomi_p76_example_fan";
    const related = await resolveRelatedEntities(hass, entityId);
    const services = readServiceAvailability({ fan: fanServices });
    const adapter = createFanAdapter(hass, entityId, services, "xiaomi_miot", related);
    expect(adapter.capabilities.directionNudge).toBe(false);
    await expect(adapter.nudge("left")).rejects.toThrow();
    expect(hass.callService).not.toHaveBeenCalled();
  });
});
