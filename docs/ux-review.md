# UI/UX review

A surface-by-surface evaluation of the site against current UI/UX practice for B2B infrastructure sites, with the change
made for each finding and how it is verified. Run on 2026-10-14 against every route at 320, 390, 768, 1024 and 1440 px,
in both themes, with keyboard, reduced-motion, no-JavaScript and screen-reader semantics checked.

## Method

- Full-page screenshots of every route (desktop 1440 px and mobile 390 px, dark and light), reviewed section by section.
- A scripted audit at five widths for horizontal page overflow, interactive targets under 24 × 24 px, text under 12 px,
  and scroll regions that hide content at desktop widths.
- Interaction checks: keyboard focus order and visibility, the mobile menu, tabs, in-page anchors, copy buttons.
- The existing gates: axe (WCAG 2.2 AA) on every route, theme and viewport; Lighthouse CI (mobile).

## Findings and changes

### Site chrome

| Finding                                                                                                                | Practice                                                    | Change                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| The current page in the header was marked only by a slightly lighter label.                                            | Make "you are here" obvious without relying on colour alone. | An accent bar under the current section's link; the mobile menu marks it with a bar and a background.                                     |
| The mobile menu stayed open on Escape or a click outside it, and its pilot link looked like any other item.            | Disclosure menus dismiss predictably and return focus.       | Escape closes it and returns focus to the button; outside clicks and link choices close it; the pilot link is a full-width primary button. |
| The header's blur never applied in Chromium: the minifier kept only `-webkit-backdrop-filter`.                         | Sticky bars must stay legible over content.                  | Declaration order fixed so both forms survive minification; `tests/styles.test.ts` fails if the unprefixed form disappears.                |
| The theme toggle had no visible tooltip and no announcement.                                                           | Icon-only controls need a name sighted users can discover.   | The toggle's label is also its `title`; switching announces the new theme through a polite live region.                                   |
| Breadcrumbs sat outside the hero, on the plain page background, above a visible seam.                                  | Wayfinding belongs to the page header it describes.          | Breadcrumbs render inside the page hero (and stay out of the Markdown copies).                                                            |
| The footer repeated "Arelis AI" twice and long pages had no quick way back up on phones.                               | Footers summarise, not repeat.                               | A single copyright line and a "Back to top" link to `#main`.                                                                              |
| No `::selection` colour; anchor jumps were instant even when motion was allowed.                                       | Polish details that match the brand.                         | Accent-tinted selection; smooth scrolling only under `prefers-reduced-motion: no-preference`.                                             |

### Page structure (all inner pages)

| Finding                                                                                                               | Practice                                                          | Change                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product, Security, Agents and integration pages run 4,000–7,000 px with no way to see or jump to their parts.         | Long reference pages offer "On this page" navigation.             | A sticky "On this page" bar under the header. With scripting, the section being read is marked `aria-current="location"` and kept scrolled into the bar. |
| Sections had no `id`, so no part of a page could be linked to.                                                        | Every major section is deep-linkable.                             | Every section carries its anchor id; jumps land the eyebrow just below the sticky bars (`scroll-margin-top`).                                             |
| Page heroes ended in text only; the next step meant scrolling to the bottom call-to-action.                           | Each page states its primary action above the fold.               | Contextual hero actions: e.g. "Connect an agent" on Agents, "Setup steps" on each integration, "Email a pilot request" on Contact.                       |
| Text-only sections (check lists, prose, FAQs) left the right half of wide screens empty and doubled the scroll length. | Use the width: heading beside content for reading-heavy sections. | An `aside` section layout: the heading sticks in a left column beside the content from 1,021 px; it stacks below that.                                    |
| Two plain sections in a row merged into one 192 px gap (e.g. Security's Deployment → FAQ).                           | Consistent rhythm and visible section boundaries.                 | Consecutive plain sections share an inset divider and normal spacing; the gap after the hero was also reduced.                                           |
| Code-like terms in intros (`HAVING COUNT(*) >= n`, `sembric_query_product`, `YYYY-MM-DD`) were plain text.             | Distinguish literal values typographically.                       | Rendered as inline code.                                                                                                                                  |

### Home

| Finding                                                                                                     | Practice                                         | Change                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The hero lede was 54 words, eight centred lines on a phone.                                                 | Hero copy is scannable in one breath.            | Tightened to 44 words; field classification is left to the four steps below it.                                                                                                                                      |
| No scannable proof points between the diagram and the problem statement.                                    | Lead with concrete, verifiable facts.            | A facts band: 6 engines, 8 read-only MCP tools, 0 agent routes that accept SQL, 30-day certificates. Each is stated in the Sembric docs; no customer counts or market statistics. |
| Agent console code overflowed its pane at desktop widths (the `filters` line was cut off).                   | Code samples fit their frame at common widths.    | Samples re-wrapped; panes scroll only on phones, with edge shadows that show more content exists.                                                                                |
| Comparison table: wrapped text slid under its bullet, the "direct" column had no marker, and on phones three 90 px columns wrapped every word. | Comparison tables read at a glance on any screen. | ✕ and ✓ markers per cell, a tinted "Through Sembric" column, and below 640 px each concern becomes a labelled card. Explicit table roles keep the semantics when stacked.          |
| The certification panel broke `sum(net_amount)` mid-word in a four-column grid.                             | Never break identifiers.                         | The metadata is a 2 × 2 grid everywhere.                                                                                                                                         |
| Integration cards on the home page lacked the "Details →" affordance the index had.                          | One card pattern, one behaviour.                 | Shared `LinkCards` component: whole-card target, hover border and arrow nudge, visible focus ring, used on home, index, integration and 404 pages.                                |
| "One MCP endpoint. Eight read-only tools." showed one button and no tools.                                   | Show, don't tell.                                | A `tools/list` panel with all eight tools grouped by surface (data products, governed views, ontology), beside three facts and two actions; the Agents page keeps the full descriptions.                                                                              |
| FAQs used a 860 px column with the rest of the row empty.                                                   | FAQ beside its heading, with a way out.          | `aside` layout plus "Something else? Ask us directly." on every FAQ; questions highlight on hover.                                                                                |

### Contact

| Finding                                                                                           | Practice                                                 | Change                                                                                                                       |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| The mailto link opened an empty message although the page listed what to include.                 | Reduce effort at the conversion point.                   | Every pilot email link pre-fills the subject and the four prompts, with a reminder not to send credentials or customer data. |
| `mailto:` does nothing on machines without a mail client.                                          | Always offer a fallback for mailto.                      | A "Copy address" button; the result is announced to screen readers.                                                          |
| Nothing said what a pilot involves.                                                                | Set expectations before asking for contact.             | "What a pilot covers": connect one source, certify a first surface, query it from an agent, each step as the docs describe.  |

### Integrations, About, Privacy and 404

- Integration pages use the shared FAQ component (so their FAQ matches its JSON-LD the same way as every other page),
  a numbered setup timeline, and "Other integrations" as cards with each engine's kind instead of bare pills.
- About and Privacy use the `aside` layout; the Privacy page's inline email links no longer render as flex boxes.
- The 404 page offers a primary "Go to the home page" action and six described destinations instead of pills.

### Accessibility preferences

| Preference                   | Change                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `forced-colors: active`      | Buttons, toggles, pills and the current in-page link keep a `CanvasText` border; check marks stay visible. |
| `prefers-contrast: more`     | Borders use the strong border colour and secondary text uses the primary text colour.                      |
| `prefers-reduced-motion`     | Unchanged guarantees, plus smooth scrolling only when motion is allowed.                                   |
| Print                        | Sticky bars, hero actions and copy buttons are hidden; every FAQ answer opens before printing.            |
| Text size                    | Every label is at least 12 px (`tests/styles.test.ts`).                                                    |

## Decisions not taken

- **No in-page navigation on the home page.** It is a narrative read top to bottom, and the header links every topic page.
- **No third-party logos** for the six engines: names and descriptions only, as the content rules require.
- **No Claude Code CLI snippet** on the Agents page: the Sembric docs do not document one, so the page shows only the
  documented curl and Messages API connector samples.

## Verification

- `npm run check`: lint, format, types, build, unit tests (including `tests/styles.test.ts` for the page-navigation,
  breadcrumb, Markdown, stylesheet and minimum-size rules), internal links and fragments, audit.
- `npm run test:e2e`: axe on every route × theme × viewport, plus tests for the mobile menu's dismissal and focus return,
  in-page navigation and its landing position, the pre-filled pilot email and copy button, the stacked comparison table,
  and no horizontal overflow at 320 px on any page.
- Lighthouse CI (mobile) on home, an integration page and Security in CI.
