import { createContext, useContext, type ReactNode } from 'react';
import { ArrowRight, Copy } from 'lucide-react';
import type { Faq } from '../content/types';
import { pilotMailto } from '../site';
import { Breadcrumbs } from './Chrome';

/** The current page's breadcrumb trail. Document provides it; the Markdown renderer does not, so copies omit it. */
export const TrailContext = createContext<{ href: string; label: string }[]>([]);

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

/**
 * A page section. `stack` puts the heading above the content; `aside` keeps the heading in a sticky left column beside
 * text-heavy content on wide screens. The section's `id` is its in-page anchor.
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = 'plain',
  layout = 'stack',
  headingLevel = 2,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
  tone?: 'plain' | 'sunken';
  layout?: 'stack' | 'aside';
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section id={id} className={`section section-${tone} section-${layout}`} aria-labelledby={`${id}-title`}>
      <div className="container section-inner">
        <header className="section-head reveal">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <Heading id={`${id}-title`} className="section-title">
            {title}
          </Heading>
          {intro ? <p className="section-intro">{intro}</p> : null}
        </header>
        {children ? <div className="section-body">{children}</div> : null}
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

export interface LinkSpec {
  href: string;
  label: string;
}

export function PilotButtons({ secondary }: { secondary?: LinkSpec }) {
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
    <Section
      id={id}
      eyebrow="FAQ"
      title={title}
      layout="aside"
      intro={
        <>
          Something else? <a href="/contact">Ask us directly</a>.
        </>
      }
    >
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

/** A copy-to-clipboard button for the element with `target` as its id. Hidden until the clipboard API is available. */
export function CopyButton({ target, label = 'Copy' }: { target: string; label?: string }) {
  return (
    <button type="button" className="copy-button" data-copy-target={target} hidden>
      <Copy aria-hidden="true" size={14} />
      <span>{label}</span>
    </button>
  );
}

export function CodeBlock({ id, label, code }: { id: string; label: string; code: string }) {
  return (
    <figure className="code-block">
      <figcaption>
        <span>{label}</span>
        <CopyButton target={id} />
      </figcaption>
      <pre className="scroll-x" tabIndex={0} aria-label={label}>
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

/** Numbered procedure: each step has a short bold lead and a sentence of detail. */
export function Timeline({ steps }: { steps: { lead?: string; body: ReactNode }[] }) {
  return (
    <ol className="timeline reveal">
      {steps.map((step, index) => (
        <li key={index}>
          {step.lead ? <strong>{step.lead}</strong> : null} {step.body}
        </li>
      ))}
    </ol>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  actions?: ReactNode;
}) {
  const trail = useContext(TrailContext);
  return (
    <section className="page-hero" aria-labelledby="page-title">
      <div className="hero-backdrop hero-backdrop-soft" aria-hidden="true" />
      <div className="container page-hero-inner">
        <Breadcrumbs trail={trail} />
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 id="page-title">{title}</h1>
        <p className="hero-lede">{lede}</p>
        {actions ? <div className="actions page-hero-actions">{actions}</div> : null}
      </div>
    </section>
  );
}

/**
 * "On this page" links to the page's sections. It sticks below the site header; with scripting, the link for the
 * section in view is marked `aria-current="location"`.
 */
export function PageNav({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav className="page-nav" aria-label="On this page" data-page-nav data-md="skip">
      <div className="container page-nav-inner">
        <p className="page-nav-label" aria-hidden="true">
          On this page
        </p>
        <ul className="scroll-x">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/** A grid of linked cards: a title, a line of description and an explicit "details" affordance. */
export function LinkCards({
  items,
  cta = 'Details',
}: {
  items: (LinkSpec & { kicker?: string; body: string })[];
  cta?: string;
}) {
  return (
    <ul className="card-grid card-grid-3 link-cards">
      {items.map((item) => (
        <li key={item.href} className="card link-card reveal">
          {item.kicker ? <p className="card-kicker">{item.kicker}</p> : null}
          <h3>
            <a href={item.href}>{item.label}</a>
          </h3>
          <p>{item.body}</p>
          <p className="card-link" aria-hidden="true">
            {cta} <ArrowRight size={14} />
          </p>
        </li>
      ))}
    </ul>
  );
}
