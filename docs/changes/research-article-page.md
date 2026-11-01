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
- **Mobile**: the contents come first in the DOM, so they sit between header and body; the TOC is
  a `<details open>` that can collapse. The aside (details card and related articles) comes after
  the body, so readers reach it once they finish the text. On desktop the summary is a plain title
  and the grid places each block by area, whatever the DOM order.
- **Contents column**: from 1280px the page has three columns: the contents on the left (260px,
  sticky under the site header, scrolling on its own if taller than the viewport), the text, and
  the aside on the right (320px) with the details card and related articles, which are not
  sticky. The article page widens to 1400px there, header text included so the title lines up with
  the contents, because inside the 1120px site container the text column would shrink to about
  420px. Between 1024px and 1279px three columns do not fit, so the contents stack above the
  details card in the right column, as before. The contents are their own grid item, not part of
  `<aside>`, so the grid can place them in either column.

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
- The right column is not sticky on desktop: with the related block it can be taller than the
  viewport. Only the contents column sticks, from 1280px.

New i18n key: `article.related.title` (es "Artículos relacionados", en "Related articles").

## Validation

`pnpm typecheck` and `pnpm build` in `apps/site` pass. Checked in the dev server at desktop and
375 px widths. Contents column: site `typecheck`, `test` (41) and `build` (33 pages) pass; in the
dev server at 1440px the contents sit at the left and stay 24px under the header while scrolling,
at 1100px they stack above the details card on the right, and at 375px the order is contents,
text, details, related with no horizontal scroll.

## Limitations

- Topic pills show the raw tag slugs (`flujos-peatonales`), as before.

## Publication search and lead article

- **Search box** next to the topic chips (on its own row on narrow screens), after the mockup's
  search field; the mockup's topic and content-type dropdowns were not added, the chips stay. It
  filters the cards together with the pressed chip: a card shows when it is in the topic and
  contains every typed word, ignoring case and accents ("prediccion" finds "predicción"). Words
  are matched against the card text and the article's full text (title, subtitle, description,
  tags and body as plain text) from a per-locale index,
  [`research/search.json`](../../apps/site/src/pages/[locale]/research/search.json.ts), built
  statically and fetched on the first focus or keystroke (about 130–140 KB per locale before
  compression). Until it loads, or if it fails, the search uses the card text only. With no
  match, "No publications match your search." is announced (`role="status"`). Without JS the box
  stays hidden. Copy: `research.search.*`.
- **Lead article**: "From counting to predicting congestion" (`leadCard = "prediction"` in
  [`Cards.astro`](../../apps/site/src/sections/research/Cards.astro)) opens the list as a full-row
  card from 768px, image left and text right; on mobile it is a normal card. It still follows the
  chips and the search, and goes back among the others if it is ever unpublished.
- The index JSON is not in the sitemap (only pages are).

## Research topic filters

The chips on `/research` (`src/sections/research/Cards.astro`) are now buttons with
`aria-pressed` that filter the cards. Each card gets a `data-topic`: the published article's
`category`, or a fixed topic per card while it has no article (events → use cases, decision →
prediction, architecture → IoT and edge). A small script hides the other cards; without JS all
cards stay visible. The edge card is filtered as IoT and edge although its label says
"Architecture".

## "Read more" on research cards

Each published card on `/research` (`apps/site/src/sections/research/Cards.astro`) ends with
"Read more" and the Lucide `ArrowRight`, styled like the home page's featured article "Read the full
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

`/research` now runs: hero → "Our approach" (overview) → "Latest publications" (chips and cards)
→ "Open questions" → "Collaborate on research".

## "Our approach" overview

New first section of `/research`, right under the section menu
([`sections/research/Overview.astro`](../../apps/site/src/sections/research/Overview.astro)),
after the mockup's "Overview" tab: eyebrow "Our approach" / "Nuestro enfoque", title "From
research to real solutions." / "De la investigación a soluciones reales.", a lead beside the title
behind a thin divider (stacked on mobile), and four steps (Explore, Experiment, Evaluate, Apply)
joined by arrows from 1024px. Spanish copy is the mockup's; English is a translation. Keys:
`research.overview.*`, with `research.overview.nav` ("Overview" / "Visión general") as its menu
label, since the eyebrow would not read as a menu item.

- **Icons**: the repo has no search, layers or cube icons, so the steps reuse the closest assets:
  `lightbulb` (Explore), `point-cloud` (Experiment), `chart` (Evaluate) and `map` (Apply), on
  soft-green circles. The arrows are Lucide `ArrowRight`, hidden on mobile.
- **Spacing**: as in the mockup, the heading sits close to the menu: 48px top padding on desktop
  (`--section-gap-inner`) and `--space-12` at the bottom, instead of the usual section padding.
  The background is `--color-surface-muted`.
- The lead says "validate their impact in real settings"; it describes the method, while no real
  sensor is connected yet.

## "Featured research" on the home page

The Featured research block moved from `/research` to the home page, right after the sectors block ("Events and crowds" and the other tiles)
([`sections/home/Featured.astro`](../../apps/site/src/sections/home/Featured.astro), heading id
`home-featured-title`). It still shows the article of `featuredCard` (`lidar`) and its copy keeps
the `research.featured.*` keys, so no texts changed. The Research card list no longer leaves that
article out: all published articles are listed in their usual order, with "coming soon"
cards last. The section menu lost its Featured link.

## "Collaborate on research" band

`/research` ends with the About page's Collaborate band, after "Open questions": same dark
background with the Research hero image, the same "Get in touch" / "Contactar" button to Contact,
and its own copy, "Collaborate on research" / "Colabora en la investigación" with a line on joint
research, data initiatives and pilots (`research.collab.title` / `research.collab.text`). It has
no eyebrow, which would repeat the title. The band moved from `sections/about/Collaborate.astro` to
[`components/CollaborateBand.astro`](../../apps/site/src/components/CollaborateBand.astro); callers
pass the heading id and translated copy, and About passes its existing `about.collab.*` texts, so
it looks as before. The section menu has no link to the band. The image now appears twice on
`/research` (hero and band), as the request asked.

## Same closing band on Applications and Demo

The closing sections "Do you have a use case you would like to explore?" (Applications) and
"After the demo..." (Demo) now use [`CollaborateBand`](../../apps/site/src/components/CollaborateBand.astro)
instead of the soft-green `CtaBand` with an icon, which had no other user and was removed. Their
texts, buttons and links are unchanged ("Propose a pilot" to `/contact?interest=pilot`, "Contact
NODES" to `/contact`): the band takes optional `href` and `label`, defaulting to Contact and the
About label. No eyebrow, as on Research.

## "Explore our research" goes to the publications

The home hero button "Explore our research" now links to `/{locale}/research#publications`, the
"Latest publications" list, instead of the top of Research
([`Hero.astro`](../../apps/site/src/sections/home/Hero.astro)).

## Research section menu

Under the hero, `/research` has a section menu
(`apps/site/src/sections/research/SectionNav.astro`) with in-page links labelled with each
section's current eyebrow: Overview (`#overview`, its own label), Latest publications
(`#publications`) and Open questions (`#open-questions`). It follows
the mockup's tab bar but not all its labels (Research areas now lives on the home page). A small script sets `aria-current` on the section in view (green text and underline);
without JS the links still work. The menu sticks under the site header while scrolling (the page's
`scroll-padding-top` grows so section headings clear both bars) and scrolls sideways on narrow
screens.

## Navigation order

Research now sits right after Home in the header and footer (`mainNav` in
`apps/site/src/lib/routes.ts`): Home, Research, Applications, Demo, About NODES, Contact.
