# GoBikeFit — marketing site

Static marketing site for the GoBikeFit iOS app. Plain HTML/CSS, no build step,
no framework, no forms, no cookies, no analytics. The only JavaScript is
`depth.js`, ~15 lines driving the scroll reveal.

## Structure

```
index.html              /                Landing page
support/index.html      /support         FAQ + contact
legal/terms/index.html  /legal/terms     Terms of Use
legal/privacy/index.html/legal/privacy   Privacy Policy
styles.css                               Shared stylesheet (base)
depth.css                                Shared stylesheet (depth layer, loads second)
depth.js                                 Scroll-reveal observer
favicon.ico                              Tab icon, 16/32/48px
favicon-96x96.png                        Tab icon, high-DPI
apple-touch-icon.png                     iOS home screen, 180px
site.webmanifest                         PWA manifest
web-app-manifest-*.png                   Manifest icons, 192/512px
og-image.png                             Social card, 1200×630
assets/hero/                             Landing-page hero background
assets/private/                          Privacy-section background
```

## Background photos

Two sets, same shape and same pipeline: `assets/hero/dusk-riding-zoom.png` behind `.hero`,
and `assets/private/dawn-empty-road.png` behind `.section--privacy`. Each is a 1584×672
master with two committed `.webp` derivatives beside it, served as CSS backgrounds.

The hero box is taller than it is wide on phones, so `background-size: cover` scales the
image by its *height* there — a width-downscaled mobile variant would be upscaled and look
soft. The mobile file is therefore a centered **crop**, not a smaller rendering of the same
frame. Regenerate both with (needs `brew install webp`):

```sh
# $1 = e.g. assets/hero/dusk-riding-zoom or assets/private/dawn-empty-road
cwebp -q 90 -m 6 -sharp_yuv -metadata none "$1.png" -o "$1.webp"

sips -c 672 960 "$1.png" --out /tmp/mobile.png
cwebp -q 90 -m 6 -sharp_yuv -metadata none /tmp/mobile.png -o "$1-960.webp"
```

Only the hero is preloaded. The privacy band is below the fold, so preloading it would
compete with the LCP image.

The 700px breakpoint appears twice — the `.hero` media query in `styles.css` and the two
`rel="preload"` links in `index.html`. Keep them in sync or the browser will preload one
file and paint the other.

Clean URLs work out of the box on any static host that serves
`directory/index.html` for `/directory` (Netlify, Vercel, Cloudflare Pages,
GitHub Pages, S3 + CloudFront with index documents).

## Depth layer

`depth.css` sits on top of `styles.css` and must load second — it overrides `.card`,
so reversing the order silently drops the elevation treatment. It adds five things:

1. **Film grain** — a fixed `body::after` overlay at 3.5% opacity, using an inline
   `feTurbulence` SVG data URI. This is what stops flat dark from reading as
   unfinished; it also kills banding in the hero gradient.
2. **Card elevation** — cards lighten and rise 2px on hover, wrapped in
   `@media (hover: hover)` so the state can't stick after a tap on touch devices.
   `.pricing-card.featured:hover` re-asserts the green border, which the generic
   `.card:hover` would otherwise win on source order at equal specificity.
3. **Hairlines** — translucent white borders instead of the opaque `--border`.
   The `.rule` utility (a divider that fades out at both ends) is defined but not
   currently placed on any page.
4. **Scroll reveal** — see below.

**Grain z-index and header z-index are a pair.** Grain is `9000`; `.site-header` is
`9500` so the sticky header stays above it. Nothing else on the site exceeds 10.

**Section backgrounds must reach opaque `--bg` at every edge.** A per-section
ambient glow was built and then removed: each radial gradient stopped translucent at
its section box, leaving a hard seam where the hero met the first section and another
below pricing. The two photo bands are fine because their gradients end at solid
`#05080d` — `.hero` at the bottom, `.section--privacy` at both ends, since a mid-page
band hands off to the flat background twice. `.section` still carries `position:
relative` and `isolation: isolate`, kept by request but inert.

### Scroll reveal

`depth.js` is an IntersectionObserver that adds `.is-visible` to each `.reveal`
element once, then unobserves it. Grouped items stagger via an inline index —
`<div class="card reveal" style="--i:0">` — which feeds a 60ms-per-step
`transition-delay`. Restart the index at 0 for each group.

The reveal **fails closed**. `depth.css` hides `.reveal` only under a `.js` class
that `depth.js` puts on `<html>`, so a missing or blocked script leaves everything
visible instead of blank. That is why the script is loaded **without `defer`** — the
class has to land before first paint, or you get a flash of content followed by a
hide. It is also gated on `prefers-reduced-motion`.

Don't put `.reveal` on anything much taller than the viewport. `threshold: 0.15`
can never be satisfied by an element more than ~6.7 viewport-heights tall, and it
would stay hidden forever. The legal pages reveal `.page-hero` and deliberately
leave `.prose` alone for exactly this reason.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Before launch — replace placeholders

- **App Store URL**: search-and-replace `https://apps.apple.com/app/id0000000000`
  with the real App Store link (appears in every page's header, hero, pricing,
  and footer).
- **Domain**: `https://gobikefit.com` is used in canonical + Open Graph tags on
  all four pages — replace with the real domain. Note `og:image` must stay an
  *absolute* URL, so the social card stays broken until this is done.

The Terms of Use entity (`Guo Rong Ma`) and governing law (`Ontario, Canada`) are
filled in, and both legal texts are final. No bracket placeholders remain in any
page.

## Favicons

Generated with [RealFaviconGenerator](https://realfavicongenerator.net). Two
deliberate departures from its default output:

- **No `favicon.svg`.** The generator's SVG is not a vector — it is a 1024×1024
  PNG base64-embedded in an `<svg>` wrapper, 1228 KB, or 122× `favicon-96x96.png`.
  Browsers prefer the SVG when it is offered, so linking it would cost every
  visitor over a megabyte for a 16px tab icon with no gain in crispness. The
  `.ico` (16/32/48) and the 96px PNG cover every tab size, including high-DPI.
  If the artwork is ever redrawn as a true vector, add it back — an SVG favicon
  is the right call when it is actually one.
- **Manifest icons are `"purpose": "any"`, not `"maskable"`.** Maskable icons
  need roughly 20% safe-zone padding; this artwork runs edge to edge, so Android
  would crop the wheels when applying its circle mask. Switch back to
  `"maskable"` only alongside a padded variant of the artwork.
