/* ============================================================
   SPARTAN INTEGRATION — main.js
   GSAP 3 + ScrollTrigger animations & interactivity
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   NAV — scroll-aware background
   ============================================================ */
const nav = document.getElementById('nav');
if (nav) {
  ScrollTrigger.create({
    start: 'top -60',
    onEnter: () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });
}

/* Mobile menu */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

/* Smooth scroll offset for in-page anchors under the fixed nav */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});

/* ============================================================
   THEME TOGGLE
   ============================================================ */
(function () {
  const root = document.documentElement;
  const STORAGE_KEY = 'spartan-theme';

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });
  }

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  });
})();

/* ============================================================
   HERO ANIMATIONS
   ============================================================ */
if (document.querySelector('.hero')) {
  if (!prefersReducedMotion) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero-tag', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 0.2)
      .fromTo('.hero-line-inner', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.12 }, 0.4)
      .fromTo('.hero-sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.75 }, 0.9)
      .fromTo('.hero-actions', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 1.1)
      .fromTo('.hero-stats', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 1.3);
  } else {
    gsap.set(['.hero-tag', '.hero-line-inner', '.hero-sub', '.hero-actions', '.hero-stats'],
      { opacity: 1, y: 0, yPercent: 0 });
  }
}

/* ============================================================
   SCROLL REVEALS
   ============================================================ */
gsap.utils.toArray('.reveal-up').forEach(el => {
  gsap.fromTo(el, { opacity: 0, y: 32 }, {
    opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
  });
});

gsap.utils.toArray('.stagger-grid').forEach(grid => {
  gsap.fromTo(Array.from(grid.children),
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08,
      scrollTrigger: { trigger: grid, start: 'top 82%' } }
  );
});

/* ============================================================
   PROCESS — wiring-diagram connector draws in on scroll
   ============================================================ */
const processDraw = document.querySelector('.process-line .draw');
if (processDraw && !prefersReducedMotion) {
  const len = processDraw.getTotalLength();
  processDraw.style.strokeDasharray = len;
  processDraw.style.strokeDashoffset = len;
  gsap.to(processDraw, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.process-wrap',
      start: 'top 70%',
      end: 'bottom 55%',
      scrub: 0.6,
    },
  });
} else if (processDraw) {
  processDraw.style.strokeDashoffset = 0;
}

/* ============================================================
   SERVICES CAROUSEL
   ============================================================ */
(function () {
  const carousel = document.querySelector('.service-carousel');
  const track = carousel && carousel.querySelector('.carousel-track');
  const slides = carousel ? carousel.querySelectorAll('.carousel-slide') : [];
  if (!carousel || !track || !slides.length) return;

  const prevBtn = carousel.querySelector('.carousel-arrow-prev');
  const nextBtn = carousel.querySelector('.carousel-arrow-next');
  const counter = document.querySelector('.carousel-count-current');
  const hint = document.querySelector('.carousel-hint');
  const total = slides.length;
  let index = 0;

  if (prefersReducedMotion) carousel.classList.add('reduced-motion');

  function go(next) {
    index = (next + total) % total;
    const prevIndex = (index - 1 + total) % total;
    const nextIndex = (index + 1) % total;
    slides.forEach((slide, i) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next');
      if (i === index) slide.classList.add('is-active');
      else if (i === prevIndex) slide.classList.add('is-prev');
      else if (i === nextIndex) slide.classList.add('is-next');
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });
    if (counter) counter.textContent = index + 1;
    if (hint) hint.textContent = slides[index].querySelector('.service-name').textContent;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => go(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(index + 1));

  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(index - 1);
    else if (e.key === 'ArrowRight') go(index + 1);
  });

  go(0);
})();

/* ============================================================
   REVIEWS — cycle through all 9 real reviews from the original
   site's /reviews/ page, three at a time. Grouped so each visible
   set of 3 cards shows three different quotes (their site reuses
   three quote bodies across nine reviewers).
   ============================================================ */
const REVIEW_SETS = [
  [
    { stars: 5, name: 'Bonnie A.', meta: 'Lakeland · Jun 2020',
      quote: '“We needed a security system for our office. Spartan provided us a free estimate and the following day was able to install the security system and get our office secure. They provided training on the system and made sure we were ready to go. Their team is professional and polite and cleaned up after themselves — would highly recommend.”' },
    { stars: 4, name: 'Tigram J.', meta: 'Saint Cloud · Apr 2020',
      quote: '“We needed a camera system for our company showroom. I was able to get in contact with someone quickly, and Craig came out the next morning to provide a proposal. He came out the following day to install the system. The cameras worked great, and Craig made sure to review everything with us before leaving.”' },
    { stars: 5, name: 'Jason P.', meta: 'Kissimmee · Aug 2020',
      quote: '“We needed keyless entry at our office complex. Spartan provided an estimate and installed it the following week. The installers were professional and always on time. If you’re looking for a respectable company in the market for a system, I would highly recommend Spartan Integration.”' },
  ],
  [
    { stars: 4, name: 'Jack H.', meta: 'Longwood · Jul 2020',
      quote: '“We needed a security system for our office. Spartan provided us a free estimate and the following day was able to install the security system and get our office secure. They provided training on the system and made sure we were ready to go. Their team is professional and polite and cleaned up after themselves — would highly recommend.”' },
    { stars: 5, name: 'Sarah W.', meta: 'Titusville · Oct 2019',
      quote: '“We needed a camera system for our company showroom. I was able to get in contact with someone quickly, and Craig came out the next morning to provide a proposal. He came out the following day to install the system. The cameras worked great, and Craig made sure to review everything with us before leaving.”' },
    { stars: 5, name: 'Ray F.', meta: 'Winter Park · Aug 2020',
      quote: '“We needed keyless entry at our office complex. Spartan provided an estimate and installed it the following week. The installers were professional and always on time. If you’re looking for a respectable company in the market for a system, I would highly recommend Spartan Integration.”' },
  ],
  [
    { stars: 4, name: 'Steward S.', meta: 'Tampa · May 2019',
      quote: '“We needed a security system for our office. Spartan provided us a free estimate and the following day was able to install the security system and get our office secure. They provided training on the system and made sure we were ready to go. Their team is professional and polite and cleaned up after themselves — would highly recommend.”' },
    { stars: 5, name: 'Winsent B.', meta: 'Osteen · Jan 2019',
      quote: '“We needed a camera system for our company showroom. I was able to get in contact with someone quickly, and Craig came out the next morning to provide a proposal. He came out the following day to install the system. The cameras worked great, and Craig made sure to review everything with us before leaving. Thank you!”' },
    { stars: 5, name: 'Carla D.', meta: 'Jacksonville · Feb 2019',
      quote: '“We needed keyless entry at our office complex. Spartan provided an estimate and installed it the following week. The installers were professional and always on time. If you’re looking for a respectable company in the market for a system, I would highly recommend Spartan Integration.”' },
  ],
];

(function () {
  const grid = document.querySelector('.reviews-grid');
  const cards = document.querySelectorAll('.review-card');
  if (!grid || cards.length !== 3) return;

  let setIndex = 0;
  let timer = null;

  function render(index) {
    REVIEW_SETS[index].forEach((r, i) => {
      const card = cards[i];
      card.querySelector('.review-stars').textContent = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
      card.querySelector('.review-quote').textContent = r.quote;
      card.querySelector('.review-name').textContent = r.name;
      card.querySelector('.review-meta').textContent = r.meta;
    });
  }

  function next() {
    setIndex = (setIndex + 1) % REVIEW_SETS.length;
    if (prefersReducedMotion) {
      render(setIndex);
      return;
    }
    gsap.to(cards, {
      opacity: 0, y: 8, duration: 0.35, stagger: 0.05, ease: 'power1.in',
      onComplete: () => {
        render(setIndex);
        gsap.to(cards, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' });
      },
    });
  }

  function start() { timer = setInterval(next, 7000); }
  function stop() { clearInterval(timer); }

  start();
  grid.addEventListener('mouseenter', stop);
  grid.addEventListener('mouseleave', start);
})();

/* ============================================================
   FOOTER YEAR
   ============================================================ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Refresh ScrollTrigger after fonts/layout settle */
window.addEventListener('load', () => {
  const id = setTimeout(() => ScrollTrigger.refresh(), 200);
  return () => clearTimeout(id);
});
