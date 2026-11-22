# SEO Audit: max-morph.com

Audited 2026-11-22 · Business type: **B2B clinical service / SaaS-style hybrid** (pay-per-case virtual surgical planning for maxillofacial surgeons) · Site: single-page static site on GitHub Pages (live HTML is byte-identical to `index.html` in this repo).

## SEO Health Score: 57 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 62 | 13.6 |
| Content Quality | 23% | 58 | 13.3 |
| On-Page SEO | 20% | 60 | 12.0 |
| Schema / Structured Data | 10% | 5 | 0.5 |
| Performance (CWV) | 10% | 90 | 9.0 |
| AI Search Readiness | 10% | 45 | 4.5 |
| Images | 5% | 78 | 3.9 |
| **Total** | | | **56.8** |

## Scope and limits (read first)

- Only the homepage exists as a real page, so "crawl" = 1 URL plus two stray backup pages (below).
- The bundled `render_page.py` could not run: its SSRF guard needs local DNS, and this sandbox only resolves through the proxy. I fetched with `curl` and rendered with Playwright through the proxy instead. Results are equivalent for this static site.
- Performance numbers are single lab runs from a datacenter (not field data). No Google API / GSC / GA4 / Matomo credentials were configured, so there is no indexation, query or traffic data. Backlink, local, maps, ecommerce, drift and DataForSEO checks were skipped (not applicable or no credentials). I did not spawn the specialist subagents; everything was run inline.

## Top 5 issues

1. **Two old versions of the site are live and indexable** (High). `/backup/round-3/` and `/backup/coming-soon-v0/` return 200 with their own `<title>`s, no canonical and no noindex. They duplicate the homepage and one carries the older "Virtual Surgical Planning for Craniomaxillofacial Procedures" title.
2. **No `robots.txt` and no `sitemap.xml`** (High). Both return the GitHub Pages 404. Nothing declares the sitemap or keeps the backup folders out.
3. **No canonical and no structured data** (High). No `rel=canonical`, no JSON-LD of any kind (no Organization, Person, WebSite, MedicalBusiness).
4. **One URL has to rank for everything** (High). Orthognathic planning, trauma, implantology, reconstruction, guides, splints and PSI are all sections of `/`, so there is no page that can target "virtual surgical planning" or "orthognathic surgery planning" queries. The H1 ("From scan to surgery.") and title contain none of those terms; "virtual surgical planning" appears only in the meta description, and the body uses the abbreviation "VSP" without ever spelling it out in a heading.
5. **Thin trust and E-E-A-T signals for a medical-device-adjacent (YMYL) offering** (High). The founder is named with a photo and LinkedIn link, but there are no qualifications, registrations, case evidence, publications, validation or accuracy data, regulatory status for patient-specific implants/guides, privacy policy, data-handling statement for DICOM/patient data, or terms. The testimonial and client sections are built but hidden because they have no entries.

## Technical SEO (62)

What works
- HTTPS everywhere; `http://` and `www.` both 301 to `https://max-morph.com/`.
- `lang="en"`, viewport meta, single H1, 5 H2s in sensible order, valid semantic landmarks (`header`, `nav`, `main`, `footer`).
- Text assets are served gzip; fixed `?v=` hashes give cache-busting.
- No console errors on desktop or mobile.

Findings
| Severity | Finding | Fix |
|---|---|---|
| High | `/robots.txt` and `/sitemap.xml` are 404 | Add both at repo root; `Sitemap: https://max-morph.com/sitemap.xml` |
| High | `/backup/round-3/`, `/backup/coming-soon-v0/` live (200) | Remove them from the published branch (keep them in git history or a separate branch) or add `noindex` plus `Disallow` |
| High | No `<link rel="canonical">` | Add `<link rel="canonical" href="https://max-morph.com/">` |
| Medium | `logo-mark.png` (root) and `assets/maxmorph-mark.png`, `maxmorph-logo-transparent.png`, `maxmorph-motion.mp4` (2 MB) are published but not referenced by the page | Delete or move out of the Pages root; they are dead weight and crawlable |
| Low | No custom 404 page (GitHub default is served) | Add `404.html` with brand and a link home |
| Info | GitHub Pages fixes `Cache-Control: max-age=600` and offers no custom security headers (no CSP, HSTS preload control, X-Frame-Options, Referrer-Policy). Putting Cloudflare or similar in front would allow them | Optional |
| Info | Fonts load from Google Fonts (3 families, render-blocking stylesheet, third-party request) | See Performance |

## On-Page SEO (60)

- Title: "MaxMorph — Digital Maxillofacial Surgery" (40 chars). Brand-led, no service keyword. Suggest "Virtual Surgical Planning for Maxillofacial Surgery | MaxMorph" (≈60 chars).
- Meta description (≈150 chars) is good and contains the right terms.
- Open Graph: `og:title`, `og:description`, `og:image` present. Missing: `og:url`, `og:type`, `og:site_name`, `og:image:width/height/alt`, and all `twitter:*` tags. The OG image is a 1600×1600 PNG (830 KB); social platforms prefer 1200×630, and 830 KB slows preview fetch.
- H1 "From scan to surgery." is on-brand but has no query terms. Keep it for design, and put the target phrase in a visible subhead or the eyebrow ("DIGITAL MAXILLOFACIAL SURGERY" is already the closest thing). Spell out "Virtual Surgical Planning (VSP)" at first use, in the hero lede or the Platform H2 paragraph.
- Internal linking: only in-page anchors. With one page there is nothing else to link to, which ties back to the content-architecture issue.
- Favicon is a single 125×125 PNG; there is no `apple-touch-icon`, no 48 px/`.ico` fallback, no web manifest.
- No visible privacy policy, terms or cookie statement, although the site embeds Google Fonts and posts a contact form to a third party (formsubmit.co).

## Content Quality (58)

- About 550 visible words on the whole site. It is clearly written and well structured, but it is brochure-level.
- Strengths: a clear value proposition ("planned by a surgeon"), a concrete deliverables list (8 digital, 5 physical items), plain differentiation (clinician-led, pay-per-case), and descriptive image alt text.
- Gaps: no process page ("how a case works", turnaround time, input requirements, file formats, pricing model), no worked or anonymised case examples with before/after, no accuracy/validation data, no FAQ answering what surgeons actually search (e.g. "how long does VSP take", "what scan do I need", "who signs off the plan").
- E-E-A-T: Experience is claimed ("by a surgeon") but not evidenced. Add credentials, training, affiliations, publications and an About-page style bio. Trust: add company details (MaxMorph LLP registration, address or jurisdiction), regulatory position, and data-protection statement.
- Do not add FAQPage schema for Google benefit: Google retired FAQ rich results for all sites in May 2026. Add FAQ content for users and as passage-level answers, not for rich results.

## Schema / Structured Data (5)

None present. Recommended JSON-LD, all describing facts already on the page:
- `Organization` (MaxMorph LLP: name, url, logo, `email`, `sameAs` → LinkedIn) with `founder` → `Person`.
- `Person` for Dr. Meet Parekh (`jobTitle`, `image`, `sameAs`). Add only credentials you can document.
- `WebSite` (name, url).
- Optionally `MedicalBusiness` or `ProfessionalService` with `serviceType` once you have an address or service area. Do not use HowTo (deprecated).
- Validate with the Rich Results Test / Schema Markup Validator after adding.

## Performance (90)

Lab measurements, headless Chromium, datacenter network, cold cache:

| Metric | Desktop 1440×900 | Mobile 390×844 | Threshold |
|---|---|---|---|
| LCP | 1.36 s | 0.42 s | ≤ 2.5 s |
| CLS | 0.00005 | **0.108** | ≤ 0.1 |
| INP | not measurable in lab (no interaction recorded); JS is light (3 files, ~51 KB) | | ≤ 200 ms |
| Requests / weight | 15 / ≈1.16 MB | 14 / ≈0.83 MB | |
| Load event | 1.13 s | 0.61 s | |

- Mobile CLS is just over the "good" line. A likely source is the hero/logo block being un-hidden by script (`hero-logo` carries the `hidden` attribute in markup and is revealed by JS; it is `display:none` below 900 px) and the web-font swap. Reserve the space or avoid toggling layout on load. Re-measure after the change; one lab run is not enough to call it a regression.
- Four images are 195–320 KB WebP each (≈1 MB across the page on desktop). They are lazy-loaded and sized with width/height, which is good. Re-encode at lower quality or use responsive `srcset` for mobile.
- Google Fonts adds a third-party, render-blocking CSS request and a privacy consideration. Self-host the three families (`font-display: swap`).
- The 2 MB `maxmorph-motion.mp4` is not loaded by the page; confirm it is not needed and remove it.

## Images (78)

- 0 images missing `alt`; alt text is descriptive. The decorative hero logo has `alt=""` with an ARIA label on the wrapper, which is correct.
- All content images are WebP with explicit dimensions and lazy loading.
- Issues: OG image format and size (above); favicon set incomplete; original PNGs (`maxmorph-splash.png` 830 KB, `maxmorph-mark.png` 433 KB, `maxmorph-logo-transparent.png` 521 KB) are published but unused.

## AI Search Readiness / Agentic (45)

- No `robots.txt`, so all AI crawlers are allowed by default. That is fine, but it is not an explicit policy; add `robots.txt` with your intent.
- `llms.txt` is absent (404). It is optional and ignored by Google Search; add it only if you want a cheap, clean summary for other agents.
- Content is plain static HTML with all text server-delivered (no JS rendering needed), which is good for crawlers and answer engines.
- Citability is limited: few self-contained, factual passages (definitions, numbers, steps). The deliverables list and the "what sets us apart" blocks are the most quotable parts. Add definition-style paragraphs ("A virtual surgical plan is…") and a short process section.
- Entity clarity: the brand name, founder and LinkedIn profile are consistent, but there is no `sameAs` markup, so entity linking is weak. Search "MaxMorph" for brand collisions and consider a Google Business-free equivalent (LinkedIn company page, Crunchbase/Wikidata only if notable).
- Accessibility for agents: single H1, labelled nav and form fields, landmarks. Mobile has no visible navigation (nav is `display:none` under 900 px and no menu button replaces it), so there is no way to reach anchors except by scrolling; this also hurts human users and is the one accessibility/UX defect worth fixing first.
- No ai-catalog.json or WebMCP tools; not needed for this site.

## Contact form and conversion (supporting)

- The form posts to `formsubmit.co/admin@max-morph.com` (third-party relay; works only after the first-submission activation email). `_captcha=false` with a honeypot is a light spam control. For patient-related enquiries, state clearly that users must not send identifiable patient data through the form, and describe the secure upload route.
- `mailto:admin@max-morph.com` is in the HTML, so it will attract scraper spam; acceptable for a B2B address, but consider a role address such as `cases@`.

## Not run

Backlinks, GSC/GA4/CrUX field data, local/maps (no physical location detected), ecommerce, hreflang (single language), drift (no baseline) and DataForSEO. To get real ranking and indexation evidence, verify the domain in Google Search Console and re-run with credentials.
