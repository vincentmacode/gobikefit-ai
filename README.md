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
```

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
- **Legal text**: `legal/terms/index.html` still contains lorem-ipsum
  placeholders and a `[DATE]` marker. Paste in the final text and remove the
  `noindex` meta tag on that page. (The Privacy Policy is final.)
- **OG image**: `index.html` references `og-image.png` (1200×630) — add one at
  the site root.
- **Favicon**: `favicon.svg` is a placeholder; swap in final app-icon artwork.
