# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for the GoBikeFit iOS app. Plain HTML/CSS: **no build step, no
JavaScript anywhere, no forms, no cookies, no analytics, no dependencies.** There is nothing
to install, compile, bundle, or test. Files are served exactly as they sit in the repo.

Preview locally:

```sh
python3 -m http.server 8000   # from repo root
```

There is no test suite, linter, or CI. Verification means loading pages in a browser or
curling them from that server — say so plainly rather than implying automated checks ran.

## Architecture

Four standalone pages, each a complete HTML document. **There is no templating, includes, or
partials.** Clean URLs come from the `directory/index.html` convention, which every static
host resolves natively.

| file | route |
|---|---|
| `index.html` | `/` |
| `support/index.html` | `/support` |
| `legal/terms/index.html` | `/legal/terms` |
| `legal/privacy/index.html` | `/legal/privacy` |

**The consequence that matters: the `<head>` block, `.site-header`, and `.site-footer` markup
are duplicated verbatim across all four files.** Anything touching nav links, the footer,
favicons, `theme-color`, or fonts must be applied four times, or the pages silently drift
apart. Grep before editing to confirm you have every copy.

`styles.css` is the single shared stylesheet for all pages. Design tokens live in `:root`
(`--bg`, `--surface`, `--text`, `--accent` blue, `--accent-2` orange, radii, font stacks) —
use them rather than hardcoding hex values. The site is dark-themed throughout; `--bg` is
`#05080d` and the `theme-color` meta matches it.

Two page archetypes share the same chrome: `.hero` (landing page only, centered, with the
background photo) and `.page-hero` (subpages, left-aligned, plain). `.container`, `.card`,
`.icon-circle`, `.site-header`, and `.site-footer` are common to both. Subpages add `.prose`
(legal text) and `.faq-item` (native `<details>`, no JS).

Breakpoints: `640px` and `860px` reshape the card grids; `700px` swaps the hero image only.

## Cross-file invariants

These span multiple files and break quietly. Documented in more depth in `README.md`.

**The 700px hero breakpoint lives in two places** — the `.hero` media query in `styles.css`
and the two `media`-scoped `rel="preload"` links in `index.html`. If they diverge, the browser
preloads one image and paints the other. Change both together.

**The hero background is a CSS `background-image`**, so `loading="eager"` and
`fetchpriority="high"` do not apply to it — those are `<img>` attributes. Its LCP priority
comes from the preload links instead. `assets/hero/dusk-riding-zoom.png` is the master; the
two `.webp` files are committed derivatives. The mobile variant is a centered **crop**, not a
downscale: the hero box is taller than it is wide on phones, so `cover` scales by height there
and a narrower file would be upscaled and look soft. Regeneration commands are in `README.md`.

**`favicon.svg` is deliberately absent.** The generator's SVG was a 1024px PNG in an `<svg>`
wrapper (1228 KB); the `.ico` and 96px PNG cover every tab size. Manifest icons are
`"purpose": "any"`, not `"maskable"`, because the artwork has no safe-zone padding. Don't
"restore" either without reading the Favicons section of `README.md` first.

**Pre-launch placeholders still in the markup**: the App Store URL
(`https://apps.apple.com/app/id0000000000`, 12 occurrences across every page's header and
footer plus the landing hero and pricing), the `gobikefit.com` domain in canonical/OG tags,
and a missing `og-image.png`. `README.md` tracks these. The legal texts are final — entity
and governing law are filled in, and no bracket placeholders remain anywhere.

## Git workflow

`main` is protected and the settings are strict — check before assuming a normal push works.

- **Rebase merge only.** Squash and merge commits are both disabled on the repo;
  `delete_branch_on_merge` is on.
- **`main` requires linear history**, with `enforce_admins` on, so force-pushes and branch
  deletion are blocked for everyone including the owner. Direct pushes to `main` are still
  allowed as long as they are linear — PRs are not required, just the norm here.
- **`pull.ff` is `only`** in this repo's local config, so `git pull` *errors out* on
  divergence instead of merging. Recover with `git pull --rebase`.
- Because branches auto-delete on merge, **pushing to a branch whose PR was just merged
  recreates it** as a stray. If a push reports `* [new branch]` for a branch that already
  existed, that is what happened — check whether the PR merged underneath you.

Branch off current `main`, open a PR, let it rebase-merge. Existing branch names are
descriptive (`chore-favicon-set`, `chore-gitignore-dsstore`).
