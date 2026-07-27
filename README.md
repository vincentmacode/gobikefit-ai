# GoBikeFit — marketing site

Static marketing site for the GoBikeFit iOS app. Plain HTML/CSS, no build step,
no JavaScript, no forms, no cookies, no analytics.

## Structure

```
index.html              /                Landing page
support/index.html      /support         FAQ + contact
legal/terms/index.html  /legal/terms     Terms of Use
legal/privacy/index.html/legal/privacy   Privacy Policy
styles.css                               Shared stylesheet
favicon.ico                              Tab icon, 16/32/48px
favicon-96x96.png                        Tab icon, high-DPI
apple-touch-icon.png                     iOS home screen, 180px
site.webmanifest                         PWA manifest
web-app-manifest-*.png                   Manifest icons, 192/512px
assets/hero/                             Landing-page hero background
```

## Hero background

`assets/hero/dusk-riding-zoom.png` (1584×672) is the master; the two committed `.webp`
files beside it are generated derivatives, served as the `.hero` CSS background.

The hero box is taller than it is wide on phones, so `background-size: cover` scales the
image by its *height* there — a width-downscaled mobile variant would be upscaled and look
soft. The mobile file is therefore a centered **crop**, not a smaller rendering of the same
frame. Regenerate both with (needs `brew install webp`):

```sh
cwebp -q 90 -m 6 -sharp_yuv -metadata none \
  assets/hero/dusk-riding-zoom.png -o assets/hero/dusk-riding-zoom.webp

sips -c 672 960 assets/hero/dusk-riding-zoom.png --out /tmp/hero-mobile.png
cwebp -q 90 -m 6 -sharp_yuv -metadata none \
  /tmp/hero-mobile.png -o assets/hero/dusk-riding-zoom-960.webp
```

The 700px breakpoint appears twice — the `.hero` media query in `styles.css` and the two
`rel="preload"` links in `index.html`. Keep them in sync or the browser will preload one
file and paint the other.

Clean URLs work out of the box on any static host that serves
`directory/index.html` for `/directory` (Netlify, Vercel, Cloudflare Pages,
GitHub Pages, S3 + CloudFront with index documents).

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
  all four pages — replace with the real domain.
- **OG image**: `index.html` references `og-image.png` (1200×630) — add one at
  the site root.

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
