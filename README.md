# GoBikeFit — marketing site

Static marketing site for the GoBikeFit iOS app. Plain HTML/CSS, no build step,
no JavaScript, no forms, no cookies, no analytics.

## Structure

```
index.html              /                Landing page
support/index.html      /support         FAQ + contact
legal/terms/index.html  /legal/terms     Terms of Use (placeholder text)
legal/privacy/index.html/legal/privacy   Privacy Policy (placeholder text)
styles.css                               Shared stylesheet
favicon.svg                              Placeholder favicon
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
- **Terms of Use entity details**: `legal/terms/index.html` still contains
  `[Your Legal Name / Company Name]` (intro paragraph) and `[Your State/Country]`
  (§11 Governing Law) — fill these in. (Both legal texts are otherwise final.)
- **OG image**: `index.html` references `og-image.png` (1200×630) — add one at
  the site root.
- **Favicon**: `favicon.svg` is a placeholder; swap in final app-icon artwork.
