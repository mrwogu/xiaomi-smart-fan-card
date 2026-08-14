import { describe, expect, it } from "vitest";
import { createTranslator, TRANSLATIONS, translate, type SupportedLanguage } from "../../src/translations";

const hass = (language: string) => ({ language });

describe("translations", () => {
  it("provides the same translation keys for every supported language", () => {
    const englishKeys = Object.keys(TRANSLATIONS.en).sort();

    for (const language of Object.keys(TRANSLATIONS) as SupportedLanguage[]) {
      expect(Object.keys(TRANSLATIONS[language]).sort()).toEqual(englishKeys);
    }
  });

  it("uses the Home Assistant language and supports regional language codes", () => {
    expect(translate(hass("pl-PL"), "fanStatus")).toBe("Stan wentylatora");
    expect(translate(hass("es_ES"), "fanStatus")).toBe("Estado del ventilador");
    expect(translate(hass("fr"), "fanStatus")).toBe("État du ventilateur");
    expect(translate(hass("it-IT"), "fanStatus")).toBe("Stato del ventilatore");
  });

  it("falls back to English for unsupported or missing languages", () => {
    expect(translate(hass("de"), "fanStatus")).toBe(TRANSLATIONS.en.fanStatus);
    expect(translate(undefined, "fanStatus")).toBe(TRANSLATIONS.en.fanStatus);
  });

  it("interpolates dynamic values without changing entity identifiers", () => {
    expect(translate(hass("pl"), "fanEntityUnavailable", { entity: "fan.living_room" })).toBe(
      "Encja wentylatora niedostępna: fan.living_room",
    );
    expect(translate(hass("fr"), "setSpeedLevel", { level: 3 })).toBe("Régler le niveau de vitesse 3");
  });

  it("formats timer durations with language-specific spacing", () => {
    expect(createTranslator("pl")("hoursMinutes", { hours: 1, minutes: 30 })).toBe("1 godz. 30 min");
    expect(createTranslator("es")("hoursOnly", { hours: 2 })).toBe("2 h");
    expect(createTranslator("it")("minutesOnly", { minutes: 15 })).toBe("15 min");
  });
});
