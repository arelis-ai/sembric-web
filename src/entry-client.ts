// Progressive enhancement only: every page is complete, readable HTML without this script.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './styles/tokens.css';
import './styles/site.css';

const root = document.documentElement;
const THEME_KEY = 'sembric-theme';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Announces a short status message to screen readers through the page's polite live region. */
function announce(message: string) {
  const region = document.querySelector('[data-live-region]');
  if (!region) return;
  region.textContent = '';
  window.setTimeout(() => (region.textContent = message), 50);
}

function setupThemeToggle() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
  const label = () => (root.dataset.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  const sync = () =>
    buttons.forEach((button) => {
      button.setAttribute('aria-label', label());
      button.title = label();
    });
  sync();
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* Storage can be blocked; the choice still applies to this page. */
      }
      sync();
      announce(next === 'light' ? 'Light theme' : 'Dark theme');
    });
  });
}

function setupTabs() {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((container) => {
    const tabs = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const select = (tab: HTMLButtonElement, focus: boolean) => {
      tabs.forEach((other) => {
        const selected = other === tab;
        other.setAttribute('aria-selected', String(selected));
        other.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(other.getAttribute('aria-controls') ?? '');
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (event) => {
        const last = tabs.length - 1;
        const target =
          event.key === 'ArrowRight'
            ? tabs[index === last ? 0 : index + 1]
            : event.key === 'ArrowLeft'
              ? tabs[index === 0 ? last : index - 1]
              : event.key === 'Home'
                ? tabs[0]
                : event.key === 'End'
                  ? tabs[last]
                  : undefined;
        if (target) {
          event.preventDefault();
          select(target, true);
        }
      });
    });
  });
}

function setupCopyButtons() {
  if (!navigator.clipboard) return;
  document.querySelectorAll<HTMLButtonElement>('[data-copy-target]').forEach((button) => {
    const source = document.getElementById(button.dataset.copyTarget ?? '');
    const text = button.querySelector('span');
    if (!source || !text) return;
    const idle = text.textContent ?? 'Copy';
    let timer = 0;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(source.textContent?.trim() ?? '');
        text.textContent = 'Copied';
      } catch {
        text.textContent = 'Copy failed';
      }
      announce(text.textContent);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (text.textContent = idle), 2000);
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  root.classList.add('reveal-ready');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((item) => {
    // Content already on screen at load is shown immediately so nothing above the fold animates in late.
    if (item.getBoundingClientRect().top < window.innerHeight) item.classList.add('is-visible');
    else observer.observe(item);
  });
}

function setupHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/** The mobile menu closes on Escape (returning focus to its button), on a click outside it and after a link is chosen. */
function setupMobileNav() {
  document.querySelectorAll<HTMLDetailsElement>('[data-mobile-nav]').forEach((menu) => {
    const summary = menu.querySelector('summary');
    const close = (focus: boolean) => {
      if (!menu.open) return;
      menu.open = false;
      if (focus) summary?.focus();
    };
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close(true);
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target as Node)) close(false);
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => close(false)));
  });
}

/** Marks the "On this page" link of the section being read, and keeps that link scrolled into the bar. */
function setupPageNav() {
  const nav = document.querySelector<HTMLElement>('[data-page-nav]');
  if (!nav || !('IntersectionObserver' in window)) return;
  const list = nav.querySelector('ul');
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const sections = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter((section): section is HTMLElement => section !== null);
  const visible = new Set<Element>();
  const mark = () => {
    const current = sections.find((section) => visible.has(section));
    links.forEach((link) => {
      const active = current !== undefined && link.hash === `#${current.id}`;
      if (active) {
        link.setAttribute('aria-current', 'location');
        if (list) {
          const left = link.offsetLeft - list.offsetLeft;
          if (left < list.scrollLeft || left + link.offsetWidth > list.scrollLeft + list.clientWidth)
            list.scrollTo({ left: left - 16, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
      } else link.removeAttribute('aria-current');
    });
  };
  // A section counts as current while it crosses the band just below the sticky header and page navigation.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
      mark();
    },
    { rootMargin: '-140px 0px -55% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
}

/** Printing shows every FAQ answer, not only the open ones. */
function setupPrint() {
  window.addEventListener('beforeprint', () =>
    document.querySelectorAll<HTMLDetailsElement>('details.faq-item').forEach((item) => (item.open = true)),
  );
}

setupThemeToggle();
setupTabs();
setupCopyButtons();
setupReveal();
setupHeader();
setupMobileNav();
setupPageNav();
setupPrint();
