import { Building, TrainFront } from "@lucide/astro";
import eventsPhoto from "../assets/applications/events-crowd.jpg";
import transportPhoto from "../assets/applications/transport-station.webp";

/**
 * The three application sectors: the home tiles and the Applications cards. Texts come from
 * i18n (`home.sectors.<id>`, `applications.<id>.*`); `id` is also the card's anchor, so the home
 * tiles link to `applications#<id>`. Lucide only where packages/ui has no asset (train, building).
 * `photo` (optional) replaces the illustration on the Applications card; source and rights of
 * each photo are recorded in src/assets/README.md.
 */
export const sectors = [
  { id: "events", icon: "icons/people-group", illustration: "illustrations/use-case-runner", photo: eventsPhoto },
  { id: "transport", lucide: TrainFront, photo: transportPhoto },
  { id: "spaces", lucide: Building, illustration: "illustrations/use-case-town-hall" },
] as const;
