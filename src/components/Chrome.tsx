import { Menu, Moon, Sun } from 'lucide-react';
import { INTEGRATIONS } from '../content/integrations';
import { SITE, markdownPath, pilotMailto } from '../site';

export const NAV = [
  { href: '/product', label: 'Product' },
  { href: '/security', label: 'Security' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/agents', label: 'Agents' },
  { href: '/about', label: 'About' },
] as const;

const isCurrent = (href: string, path: string) => path === href || path.startsWith(`${href}/`);

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" />
      <g fill="none" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M16 7 6.5 12 16 17l9.5-5L16 7Z" />
        <path d="m6.5 16.2 9.5 5 9.5-5" />
        <path d="m6.5 20.4 9.5 5 9.5-5" />
      </g>
    </svg>
  );
}

function ThemeToggle() {
  return (
    <button type="button" className="theme-toggle" data-theme-toggle aria-label="Switch colour theme">
      <Sun aria-hidden="true" size={16} className="icon-sun" />
      <Moon aria-hidden="true" size={16} className="icon-moon" />
    </button>
  );
}

export function SiteHeader({ path }: { path: string }) {
  const links = NAV.map((item) => (
    <li key={item.href}>
      <a href={item.href} aria-current={isCurrent(item.href, path) ? 'page' : undefined}>
        {item.label}
      </a>
    </li>
  ));
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="/" aria-label="Sembric home">
          <BrandMark />
          <span>Sembric</span>
        </a>
        <nav className="primary-nav" aria-label="Primary">
          <ul>{links}</ul>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <a className="button button-primary header-cta" href="/contact">
            Request a pilot
          </a>
          <details className="mobile-nav">
            <summary aria-label="Menu">
              <Menu aria-hidden="true" size={18} />
            </summary>
            <nav aria-label="Mobile">
              <ul>
                {links}
                <li>
                  <a href="/contact" aria-current={path === '/contact' ? 'page' : undefined}>
                    Request a pilot
                  </a>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function Breadcrumbs({ trail }: { trail: { href: string; label: string }[] }) {
  if (trail.length < 2) return null;
  return (
    <nav className="breadcrumbs container" aria-label="Breadcrumb">
      <ol>
        {trail.map((crumb, index) => (
          <li key={crumb.href}>
            {index === trail.length - 1 ? (
              <span aria-current="page">{crumb.label}</span>
            ) : (
              <a href={crumb.href}>{crumb.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SiteFooter({ path }: { path: string }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a className="brand" href="/" aria-label="Sembric home">
            <BrandMark />
            <span>Sembric</span>
          </a>
          <p>{SITE.tagline}. Certified answers for agents; your data stays in your warehouse.</p>
          <p className="footer-status">
            <span className="status-dot" aria-hidden="true" /> Available for pilots
          </p>
        </div>
        <nav aria-label="Product">
          <h2>Product</h2>
          <ul>
            <li>
              <a href="/product">How it works</a>
            </li>
            <li>
              <a href="/security">Security</a>
            </li>
            <li>
              <a href="/agents">Agents and MCP</a>
            </li>
            <li>
              <a href="/integrations">Integrations</a>
            </li>
          </ul>
        </nav>
        <nav aria-label="Integrations">
          <h2>Integrations</h2>
          <ul>
            {INTEGRATIONS.map((integration) => (
              <li key={integration.slug}>
                <a href={`/integrations/${integration.slug}`}>{integration.name}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2>Company</h2>
          <ul>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Request a pilot</a>
            </li>
            <li>
              <a href={pilotMailto}>{SITE.contactEmail}</a>
            </li>
            <li>
              <a href="/privacy">Privacy</a>
            </li>
          </ul>
        </nav>
        <nav aria-label="For AI agents">
          <h2>For agents</h2>
          <ul>
            <li>
              <a href="/llms.txt">llms.txt</a>
            </li>
            <li>
              <a href="/llms-full.txt">llms-full.txt</a>
            </li>
            <li>
              <a href={markdownPath(path)} type="text/markdown">
                This page as Markdown
              </a>
            </li>
            <li>
              <a href="/sitemap.xml">Sitemap</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="container footer-base">
        <p>
          © 2026 <a href={SITE.publisher.url}>{SITE.publisher.name}</a>. Sembric is built by {SITE.publisher.name}.
        </p>
        <p>No cookies. No trackers.</p>
      </div>
    </footer>
  );
}
