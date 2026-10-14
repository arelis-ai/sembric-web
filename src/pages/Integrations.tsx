import {
  ButtonLink,
  CheckList,
  CtaBand,
  FaqList,
  LinkCards,
  PageHero,
  PageNav,
  Section,
  Timeline,
} from '../components/ui';
import { integrationBySlug, integrationCards, type IntegrationSlug } from '../content/integrations';

const SHARED = [
  'Source rows stay in your engine; Sembric stores only reviewed metadata, definitions and audit records.',
  'Each Sembric role maps to its own narrow customer identity, so source row and column policies keep applying.',
  'Only owners connect sources, test role identities or change mappings. Engineers may rediscover.',
  'Every submitted statement reserves workspace read budget before contact, including catalog pages and schema reads.',
  'Queries check the live schema against the certified fingerprint and refuse drift.',
  'Editing or pausing a source withdraws dependent reviews and certificates atomically; resuming requires rediscovery and recertification.',
];

export function Integrations() {
  return (
    <>
      <PageHero
        eyebrow="Integrations"
        title="Governed agent access for the warehouses and engines you already run"
        lede="Sembric connects to BigQuery, Snowflake, Trino, Databricks, PostgreSQL and MySQL with a customer identity per Sembric role. Your engine keeps enforcing its own policies; Sembric decides which certified answers an agent may receive."
        actions={
          <>
            <ButtonLink href="/contact" arrow>
              Request a pilot
            </ButtonLink>
            <ButtonLink href="#shared" variant="secondary">
              What every connector guarantees
            </ButtonLink>
          </>
        }
      />
      <Section id="connectors" eyebrow="Connectors" title="Six sources, one governed workflow">
        <LinkCards items={integrationCards} />
      </Section>
      <Section
        id="shared"
        tone="sunken"
        layout="aside"
        eyebrow="Every connector"
        title="Guarantees that hold for every source"
      >
        <CheckList items={SHARED} />
        <p className="fine-print">
          A local DuckDB adapter exists for single-host pilots only; the isolated customer runtime disables it at
          startup.
        </p>
      </Section>
      <CtaBand />
    </>
  );
}

export function IntegrationPage({ slug }: { slug: IntegrationSlug }) {
  const integration = integrationBySlug(slug);
  const others = integrationCards.filter((card) => card.href !== `/integrations/${slug}`);
  return (
    <>
      <PageHero
        eyebrow={`Integration · ${integration.kind}`}
        title={`Governed ${integration.name} access for AI agents`}
        lede={integration.summary}
        actions={
          <>
            <ButtonLink href="/contact" arrow>
              Request a pilot
            </ButtonLink>
            <ButtonLink href="#setup" variant="secondary">
              Setup steps
            </ButtonLink>
          </>
        }
      />
      <PageNav
        items={[
          { id: 'identity', label: 'Identity' },
          { id: 'guards', label: 'Enforcement' },
          { id: 'limits', label: 'Limits' },
          { id: 'setup', label: 'Setup' },
          { id: 'faq', label: 'FAQ' },
          { id: 'others', label: 'Other sources' },
        ]}
      />
      <Section id="identity" eyebrow="Identity" title={`How Sembric connects to ${integration.name}`}>
        <div className="card-grid card-grid-2">
          <article className="card reveal">
            <h3>Per-role identity</h3>
            <p>{integration.identity}</p>
          </article>
          <article className="card reveal">
            <h3>Your policies stay in force</h3>
            <p>{integration.policies}</p>
          </article>
        </div>
      </Section>
      <Section id="guards" tone="sunken" layout="aside" eyebrow="Enforcement" title="What Sembric checks and refuses">
        <CheckList items={integration.guards} />
      </Section>
      <Section id="limits" layout="aside" eyebrow="Limits" title="What these controls don’t do">
        <div className="callout reveal">
          <ul className="plain-list">
            {integration.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </div>
      </Section>
      <Section id="setup" tone="sunken" layout="aside" eyebrow="Setup" title={`Connecting ${integration.name}`}>
        <Timeline steps={integration.setup.map((body) => ({ body }))} />
      </Section>
      <FaqList items={integration.faq} title={`${integration.name} questions`} />
      <Section id="others" tone="sunken" eyebrow="More sources" title="Other integrations">
        <LinkCards items={others} />
      </Section>
      <CtaBand />
    </>
  );
}
