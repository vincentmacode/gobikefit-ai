# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for the GoBikeFit iOS app. Plain HTML/CSS plus **one** small script:
**no build step, no framework, no forms, no cookies, no analytics, no dependencies.** The
only JavaScript is `depth.js` (~15 lines, the scroll-reveal observer) — do not add more
without a reason as good. There is nothing to install, compile, bundle, or test. Files are
served exactly as they sit in the repo.

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
favicons, `theme-color`, fonts, the `styles.css` / `depth.css` / `depth.js` tags, the
`.svg-defs` filter block after `<body>`, or the Open Graph / Twitter card tags must be applied
four times, or the pages silently drift apart. Grep
before editing to confirm you have every copy — `og:image` was on the landing page alone for
a while precisely because of this.

Two stylesheets, shared by all pages. `styles.css` is the base; **`depth.css` layers on top
and must load second** — it overrides `.card`, so swapping the order silently drops the
elevation treatment. Design tokens live in `styles.css`'s `:root` (`--bg`, `--surface`,
`--text`, `--accent`, `--accent-2`, radii, font stacks); `depth.css` adds only its own
(`--surface-hover`, `--hairline`, `--hairline-strong`, `--accent-glow`) and deliberately does
not redeclare the base ones. Use tokens rather than hardcoding hex values. The site is
dark-themed throughout; `--bg` is `#05080d` and the `theme-color` meta matches it.

**`--accent` and `--accent-2` are both `#f55b15` orange.** The site was blue-accented
(`#208aef`) until the depth layer landed; the flip was deliberate and site-wide. Three things
were then walked back to blue on purpose, and each has its own token so they don't drift:

- `--accent-blue` (`#208aef`) drives `.icon-circle`, which keeps the features grid alternating
  against `.icon-circle.orange` and keeps the steps and privacy-lock icons blue. Do not
  collapse it into `--accent`.
- `--appstore` (`#0a84ff`) — see below.

Everything else that reads `var(--accent)` is orange by design: body links, the pricing CTAs,
and the FAQ `+` marker.

**`--appstore` (`#0a84ff`) is intentionally outside that scale.** The header's
`.btn-store-small` uses Apple's App Store blue rather than `--accent`, so the store CTA reads
as the App Store instead of as a GoBikeFit button. Do not "fix" it to match the brand accent.
The hero's `.appstore-badge` stays black, which is what Apple's badge guidelines require —
blue is not an approved badge treatment.

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

**The grain and the header are a z-index pair.** The film grain is `body::after` at
`z-index: 9000` in `depth.css`; `.site-header` sits at `9500` in `styles.css` so the sticky
header paints above it. Nothing else on the site uses a z-index over 10. Move one and you
must move the other.

**Section backgrounds must reach opaque `--bg` at every edge.** An ambient per-section glow
was tried and removed because each radial gradient stopped translucent at its section box,
leaving a hard horizontal seam where the hero handed off to the first section and another
beneath pricing. `.hero` and `.section--privacy` are photo bands and are fine precisely
because their gradients end at solid `#05080d` — the hero at the bottom, the privacy band at
both ends, since a mid-page band hands off twice. Any residual tint at an edge is a seam.
`.section` keeps `position: relative` and `isolation: isolate`, retained by request but inert.

**The scroll reveal fails closed, deliberately.** `depth.css` hides `.reveal` elements only
under a `.js` class that `depth.js` sets on `<html>`, and the script is loaded **without
`defer`** so that class lands before first paint. If JS is disabled or the file 404s, nothing
is ever hidden. Two consequences: don't add `defer` (you get a flash of content, then a hide),
and don't put `.reveal` on anything much taller than the viewport — the observer's
`threshold: 0.15` becomes unreachable for tall elements, which is why the legal pages reveal
`.page-hero` but not `.prose`.

**The canonical/OG tags carry the live domain**, `https://gobikefit.ca` — three tags per page
(`rel="canonical"`, `og:url`, `og:image`), twelve in all. `og:image` must stay an *absolute*
URL, so it can never be shortened to a path. The contact address `support@gobikefit.ca` is
duplicated the same way: seven anchors, once in every footer and again in the Contact section
of `/support` and the Contact Us clause of both legal pages. The App Store URL
(`https://apps.apple.com/app/id6791359268`, 12 occurrences across every page's header and
footer plus the landing hero and pricing) is the real one — it 404s only until the app is
released. The legal texts are final — entity and governing law are filled in, and no bracket
placeholders remain anywhere.

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
