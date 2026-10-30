import { Building, TrainFront } from "@lucide/astro";
import eventsPhoto from "../assets/applications/events-crowd.jpg";
import spacesPhoto from "../assets/applications/spaces-stadium.webp";
import transportPhoto from "../assets/applications/transport-station.webp";

/**
 * The three application sectors: the home tiles and the Applications cards. Texts come from
 * i18n (`home.sectors.<id>`, `applications.<id>.*`); `id` is also the card's anchor, so the home
 * tiles link to `applications#<id>`. Lucide only where packages/ui has no asset (train, building).
 * `photo` fills the top of the Applications card; source and rights of each photo are recorded in
 * src/assets/README.md.
 */
export const sectors = [
  { id: "events", icon: "icons/people-group", photo: eventsPhoto },
  { id: "transport", lucide: TrainFront, photo: transportPhoto },
  { id: "spaces", lucide: Building, photo: spacesPhoto },
] as const;
