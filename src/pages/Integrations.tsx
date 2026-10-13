import { ArrowRight } from 'lucide-react';
import { CheckList, CtaBand, PageHero, Section } from '../components/ui';
import { INTEGRATIONS, integrationBySlug, type IntegrationSlug } from '../content/integrations';

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
      />
      <Section id="connectors" eyebrow="Connectors" title="Six sources, one governed workflow">
        <ul className="card-grid card-grid-3 integration-grid">
          {INTEGRATIONS.map((integration) => (
            <li key={integration.slug} className="card integration-card reveal">
              <p className="card-kicker">{integration.kind}</p>
              <h3>
                <a href={`/integrations/${integration.slug}`}>{integration.name}</a>
              </h3>
              <p>{integration.summary}</p>
              <p className="card-link" aria-hidden="true">
                Details <ArrowRight size={14} />
              </p>
            </li>
          ))}
        </ul>
      </Section>
      <Section id="shared" tone="sunken" eyebrow="Every connector" title="Guarantees that hold for every source">
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
  const others = INTEGRATIONS.filter((other) => other.slug !== slug);
  return (
    <>
      <PageHero
        eyebrow={`Integration · ${integration.kind}`}
        title={`Governed ${integration.name} access for AI agents`}
        lede={integration.summary}
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
      <Section id="guards" tone="sunken" eyebrow="Enforcement" title="What Sembric checks and refuses">
        <CheckList items={integration.guards} />
      </Section>
      <Section id="limits" eyebrow="Limits" title="What these controls don’t do">
        <div className="callout reveal">
          <ul className="plain-list">
            {integration.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </div>
      </Section>
      <Section id="setup" tone="sunken" eyebrow="Setup" title={`Connecting ${integration.name}`}>
        <ol className="timeline reveal">
          {integration.setup.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Section>
      <section className="section" aria-labelledby="faq-title">
        <div className="container">
          <header className="section-head reveal">
            <p className="eyebrow">FAQ</p>
            <h2 id="faq-title" className="section-title">
              {integration.name} questions
            </h2>
          </header>
          <div className="faq reveal">
            {integration.faq.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>
                  <h3 className="faq-q">{item.q}</h3>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-sunken" aria-labelledby="others-title">
        <div className="container">
          <h2 id="others-title" className="section-title section-title-sm">
            Other integrations
          </h2>
          <ul className="pill-links">
            {others.map((other) => (
              <li key={other.slug}>
                <a href={`/integrations/${other.slug}`}>{other.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
