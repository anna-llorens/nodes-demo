import { Building2, TrainFront } from "@lucide/astro";

/**
 * The three application sectors: the home tiles and the Applications cards. Texts come from
 * i18n (`home.sectors.<id>`, `applications.<id>.*`); `id` is also the card's anchor, so the home
 * tiles link to `applications#<id>`. Lucide only where packages/ui has no asset (train, building).
 */
export const sectors = [
  { id: "events", icon: "icons/people-group", illustration: "illustrations/use-case-runner" },
  { id: "transport", lucide: TrainFront },
  { id: "spaces", lucide: Building2, illustration: "illustrations/use-case-town-hall" },
] as const;
