import type { Faq } from './types';

export type IntegrationSlug = 'bigquery' | 'snowflake' | 'trino' | 'databricks' | 'postgresql' | 'mysql';

export interface Integration {
  slug: IntegrationSlug;
  name: string;
  kind: string;
  summary: string;
  description: string;
  identity: string;
  policies: string;
  guards: string[];
  limits: string[];
  setup: string[];
  faq: Faq[];
}

// Facts per connector come from the Sembric repository's docs/<connector>.md and AGENTS.md.
export const INTEGRATIONS: Integration[] = [
  {
    slug: 'bigquery',
    name: 'BigQuery',
    kind: 'Google Cloud data warehouse',
    summary:
      'Discover a BigQuery dataset and serve certified aggregates and governed views to agents, with each Sembric role impersonating its own customer service account.',
    description:
      'Give AI agents governed access to BigQuery: per-role service accounts, preserved row and column policies, billed-byte allowances and no SQL from agents.',
    identity:
      'Each Sembric role maps to its own customer service account. The Sembric runtime holds Token Creator on those target accounts only and impersonates the account mapped to the acting role.',
    policies:
      'BigQuery row-level and column-level policies stay in force because every query runs as the mapped account. Curated datasets or authorized views keep raw and regulated tables out of reach.',
    guards: [
      'Discovery pages through the entire dataset and commits a new catalog only after every metadata call succeeds.',
      'Nested STRUCT and repeated ARRAY fields keep their full type in the reviewed fingerprint, start sensitive when a nested field name looks personal, and can never be measures or dimensions.',
      'Every result page is read; repeated or missing page tokens are refused, so a partial page is never treated as the whole answer.',
      'NUMERIC, BIGNUMERIC and wide integers return as exact strings; timestamps return as ISO strings.',
      'Each job reserves from a workspace UTC-day billed-byte allowance (10 GB by default) before it starts and carries a matching maximumBytesBilled and a 30-second timeout.',
    ],
    limits: [
      'The billed-byte allowance is an on-demand query control, not an invoice limit: capacity reservations, storage and other Google Cloud charges are outside it. Keep project budgets and billing alerts.',
      'Only confirmed billed bytes return unused allowance; failed or uncertain jobs keep their full reservation.',
    ],
    setup: [
      'Create one service account per Sembric role with metadata and data read on the chosen dataset or authorized views, plus BigQuery Job User on the billing project.',
      'Grant the Sembric runtime identity Token Creator on those service accounts only. In an isolated customer plane, the connection form shows the exact identity to grant.',
      'An owner enters the data project, dataset, billing project, location, per-query billed-byte cap and the account for each role, then tests every mapping before saving.',
      'Discover the dataset, have the asset’s steward review classifications, then define and independently certify products and views.',
    ],
    faq: [
      {
        q: 'Does Sembric need access to all of our BigQuery data?',
        a: 'No. Each role’s service account should read only a curated dataset or authorized views. Sembric discovers what that account can see, and agents can reach only certified surfaces built on reviewed, non-sensitive fields.',
      },
      {
        q: 'Can an agent run up a large BigQuery bill?',
        a: 'Agents cannot send SQL. Every job reserves from a workspace daily billed-byte allowance and carries maximumBytesBilled. That bounds on-demand query bytes, but it is not an invoice limit, so keep project budgets and alerts too.',
      },
    ],
  },
  {
    slug: 'snowflake',
    name: 'Snowflake',
    kind: 'Cloud data platform',
    summary:
      'Connect a Snowflake schema over the SQL API with one key-pair user and role per Sembric role, and let agents query only certified surfaces.',
    description:
      'Give AI agents governed access to Snowflake: key-pair users per role, grant checks before every statement, preserved masking and row access policies.',
    identity:
      'Each Sembric role uses its own Snowflake service user, role and RSA key pair over the SQL API. Private keys stay on the runtime and never enter source metadata, the portal or logs.',
    policies:
      'Snowflake access control, row access policies and masking policies stay authoritative. Certification runs every check under each granted role’s identity, so a policy that changes answers per role is visible during review.',
    guards: [
      'Before any data statement Sembric reads SHOW GRANTS TO ROLE and refuses administrative roles, inherited roles, grant options and write or ownership privileges. A passing check is reused for ten minutes per identity.',
      'Only the exact account origin is allowed; other origins, redirects, paths and plain HTTP are refused.',
      'Statements use positional bindings with reviewed casts, TIMEZONE=UTC and bounded jsonv2 result partitions.',
      'Users, environment variables and keys must differ across roles; the source form refuses two roles that resolve to the same key.',
    ],
    limits: [
      'The statement timeout (30 seconds by default) and best-effort cancellation do not cap warehouse credits.',
    ],
    setup: [
      'For each Sembric role, create a dedicated Snowflake role and service user with USAGE on the warehouse, database and schema and SELECT on only the chosen tables or secure views.',
      'Generate an RSA key pair per user, register the public key, and provision the private key on the Sembric runtime under a role-named secret.',
      'Allow the exact account origin, then have an owner enter the warehouse, database, schema and role mappings and test every mapping before saving.',
      'Discover, review classifications, and certify products and views with an independent reviewer.',
    ],
    faq: [
      {
        q: 'Why does Sembric refuse a Snowflake role that inherits another role?',
        a: 'Inherited roles can change a role’s effective grants without notice. Sembric requires narrow, direct read grants so the identity a reviewer certified is the identity that serves agents.',
      },
      {
        q: 'Do masking policies still apply?',
        a: 'Yes. Queries run as the Snowflake role mapped to the caller’s Sembric role, so Snowflake’s own masking and row access policies decide what that role reads.',
      },
    ],
  },
  {
    slug: 'trino',
    name: 'Trino',
    kind: 'Federated SQL engine and lakehouse catalogs',
    summary:
      'Discover one Trino catalog and schema, including a lakehouse catalog you operate, and serve certified surfaces through role-specific read-only users.',
    description:
      'Give AI agents governed access to Trino and lakehouse catalogs: read-only users per role, origin allowlists, Trino access control and no agent SQL.',
    identity:
      'Each Sembric role uses a distinct read-only Trino user over HTTPS with password authentication. Passwords live in runtime secrets and are never entered in the portal.',
    policies:
      'Trino’s access-control policy enforces table, column and row restrictions. Sembric does not manage the catalog, ingest rows, create source views or transform data.',
    guards: [
      'Only exact coordinator origins are allowed, and cross-origin result links are refused.',
      'Queries use USING parameters and a 30-second client deadline, and check the live schema against the certified fingerprint before execution.',
      'Every request sets a coordinator-side run-time limit and a physical-scan session setting.',
      'Each mapped role needs a different username, password variable and underlying secret.',
    ],
    limits: [
      'The physical-scan setting depends on the connector: a PostgreSQL-backed fixture returns rows despite a 1-byte setting. Neither setting is a cost cap, so enforce source-side resource groups or quotas.',
      'In an isolated customer plane, serving traffic leaves through a customer-specific NAT address you can allowlist. That gives a stable address, not a destination firewall; verify the observed IP before relying on it.',
    ],
    setup: [
      'Enable HTTPS and password authentication on the coordinator, and create a distinct read-only Trino user for every Sembric role that will receive a grant.',
      'Enforce table, column and row restrictions in Trino’s access-control policy.',
      'List the exact coordinator origin on the Sembric runtime and store each role’s password as a runtime secret.',
      'An owner chooses one catalog and schema, tests every role mapping, then discovers, reviews and certifies.',
    ],
    faq: [
      {
        q: 'Can Sembric govern a lakehouse through Trino?',
        a: 'Yes. Trino can expose a lakehouse catalog you configure. Sembric discovers that catalog’s schema, and your Trino policies keep enforcing access under each role’s user.',
      },
      {
        q: 'Does the Trino scan setting cap our costs?',
        a: 'No. Its effect depends on the connector, so Sembric does not treat it as a cost control. Use source-side resource groups or quotas.',
      },
    ],
  },
  {
    slug: 'databricks',
    name: 'Databricks',
    kind: 'Databricks SQL warehouse with Unity Catalog',
    summary:
      'Connect a Databricks SQL warehouse and one Unity Catalog schema with a separate OAuth service principal per Sembric role.',
    description:
      'Governed AI agent access to Databricks: OAuth service principals per role, Unity Catalog row filters and masks preserved, bounded results and no agent SQL.',
    identity:
      'Each Sembric role uses a different OAuth machine-to-machine service principal that requests only the sql scope. Secrets are runtime-only references; source metadata stores only the principal’s client ID.',
    policies:
      'Unity Catalog grants, row filters and column masks remain authoritative. Principals receive CAN USE on the warehouse and USE CATALOG, USE SCHEMA and SELECT on chosen tables only.',
    guards: [
      'Only the exact workspace origin is allowed, and redirects are refused so credentials cannot be forwarded.',
      'Statements use named parameters and bounded INLINE results through the SQL Statement Execution API; truncated or malformed results are refused.',
      'Full Unity Catalog types enter the reviewed fingerprint; nested or repeated fields start sensitive when a field name looks personal and cannot be measures or dimensions.',
      'A workspace read is reserved before every submitted statement, including each metadata page; polling and result chunks share that reservation.',
    ],
    limits: ['Cancellation after 5–25 seconds and response limits do not cap scan bytes or DBUs.'],
    setup: [
      'Create a service principal per Sembric role with the SQL entitlement, CAN USE on the warehouse, and USE CATALOG, USE SCHEMA and SELECT on only the chosen tables or curated views.',
      'Generate a sql-scoped OAuth secret per principal and provision it on the runtime under a role-named reference.',
      'Allow the exact workspace origin, then have an owner enter the warehouse ID, catalog, schema and role mappings and test each one.',
      'Discover, review classifications and certify with an independent reviewer.',
    ],
    faq: [
      {
        q: 'Do Unity Catalog row filters and column masks still apply?',
        a: 'Yes. Each query runs as the service principal mapped to the caller’s Sembric role, so Unity Catalog decides what that principal reads.',
      },
      {
        q: 'Does Sembric cap DBU spend?',
        a: 'No. Sembric bounds statement count, time and response size, but not scan bytes or DBUs. Keep Databricks-side controls in place.',
      },
    ],
  },
  {
    slug: 'postgresql',
    name: 'PostgreSQL',
    kind: 'Native PostgreSQL',
    summary:
      'Connect an existing PostgreSQL schema over verified TLS with a restricted login per Sembric role, keeping row-level security in force.',
    description:
      'Give AI agents governed access to PostgreSQL: verified TLS, restricted logins per role, row-level security preserved, read-only transactions, no agent SQL.',
    identity:
      'Each Sembric role uses its own restricted login and runtime-only password reference. TLS certificate and hostname verification is always on, and an operator allowlists the exact host, port and database.',
    policies:
      'Row-level security and column grants stay in force. Superusers, BYPASSRLS logins and table owners can bypass row policies, which is why Sembric refuses those mappings.',
    guards: [
      'On every connection, before the data statement, Sembric refuses administration, BYPASSRLS, schema creation, relation ownership and write privileges in the chosen schema.',
      'Reads run in read-only transactions with $n parameters, server statement timeouts and bounded streaming responses.',
      'Composite, array, domain and enum types keep their full definitions in the reviewed fingerprint.',
      'Source connections never reuse Sembric’s own metadata database credentials, pools or type parsers.',
    ],
    limits: [
      'Time and response controls do not cap scan bytes or server cost; set connection limits and resource controls on your server.',
    ],
    setup: [
      'Create a separate login per Sembric role with CONNECT on the database, USAGE on the schema and SELECT on approved tables, views or columns only.',
      'Have an operator allowlist the exact endpoint and provision each role’s password as a runtime secret (and a private CA bundle if you use one).',
      'An owner enters the endpoint, schema, logins and secret references and tests every mapping.',
      'Discover, review classifications and certify with an independent reviewer.',
    ],
    faq: [
      {
        q: 'Will PostgreSQL row-level security still apply?',
        a: 'Yes. Queries run as the login mapped to the caller’s role, and Sembric refuses logins that could bypass row policies, such as superusers, BYPASSRLS roles and table owners.',
      },
      {
        q: 'Can we turn off TLS for a private network?',
        a: 'No. Certificate and hostname verification is always enabled. Use a private CA bundle if your server is not signed by a public authority.',
      },
    ],
  },
  {
    slug: 'mysql',
    name: 'MySQL',
    kind: 'MySQL 8.0 and 8.4',
    summary:
      'Connect a MySQL 8.0 or 8.4 database over mandatory verified TLS with direct read-only grants per Sembric role.',
    description:
      'Give AI agents governed access to MySQL 8.0 and 8.4: verified TLS, direct read-only grants per role, customer-owned views for restrictions, no agent SQL.',
    identity:
      'Each Sembric role uses a distinct serving-only login over mandatory verified TLS. An operator allowlists the exact host, port and database.',
    policies:
      'Customer-owned views and column grants enforce restrictions. MySQL has no native row policies like PostgreSQL’s, and Sembric does not claim them.',
    guards: [
      'Before any data SQL, Sembric refuses write, administrative, global or foreign-database grants, proxy and role grants, and grant options; only direct SELECT and SHOW VIEW grants are supported.',
      'Reads use read-only transactions and binary prepared parameters.',
      'Native types, enum and set labels and collations enter the reviewed fingerprint, so a change withdraws access.',
      'MariaDB and versions outside 8.0 and 8.4 are refused.',
    ],
    limits: [
      'Server execution settings and client deadlines stop release after limits, but do not cap source scan cost or guarantee immediate cancellation.',
    ],
    setup: [
      'Create a login per Sembric role with direct SELECT (and SHOW VIEW where needed) on approved tables, views or columns only.',
      'Use customer-owned views to express row restrictions, and verify them under each login.',
      'Have an operator allowlist the exact endpoint and provision each password as a runtime secret; an owner then tests every mapping.',
      'Discover, review classifications and certify with an independent reviewer.',
    ],
    faq: [
      {
        q: 'How do we restrict rows in MySQL?',
        a: 'Use customer-owned views and column grants for each role’s login. Certification runs its checks under every granted login, so a view that changes answers per role is visible during review.',
      },
      {
        q: 'Is MariaDB supported?',
        a: 'Not yet. Sembric supports MySQL 8.0 and 8.4 and refuses other engines until they have their own acceptance work.',
      },
    ],
  },
];

/** Integration index and home-page cards. */
export const integrationCards = INTEGRATIONS.map((integration) => ({
  href: `/integrations/${integration.slug}`,
  label: integration.name,
  kicker: integration.kind,
  body: integration.summary,
}));

export const integrationBySlug = (slug: IntegrationSlug) => {
  const found = INTEGRATIONS.find((integration) => integration.slug === slug);
  if (!found) throw new Error(`unknown integration ${slug}`);
  return found;
};
