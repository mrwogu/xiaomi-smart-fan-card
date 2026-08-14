import "./card";

const customCards = (window as Window & { customCards?: unknown[] }).customCards ?? [];
if (
  !customCards.some(
    (card) => typeof card === "object" && card !== null && (card as { type?: unknown }).type === "xiaomi-fan-card",
  )
) {
  customCards.push({
    type: "xiaomi-fan-card",
    name: "Xiaomi Fan Card",
    description: "Modern capability-aware card for Xiaomi and generic Home Assistant fans.",
    preview: true,
  });
}
(window as Window & { customCards?: unknown[] }).customCards = customCards;
