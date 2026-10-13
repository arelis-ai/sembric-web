# sembric-web repository guidance

This is Sembric's public marketing website. It is static: prerendered React, nginx, Cloud Run behind a global HTTPS
load balancer at https://sembric.app.arelis.digital.

## Invariants

- **Truthful content.** Every product claim must be traceable to the Sembric repository's `AGENTS.md` or `docs/`.
  Sembric is available for pilots. No customer logos, testimonials, invented statistics, pricing, compliance
  certifications, or claims that open commercial gates (cross-tenant tests, failover, customer-scale load, recurring
  archive verification) are closed. Never describe ingestion, free-form SQL or agent access to source credentials as
  Sembric features. `tests/content.test.ts` must keep passing.
- **Same UI as the portal.** `src/styles/tokens.css` is a verbatim copy of the portal's token blocks; keep it identical
  (`node scripts/check-tokens.mjs <sembric>/apps/web/src/theme.css`). Use the portal's vocabulary: elevated surfaces
  with 1px borders, amber primary buttons, mono eyebrows, success/warning/danger status pills.
- **Static and script-optional.** Every page must be complete HTML without JavaScript. No client React, no third-party
  scripts, fonts or embeds, no cookies, no trackers.
- **CSP.** One inline script only (the pre-paint theme script in `src/Document.tsx`), allowed by hash. No `style=`
  attributes in markup, no inline event handlers, no new inline scripts. Headers come only from `scripts/headers.mjs`.
- **SEO and agents.** Each route in `src/routes.tsx` needs a unique title (≤ 60 chars) and description (70–160), and
  gets a canonical URL, OG/Twitter tags with a generated 1200×630 image, JSON-LD, a Markdown copy and llms.txt entry.
  Unknown paths return a real 404. Keep `robots.txt` open to search engines and named AI crawlers.
- **Accessibility.** WCAG 2.2 AA with zero axe violations on every route in both themes, desktop and mobile. Honour
  `prefers-reduced-motion`.
- **Delivery.** Deploy only through the workflow (by digest, via Workload Identity Federation). Never commit `.env`,
  `*.tfvars`, state, keys or the billing account. Pin actions and base images by SHA/digest.

## Verification

`npm run check`, `npm run test:e2e`, and for container or header changes `docker build` + `scripts/image-scan.sh` +
`E2E_BASE_URL=… npm run test:e2e` + Lighthouse CI. For `infra/`: `terraform fmt -check -recursive`, `terraform validate`,
`terraform test`, and a reviewed `terraform plan`.
