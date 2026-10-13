import { BadgeCheck, Ban, Bot, Check, Database, Lock, ShieldCheck } from 'lucide-react';
import { Tabs } from './ui';

function Flow({ className = '' }: { className?: string }) {
  // Decorative connector between the diagram's columns; the dashes travel only when motion is allowed.
  return (
    <div className={`flow ${className}`} aria-hidden="true">
      <svg viewBox="0 0 80 24" preserveAspectRatio="none" focusable="false">
        <path className="flow-track" d="M0 12h80" />
        <path className="flow-pulse" d="M0 12h80" />
      </svg>
    </div>
  );
}

const SOURCE_TABLES = [
  { name: 'orders', columns: [['region'], ['net_amount'], ['ordered_at']] },
  { name: 'customers', columns: [['email', 'sensitive'], ['full_name', 'sensitive'], ['segment']] },
  { name: 'support_cases', columns: [['notes', 'sensitive'], ['status'], ['opened_at']] },
];

/** The hero diagram: source tables on the left, Sembric's gate in the middle, agents on the right. */
export function GateDiagram() {
  return (
    <figure className="gate" aria-labelledby="gate-caption">
      <div className="gate-frame" data-md="skip">
        <div className="gate-chrome" aria-hidden="true">
          <span />
          <span />
          <span />
          <em>sembric · governed path</em>
        </div>
        <div className="gate-grid">
          <section className="gate-col" aria-label="Your warehouse">
            <p className="gate-head">
              <Database aria-hidden="true" size={16} /> Your warehouse
            </p>
            <p className="gate-sub">Tables stay where they are</p>
            <ul className="gate-tables">
              {SOURCE_TABLES.map((table) => (
                <li key={table.name}>
                  <span className="gate-table">{table.name}</span>
                  <ul className="gate-columns">
                    {table.columns.map(([column, flag]) => (
                      <li key={column} className={flag ? 'col-sensitive' : 'col-standard'}>
                        {flag ? <Lock aria-hidden="true" size={11} /> : null}
                        {column}
                        {flag ? <span className="sr-only"> (sensitive)</span> : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
          <Flow />
          <section className="gate-col gate-core" aria-label="Sembric">
            <p className="gate-head">
              <ShieldCheck aria-hidden="true" size={16} /> Sembric
            </p>
            <p className="gate-sub">Only certified surfaces pass</p>
            <ol className="gate-steps">
              <li>
                <Check aria-hidden="true" size={13} /> Fields classified, 3 sensitive withheld
              </li>
              <li>
                <Check aria-hidden="true" size={13} /> Steward review approved
              </li>
              <li>
                <Check aria-hidden="true" size={13} /> Independent certification, 4 of 4 checks
              </li>
              <li className="gate-live">
                <span className="live-dot" aria-hidden="true" /> Enforced on every call
              </li>
            </ol>
            <div className="gate-surface">
              <span className="status status-certified">
                <BadgeCheck aria-hidden="true" size={12} /> Certified
              </span>
              <strong>Net revenue by region</strong>
              <small>sum(net_amount) · region, ordered_at · min group 5</small>
            </div>
          </section>
          <Flow className="flow-late" />
          <section className="gate-col" aria-label="Your agents">
            <p className="gate-head">
              <Bot aria-hidden="true" size={16} /> Your agents
            </p>
            <p className="gate-sub">MCP and typed API</p>
            <ul className="gate-calls">
              <li className="call-ok">
                <code>sembric_query_product</code>
                <span>region, ordered_at:quarter → 4 rows</span>
                <em>answered · audited</em>
              </li>
              <li className="call-refused">
                <code>customers.email</code>
                <span>not a declared field</span>
                <em>
                  <Ban aria-hidden="true" size={11} /> refused · audited
                </em>
              </li>
              <li className="call-refused">
                <code>SELECT * FROM customers</code>
                <span>no route accepts SQL</span>
                <em>
                  <Ban aria-hidden="true" size={11} /> refused
                </em>
              </li>
            </ul>
          </section>
        </div>
      </div>
      <figcaption id="gate-caption">
        Illustrative example with synthetic names. Agents reach only certified surfaces granted to their role; sensitive
        fields and SQL never pass through.
      </figcaption>
    </figure>
  );
}

const ANSWERED = `→ tools/call  sembric_query_product
{
  "productId": "net-revenue-by-region",
  "dimensions": ["region", "ordered_at:quarter"],
  "filters": { "ordered_at": { "gte": "2026-01-01", "lt": "2026-07-01" } },
  "limit": 20
}

← 4 rows · certified · expires in 23 days
  region  ordered_at   net_revenue
  North   2026-01-01   412880.00
  North   2026-04-01   436120.00
  South   2026-01-01   298410.00
  South   2026-04-01   305990.00

audit  answered · caller mcp · key 3f9c…a1`;

const REFUSED = `→ tools/call  sembric_query_product
{
  "productId": "net-revenue-by-region",
  "dimensions": ["customer_email"],
  "limit": 20
}

← refused before any source query
  customer_email is not a declared dimension
  of this product.

audit  refused · undeclared field · caller mcp · key 3f9c…a1`;

const WITHDRAWN = `steward  customers.segment marked sensitive
         → classification changed

sembric  certificate withdrawn · product returned to draft
         → agent visibility removed in the same transaction

→ tools/call  sembric_list_products
← net-revenue-by-segment is no longer listed

audit  certificate withdrawn · notification sent`;

/** What an agent actually sees: one answered call, one refusal and one withdrawal. */
export function AgentConsole() {
  return (
    <div className="console reveal">
      <Tabs
        label="Example agent calls"
        tabs={[
          {
            id: 'answered',
            label: 'Answered',
            content: <ConsolePane code={ANSWERED} tone="ok" label="Answered agent call" />,
          },
          {
            id: 'refused',
            label: 'Refused',
            content: <ConsolePane code={REFUSED} tone="refused" label="Refused agent call" />,
          },
          {
            id: 'withdrawn',
            label: 'Withdrawn',
            content: <ConsolePane code={WITHDRAWN} tone="warn" label="Withdrawn certificate" />,
          },
        ]}
      />
      <p className="console-note">Illustrative synthetic data. Tool names match Sembric’s MCP server.</p>
    </div>
  );
}

function ConsolePane({ code, tone, label }: { code: string; tone: 'ok' | 'refused' | 'warn'; label: string }) {
  return (
    <pre className={`console-pane console-${tone}`} tabIndex={0} aria-label={label}>
      <code>{code}</code>
    </pre>
  );
}

const CHECKS = [
  ['Analyst · Q1 total', '711,290.00', 'pass'],
  ['Analyst · North only', '849,000.00', 'pass'],
  ['Viewer · Q1 total', '412,880.00', 'pass'],
  ['Viewer · North only', '849,000.00', 'pass'],
] as const;

/** A portal-style certification record, as an independent reviewer sees it. */
export function CertificationPanel() {
  return (
    <div className="panel cert-panel reveal" role="group" aria-label="Example certification record">
      <div className="panel-head">
        <div>
          <p className="panel-kicker">Data product</p>
          <p className="panel-title">Net revenue by region</p>
        </div>
        <span className="status status-certified">
          <BadgeCheck aria-hidden="true" size={12} /> Certified
        </span>
      </div>
      <dl className="panel-meta">
        <div>
          <dt>Measure</dt>
          <dd>sum(net_amount)</dd>
        </div>
        <div>
          <dt>Granted roles</dt>
          <dd>analyst, viewer</dd>
        </div>
        <div>
          <dt>Minimum group</dt>
          <dd>5 records</dd>
        </div>
        <div>
          <dt>Expires</dt>
          <dd>in 23 days</dd>
        </div>
      </dl>
      <table className="panel-table">
        <caption className="sr-only">Expected-answer checks run under each granted role</caption>
        <thead>
          <tr>
            <th scope="col">Check under role</th>
            <th scope="col">Expected</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {CHECKS.map(([label, expected, result]) => (
            <tr key={label}>
              <td>{label}</td>
              <td className="mono">{expected}</td>
              <td>
                <span className="status status-certified">{result}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="panel-foot">
        Reviewer is neither the owner nor the last editor · fingerprint unchanged through the final check
      </p>
    </div>
  );
}
