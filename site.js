(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 700px)').matches;
  var isCompact = window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches;

  /* ── Page enter (no blank screen) ── */
  function initPageEnter() {
    document.body.classList.add('is-entering');
    window.setTimeout(function () {
      document.body.classList.remove('is-entering');
    }, prefersReducedMotion ? 1 : 520);
  }

  /* ── Mobile menu ── */
  window.toggleMenu = function () {
    var menu = document.querySelector('.mobile-menu');
    if (!menu) return;
    var opening = !menu.classList.contains('open');
    menu.classList.toggle('open', opening);
    document.body.classList.toggle('menu-open', opening);
    if (opening) {
      menu.querySelectorAll('a').forEach(function (link, i) {
        link.style.setProperty('--nav-i', i);
      });
    }
  };

  document.querySelectorAll('.mobile-menu a').forEach(function (link) {
    link.addEventListener('click', function () {
      var menu = document.querySelector('.mobile-menu');
      if (menu && menu.classList.contains('open')) toggleMenu();
    });
  });

  /* ── Lightbox ── */
  var lightboxClosing = false;

  window.openLightbox = function (src, alt) {
    var box = document.querySelector('.lightbox');
    if (!box) return;
    var img = box.querySelector('img');
    img.src = src;
    img.alt = alt || '';
    lightboxClosing = false;
    box.classList.remove('closing');
    box.classList.add('open');
    document.body.classList.add('lightbox-open');
    window.requestAnimationFrame(function () {
      box.classList.add('visible');
    });
  };

  window.closeLightbox = function (e) {
    if (e && e.target && e.target.tagName === 'IMG') return;
    var box = document.querySelector('.lightbox');
    if (!box || !box.classList.contains('open') || lightboxClosing) return;
    lightboxClosing = true;
    box.classList.remove('visible');
    box.classList.add('closing');
    window.setTimeout(function () {
      box.classList.remove('open', 'closing');
      document.body.classList.remove('lightbox-open');
      lightboxClosing = false;
    }, prefersReducedMotion ? 1 : 320);
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ── Scroll reveal (IntersectionObserver) ── */
  function initReveal() {
    var selectors = [
      { sel: '.title, .subtitle, .center .eyebrow', type: 'reveal-heading' },
      { sel: '.card', type: 'reveal-card' },
      { sel: '.feature-strip .card', type: 'reveal-card', stagger: true },
      { sel: '.stat', type: 'reveal-card', stagger: true },
      { sel: '.portrait-frame', type: 'reveal-image' },
      { sel: '.journey-gallery img', type: 'reveal-image', stagger: true },
      { sel: '.memory', type: 'reveal-gallery', stagger: true },
      { sel: '.letter', type: 'reveal-card' },
      { sel: '.celebrate', type: 'reveal-celebrate' },
      { sel: '.milestone', type: 'reveal-milestone', stagger: true },
      { sel: '.side-note', type: 'reveal-card' },
      { sel: '.quote', type: 'reveal-card' }
    ];

    selectors.forEach(function (cfg) {
      document.querySelectorAll(cfg.sel).forEach(function (el, i) {
        if (el.closest('.home-hero')) return;
        el.classList.add('reveal', cfg.type);
        if (cfg.stagger) el.style.setProperty('--reveal-i', i);
      });
    });

    var timeline = document.querySelector('.timeline');
    if (timeline) timeline.classList.add('reveal-timeline');

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .reveal-timeline').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    document.querySelectorAll('.reveal, .reveal-timeline').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Hero sequence (home) ── */
  function initHero() {
    var hero = document.querySelector('.home-hero');
    if (!hero) return;

    var sequence = [
      '.hero-bg',
      '.eyebrow',
      '.title',
      '.hero-copy > h2',
      '.credentials',
      '.hero-copy > p',
      '.hero-actions',
      '.stats',
      '.portrait-frame',
      '.hero-flowers'
    ];

    sequence.forEach(function (sel, i) {
      var el = hero.querySelector(sel);
      if (el) {
        el.classList.add('hero-item');
        el.style.setProperty('--hero-i', i);
      }
    });

    if (prefersReducedMotion) {
      hero.querySelectorAll('.hero-item').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    window.requestAnimationFrame(function () {
      hero.classList.add('hero-ready');
    });
  }

  /* ── Decorative ECG (fills host box, seamless infinite loop) ── */
  var ECG_BEAT_W = 80;
  var ECG_BEATS = 16;
  var ECG_H = 48;

  function ecgPath() {
    var parts = [];
    var i;
    for (i = 0; i < ECG_BEATS; i++) {
      var x = i * ECG_BEAT_W;
      parts.push(
        'M' + x + ',24 h14 h6 l4,-16 l4,32 l4,-16 h16 h6 l4,-10 l4,20 l4,-10 h14'
      );
    }
    return parts.join(' ');
  }

  function ecgSvgMarkup() {
    var w = ECG_BEAT_W * ECG_BEATS;
    var path =
      '<path class="ecg-path" d="' +
      ecgPath() +
      '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    var svg =
      '<svg class="ecg-line" viewBox="0 0 ' +
      w +
      ' ' +
      ECG_H +
      '" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false">' +
      path +
      '</svg>';
    return svg + svg;
  }

  function initEcg() {
    document.querySelectorAll('.credentials, .celebrate').forEach(function (host) {
      if (host.querySelector('.ecg-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'ecg-wrap';
      var track = document.createElement('div');
      track.className = 'ecg-track';
      track.innerHTML = ecgSvgMarkup();
      wrap.appendChild(track);
      host.insertBefore(wrap, host.firstChild);
    });
  }

  /* ── Floating graduation motifs (petals layer) ── */
  var floatMotifs = [
    { glyph: '✿', kind: 'flower' },
    { glyph: '❀', kind: 'flower' },
    { glyph: '✾', kind: 'flower' },
    { glyph: '🎓', kind: 'cap' },
    { glyph: '📜', kind: 'scroll' },
    { glyph: '🩺', kind: 'medical' },
    { glyph: '♥', kind: 'heart' },
    { glyph: '✦', kind: 'sparkle' }
  ];

  function initPetals() {
    if (prefersReducedMotion) return;

    var container = document.createElement('div');
    container.className = 'petals-layer';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    var count = isMobile ? 4 : isCompact ? 6 : 12;

    for (var i = 0; i < count; i++) {
      var petal = document.createElement('span');
      petal.className = 'petal';
      var inner = document.createElement('span');
      inner.className = 'petal-inner';
      var isDot = Math.random() > 0.88;

      if (isDot) {
        inner.classList.add('petal-dot');
        if (Math.random() > 0.65) inner.classList.add('petal-dot-gold');
      } else {
        var motif = floatMotifs[Math.floor(Math.random() * floatMotifs.length)];
        inner.textContent = motif.glyph;
        inner.classList.add('petal-glyph', 'petal-' + motif.kind);
      }

      petal.style.setProperty('--x', Math.random() * 100 + '%');
      petal.style.setProperty('--delay', Math.random() * 8 + 's');
      petal.style.setProperty('--duration', 14 + Math.random() * 10 + 's');
      petal.style.setProperty('--drift', (Math.random() * 40 - 20) + 'px');
      petal.style.setProperty('--size', 0.8 + Math.random() * 0.45);
      petal.style.setProperty('--spin', (180 + Math.random() * 220) + 'deg');
      petal.style.setProperty('--sway', (Math.random() * 14 - 7) + 'px');
      petal.appendChild(inner);
      container.appendChild(petal);
    }
  }

  /* ── Hero flowers ── */
  function initHeroFlowers() {
    var hero = document.querySelector('.home-hero');
    if (!hero || prefersReducedMotion) return;

    var wrap = document.createElement('div');
    wrap.className = 'hero-flowers hero-item';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.setProperty('--hero-i', 9);
    var blooms = isMobile ? 2 : isCompact ? 3 : 5;
    for (var i = 0; i < blooms; i++) {
      var f = document.createElement('span');
      f.className = 'hero-flower';
      f.textContent = '✿';
      f.style.setProperty('--fx', 8 + i * 18 + '%');
      f.style.setProperty('--fy', 10 + (i % 3) * 28 + '%');
      f.style.setProperty('--fd', i * 0.6 + 's');
      wrap.appendChild(f);
    }
    hero.appendChild(wrap);

    var bg = document.createElement('div');
    bg.className = 'hero-bg hero-item';
    bg.setAttribute('aria-hidden', 'true');
    bg.style.setProperty('--hero-i', 0);
    hero.insertBefore(bg, hero.firstChild);
  }

  /* ── Lightweight confetti / party popper ── */
  function burstConfetti(originEl, options) {
    if (prefersReducedMotion) return;

    options = options || {};
    var fullPage = !!options.fullPage;

    var canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas' + (fullPage ? ' confetti-canvas--popper' : '');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    ctx.scale(dpr, dpr);

    var rect = originEl
      ? originEl.getBoundingClientRect()
      : { left: vw / 2, top: vh / 2, width: 0, height: 0 };
    var ox = rect.left + rect.width / 2;
    var oy = rect.top + rect.height / 2;
    var colors = ['#8d1740', '#b64066', '#ffdf7c', '#fff0f4', '#d7a01e', '#e8a8bc'];
    var emojis = ['🎓', '✿', '✦', '♥', '📜'];
    var count = fullPage ? (isCompact ? 36 : 72) : isCompact ? 24 : 56;
    var pieces = [];
    var origins = fullPage
      ? [
          { x: ox, y: oy, weight: 0.42 },
          { x: vw * 0.18, y: vh * 0.38, weight: 0.18 },
          { x: vw * 0.82, y: vh * 0.28, weight: 0.16 },
          { x: vw * 0.5, y: vh * 0.12, weight: 0.12 },
          { x: vw * 0.72, y: vh * 0.72, weight: 0.12 }
        ]
      : [{ x: ox, y: oy, weight: 1 }];

    function pickOrigin() {
      var roll = Math.random();
      var sum = 0;
      for (var o = 0; o < origins.length; o++) {
        sum += origins[o].weight;
        if (roll <= sum) return origins[o];
      }
      return origins[0];
    }

    for (var i = 0; i < count; i++) {
      var origin = pickOrigin();
      var angle = Math.random() * Math.PI * 2;
      var speed = fullPage
        ? (isMobile ? 6 : 9) + Math.random() * (isMobile ? 10 : 16)
        : (Math.random() - 0.5) * (isMobile ? 7 : 10);
      var useEmoji = fullPage ? Math.random() < 0.22 : Math.random() < 0.08;

      if (fullPage) {
        pieces.push({
          type: useEmoji ? 'emoji' : 'rect',
          x: origin.x + (Math.random() - 0.5) * 12,
          y: origin.y + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 4 + 1),
          w: 4 + Math.random() * 5,
          h: 6 + Math.random() * 7,
          rot: Math.random() * 360,
          vr: (Math.random() - 0.5) * 14,
          color: colors[i % colors.length],
          emoji: emojis[i % emojis.length],
          size: 12 + Math.random() * 8,
          life: 1,
          drag: 0.985 + Math.random() * 0.01
        });
      } else {
        pieces.push({
          type: useEmoji ? 'emoji' : 'rect',
          x: origin.x,
          y: origin.y,
          vx: (Math.random() - 0.5) * (isMobile ? 7 : 10),
          vy: Math.random() * -9 - 3,
          w: 4 + Math.random() * 5,
          h: 6 + Math.random() * 7,
          rot: Math.random() * 360,
          vr: (Math.random() - 0.5) * 12,
          color: colors[i % colors.length],
          emoji: emojis[i % emojis.length],
          size: 11 + Math.random() * 6,
          life: 1,
          drag: 1
        });
      }
    }

    var start = performance.now();
    var duration = fullPage ? (isCompact ? 1500 : 2200) : isCompact ? 1100 : 1800;

    function drawPiece(p) {
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      if (p.type === 'emoji') {
        ctx.font = p.size + 'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }

    function frame(now) {
      var t = now - start;
      ctx.clearRect(0, 0, vw, vh);
      var alive = false;

      pieces.forEach(function (p) {
        if (t > duration * 0.58) p.life -= fullPage ? 0.018 : 0.025;
        if (p.life <= 0) return;
        alive = true;
        p.vy += fullPage ? 0.14 : 0.18;
        if (p.drag !== 1) {
          p.vx *= p.drag;
          p.vy *= p.drag;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        drawPiece(p);
      });

      if (alive && t < duration) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }

    requestAnimationFrame(frame);
  }

  /* ── Flower celebration trigger (all pages) ── */
  function initCelebrationTrigger() {
    if (document.querySelector('.celebration-trigger')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'celebration-trigger';
    btn.setAttribute('aria-label', 'Celebrate — party popper');
    btn.innerHTML = '<span class="celebration-trigger__icon" aria-hidden="true">✿</span>';

    if (!prefersReducedMotion) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-popping')) return;
        btn.classList.add('is-popping');
        burstConfetti(btn, { fullPage: true });
        window.setTimeout(function () {
          btn.classList.remove('is-popping');
        }, 720);
      });
    }

    document.body.appendChild(btn);
  }

  /* ── Celebration section ── */
  function initCelebration() {
    var section = document.querySelector('.celebrate');
    if (!section) return;

    section.classList.add('celebrate-stage');

    var btn = section.querySelector('[data-celebrate-again]');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        section.classList.remove('celebrate-pop');
        void section.offsetWidth;
        section.classList.add('celebrate-pop');
        burstConfetti(btn);
      });
    }

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      section.classList.add('celebrate-pop');
      return;
    }

    var fired = false;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || fired) return;
          fired = true;
          section.classList.add('celebrate-pop');
          burstConfetti(section.querySelector('h2'));
          obs.disconnect();
        });
      },
      { threshold: 0.35 }
    );
    obs.observe(section);
  }

  /* ── Desktop nav underline tracking ── */
  function initNav() {
    document.querySelectorAll('.desktop-nav a').forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        link.classList.add('nav-hover');
      });
      link.addEventListener('mouseleave', function () {
        link.classList.remove('nav-hover');
      });
    });
  }

  /* ── Smooth internal anchors ── */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  function initVisibilityPause() {
    function sync() {
      document.body.classList.toggle('is-hidden', document.hidden);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
  }

  /* ── Boot ── */
  function boot() {
    initPageEnter();
    initHeroFlowers();
    initHero();
    initEcg();
    initPetals();
    initCelebrationTrigger();
    initReveal();
    initCelebration();
    initNav();
    initAnchors();
    initVisibilityPause();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
