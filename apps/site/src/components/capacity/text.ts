import { t, type Locale } from "../../i18n";

/** Right end of the density scale, in people/m² ("6+"). */
export const CROWD_SCALE_MAX = 6;
/** Most figures the 5 × 5 m illustration draws (6 people/m² × 25 m²). */
export const MAX_FIGURES = 150;

/** Translated strings the calculator script needs in the browser. */
export const capacityCalculatorText = (locale: Locale) => ({
  numberLocale: locale === "es" ? "es-ES" : "en-GB",
  peopleLong: t(locale, "capacity.unit.peopleLong"),
  perM2: t(locale, "capacity.unit.perM2"),
  empty: t(locale, "capacity.result.empty"),
  invalid: t(locale, "capacity.result.invalid"),
  untilStanding: t(locale, "capacity.result.untilStanding"),
  untilMoving: t(locale, "capacity.result.untilMoving"),
  levels: {
    normal: t(locale, "capacity.level.normal"),
    attention: t(locale, "capacity.level.attention"),
    serious: t(locale, "capacity.level.serious"),
    critical: t(locale, "capacity.level.critical"),
  },
  levelText: {
    standing: {
      normal: t(locale, "capacity.level.standing.normal"),
      attention: t(locale, "capacity.level.standing.attention"),
      serious: t(locale, "capacity.level.standing.serious"),
      critical: t(locale, "capacity.level.standing.critical"),
    },
    moving: {
      normal: t(locale, "capacity.level.moving.normal"),
      attention: t(locale, "capacity.level.moving.attention"),
      critical: t(locale, "capacity.level.moving.critical"),
    },
  },
  vizLabel: t(locale, "capacity.viz.label"),
  vizCaption: t(locale, "capacity.viz.caption"),
  vizCapped: t(locale, "capacity.viz.capped", { max: MAX_FIGURES }),
});

export type CapacityCalculatorText = ReturnType<typeof capacityCalculatorText>;
