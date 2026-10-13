import type { ReactNode } from 'react';
import { ArrowRight, Copy } from 'lucide-react';
import type { Faq } from '../content/types';
import { pilotMailto } from '../site';

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = 'plain',
  headingLevel = 2,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
  tone?: 'plain' | 'sunken';
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section className={`section section-${tone}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <header className="section-head reveal">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <Heading id={`${id}-title`} className="section-title">
            {title}
          </Heading>
          {intro ? <p className="section-intro">{intro}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  arrow = false,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'quiet';
  arrow?: boolean;
}) {
  return (
    <a className={`button button-${variant}`} href={href}>
      {children}
      {arrow ? <ArrowRight aria-hidden="true" size={16} /> : null}
    </a>
  );
}

export function PilotButtons({ secondary }: { secondary?: { href: string; label: string } }) {
  return (
    <div className="actions">
      <ButtonLink href="/contact" arrow>
        Request a pilot
      </ButtonLink>
      {secondary ? (
        <ButtonLink href={secondary.href} variant="secondary">
          {secondary.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function FaqList({
  items,
  id = 'faq',
  title = 'Frequently asked questions',
}: {
  items: Faq[];
  id?: string;
  title?: string;
}) {
  return (
    <Section id={id} eyebrow="FAQ" title={title}>
      <div className="faq reveal">
        {items.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>
              <h3 className="faq-q">{item.q}</h3>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function CtaBand({
  title = 'Put your first certified data product in front of an agent.',
  body = 'Tell us which warehouse you run and what your agents need to answer. We will help you connect a source, certify a first surface and query it over MCP.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="container cta-inner reveal">
        <div>
          <h2 id="cta-title">{title}</h2>
          <p>{body}</p>
        </div>
        <div className="actions">
          <ButtonLink href="/contact" arrow>
            Request a pilot
          </ButtonLink>
          <a className="button button-secondary" href={pilotMailto}>
            Email us
          </a>
        </div>
      </div>
    </section>
  );
}

export function CodeBlock({ id, label, code }: { id: string; label: string; code: string }) {
  return (
    <figure className="code-block">
      <figcaption>
        <span>{label}</span>
        <button type="button" className="copy-button" data-copy-target={id} hidden>
          <Copy aria-hidden="true" size={14} />
          <span>Copy</span>
        </button>
      </figcaption>
      <pre tabIndex={0} aria-label={label}>
        <code id={id}>{code}</code>
      </pre>
    </figure>
  );
}

export interface TabSpec {
  id: string;
  label: string;
  content: ReactNode;
}

/** ARIA tabs. Without JavaScript every panel is shown in order; src/entry-client.ts adds keyboard behaviour.
 *  Panel content must contain a focusable element (the console panes are focusable scroll regions). */
export function Tabs({ label, tabs }: { label: string; tabs: TabSpec[] }) {
  return (
    <div className="tabs" data-tabs>
      <div className="tablist" role="tablist" aria-label={label}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            aria-selected={index === 0}
            tabIndex={index === 0 ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== 0}
          className="tabpanel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

export function CheckList({ items, tone = 'ok' }: { items: ReactNode[]; tone?: 'ok' | 'no' }) {
  return (
    <ul className={`check-list check-list-${tone}`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function PageHero({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <section className="page-hero" aria-labelledby="page-title">
      <div className="hero-backdrop hero-backdrop-soft" aria-hidden="true" />
      <div className="container page-hero-inner">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 id="page-title">{title}</h1>
        <p className="hero-lede">{lede}</p>
      </div>
    </section>
  );
}
