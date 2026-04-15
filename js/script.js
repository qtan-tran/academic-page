/* ═══════════════════════════════════════════════
   script.js — Core interactions
   (expanded in later prompts)
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Scroll-shadow on nav
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // 3. Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = themeToggle.querySelector('.theme-icon');
  const savedTheme  = localStorage.getItem('theme') || 'light';

  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☽';

  themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeIcon.textContent = next === 'dark' ? '☀' : '☽';
    themeToggle.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} mode`);
  });

  // 4. Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu on link click
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // 5. Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));

  // 6. Publications tab switcher
  const pubTabs   = document.querySelectorAll('.pub-tab');
  const pubPanels = document.querySelectorAll('.pub-panel');

  pubTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('aria-controls');

      pubTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      pubPanels.forEach(p => p.classList.add('hidden'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(target).classList.remove('hidden');
    });
  });

  loadPublications();
  loadProjects();
});

/* ─────────────────────────────────────────
   Data loaders (stub — fill in Prompt 9)
───────────────────────────────────────── */
async function loadPublications() {
  try {
    const res  = await fetch('data/publications.json');
    const data = await res.json();
    renderPublications(data);
  } catch {
    // JSON not yet populated — silently skip
  }
}

function renderPublications(data) {
  const panels = { books: 'tab-books', articles: 'tab-articles', conf: 'tab-conf' };

  Object.entries(panels).forEach(([key, panelId]) => {
    const panel = document.getElementById(panelId);
    const items = data[key] || [];

    if (!items.length) {
      panel.innerHTML = '<p class="status-text">No publications are available at this time.</p>';
      return;
    }

    panel.innerHTML = items.map(pub => `
      <article class="pub-card" aria-label="${pub.title}">
        <p class="pub-type-badge">${pub.type || ''}</p>
        <h3 class="pub-title">${pub.title}</h3>
        <p class="pub-authors">${pub.authors}</p>
        <p class="pub-venue">${pub.venue} · ${pub.year}</p>
        <div class="pub-links">
          ${pub.doi  ? `<a class="pub-link" href="${pub.doi}"  target="_blank" rel="noopener">DOI</a>` : ''}
          ${pub.pdf  ? `<a class="pub-link" href="${pub.pdf}"  target="_blank" rel="noopener">PDF</a>` : ''}
          ${pub.abstract ? `<button class="pub-toggle" aria-expanded="false">+ Abstract</button>` : ''}
        </div>
        ${pub.abstract ? `<div class="pub-abstract">${pub.abstract}</div>` : ''}
      </article>
    `).join('');

    // Wire abstract toggles
    panel.querySelectorAll('.pub-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const abstract = btn.closest('.pub-card').querySelector('.pub-abstract');
        const isOpen   = abstract.classList.toggle('open');
        btn.textContent = isOpen ? '− Abstract' : '+ Abstract';
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    });
  });
}

async function loadProjects() {
  // Inline data (no separate JSON needed for projects)
  const projects = [
    {
      title: 'CrewAI Open Infra Orchestrator',
      type: 'Project',
      featured: true,
      desc: 'A multi-agent orchestration system built with CrewAI for automating open infrastructure tasks — metadata harvesting, compliance checks, and repository indexing across scholarly platforms.',
      tech: ['Python', 'CrewAI', 'FastAPI', 'Docker'],
      github: 'https://github.com/',
      demo: null
    },
    {
      title: 'Ollama Semantic Literature Search',
      type: 'Repo',
      featured: false,
      desc: 'Local-first semantic search over academic literature using Ollama-hosted LLMs and FAISS vector indices. No cloud dependency — runs on your own hardware.',
      tech: ['Python', 'Ollama', 'FAISS', 'LangChain'],
      github: 'https://github.com/',
      demo: null
    },
    {
      title: 'Open Science Metadata Validator',
      type: 'Repo',
      featured: false,
      desc: 'A lightweight CLI + API to validate scholarly metadata against FAIR data principles and common open-access schemas (OpenAIRE, DataCite).',
      tech: ['Python', 'Pydantic', 'Click', 'JSON-LD'],
      github: 'https://github.com/',
      demo: null
    }
  ];

  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = projects.map(p => `
    <article class="project-card${p.featured ? ' featured' : ''}" aria-label="${p.title}">
      <p class="project-tag-type">${p.type}</p>
      <h3 class="project-title">${p.title}</h3>
      <p class="project-desc">${p.desc}</p>
      <div class="tech-tags">
        ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
      <div class="project-links">
        ${p.github ? `<a class="btn btn-secondary btn-sm" href="${p.github}" target="_blank" rel="noopener">GitHub ↗</a>` : ''}
        ${p.demo   ? `<a class="btn btn-primary  btn-sm" href="${p.demo}"   target="_blank" rel="noopener">Demo ↗</a>`   : ''}
      </div>
    </article>
  `).join('');
}