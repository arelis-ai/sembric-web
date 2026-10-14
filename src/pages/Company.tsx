import { ArrowRight, Mail } from 'lucide-react';
import { ButtonLink, CheckList, CopyButton, CtaBand, LinkCards, PageHero, Section, Timeline } from '../components/ui';
import { PILOT_PROMPTS, SITE, pilotMailto } from '../site';

export function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Why we built Sembric"
        lede="Companies want AI agents to answer questions from their data. The data is already governed in the warehouse; the risk is in how agents reach it. Sembric is the missing layer in between."
      />
      <Section
        id="belief"
        layout="aside"
        eyebrow="What we believe"
        title="Agents should get answers people have vouched for"
      >
        <div className="prose reveal">
          <p>
            Most organisations spent years putting row policies, column grants and data ownership in place. Connecting
            an agent with a service account and a text-to-SQL prompt quietly bypasses all of it: the agent can read what
            the account can read, write any query, and nobody reviewed the number it returns.
          </p>
          <p>
            We think the right unit of access for an agent is not a table but a certified answer — a definition someone
            owns, a classification a steward reviewed, and checks an independent reviewer ran under every role that will
            use it. When any of that changes, access should stop on its own.
          </p>
        </div>
      </Section>
      <Section id="principles" tone="sunken" layout="aside" eyebrow="Principles" title="How we build">
        <CheckList
          items={[
            'Customer data stays in its source. We don’t add ingestion, transformation or free-form SQL.',
            'The source engine stays authoritative; Sembric only narrows access further.',
            'Fail closed: when facts change, withdraw access and record why.',
            'Say exactly what a control does and doesn’t do — including the limits of our own cost and privacy controls.',
            'Claim only what we have evidence for.',
          ]}
        />
      </Section>
      <Section id="company" layout="aside" eyebrow="Company" title={`Sembric is built by ${SITE.publisher.name}`}>
        <div className="prose reveal">
          <p>
            {SITE.publisher.name} builds governance and integration software for enterprise AI. Sembric is available for
            pilots today.
          </p>
          <p>
            <a className="icon-link" href={SITE.publisher.url}>
              Visit {SITE.publisher.name} <ArrowRight aria-hidden="true" size={14} />
            </a>
          </p>
        </div>
      </Section>
      <CtaBand />
    </>
  );
}

export function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Request a pilot"
        title="Start a Sembric pilot on your own warehouse"
        lede="A pilot connects one source, certifies a first data product or governed view with your team, and puts it in front of an agent over MCP."
        actions={
          <>
            <ButtonLink href={pilotMailto} arrow>
              Email a pilot request
            </ButtonLink>
            <ButtonLink href="#pilot" variant="secondary">
              What a pilot covers
            </ButtonLink>
          </>
        }
      />
      <Section
        id="how-to"
        eyebrow="Get in touch"
        title="Email us with a few details"
        intro="The email button opens a message with these questions filled in. Answer what you can; we’ll take it from there."
      >
        <div className="split">
          <div className="contact-card card reveal">
            <Mail aria-hidden="true" size={22} className="card-icon" />
            <h3>Pilot requests</h3>
            <p className="contact-address">
              <a className="contact-email" id="contact-email" href={pilotMailto}>
                {SITE.contactEmail}
              </a>
              <CopyButton target="contact-email" label="Copy address" />
            </p>
            <ButtonLink href={pilotMailto} arrow>
              Email a pilot request
            </ButtonLink>
            <p className="fine-print">
              This site has no forms and sets no cookies. Your message goes only to our inbox.
            </p>
          </div>
          <div className="split-copy reveal">
            <h3>Helpful to include</h3>
            <CheckList items={PILOT_PROMPTS} />
            <p className="fine-print">Please don’t send credentials or customer data by email.</p>
          </div>
        </div>
      </Section>
      <Section
        id="pilot"
        tone="sunken"
        layout="aside"
        eyebrow="What a pilot covers"
        title="From one source to one agent answer"
        intro="We share the current security evidence and open acceptance gates with pilot customers on request."
      >
        <Timeline
          steps={[
            {
              lead: 'Connect one source.',
              body: 'An owner connects BigQuery, Snowflake, Trino, Databricks, PostgreSQL or MySQL with a narrow, read-only customer identity for each Sembric role, and tests every mapping before saving.',
            },
            {
              lead: 'Certify a first surface.',
              body: 'The asset’s data steward reviews its classification, then an independent reviewer certifies a data product or governed view by running expected-answer checks under every granted role.',
            },
            {
              lead: 'Query it from an agent.',
              body: 'Connect Claude Code or your own MCP client with a short-lived, revocable key, and see every answered or refused call in the audit record.',
            },
          ]}
        />
      </Section>
    </>
  );
}

export function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Website privacy notice"
        lede={`How ${SITE.name}’s website at ${SITE.origin.replace('https://', '')} handles information. It covers this website only, not the Sembric product.`}
      />
      <Section id="summary" layout="aside" eyebrow={`Last updated ${SITE.updated}`} title="The short version">
        <div className="prose reveal">
          <p>
            This website sets no cookies, runs no analytics or advertising scripts, embeds no third-party content and
            has no forms. Fonts and scripts are served from this domain.
          </p>
          <h3>Theme preference</h3>
          <p>
            If you switch between light and dark themes, your choice is stored in your browser’s local storage under the
            key <code>sembric-theme</code>. It never leaves your device; clear site data to remove it.
          </p>
          <h3>Server logs</h3>
          <p>
            Like any web server, our hosting on Google Cloud receives your IP address, user agent, the requested path
            and the time of each request. These request logs are used to operate and secure the site and are kept in
            Google Cloud Logging under its default retention.
          </p>
          <h3>Email</h3>
          <p>
            If you email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>, we use your message and
            address to reply and to discuss a pilot with you.
          </p>
          <h3>Questions</h3>
          <p>
            Contact <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> with any question about this notice.
          </p>
        </div>
      </Section>
    </>
  );
}

const SUGGESTIONS = [
  {
    href: '/',
    label: 'Home',
    body: 'What Sembric is and the problem it solves for companies putting agents on their data.',
  },
  {
    href: '/product',
    label: 'How it works',
    body: 'Discover, classify, certify and serve: the workflow and the rules it enforces.',
  },
  {
    href: '/security',
    label: 'Security',
    body: 'Per-role source identities, no SQL from agents, fail-closed checks and full audit.',
  },
  {
    href: '/integrations',
    label: 'Integrations',
    body: 'BigQuery, Snowflake, Trino, Databricks, PostgreSQL and MySQL.',
  },
  {
    href: '/agents',
    label: 'Agents and MCP',
    body: 'Eight read-only MCP tools, credentials and how to connect an agent.',
  },
  { href: '/contact', label: 'Request a pilot', body: 'Start with one source, one certified surface and one agent.' },
];

export function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404"
        title="This page isn’t certified"
        lede="We couldn’t find the page you asked for. It may have moved, or the link may be mistyped."
        actions={
          <ButtonLink href="/" arrow>
            Go to the home page
          </ButtonLink>
        }
      />
      <Section id="suggestions" title="Or try one of these">
        <LinkCards items={SUGGESTIONS} cta="Open" />
      </Section>
    </>
  );
}
