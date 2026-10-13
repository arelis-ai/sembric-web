import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CircleHelp,
  Copy,
  Fingerprint,
  Gauge,
  KeyRound,
  RefreshCw,
  ScanSearch,
  ScrollText,
  Tags,
  UserX,
  Workflow,
} from 'lucide-react';
import { CertificationPanel, AgentConsole, GateDiagram } from '../components/visuals';
import { CheckList, CtaBand, FaqList, PilotButtons, Section } from '../components/ui';
import { HOME_FAQ } from '../content/faqs';
import { INTEGRATIONS } from '../content/integrations';

const PROBLEMS = [
  {
    icon: KeyRound,
    title: 'Credentials and raw SQL',
    body: 'The quickest integration hands an agent a service account and lets the model write queries. That account can read every table it can see, and nobody reviewed the query it just ran.',
  },
  {
    icon: Copy,
    title: 'Copies that drift',
    body: 'Exporting tables into a new store for agents creates one more copy to secure. Warehouse policies do not follow the data, and the numbers start to disagree with the source.',
  },
  {
    icon: CircleHelp,
    title: 'Answers nobody vouches for',
    body: 'A model that writes its own joins can return a confident, wrong figure. There is no business definition, owner or check behind it, and no way to tell a good answer from a lucky one.',
  },
  {
    icon: ScrollText,
    title: 'No record and no limits',
    body: 'When an answer is questioned, teams cannot say which agent asked what, under which identity, or what it was refused. Nothing bounds how much an agent can ask the warehouse for.',
  },
];

const STEPS = [
  {
    icon: ScanSearch,
    label: '01 · Discover',
    title: 'Connect what you already run',
    body: 'An owner connects a warehouse with a read-only customer identity per Sembric role. Sembric reads the catalog of existing tables and views. It never ingests, copies or transforms rows.',
  },
  {
    icon: Tags,
    label: '02 · Classify',
    title: 'Review every field',
    body: 'Columns that look personal start sensitive. The asset’s data steward reviews its classification before anything is published, and sensitive fields can never become measures, dimensions or view columns.',
  },
  {
    icon: BadgeCheck,
    label: '03 · Certify',
    title: 'Prove the answer first',
    body: 'Define an aggregate data product or a governed view with business context. A reviewer who is neither its owner nor its last editor runs expected-answer checks under every granted role, then certifies it for 30 days.',
  },
  {
    icon: Workflow,
    label: '04 · Serve',
    title: 'Agents query only that',
    body: 'Agents discover and query certified surfaces through MCP or the typed API: declared fields, typed filters and bounded limits. Every call is audited, answered or refused.',
  },
];

const COMPARISON = [
  [
    'Access',
    'A shared service account that can read whatever it can see',
    'Certified surfaces granted to the caller’s current role',
  ],
  ['Interface', 'Free-form SQL written by the model', 'Typed tools over declared fields, filters and limits'],
  ['Data movement', 'Exports and copies into new stores', 'Data stays in your warehouse or lakehouse'],
  ['Correctness', 'Model-written joins with no review', 'Business definitions with independent expected-answer checks'],
  ['Change', 'Schema and policy changes go unnoticed', 'Drift or reclassification withdraws access automatically'],
  ['Accountability', 'Little or no record of agent activity', 'Every agent query audited, answered or refused'],
  ['Load', 'Nothing bounds what an agent asks for', 'Persistent workspace read budgets before every statement'],
];

const CHANGES = [
  {
    icon: Fingerprint,
    title: 'Schema drift stops queries',
    body: 'Before each query Sembric compares the live schema with the certified fingerprint. A mismatch stops the query until the source is rediscovered, reviewed and recertified.',
  },
  {
    icon: Tags,
    title: 'Reclassification withdraws',
    body: 'Mark a column sensitive and every product or view that uses it returns to draft. Re-reviewing cannot quietly recertify an unchanged draft.',
  },
  {
    icon: UserX,
    title: 'Revocation is immediate',
    body: 'Membership, role, the calling key and the certificate are rechecked after every source query, so a revocation mid-query withholds the rows.',
  },
  {
    icon: CalendarClock,
    title: 'Certificates expire',
    body: 'Certificates last 30 days by default. Renewal in the final week re-runs every check; an expired surface returns to draft with an audit record.',
  },
  {
    icon: RefreshCw,
    title: 'Source edits reset trust',
    body: 'Editing or pausing a source withdraws dependent reviews and certificates in one transaction. Resuming requires rediscovery and recertification.',
  },
  {
    icon: Gauge,
    title: 'Budgets before contact',
    body: 'Every statement reserves workspace minute and day read budgets before reaching the source, and BigQuery jobs reserve a daily billed-byte allowance.',
  },
];

export function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="container hero-inner">
          <p className="hero-badge">
            <span className="status-dot" aria-hidden="true" /> The governed data layer for AI agents
          </p>
          <h1 id="hero-title">
            Give AI agents certified answers, <span className="accent">not warehouse access.</span>
          </h1>
          <p className="hero-lede">
            Sembric sits between the warehouse you already run and the agents your teams are building. Your people
            classify fields and certify the exact aggregates and views agents may use. Agents query only those certified
            surfaces through MCP or a typed API, with no SQL, no copied data and an audit record for every call.
          </p>
          <PilotButtons secondary={{ href: '/product', label: 'See how it works' }} />
          <p className="hero-sources">
            Works with{' '}
            {INTEGRATIONS.map((integration, index) => (
              <span key={integration.slug}>
                <a href={`/integrations/${integration.slug}`}>{integration.name}</a>
                {index < INTEGRATIONS.length - 2 ? ', ' : index === INTEGRATIONS.length - 2 ? ' and ' : ''}
              </span>
            ))}
            .
          </p>
          <GateDiagram />
        </div>
      </section>

      <Section
        id="problem"
        eyebrow="The problem"
        title="Every company wants agents on its data. Today’s shortcuts put the data at risk."
        intro="Teams are under pressure to connect AI agents to business data. The fastest paths hand an agent far more than the answer it needs, and leave nobody accountable for what it says."
      >
        <ul className="card-grid card-grid-4">
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card problem-card reveal">
              <Icon aria-hidden="true" size={20} className="card-icon card-icon-warn" />
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="how"
        tone="sunken"
        eyebrow="How Sembric works"
        title="A governed path from table to agent, in four steps"
        intro="Sembric does not add another copy of your data. It adds review, certification and enforcement between the data you already govern and the agents that need answers."
      >
        <ol className="steps">
          {STEPS.map(({ icon: Icon, label, title, body }) => (
            <li key={label} className="step reveal">
              <div className="step-icon">
                <Icon aria-hidden="true" size={20} />
              </div>
              <p className="step-label">{label}</p>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
        <p className="section-more">
          <a href="/product">
            Read the full workflow <ArrowRight aria-hidden="true" size={14} />
          </a>
        </p>
      </Section>

      <Section
        id="agent-view"
        eyebrow="What an agent sees"
        title="Answers when it’s certified. Refusals when it isn’t."
        intro="Agents get typed tools, business definitions and caveats, never a connection string. Anything outside a certified surface is refused before a source query runs, and recorded."
      >
        <div className="split">
          <AgentConsole />
          <div className="split-copy reveal">
            <h3>Agents can</h3>
            <CheckList
              items={[
                'List the certified products and views granted to their role',
                'Group by up to three declared dimensions, including day to year time grains',
                'Filter with typed equality, value lists of up to 50, and ranges on numeric, date and time fields',
                'Read definitions, caveats and the concepts a surface grounds',
              ]}
            />
            <h3>Agents cannot</h3>
            <CheckList
              tone="no"
              items={[
                'Send SQL or reach source credentials',
                'See undeclared, sensitive or nested fields',
                'Query drafts, expired or withdrawn surfaces',
                'Release groups smaller than a product’s reviewed minimum',
              ]}
            />
          </div>
        </div>
      </Section>

      <Section
        id="compare"
        tone="sunken"
        eyebrow="Shortcut vs. Sembric"
        title="The difference between access and a governed answer"
      >
        <div className="table-wrap reveal">
          <table className="compare-table">
            <caption className="sr-only">
              Connecting agents directly compared with connecting them through Sembric
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Concern</span>
                </th>
                <th scope="col">Direct agent access</th>
                <th scope="col">Through Sembric</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([concern, direct, sembric]) => (
                <tr key={concern}>
                  <th scope="row">{concern}</th>
                  <td className="compare-direct">{direct}</td>
                  <td className="compare-sembric">{sembric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        id="certify"
        eyebrow="Certification"
        title="At least two people stand behind every certified answer"
        intro="The person who defines a surface can’t certify it. An independent reviewer runs distinct expected-answer checks under each granted role’s own source identity, so row policies that change answers per role are caught during review."
      >
        <div className="split split-reverse">
          <CertificationPanel />
          <div className="split-copy reveal">
            <CheckList
              items={[
                'Classification review by the asset’s assigned data steward comes first',
                'The reviewer must differ from both the current owner and the last definition editor',
                'Each granted role needs distinct checks; a check can override its expected answer per role',
                'Governed views also prove every granted identity can read the approved projection',
                'The reviewed asset fingerprint must stay unchanged through the final check',
              ]}
            />
            <p className="section-more">
              <a href="/security">
                See the security model <ArrowRight aria-hidden="true" size={14} />
              </a>
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="change"
        tone="sunken"
        eyebrow="Safe by default"
        title="When something changes, access stops"
        intro="Governance that only holds on the day of review isn’t governance. Sembric withdraws access as soon as the facts behind a certificate change."
      >
        <ul className="card-grid card-grid-3">
          {CHANGES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card reveal">
              <Icon aria-hidden="true" size={20} className="card-icon" />
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="sources"
        eyebrow="Your warehouse stays in charge"
        title="Built on the engines and policies you already trust"
        intro="Sembric queries with the customer identity mapped to each Sembric role, so the source engine’s own row and column policies keep applying. Only owners connect sources or change those mappings."
      >
        <ul className="card-grid card-grid-3 integration-grid">
          {INTEGRATIONS.map((integration) => (
            <li key={integration.slug} className="card integration-card reveal">
              <p className="card-kicker">{integration.kind}</p>
              <h3>
                <a href={`/integrations/${integration.slug}`}>{integration.name}</a>
              </h3>
              <p>{integration.summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="agents"
        tone="sunken"
        eyebrow="Built for agents"
        title="One MCP endpoint. Eight read-only tools."
        intro="Connect Claude Code or any HTTP MCP client with a short-lived, revocable Sembric key, or with user-linked tokens from your identity provider. Applications that don’t speak MCP use the typed REST API, described by an OpenAPI document."
      >
        <div className="actions">
          <a className="button button-secondary" href="/agents">
            Connect an agent <ArrowRight aria-hidden="true" size={16} />
          </a>
        </div>
      </Section>

      <FaqList items={HOME_FAQ} />
      <CtaBand />
    </>
  );
}
