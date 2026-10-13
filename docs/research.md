# Research: what a top-tier Sembric website needs

Researched 2026-10-13/14 against current vendor documentation and peer sites. Each finding below is mapped to the
feature that implements it in this repository. Sources are linked inline.

## 1. Peer B2B data and AI-infrastructure sites

Sites reviewed: Immuta, Atlan, Cube, Databricks Unity Catalog, Snowflake Horizon, Tailscale, Linear, Supabase,
MotherDuck, Vercel and modelcontextprotocol.io.

| Finding | Evidence | Implemented as |
| --- | --- | --- |
| Agents now appear in almost every hero ("for humans and agents"), so the phrase alone no longer differentiates. Compete on the mechanism. | [Immuta](https://www.immuta.com/), [Cube](https://cube.dev/), [Linear](https://linear.app/), [Unity Catalog](https://www.databricks.com/product/unity-catalog) | Hero leads with the mechanism: "Give AI agents certified answers, not warehouse access." (`src/pages/Home.tsx`) |
| The strongest pages tell the problem before the product: observation → why current approaches fail → mechanism diagram → 3–4 steps → proof → CTA. | Immuta, [Atlan](https://atlan.com/) | Home order: hero + gate diagram → "The problem" (four failure modes) → four steps → what an agent sees → comparison table → certification → change safety → sources → agents → FAQ → CTA. |
| One mechanism diagram plus dense, realistic product UI beats illustration. | Immuta, Linear, Cube | `GateDiagram` (warehouse → Sembric → agents), `AgentConsole` (answered/refused/withdrawn MCP calls) and `CertificationPanel` built with the portal's own tokens and status pills (`src/components/visuals.tsx`). |
| Proof is layered (logos, outcomes, quotes, badges). Sembric has no customer logos yet; invented stats are visible credibility leaks on peer sites. | Immuta's mismatched stat attribution, unsourced "30%+" claims elsewhere | Proof is verifiable engineering behaviour only ("No agent route accepts SQL", minimum group size in the source query, refused queries audited). An explicit "What we don't claim yet" box on `/security`. `tests/content.test.ts` fails the build on certifications, customer proof, prices, unsourced statistics or claims that open commercial gates are closed. |
| Two CTAs — a primary action and a technical secondary — repeated at hero, middle and end. | Tailscale, Vercel, Cube | "Request a pilot" + "See how it works" in the hero; secondary links to the workflow and security model mid-page; `CtaBand` at the end of every page. |
| Developer surfaces (Security, Integrations, Docs) live in the main navigation. | Cube, Tailscale, Linear | Nav: Product, Security, Integrations, Agents, About. Footer column "For agents" links llms.txt, llms-full.txt, the page's Markdown and the sitemap. |
| Sites selling to agent builders give agents Markdown and llms.txt; this doubles as product proof. | [Supabase llms.txt](https://supabase.com/llms.txt), MotherDuck, MCP | See §3. |

## 2. Technical SEO

| Finding | Evidence | Implemented as |
| --- | --- | --- |
| Titles and descriptions are truncated in results; keep titles ≈50–60 and descriptions ≈140–160 characters, unique per page. | [Google title links](https://developers.google.com/search/docs/appearance/title-link), [snippets](https://developers.google.com/search/docs/appearance/snippet) | Per-route `title`/`description` in `src/routes.tsx`; `tests/seo.test.ts` enforces ≤60 / 70–160 characters and uniqueness. |
| Self-referencing absolute canonical; one URL form; redirect the other. | [Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [trailing slashes](https://developers.google.com/search/blog/2010/04/to-slash-or-not-to-slash) | Canonical without trailing slash on every page; nginx and the preview server 301 `/x/` → `/x`; e2e test covers the redirect. |
| Open Graph needs title, type, image, url; images ≥1200×630; `summary_large_image` for X. | [ogp.me](https://ogp.me/), [Meta image guidance](https://developers.facebook.com/docs/sharing/webmasters/images/) | Per-page 1200×630 PNG rendered at build with satori + resvg in the portal's palette (`scripts/prerender.ts`); width/height/alt tags; the test checks PNG dimensions. |
| Organization, WebSite and BreadcrumbList are useful; `SoftwareApplication` rich results need ratings and prices (never fabricate); FAQ rich results were retired in May 2026, but visible FAQs still help users and LLMs. | [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [software app](https://developers.google.com/search/docs/appearance/structured-data/software-app), [FAQPage retirement](https://developers.google.com/search/docs/appearance/structured-data/faqpage) | One `@graph` per page (`src/seo/jsonld.ts`): Organization, WebSite, SoftwareApplication (no ratings or offers), the page node, BreadcrumbList and FAQPage where a visible FAQ exists. The test asserts every FAQ question and answer is visible on the page. |
| Sitemap: canonical absolute URLs; `priority`/`changefreq` ignored; `lastmod` only if accurate. | [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) | `sitemap.xml` lists exactly the canonical pages with a content revision date (`SITE.updated`), no priority or changefreq. |
| robots.txt at the root with a fully qualified `Sitemap:` line. | [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt) | Generated `robots.txt`; tested. |
| Unknown paths must return a real 404, not a 200 fallback; not every bot runs JavaScript. | [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | Prerendered `404.html` with `noindex`, served with status 404 by nginx; e2e test. |
| Static prerendering gives the best FCP, TBT and INP; rehydration hurts TBT/INP. | [Rendering on the web](https://web.dev/articles/rendering-on-the-web) | React 19 renders every page to static HTML at build (`renderToStaticMarkup`); no client React. The only script is 2 KB of progressive enhancement. |

## 3. Discoverability by AI agents

| Finding | Evidence | Implemented as |
| --- | --- | --- |
| llms.txt: H1 (required), blockquote summary, H2 link lists, `## Optional`. | [llmstxt.org](https://llmstxt.org/) | Generated `/llms.txt` with key facts, grouped links to every page's Markdown and an Optional section; tested for shape. |
| Markdown twins at `.md` URLs, discoverable via `rel="alternate" type="text/markdown"` and `rel="describedby"` to llms.txt. | llmstxt.org | Every page has `/<path>.md` (home: `/index.md`) derived from the same render with turndown, plus both link elements in `<head>` and a footer link. |
| `llms-full.txt` is a widely used convention (all content in one file). | Supabase | Generated `/llms-full.txt`. |
| Some coding agents (Claude Code, Cursor, OpenCode) send `Accept: text/markdown`. | [Checkly, 2026](https://www.checklyhq.com/blog/state-of-ai-agent-content-negotation/) | nginx serves the Markdown copy at the same URL for `Accept: text/markdown`, with `Vary: Accept`; e2e test. |
| Major AI crawlers do not execute JavaScript. | [Vercel/MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler) | All copy, navigation, metadata and JSON-LD are in the prerendered HTML; a no-JavaScript e2e test shows every tab panel. |
| Current crawler tokens: OpenAI `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`; Anthropic `ClaudeBot`, `Claude-SearchBot`, `Claude-User`; Perplexity `PerplexityBot`, `Perplexity-User`; Google `Google-Extended`, `Google-Agent`; Apple `Applebot-Extended`; `CCBot`; Meta `meta-externalagent`; Mistral `MistralAI-User`. | [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/guides/bots), [Google](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers), [Apple](https://support.apple.com/en-us/119829), [Meta](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/), [Mistral](https://docs.mistral.ai/robots/) | `robots.txt` allows `*` and names each token explicitly; the test requires GPTBot, OAI-SearchBot, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot and Google-Extended. |

## 4. Accessibility (WCAG 2.2 AA)

| Finding | Evidence | Implemented as |
| --- | --- | --- |
| Skip link, landmarks, one H1, no skipped heading levels, descriptive links, page language. | [WCAG 2.2 quickref](https://www.w3.org/WAI/WCAG22/quickref/) | Skip link to `#main`; `header`/`nav`/`main`/`footer`; one H1 per page (tested); diagram labels are not headings. |
| 2.4.11 Focus Not Obscured: sticky headers must not hide focus. | [New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) | `scroll-padding-top` matches the sticky header. |
| 2.5.8 Target Size: 24×24 px minimum. axe's `wcag22aa` tag covers only `target-size`, which is disabled by default. | [axe rule list](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) | e2e enables `target-size` explicitly and asserts it ran; buttons ≥36–44 px, footer links 30 px tall. |
| Run axe with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` on every route, in both themes. | [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) | `e2e/site.spec.ts`: every route × dark/light × desktop/mobile, zero violations required. |
| Honour `prefers-reduced-motion`; no auto-playing motion without need. | WCAG 2.2.2, 2.3.3 | Flow animations and scroll reveals only under `prefers-reduced-motion: no-preference`; e2e test with reduced motion asserts nothing is hidden or animated. |
| Scrollable regions must be keyboard-focusable. | axe `scrollable-region-focusable` | Code and console blocks are focusable with labels; tabs follow the ARIA pattern with arrow/Home/End keys (tested). |

## 5. Performance (Lighthouse mobile ≥95)

| Finding | Evidence | Implemented as |
| --- | --- | --- |
| Lighthouse weights TBT 30%, LCP 25%, CLS 25%; mobile simulates slow 4G and 4× CPU. | [Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring), [throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md) | No client framework; 2 KB script; LCP is text. Lighthouse CI runs on every pull request against the built container. |
| Self-host WOFF2, subset, preload only critical faces. | [Font best practices](https://web.dev/articles/font-best-practices) | `@fontsource` Inter and JetBrains Mono (Latin subsets, same packages as the portal); Inter 400 and 700 preloaded. |
| Hashed assets immutable for a year; HTML revalidated with ETag. | [HTTP cache](https://web.dev/articles/http-cache) | `scripts/headers.mjs` + `nginx/default.conf`: `/assets/` immutable, documents `max-age=0, must-revalidate` with ETag; tested. |
| Precompress text at build. | [Cloud CDN compression](https://docs.cloud.google.com/cdn/docs/dynamic-compression) | Build writes `.gz` variants; nginx `gzip_static on`. |

## 6. Security headers

| Finding | Evidence | Implemented as |
| --- | --- | --- |
| HSTS two years with includeSubDomains; omit `preload`, which would bind all of `arelis.digital`. | [MDN HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security), [hstspreload.org](https://hstspreload.org/) | `Strict-Transport-Security: max-age=63072000; includeSubDomains`. |
| Hash-based strict CSP; no `'unsafe-inline'`; header (not meta) so `frame-ancestors` works; ban inline style attributes. | [web.dev strict CSP](https://web.dev/articles/strict-csp), [MDN script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src) | `default-src 'none'`, `script-src 'self' 'sha256-…'` for the single pre-paint theme script, `style-src 'self'`, `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'none'`, plus `require-trusted-types-for 'script'`. The build fails if any page has a different inline script; tests reject `style=` attributes. |
| `nosniff`, explicit Referrer-Policy, Permissions-Policy with only recognised features (unknown ones log console errors), COOP, X-Frame-Options. | [OWASP secure headers](https://owasp.org/www-project-secure-headers/) | All set from `scripts/headers.mjs` and verified in the container and live. |
| security.txt (RFC 9116): `Contact` and one `Expires` under a year ahead. | [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) | Generated `/.well-known/security.txt` with a rolling one-year expiry; tested. |

## 7. Hosting on Cloud Run

| Finding | Evidence | Implemented as |
| --- | --- | --- |
| Cloud Run domain mapping does not support europe-west3 and is not production-ready. | [Domain mapping](https://docs.cloud.google.com/run/docs/mapping-custom-domains) | Global external Application Load Balancer (`EXTERNAL_MANAGED`) with a serverless NEG and a Google-managed certificate (`infra/`). |
| HTTP→HTTPS via a second URL map and port-80 forwarding rule on the same IP. | [Redirect setup](https://docs.cloud.google.com/load-balancing/docs/https/setting-up-http-https-redirect) | `google_compute_url_map.redirect` and an HTTP proxy on the same reserved address. |
| Ingress `internal-and-cloud-load-balancing` blocks direct run.app traffic. | [Ingress](https://docs.cloud.google.com/run/docs/securing/ingress) | Set on the service in Terraform. |
| Emit CSP from the container: the hash is a build artefact and the LB allows only 16 custom headers. | [Custom headers](https://docs.cloud.google.com/load-balancing/docs/https/custom-headers) | nginx serves all headers from the generated snippet. |
| GitHub Actions should use Workload Identity Federation with an attribute condition on numeric repository/owner IDs and the ref; deploy by image digest. | [google-github-actions/auth](https://github.com/google-github-actions/auth), [security considerations](https://github.com/google-github-actions/auth/blob/main/docs/SECURITY_CONSIDERATIONS.md) | WIF provider condition on `repository_id`, `repository_owner_id` and `refs/heads/main`; deploy job pushes to Artifact Registry and deploys `…@sha256:<digest>`. |

## Decisions not taken

- **Cloud CDN.** Not enabled initially: documents are revalidated on every request and assets are immutable, so the
  benefit is global latency, not correctness. Enabling it needs cache invalidation in the deploy job.
- **Brotli.** The unprivileged nginx image has no Brotli module; gzip variants are precompressed instead.
- **Customer logos, testimonials, pricing and compliance badges.** None exist that are verifiable today; the content
  test keeps them out until they do.
