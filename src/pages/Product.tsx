import { CertificationPanel } from '../components/visuals';
import { ButtonLink, CheckList, CtaBand, FaqList, PageHero, PageNav, Section } from '../components/ui';
import { PRODUCT_FAQ } from '../content/faqs';

const ROLES = [
  [
    'Owner',
    'Connects sources and maps role identities, assigns stewards, invites and removes members, clears sensitive marks, revokes any key.',
  ],
  [
    'Engineer',
    'Browses the catalog, rediscovers sources, marks columns sensitive, builds and certifies surfaces, monitors agents.',
  ],
  ['Analyst', 'Sees and queries the certified products and views granted to the analyst role.'],
  ['Viewer', 'Sees and queries the certified products and views granted to the viewer role.'],
];

const QUERY_RULES = [
  [
    'Fields',
    'Only declared dimensions or approved columns; a product query may group by at most three of up to 12 declared dimensions.',
  ],
  [
    'Filters',
    'Equality, a value list of at most 50, or a range on numeric, date and time fields — always bound as typed parameters.',
  ],
  [
    'Time grains',
    'day, week, month, quarter or year on declared date or timestamp dimensions; weeks start Monday and instants bucket in UTC.',
  ],
  ['Limits', '1 to 100 rows. A query matching more is refused with narrowing guidance instead of being truncated.'],
  ['Result shape', 'Provider rows must have exactly the approved columns; an extra or missing field fails closed.'],
  ['Response size', 'Serialized rows are capped at 1 MB by default (configurable up to 4 MB) before release.'],
  [
    'Fixed restrictions',
    'A view’s equality or value-list restrictions are always conjoined with caller filters and cannot be replaced.',
  ],
];

export function Product() {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="How Sembric turns warehouse tables into answers agents can trust"
        lede="Sembric runs one governed workflow: discover what you already have, classify it, certify exactly what agents may use, then enforce that on every call. Here is each step and the rules it enforces."
        actions={
          <>
            <ButtonLink href="/contact" arrow>
              Request a pilot
            </ButtonLink>
            <ButtonLink href="/security" variant="secondary">
              Read the security model
            </ButtonLink>
          </>
        }
      />
      <PageNav
        items={[
          { id: 'discover', label: 'Discover' },
          { id: 'classify', label: 'Classify' },
          { id: 'surfaces', label: 'Define' },
          { id: 'certification', label: 'Certify' },
          { id: 'serve', label: 'Serve' },
          { id: 'ontology', label: 'Ontology' },
          { id: 'team', label: 'Workspace' },
          { id: 'faq', label: 'FAQ' },
        ]}
      />

      <Section
        id="discover"
        layout="aside"
        eyebrow="1 · Discover"
        title="Read the catalog, never the whole warehouse"
        intro="An owner connects a BigQuery dataset, Snowflake schema, Trino catalog and schema, Databricks catalog and schema, PostgreSQL schema or MySQL database, and tests the customer identity each Sembric role uses before saving."
      >
        <CheckList
          items={[
            'Discovery reads every catalog page before publishing the refreshed inventory, so a failure part-way leaves the previous catalog intact.',
            'Assets that disappear are marked missing, lose their reviews and dependent certificates, and cannot be used until restored and rediscovered.',
            'Readable display names can be set per workspace; the physical relation stays visible for traceability and remains the only query target.',
            'Owners and engineers browse the catalog; analysts and viewers see only certified surfaces, because table and column names can be sensitive themselves.',
          ]}
        />
      </Section>

      <Section
        id="classify"
        tone="sunken"
        layout="aside"
        eyebrow="2 · Classify and steward"
        title="Every asset has one accountable steward"
        intro="Columns with common personal-data names start sensitive. That heuristic is a starting point, so review by the asset’s assigned data steward is mandatory before anything built on it can be certified."
      >
        <CheckList
          items={[
            'An owner assigns a steward, or the first eligible reviewer claims an unassigned asset. Reassignment withdraws the review and dependent certificates atomically.',
            'Engineers can mark a column sensitive; only an owner can clear the mark. Many columns can be marked in one reviewed change.',
            'Nested or repeated fields keep their full type in the reviewed fingerprint, start sensitive when any nested name looks personal, and cannot be measures or dimensions.',
            'Every preview, certification and query rechecks the stored definition against the current classification, so a newly sensitive column can never be released.',
          ]}
        />
      </Section>

      <Section
        id="surfaces"
        eyebrow="3 · Define"
        title="Two kinds of certified surface"
        intro="Both carry a business definition, caveats, concepts, role grants and at least two distinct expected-answer cases. Every saved definition is versioned with a field-level history."
      >
        <div className="card-grid card-grid-2">
          <article className="card reveal">
            <p className="card-kicker">Aggregate</p>
            <h3>Data product</h3>
            <p>
              One measure — <code>sum</code>, <code>count</code>, <code>count_distinct</code>, <code>avg</code>,{' '}
              <code>min</code> or <code>max</code> — over approved dimensions. Sum, average, minimum and maximum need a
              numeric measure so their checks are verifiable.
            </p>
            <p>
              A reviewed minimum group size is enforced in the source query with <code>HAVING COUNT(*) &gt;= n</code>{' '}
              for previews, certification, the API and MCP. It withholds small groups but is not complementary
              suppression, so keep person-level dimensions coarse.
            </p>
          </article>
          <article className="card reveal">
            <p className="card-kicker">Projection</p>
            <h3>Governed view</h3>
            <p>
              Approved, non-sensitive columns with optional fixed row restrictions. Restrictions are equality or value
              lists, never open ranges, and are always conjoined with what the caller asks for.
            </p>
            <p>
              Certification also proves that each granted source identity can actually read the approved projection — a
              row count alone cannot prove column access.
            </p>
          </article>
        </div>
      </Section>

      <Section
        id="certification"
        tone="sunken"
        eyebrow="4 · Certify"
        title="Independent review, checked under every role"
        intro="A builder requests review from a named, independent owner or engineer. The request closes itself when the surface is certified or its definition changes."
      >
        <div className="split">
          <CertificationPanel />
          <div className="split-copy reveal">
            <CheckList
              items={[
                'The reviewer differs from both the current owner and the last definition editor.',
                'Each granted role runs two distinct checks; an expected answer can be overridden per role when source row policies differ.',
                'COUNT checks need exact non-negative integers; SUM and AVG allow only machine-precision noise.',
                'A failed or refused certification is recorded with its reason and visible to every builder.',
                'Certificates last 30 days by default. In the final 7 days an independent reviewer can renew in place by re-running every check; expired certificates are never renewed.',
              ]}
            />
          </div>
        </div>
      </Section>

      <Section
        id="serve"
        eyebrow="5 · Serve"
        title="Bounded, typed queries — and nothing else"
        intro="Agents and applications query certified surfaces through MCP or the REST API. Sembric builds the source query; callers supply only these inputs."
      >
        <div className="table-wrap reveal">
          <table className="spec-table">
            <caption className="sr-only">Query rules enforced for every API and MCP call</caption>
            <thead>
              <tr>
                <th scope="col">Rule</th>
                <th scope="col">What Sembric enforces</th>
              </tr>
            </thead>
            <tbody>
              {QUERY_RULES.map(([rule, detail]) => (
                <tr key={rule}>
                  <th scope="row">{rule}</th>
                  <td>{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine-print">
          After a source query returns, Sembric rechecks membership, role, the calling session or key, and the
          certificate before releasing rows.
        </p>
      </Section>

      <Section
        id="ontology"
        tone="sunken"
        layout="aside"
        eyebrow="Context for agents"
        title="Ontology and lineage"
        intro="Concepts declared on certified surfaces form a shared ontology. Owners and engineers connect them with typed relationships, and certification refuses a conflicting definition for an existing concept."
      >
        <CheckList
          items={[
            'The API and MCP filter concepts and relationships to the surfaces visible to the caller; links disappear when a surface is withdrawn.',
            'Column-level lineage traces each certified surface from its source columns — sensitive ones shown as withheld — through approved fields to concepts, roles and agents.',
            'Cmd/Ctrl+K searches everything a member may see.',
          ]}
        />
      </Section>

      <Section
        id="team"
        eyebrow="Workspace"
        title="Roles, collaboration and monitoring"
        intro="Membership and role are re-read on every request, so changes take effect immediately for people and their agents."
      >
        <div className="table-wrap reveal">
          <table className="spec-table">
            <caption className="sr-only">Workspace roles</caption>
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Can</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map(([role, detail]) => (
                <tr key={role}>
                  <th scope="row">{role}</th>
                  <td>{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CheckList
          items={[
            'Notifications cover review requests, certification outcomes, withdrawals, renewals due and expiry — in-app, with optional email and webhook copies that carry only a title and a portal link.',
            'The Agents page shows answered and refused calls, the busiest surfaces, recent refusals and each key’s last use.',
            'Owners download workspace audit events as JSONL from the Activity page.',
          ]}
        />
      </Section>

      <FaqList items={PRODUCT_FAQ} />
      <CtaBand />
    </>
  );
}
