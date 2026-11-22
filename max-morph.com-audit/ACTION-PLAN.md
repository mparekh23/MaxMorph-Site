# Action Plan: max-morph.com

Score 57/100. Each item: fix → how you would know it failed → leading indicator.

## Phase 1: Critical/High fixes (Week 1)
1. **Remove or noindex the backup pages.** Delete `backup/` from the published branch. Fail check: `curl -I https://max-morph.com/backup/round-3/index.html` still returns 200. Indicator: GSC "Duplicate" / "Crawled" counts drop.
2. **Add `robots.txt` and `sitemap.xml`** (`Sitemap:` line in robots). Fail check: both return 404. Indicator: sitemap shows "Success" in GSC.
3. **Add `<link rel="canonical" href="https://max-morph.com/">`.** Fail check: GSC selects a different canonical.
4. **Verify the domain in Google Search Console and Bing Webmaster Tools**, submit the sitemap. Needed for every later measurement.
5. **Add Organization + Person + WebSite JSON-LD.** Fail check: Rich Results Test/Schema validator reports errors.
6. **Add a mobile menu button.** Under 900 px the nav is hidden with no replacement.

## Phase 2: High-impact improvements (Weeks 2–3)
7. Rewrite title to "Virtual Surgical Planning for Maxillofacial Surgery | MaxMorph" and spell out "Virtual Surgical Planning (VSP)" near the top of the page.
8. Complete social tags: `og:url`, `og:type`, `og:site_name`, `og:image:width/height/alt`, `twitter:card=summary_large_image`; create a 1200×630 OG image (<150 KB).
9. Add privacy policy and terms pages, a "do not send identifiable patient data via this form" notice, and a data-handling statement.
10. Fix mobile CLS (0.108 → <0.1): reserve space for the logo/hero block and avoid late layout toggles; re-test several runs.
11. Self-host the Google Fonts.
12. Complete icons: 180 px `apple-touch-icon`, 48 px and 192/512 px icons, optional `.ico`.

## Phase 3: Content and authority (Month 2)
13. Split into real pages with their own titles, H1s and copy: Orthognathic planning, Trauma, Implantology, Reconstruction, Surgical guides & splints, How it works / pricing, About Dr. Parekh. Link them from nav and footer.
14. Add credentials, affiliations, publications, regulatory status and validation/accuracy evidence to the About content.
15. Publish 2–3 anonymised case studies (with consent) and populate the hidden testimonial/client sliders in `why.js` only with real entries.
16. Add a short, answer-style FAQ (turnaround, scan requirements, sign-off, file formats). Content only; do not expect Google FAQ rich results.

## Phase 4: Monitoring (Ongoing)
17. Run `/seo drift baseline https://max-morph.com` after Phase 1–2 ship, then `drift compare` after each deploy.
18. Monthly: GSC queries/indexation, Core Web Vitals field data once CrUX has enough traffic.
19. Optional: `llms.txt`, Cloudflare in front for security headers, 404 page, delete unused media (`maxmorph-motion.mp4`, duplicate logo PNGs).

## Quick wins (under an hour each)
robots.txt, sitemap.xml, canonical, delete `backup/`, title/OG tags, Organization JSON-LD, apple-touch-icon.
