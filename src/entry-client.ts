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

function setupThemeToggle() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
  const label = () => (root.dataset.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  buttons.forEach((button) => {
    button.setAttribute('aria-label', label());
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* Storage can be blocked; the choice still applies to this page. */
      }
      buttons.forEach((other) => other.setAttribute('aria-label', label()));
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
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(source.textContent ?? '');
        text.textContent = 'Copied';
      } catch {
        text.textContent = 'Copy failed';
      }
      window.setTimeout(() => (text.textContent = 'Copy'), 2000);
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll<HTMLElement>('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
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

setupThemeToggle();
setupTabs();
setupCopyButtons();
setupReveal();
setupHeader();
