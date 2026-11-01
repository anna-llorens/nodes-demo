# Research article page redesign

Redesign of `apps/site/src/pages/[locale]/research/[slug].astro` after
`docs/design/v2/article.png` (structure and order only).

## Header and side column

- **Cover**: the research schema takes an optional `cover` (Astro `image()`) and `coverAlt`; a
  refine requires `coverAlt` whenever `cover` is set. Only the two LiDAR articles set it, reusing
  `src/assets/research/lidar-point-cloud-plaza.jpg`, which also stays in the body.
- **Dark header**: full-width band on a new `--color-surface-inverse` token, with
  `--color-text-inverse-muted` for the eyebrow and subtitle (both AA on it). Eyebrow is
  `category · type · short date`; the category label reuses `research.filters.*`, falling back to
  the raw key. Short date comes from `formatShortDate` in `src/lib/research.ts` ("30 oct 2026",
  `en-GB` order for English). With a cover, `<Image>` (640–1920 widths, eager, high priority)
  fills the band behind a left-to-right dark gradient that stays near-solid under the text.
- **Table of contents**: numbered h2 links (01, 02…) in a soft card. A small
  `IntersectionObserver` script sets `aria-current` on the section being read (last heading above
  the upper third of the viewport); without JS the links still work.
- **Details card**: date, type and topics with Lucide `Calendar`, `FileText`, `Tag`; topics as
  outlined pills.
- **Mobile**: the aside is first in the DOM, so it sits between header and body; the TOC is a
  `<details open>` that can collapse. On desktop the grid moves the aside to a sticky right column
  and the summary is a plain title.

- **Research cards**: a card whose published article has a `cover` shows that image instead of
  the icon panel (`src/sections/research/Cards.astro`), in the same 16:8 frame, so the card, the
  article header and the home Research card use the same picture.

## Related articles

- `relatedArticles(entry, limit = 3)` in `src/lib/research.ts`: other published articles in the
  same locale, newest first.
- Block below the details card: each row is one link with a thumbnail (the cover, or the card icon
  on the soft-green panel), category eyebrow, title, short date and an arrow. Hidden when empty.
- The card → icon map moved from `Cards.astro` to `cardIcons` in `src/lib/research.ts`, so the
  Research cards and the related rows share it.
- The side column is no longer sticky on desktop: with the related block it can be taller than the
  viewport.

New i18n key: `article.related.title` (es "Artículos relacionados", en "Related articles").

## Validation

`pnpm typecheck` and `pnpm build` in `apps/site` pass. Checked in the dev server at desktop and
375 px widths.

## Limitations

- Topic pills show the raw tag slugs (`flujos-peatonales`), as before.

## Research topic filters

The chips on `/research` (`src/sections/research/Cards.astro`) are now buttons with
`aria-pressed` that filter the cards. Each card gets a `data-topic`: the published article's
`category`, or a fixed topic per card while it has no article (events → use cases, decision →
prediction, architecture → IoT and edge). A small script hides the other cards; without JS all
cards stay visible. The edge card is filtered as IoT and edge although its label says
"Architecture".

## "Read more" on research cards

Each published card on `/research` (`apps/site/src/sections/research/Cards.astro`) ends with
"Read more" and the Lucide `ArrowRight`, styled like the featured article's "Read the full
article" link. It is a `span` with `aria-hidden`, not a second link: the stretched title link
already covers the card, so screen readers keep one link per card. "Coming soon" cards do not
show it because they have nowhere to go. Copy: `research.readMore` in `es.json` / `en.json`.

## "Latest publications" heading

The card list on `/research` now opens with the shared `SectionHeading`: eyebrow "Latest
publications" and h2 "Research and technical notes." (`research.list.eyebrow` /
`research.list.title`). The section is labelled by that h2 instead of the nav label, and the card
titles moved from h2 to h3 so the outline nests under it. The chips sit between the heading and the
cards.

## "Open questions" section

`/research` has a new section after the card list, before the featured article
(`apps/site/src/sections/research/Questions.astro`): eyebrow "Open questions", a one-line h2
"The questions that guide our research." (no 60ch cap, so it wraps only on narrow screens), and
three numbered rows. Each row has the question (h3), a status badge ("Investigating" or "Seeking
collaborators"), the methodology and the experiment, and an illustration. Rows stack on mobile and
become question · details · image columns from 1024px.

- Copy: `research.questions.*` in `es.json` / `en.json`; status keys are codes
  (`investigating`, `seekingCollaborators`).
- Images reuse existing own illustrations instead of cutting them out of the mockup:
  `lidar-point-cloud-plaza.jpg`, `decision-venue-flows.webp` and `events-race-start.webp`
  (usage added to `apps/site/src/assets/README.md`). They are decorative (`alt=""`).
- Icons: the `icons/chart` asset for "Experiment"; Lucide `FlaskConical` for "Methodology",
  since there is no flask asset.
- The third question's methodology lists "LiDAR, IoT" only: "cameras" from the mockup copy was
  dropped because NODES does not use cameras.

## Research page order

`/research` now runs: hero → "Latest publications" (chips and cards) → "Open questions" →
"Featured research". The card list still leaves out the featured article while it is published,
so that article appears only in the featured section further down.

## Research section menu

Under the hero, `/research` has a section menu
(`apps/site/src/sections/research/SectionNav.astro`) with in-page links labelled with each
section's current eyebrow: Latest publications (`#publications`), Open questions
(`#open-questions`), and Featured research (`#featured`). It follows
the mockup's tab bar but not its labels (no "Overview", and Research areas now lives on the home
page). A small script sets `aria-current` on the section in view (green text and underline);
without JS the links still work. The menu sticks under the site header while scrolling (the page's
`scroll-padding-top` grows so section headings clear both bars) and scrolls sideways on narrow
screens. The Featured link is left out while that article is unpublished in the locale, because the
section then renders nothing.

## Navigation order

Research now sits right after Home in the header and footer (`mainNav` in
`apps/site/src/lib/routes.ts`): Home, Research, Applications, Demo, About NODES, Contact.
