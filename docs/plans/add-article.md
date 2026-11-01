# Plan: add a research article

Reusable plan. The author writes the article Markdown by hand; when told "execute
add-article.md", the agent runs the steps below for every new or changed article. No git
operations: leave changes uncommitted and propose a commit message.

## Input from the author

- One Markdown file per locale in `apps/site/src/content/research/{en,es}/` (a single locale is
  fine; the missing one is reported, not invented).
- Optionally a preview image (path or pasted in chat) and its source and licence.

## Steps

1. **Find the new articles.** `git status` on `apps/site/src/content/research/` and
   `apps/site/src/assets/research/`. If unclear which article is meant, ask.
2. **Check the frontmatter** against the `research` schema in `apps/site/src/content.config.ts`:
   `title`, `subtitle`, `description` (≤ 155 chars), `slug` (English slug for `en`, matching the
   file name), `date` (ISO, or empty while draft), `type`, `category`, `tags`, `author`, `draft`,
   `card`. Both locales share the same `card` key so translations are paired. Fix only
   formatting; ask before changing wording.
3. **Preview image**, if given:
   - Copy it to `apps/site/src/assets/research/<descriptive-english-name>.<ext>` (keep the
     format; never cut images from mockups).
   - Add `cover` and `coverAlt` to each locale's frontmatter, with `coverAlt` in that locale's
     language.
   - Put the same image in the body after the intro paragraph, before the first `##`, with the
     same alt text (the article keeps its own copy in the body).
   - Add a row to `apps/site/src/assets/README.md` (file, where used, source, licence). If the
     source or licence is unknown, write "to confirm" and tell the author.
4. **Card and listing.** The Research list only shows cards registered in code. For a new
   `card` key: add it to `cardIcons` in `apps/site/src/lib/research.ts` (icon from
   `packages/ui/assets/icons/`), to `cardTopics` in `apps/site/src/sections/research/Cards.astro`,
   and add `research.cards.<key>.{category,title,description,type}` to both
   `apps/site/src/i18n/en.json` and `es.json` (reuse an existing category label). Then check the
   built `/en/research/` and `/es/research/` list it.
5. **Content rules** (CLAUDE.md): figures from the real world need a source in
   `docs/sources.md`; no "prevents incidents", "danger", "evacuate" framing for product claims;
   no faces from mockups. Report problems; do not rewrite the author's text silently.
6. **Record.** Update `docs/changes/research-article-page.md` (or the feature record in use)
   with the article, image and any open questions.
7. **Validate**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Check the built
   page exists at `/en/research/<slug>` and `/es/research/<slug>` (unless draft).
8. **Report**: what was added, what is pending (missing locale, image licence, draft flag,
   empty date) and a proposed Conventional Commit message, e.g.
   `feat(site): add "<title>" research article`.
