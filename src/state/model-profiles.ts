import type { FanModelProfile } from "../types";

const commonAngles = [30, 60, 90, 120, 140];

const profiles: FanModelProfile[] = [
  {
    model: "zhimi.fan.v2",
    label: "Mi Smart Fan V2",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [30, 60, 90, 120, 140, 150],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
  },
  {
    model: "zhimi.fan.v3",
    label: "Mi Smart Fan V3",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [30, 60, 90, 120, 140, 150],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
  },
  ...["zhimi.fan.sa1", "zhimi.fan.za1", "zhimi.fan.za3", "zhimi.fan.za4"].map((model) => ({
    model,
    label: "Xiaomi Smart Fan",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [...commonAngles],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
  })),
  {
    model: "zhimi.fan.za5",
    label: "Smartmi Standing Fan 3",
    known: true,
    isXiaomi: true,
    timerUnit: "s",
    speedLevels: 4,
    horizontalAngles: [30, 60, 90, 120],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: true,
  },
  ...["dmaker.fan.p5", "dmaker.fan.p9", "dmaker.fan.p10", "dmaker.fan.p11", "dmaker.fan.p15"].map((model) => ({
    model,
    label: "Xiaomi Smart Fan",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [...commonAngles],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
  })),
  {
    model: "dmaker.fan.p8",
    label: "Xiaomi Smart Fan 1C",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [...commonAngles],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
  },
  {
    model: "dmaker.fan.1c",
    label: "Xiaomi Smart Fan 1C",
    known: true,
    isXiaomi: true,
    speedLevels: 3,
    horizontalAngles: [],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
  },
  ...["dmaker.fan.p18", "dmaker.fan.p30", "dmaker.fan.p33", "dmaker.fan.p39"].map((model) => ({
    model,
    label: "Xiaomi Smart Standing Fan",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [...commonAngles],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: model === "dmaker.fan.p33",
  })),
  {
    model: "xiaomi.fan.p45",
    label: "Xiaomi Smart Tower Fan 2",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [30, 60, 90, 120, 150],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: true,
  },
  {
    model: "xiaomi.fan.p76",
    label: "Xiaomi Smart Standing Air Circulation Fan",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [30, 60, 90, 120],
    verticalAngles: [30, 60, 90, 100],
    supportsVerticalSwing: true,
    supportsNudge: true,
  },
  {
    model: "xiaomi.fan.p70",
    label: "Xiaomi Smart Desktop Air Circulation Fan",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [30, 60, 90, 120],
    verticalAngles: [30, 60, 90, 100],
    supportsVerticalSwing: true,
    supportsNudge: true,
  },
  ...["xiaomi.fan.p30", "xiaomi.fan.p85", "xiaomi.fan.p43"].map((model) => ({
    model,
    label: "Xiaomi Smart Standing Fan",
    known: true,
    isXiaomi: true,
    speedLevels: 4,
    horizontalAngles: [30, 60, 90],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: true,
  })),
  {
    model: "xiaomi.fan.2lite",
    label: "Mi Smart Standing Fan 2 Lite",
    known: true,
    isXiaomi: true,
    speedLevels: 3,
    horizontalAngles: [],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
  },
  {
    model: "leshow.fan.ss4",
    label: "Leshow Fan",
    known: true,
    isXiaomi: false,
    speedLevels: 4,
    horizontalAngles: [],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
  },
];

const profileMap = new Map(profiles.flatMap((profile) => (profile.model ? [[profile.model, profile]] : [])));

const unknownProfile = (model?: string): FanModelProfile => ({
  model,
  label: model ? `Xiaomi Fan (${model})` : "Smart Fan",
  known: false,
  isXiaomi: model?.trim().toLowerCase().includes(".fan.") ?? false,
  speedLevels: 4,
  horizontalAngles: [],
  verticalAngles: [],
  supportsVerticalSwing: false,
  supportsNudge: false,
});

export const getModelProfile = (model?: string): FanModelProfile =>
  profileMap.get(model?.trim().toLowerCase() ?? "") ?? unknownProfile(model);

export const isXiaomiFanModel = (model?: string): boolean =>
  getModelProfile(model).isXiaomi || model?.trim().toLowerCase().startsWith("leshow.fan.") === true;

export const resolveSpeedLevels = (
  attributes: Record<string, unknown>,
  profile: FanModelProfile = getModelProfile(),
): number => {
  for (const key of ["speed_levels", "speed_count", "max_speed", "fan_speed_count"]) {
    const value = Number(attributes[key]);
    if (Number.isInteger(value) && value >= 1 && value <= 20) {
      return value;
    }
  }

  const modes =
    [attributes["preset_modes"], attributes["speed_list"], attributes["speed_modes"]].find(
      (value): value is unknown[] => Array.isArray(value) && value.length > 0,
    ) ?? [];
  if (Array.isArray(modes)) {
    const levels = modes
      .map(String)
      .map((mode) => mode.match(/(?:level|speed)\s*(\d+)/i)?.[1] ?? (mode.match(/^\d+$/) ?? [])[0])
      .map(Number)
      .filter((level) => Number.isInteger(level) && level > 0 && level <= 20);

    if (levels.length > 0) {
      return Math.max(...levels);
    }
  }

  const percentageStep = Number(attributes["percentage_step"]);
  if (Number.isFinite(percentageStep) && percentageStep > 1 && percentageStep <= 100) {
    return Math.ceil(100 / percentageStep);
  }

  return profile.speedLevels;
};

export const percentageStepDefinesLevels = (speedLevels: number, percentageStep: number): boolean =>
  percentageStep > 1 && Math.ceil(100 / percentageStep) === speedLevels;

export const percentageForSpeedLevel = (level: number, speedLevels: number, percentageStep = 1): number => {
  const stepDefinesLevels = percentageStepDefinesLevels(speedLevels, percentageStep);
  return stepDefinesLevels ? Math.min(100, level * percentageStep) : Math.round((level / speedLevels) * 100);
};

export const speedLevelForPercentage = (percentage: number, speedLevels: number, percentageStep = 1): number => {
  if (percentage <= 0) {
    return 0;
  }

  if (percentage >= 100) {
    return speedLevels;
  }

  const stepDefinesLevels = percentageStepDefinesLevels(speedLevels, percentageStep);
  const level = stepDefinesLevels
    ? Math.round(percentage / percentageStep)
    : Math.round((percentage / 100) * speedLevels);
  return Math.min(speedLevels, Math.max(1, level));
};
