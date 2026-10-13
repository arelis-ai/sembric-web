import { Database, EyeOff, Fingerprint, KeyRound, ScrollText, ShieldCheck } from 'lucide-react';
import { CheckList, CtaBand, FaqList, PageHero, Section } from '../components/ui';
import { SECURITY_FAQ } from '../content/faqs';

const PRINCIPLES = [
  {
    icon: Database,
    title: 'Data stays in its source',
    body: 'Sembric stores metadata, definitions, classifications, checks, certificate state and audit records. Source rows are read by bounded queries in your engine and never copied into Sembric.',
  },
  {
    icon: ShieldCheck,
    title: 'Your engine stays authoritative',
    body: 'Queries run as the customer identity mapped to the acting Sembric role, so source row and column policies keep applying. Sembric only narrows access further.',
  },
  {
    icon: EyeOff,
    title: 'No SQL from agents',
    body: 'No agent route accepts SQL. Query builders accept declared fields only, bind every value as a typed parameter and enforce bounded limits.',
  },
  {
    icon: Fingerprint,
    title: 'Fail closed',
    body: 'Schema drift, reclassification, an extra or missing result column, an oversized response or a stale source version stops the release rather than passing it on.',
  },
  {
    icon: KeyRound,
    title: 'Revocable credentials',
    body: 'Agent keys are random, stored as digests, shown once, expire within 90 days and can be revoked immediately. Members’ roles are re-read on every request.',
  },
  {
    icon: ScrollText,
    title: 'Everything recorded',
    body: 'Every agent query is audited, answered or refused, with a caller naming its channel and the public key identifier. Session tokens and their hashes are never recorded.',
  },
];

export function Security() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title="A security model built around your source, not around trust in the agent"
        lede="Sembric assumes agents will ask for things they shouldn’t. It answers only from reviewed, certified definitions, keeps your warehouse in charge of row and column access, and records every decision."
      />

      <Section id="principles" eyebrow="Principles" title="Six rules Sembric does not bend">
        <ul className="card-grid card-grid-3">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card reveal">
              <Icon aria-hidden="true" size={20} className="card-icon" />
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="identity"
        tone="sunken"
        eyebrow="Identity and access"
        title="People, agents and source identities stay separate"
      >
        <div className="card-grid card-grid-3">
          <article className="card reveal">
            <h3>People</h3>
            <CheckList
              items={[
                'Portal single sign-on through your OIDC provider with authorization code and PKCE; a configured hosted domain is checked in the signed token.',
                'Browser sessions are random tokens stored as SHA-256 digests in HttpOnly, SameSite=Strict cookies and expire after eight hours.',
                'Removing a member deletes their sessions and revokes their API keys in the same transaction.',
              ]}
            />
          </article>
          <article className="card reveal">
            <h3>Agents</h3>
            <CheckList
              items={[
                'Short-lived Sembric keys with one-, seven- or 30-day lifetimes, inheriting the issuing member’s current role.',
                'Optional OIDC access tokens must be signed by the configured issuer, target the exact /mcp resource, carry sembric:read and map to one verified member.',
                'Owners can revoke any member’s key; engineers monitor agents but revoke only their own keys.',
              ]}
            />
          </article>
          <article className="card reveal">
            <h3>Sources</h3>
            <CheckList
              items={[
                'Only owners connect sources, test role identities or change mappings; engineers may rediscover.',
                'Each Sembric role maps to a distinct, narrow customer identity; connectors refuse administrative, write and ownership privileges they can detect.',
                'Source secrets are runtime-only references. The portal shows names of references, never values, and agents never see either.',
              ]}
            />
          </article>
        </div>
      </Section>

      <Section
        id="query-safety"
        eyebrow="Query safety"
        title="What happens on every agent query"
        intro="Each step runs on every call to the API or MCP, for every connector."
      >
        <ol className="timeline reveal">
          <li>
            <strong>Authenticate and authorize.</strong> Resolve the key or token to a current member and role; refuse
            ungranted or uncertified surfaces and audit the refusal.
          </li>
          <li>
            <strong>Validate against the definition.</strong> Accept only declared fields, typed filters and a bounded
            limit, and recheck the definition against the current classification.
          </li>
          <li>
            <strong>Reserve budget.</strong> Atomically reserve the live schema check and the data statement against the
            workspace minute and day budgets; a refusal at this boundary consumes nothing and contacts no source.
          </li>
          <li>
            <strong>Check the live schema.</strong> Compare it with the certified fingerprint and stop on any drift.
          </li>
          <li>
            <strong>Run a parameterized read.</strong> Execute under the role’s source identity with the source’s own
            policies, deadlines and response bounds.
          </li>
          <li>
            <strong>Verify the result.</strong> Release rows only if their keys exactly match the approved shape and the
            serialized size stays within the cap.
          </li>
          <li>
            <strong>Recheck access.</strong> Re-read membership, role, the calling credential and the certificate before
            returning rows, then record the outcome.
          </li>
        </ol>
      </Section>

      <Section
        id="privacy"
        tone="sunken"
        eyebrow="Privacy in aggregates"
        title="Small groups, handled honestly"
        intro="A data product can set a reviewed minimum group size. The source query adds HAVING COUNT(*) >= n, so smaller groups — and filters that would isolate them — return no row in previews, certification, the API and MCP."
      >
        <p className="callout reveal">
          Threshold suppression is not complementary suppression. When a released total and the other released groups
          differ by exactly one withheld group, a caller could derive it by subtraction. For person-level data, keep
          dimensions coarse or don’t grant the product to roles that should never see small groups.
        </p>
      </Section>

      <Section id="audit" eyebrow="Audit and operations" title="Evidence you can hand to an auditor">
        <CheckList
          items={[
            'Audit records cover source connection and discovery, classification, product changes, certification and failed checks, expiry, keys, invitations and every product and view query.',
            'In the isolated Cloud SQL runtime, committed audit events are archived to create-only objects in a bucket in a separate backup project with a locked retention policy; the runtime cannot delete objects or administer the bucket.',
            'Owners export workspace-scoped audit events as JSONL, one date range of up to 31 days at a time.',
            'Notifications and outbox rows carry a title and a portal link only — never check details, source values, credentials or invitation links.',
            'The runtime logs the request path only: never query strings, cookies, tokens, keys or source rows.',
          ]}
        />
      </Section>

      <Section
        id="cost"
        tone="sunken"
        eyebrow="Cost controls"
        title="Bounded by design, honest about the limits"
        intro="Every statement submitted to a source consumes persistent workspace read budgets before contact — 120 per minute and 5,000 per UTC day by default — including previews, certification checks, catalog pages and schema reads."
      >
        <CheckList
          items={[
            'BigQuery jobs also reserve a workspace UTC-day billed-byte allowance before job creation, capped by the source’s per-query maximumBytesBilled.',
            'Snowflake, Databricks, PostgreSQL and MySQL apply statement timeouts and bounded responses; Trino sets coordinator-side run-time and physical-scan settings.',
          ]}
        />
        <p className="callout reveal">
          These are on-demand query controls, not invoice limits. They do not cap warehouse credits, DBUs, capacity
          pricing or storage. Keep your own project budgets, quotas and billing alerts.
        </p>
      </Section>

      <Section
        id="deployment"
        eyebrow="Deployment"
        title="Isolation per customer"
        intro="Sembric’s commercial deployment design gives each customer its own Google Cloud workload project, a separate backup project and its own Cloud SQL instance, with the serving and migration identities kept apart."
      >
        <CheckList
          items={[
            'Serving traffic leaves through a customer-specific NAT address that public sources can allowlist. It is a stable address, not a destination firewall.',
            'Cloud Armor applies a strict sign-in throttle and a configurable per-client edge limit.',
            'Local DuckDB files are pilot-only and are disabled at startup in the isolated customer runtime.',
          ]}
        />
        <aside className="status-note reveal" aria-labelledby="status-note-title">
          <h3 id="status-note-title">What we don’t claim yet</h3>
          <p>
            Sembric is available for pilots. Its commercial acceptance gates — including a second-plane cross-tenant
            test, Cloud SQL failover, customer-scale load and recurring archive-integrity verification — are still open,
            and Sembric holds no third-party security certification today. We share the current evidence with pilot
            customers on request.
          </p>
        </aside>
      </Section>

      <FaqList items={SECURITY_FAQ} />
      <CtaBand
        title="Review the model with your security team"
        body="We’ll walk through identities, policies, audit evidence and the open gates with the people who need to sign off."
      />
    </>
  );
}
