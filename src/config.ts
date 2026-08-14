import type { FanCardConfig } from "./types";

export const DEFAULT_CONFIG = {
  type: "custom:xiaomi-fan-card",
  entity: "",
  theme: "auto",
  integration: "auto",
  disable_animation: false,
  show_sleep: true,
  show_timer: true,
  show_child_lock: true,
  show_led: true,
  show_buzzer: true,
  show_ionizer: true,
} satisfies Partial<FanCardConfig>;
