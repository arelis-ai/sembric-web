import type { Faq } from './types';

export const HOME_FAQ: Faq[] = [
  {
    q: 'Does Sembric copy or move our data?',
    a: 'No. Customer data stays in its source. Sembric stores metadata, definitions, classifications, checks, certificate state and audit records, and runs bounded, parameterized reads in your engine when a certified surface is queried.',
  },
  {
    q: 'Can an agent run its own SQL through Sembric?',
    a: 'No. No agent route accepts SQL. Agents choose from declared dimensions, typed filters and a bounded limit on surfaces certified for their role, and Sembric builds the source query.',
  },
  {
    q: 'How is this different from giving an agent a read-only service account?',
    a: 'A read-only account can still read every table it can see and lets the model write any query. Sembric narrows that to reviewed fields and certified definitions, checks the answers before release, rechecks access after every source query, and audits each call — answered or refused.',
  },
  {
    q: 'Which agents can use Sembric?',
    a: 'Any client that speaks the Model Context Protocol over HTTP, such as Claude Code, plus applications that call the typed REST API. Agents authenticate with a short-lived, revocable Sembric key or a user-linked token from your identity provider.',
  },
  {
    q: 'What happens when a table’s schema changes?',
    a: 'Before every query Sembric compares the live schema with the certified fingerprint. A mismatch stops the query until the source is rediscovered, reviewed and recertified.',
  },
  {
    q: 'Is Sembric generally available?',
    a: 'Sembric is available for pilots. Its commercial release depends on acceptance gates that are still open, and we share the current evidence with pilot customers.',
  },
];

export const PRODUCT_FAQ: Faq[] = [
  {
    q: 'What is the difference between a data product and a governed view?',
    a: 'A data product is one aggregate measure — sum, count, distinct count, average, minimum or maximum — over approved dimensions. A governed view projects approved columns with optional fixed row restrictions. Both carry business context, role grants and expected-answer checks.',
  },
  {
    q: 'Who can certify a surface?',
    a: 'An owner or engineer who is neither the surface’s current owner nor its last definition editor. They run two distinct expected-answer checks under every granted role’s source identity before certifying.',
  },
  {
    q: 'How long does a certificate last?',
    a: 'Thirty days by default. In the last seven days an independent reviewer can renew it by re-running every check. An expired certificate is withdrawn, recorded and never renewed; the surface returns to draft.',
  },
  {
    q: 'How do aggregates protect people in small groups?',
    a: 'A product can set a reviewed minimum group size, enforced in the source query with HAVING COUNT(*) >= n. It withholds small groups but is not complementary suppression, so keep person-level dimensions coarse.',
  },
];

export const SECURITY_FAQ: Faq[] = [
  {
    q: 'Can Sembric see our warehouse credentials?',
    a: 'The Sembric runtime holds the customer identities mapped to each role as runtime-only secrets. Agents never receive source credentials, and the portal shows only names of secret references, never values.',
  },
  {
    q: 'What does Sembric record about agent activity?',
    a: 'Every agent query, answered or refused, with a caller naming its channel and, for keys, the public key identifier. Session tokens and their hashes are never written to audit details.',
  },
  {
    q: 'Does Sembric limit warehouse spend?',
    a: 'Every statement consumes persistent workspace minute and day read budgets before contact, and BigQuery jobs reserve a daily billed-byte allowance. These are on-demand query controls, not invoice limits.',
  },
];

export const AGENTS_FAQ: Faq[] = [
  {
    q: 'Does Sembric work with Claude?',
    a: 'Yes. Claude Code and other MCP clients connect to Sembric’s HTTP MCP endpoint, and the Claude Messages API MCP connector can use the same endpoint with a short-lived key.',
  },
  {
    q: 'What happens when we revoke a key?',
    a: 'The agent is refused on its next call. Sembric also rechecks membership, role, the calling credential and the certificate after each source query, so a revocation during a query withholds its result.',
  },
  {
    q: 'Why would a query come back empty or refused?',
    a: 'A query matching more rows than its limit is refused with narrowing guidance rather than truncated, and a product’s minimum group size omits small groups. Undeclared fields, ungranted roles and uncertified surfaces are refused and audited.',
  },
];
