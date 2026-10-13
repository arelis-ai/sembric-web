import { ArrowRight, Mail } from 'lucide-react';
import { ButtonLink, CheckList, CtaBand, PageHero, Section } from '../components/ui';
import { SITE, pilotMailto } from '../site';

export function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Why we built Sembric"
        lede="Companies want AI agents to answer questions from their data. The data is already governed in the warehouse; the risk is in how agents reach it. Sembric is the missing layer in between."
      />
      <Section id="belief" eyebrow="What we believe" title="Agents should get answers people have vouched for">
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
      <Section id="principles" tone="sunken" eyebrow="Principles" title="How we build">
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
      <Section id="company" eyebrow="Company" title={`Sembric is built by ${SITE.publisher.name}`}>
        <div className="prose reveal">
          <p>
            {SITE.publisher.name} builds governance and integration software for enterprise AI. Sembric is available for
            pilots today.
          </p>
          <p>
            <a href={SITE.publisher.url}>
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
      />
      <Section id="how-to" eyebrow="Get in touch" title="Email us with a few details">
        <div className="split">
          <div className="contact-card card reveal">
            <Mail aria-hidden="true" size={22} className="card-icon" />
            <h3>Pilot requests</h3>
            <p>
              <a className="contact-email" href={pilotMailto}>
                {SITE.contactEmail}
              </a>
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
            <CheckList
              items={[
                'Which warehouse or engine holds the data: BigQuery, Snowflake, Trino, Databricks, PostgreSQL or MySQL',
                'The first questions your agents should answer, and who owns that data today',
                'Which agents or clients you use, such as Claude Code or your own MCP client',
                'Any security or compliance review the pilot needs to pass',
              ]}
            />
            <p className="fine-print">Please don’t send credentials or customer data by email.</p>
          </div>
        </div>
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
      <Section id="summary" eyebrow={`Last updated ${SITE.updated}`} title="The short version">
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

export function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404"
        title="This page isn’t certified"
        lede="We couldn’t find the page you asked for. It may have moved, or the link may be mistyped."
      />
      <section className="section" aria-labelledby="nf-title">
        <div className="container">
          <h2 id="nf-title" className="section-title section-title-sm">
            Try one of these
          </h2>
          <ul className="pill-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/product">How it works</a>
            </li>
            <li>
              <a href="/security">Security</a>
            </li>
            <li>
              <a href="/integrations">Integrations</a>
            </li>
            <li>
              <a href="/agents">Agents and MCP</a>
            </li>
            <li>
              <a href="/contact">Request a pilot</a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
