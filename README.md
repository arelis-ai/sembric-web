# sembric-web

The public website for [Sembric](https://sembric.app.arelis.digital), the governed data layer between customer-owned
warehouses and AI agents. Every page is prerendered React served as static files by nginx on Cloud Run, behind a
global HTTPS load balancer.

## Stack

- **Same UI as the Sembric portal:** React 19, Vite and TypeScript; Inter and JetBrains Mono from `@fontsource`;
  `lucide-react` icons; the portal's design tokens copied verbatim into `src/styles/tokens.css` (dark first, light
  through `data-theme`, remembered in `localStorage` under `sembric-theme`).
- **Static output:** `scripts/prerender.ts` renders every route with `react-dom/server` and derives Markdown copies,
  `llms.txt`, `llms-full.txt`, `sitemap.xml`, `robots.txt`, `/.well-known/security.txt`, per-page Open Graph images,
  icons and gzip variants. The only client script (`src/entry-client.ts`, about 2 KB) adds the theme toggle, tabs, copy
  buttons and scroll reveals; pages are complete without it.
- **Headers:** `scripts/headers.mjs` is the single source of the security headers and cache policy. The build writes
  the nginx snippet with the CSP hash of the one inline (pre-paint theme) script; `scripts/serve.mjs` applies the same
  headers locally.

## Develop

```bash
npm ci
npm run dev          # Vite dev server (styles and client script)
npm run build        # full static build into dist/ (+ dist-nginx/)
npm run preview      # serve dist/ on http://127.0.0.1:4173 with production headers
```

Pages live in `src/pages`, connector facts in `src/content/integrations.ts`, FAQs in `src/content/faqs.ts` and the route
registry (titles, descriptions, breadcrumbs, JSON-LD types) in `src/routes.tsx`. Bump `SITE.updated` in `src/site.ts`
when content changes; it feeds the sitemap and Markdown copies.

## Verify

```bash
npm run check                    # lint, format, typecheck, build, unit/SEO/CSP/content tests, links, npm audit
npx playwright install chromium
npm run test:e2e                 # every route × dark/light × desktop/mobile with axe (WCAG 2.2 AA), behaviour tests
docker build -t sembric-web:local .
bash scripts/image-scan.sh sembric-web:local      # Trivy: fails on fixable HIGH/CRITICAL
docker run --rm -p 127.0.0.1:8080:8080 sembric-web:local
E2E_BASE_URL=http://127.0.0.1:8080 npm run test:e2e
npx @lhci/cli@0.15.1 autorun --config=lighthouserc.json   # mobile: performance ≥ 0.95, others 1.0
node scripts/check-tokens.mjs ../sembric/apps/web/src/theme.css   # tokens identical to the portal
```

## Deploy

Pushes to `main` deploy automatically (`.github/workflows/deploy.yml`): verify → build the image once → push to Artifact
Registry → `gcloud run services update --image …@sha256:<digest>` → confirm the serving revision runs that digest →
`scripts/smoke.sh` against the live origin. GitHub authenticates with Workload Identity Federation, restricted to this
repository's numeric ID on `refs/heads/main`; there are no service-account keys. Pull requests run `.github/workflows/ci.yml`
(checks, e2e, container scan, e2e against nginx and Lighthouse CI), which branch protection requires.

Infrastructure is Terraform in [`infra/`](infra/README.md). See [operations](docs/operations.md) for rollback and
routine tasks, and [research](docs/research.md) for why the site is built this way.

## Content rules

Every product statement must be verifiable in the Sembric repository's `AGENTS.md` or `docs/`. Sembric is available
for pilots; do not add customer logos, testimonials, pricing, compliance certifications or claims that open commercial
gates are closed. `tests/content.test.ts` enforces the most common drift.
