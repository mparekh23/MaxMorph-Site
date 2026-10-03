# MaxMorph website

Static single-page site for [max-morph.com](https://max-morph.com) (GitHub Pages, no build step).

Sections: Home, Platform, Applications, What You Receive, About MaxMorph, Contact.

- `index.html`, `styles.css`, `script.js` — site
- `assets/logo-base.webp` — the static hero artwork (skull + the golden network that is embedded in it), 3× resolution with its background removed
- `why.js` — the testimonials and clients cards in the About section; they stay hidden until real entries are added at the top of this file
- `logo.js` — animates the floating left side of the golden network (redrawn as vectors) and runs light pulses along the golden lines over the static artwork
- `assets/maxmorph-logo-transparent.png` — the full-size transparent logo (not used by the page; for reuse)
- `assets/` — other brand assets (mark, splash, motion video)
- `backup/coming-soon-v0/` — the original "launching soon" page
- `backup/round-3/` — snapshot of the site after the third round of edits (open `backup/round-3/index.html`)

## Hosting note: keep this site informational

This site is hosted on GitHub Pages. GitHub's terms do not allow Pages to be used as a free host for an online business or store, or for a site that is primarily about facilitating commercial transactions or providing commercial software as a service (SaaS). Check GitHub's current Pages terms before relying on this.

An informational site is fine: it explains MaxMorph and lets visitors send a message through the contact form. **Do not add the following to this site while it is on GitHub Pages:**

- online payments, a pay-per-case checkout or invoicing
- client logins, accounts or a dashboard
- case upload or any web app that delivers the service itself
- patient-identifiable data of any kind (Pages has no secure backend)

If any of these are needed, move hosting first (Cloudflare Pages and Netlify's free plan both allow commercial sites; Vercel's free plan does not). The site is plain static files, so moving needs no rebuild: connect the repository to the new host and point the domain's DNS at it. Email for the domain runs on Google Workspace, so its MX/SPF/DKIM records must be kept when DNS is changed.
