/* ==========================================================
   Portofolio — Bagus Sadewo
   Interaksi: tema, menu mobile, navbar sticky, scroll reveal,
   nav aktif, typing effect, counter, filter proyek, form kontak.
   ========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tema terang/gelap ---------- */
  var themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Menu mobile ---------- */
  var menuToggle = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');

  function closeMenu() {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu');
  }

  menuToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Navbar sticky & tombol kembali ke atas ---------- */
  var navbar = document.getElementById('navbar');
  var backToTop = document.getElementById('back-to-top');

  function onScroll() {
    var y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 20);
    backToTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', function () {
    if (window.lenis) window.lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Scroll reveal (dengan stagger per grup) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('reveal');
    });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--delay', Math.min(i * 0.08, 0.4) + 's');
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Link navigasi aktif ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var links = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Efek mengetik di hero ---------- */
  var typed = document.getElementById('typed');
  var roles = ['Full Stack Developer', 'Frontend Engineer', 'Backend Developer', 'Problem Solver'];

  if (typed && !reduceMotion) {
    var roleIndex = 0;
    var charIndex = roles[0].length;
    var deleting = true;

    (function tick() {
      var word = roles[roleIndex];
      typed.textContent = word.slice(0, charIndex);
      var delay = deleting ? 45 : 90;

      if (deleting) {
        charIndex--;
        if (charIndex < 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          charIndex = 0;
          delay = 300;
        }
      } else {
        charIndex++;
        if (charIndex > roles[roleIndex].length) {
          deleting = true;
          charIndex = roles[roleIndex].length;
          delay = 2200;
        }
      }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Counter statistik ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObserver.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-count'); });
  }

  /* ---------- Filter proyek ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });
      projectCards.forEach(function (card) {
        var show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('hide', !show);
        if (show) card.classList.add('visible');
      });
    });
  });

  /* ---------- Form kontak ----------
     Tanpa backend: validasi di sisi klien lalu membuka aplikasi email
     dengan isi pesan yang sudah terisi. Ganti CONTACT_EMAIL dengan email kamu,
     atau hubungkan ke layanan seperti Formspree bila ingin tanpa mailto. */
  var CONTACT_EMAIL = 'email@contoh.com';
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');

  function setError(field, msg) {
    var wrap = field.closest('.field');
    wrap.classList.toggle('invalid', !!msg);
    wrap.querySelector('.error-msg').textContent = msg || '';
  }

  function validate(field) {
    var value = field.value.trim();
    if (!value) return 'Bagian ini wajib diisi.';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid.';
    if (field.name === 'message' && value.length < 10) return 'Pesan minimal 10 karakter.';
    return '';
  }

  form.querySelectorAll('input, textarea').forEach(function (field) {
    field.addEventListener('blur', function () { setError(field, validate(field)); });
    field.addEventListener('input', function () {
      if (field.closest('.field').classList.contains('invalid')) setError(field, validate(field));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll('input, textarea');
    var firstInvalid = null;

    fields.forEach(function (field) {
      var msg = validate(field);
      setError(field, msg);
      if (msg && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      statusEl.textContent = '';
      return;
    }

    var name = form.elements['name'].value.trim();
    var email = form.elements['email'].value.trim();
    var message = form.elements['message'].value.trim();
    var subject = encodeURIComponent('Pesan dari portofolio — ' + name);
    var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');

    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    statusEl.textContent = 'Terima kasih, ' + name + '! Aplikasi email kamu akan terbuka.';
    form.reset();
  });

  /* ---------- Galeri foto otomatis (About) ---------- */
  var gallery = document.getElementById('gallery');
  if (gallery) {
    var DURATION = 4500; // ms per foto
    var slides = gallery.querySelectorAll('.slide');
    var dotsWrap = gallery.querySelector('.gallery-dots');
    var countEl = gallery.querySelector('.gallery-count');
    var current = 0;
    var timer = null;
    var startedAt = 0;
    var remaining = DURATION;
    var reasons = {}; // alasan pause: hover, focus, offscreen, hidden, motion

    gallery.style.setProperty('--slide-ms', DURATION + 'ms');

    var dots = Array.prototype.map.call(slides, function (slide, i) {
      var dot = document.createElement('button');
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', 'Foto ' + (i + 1));
      dot.innerHTML = '<span></span>';
      dot.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function isPaused() { return Object.keys(reasons).some(function (k) { return reasons[k]; }); }

    function schedule() {
      clearTimeout(timer);
      if (isPaused() || slides.length < 2) return;
      startedAt = Date.now();
      timer = setTimeout(function () { go(current + 1); }, remaining);
    }

    function setPause(reason, on) {
      var was = isPaused();
      reasons[reason] = on;
      var now = isPaused();
      gallery.classList.toggle('paused', now);
      if (now && !was) {
        clearTimeout(timer);
        remaining = Math.max(remaining - (Date.now() - startedAt), 0);
      } else if (!now && was) {
        schedule();
      }
    }

    function go(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var active = i === current;
        s.classList.toggle('active', active);
        s.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach(function (d, i) {
        d.classList.remove('active');
        d.classList.toggle('done', i < current);
        d.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
      void dotsWrap.offsetWidth; // restart animasi progress
      dots[current].classList.add('active');
      if (reasons.motion) dots[current].classList.add('done');
      countEl.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      remaining = DURATION;
      schedule();
    }

    gallery.querySelector('.prev').addEventListener('click', function () { go(current - 1); });
    gallery.querySelector('.next').addEventListener('click', function () { go(current + 1); });

    // Pause saat di-hover / difokus, lanjut saat ditinggal
    gallery.addEventListener('mouseenter', function () { setPause('hover', true); });
    gallery.addEventListener('mouseleave', function () { setPause('hover', false); });
    // Fokus hanya mem-pause bila dari keyboard (klik tombol tidak membuat galeri berhenti)
    gallery.addEventListener('focusin', function (e) {
      if (e.target.matches(':focus-visible')) setPause('focus', true);
    });
    gallery.addEventListener('focusout', function () { setPause('focus', false); });
    gallery.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(current + 1);
      if (e.key === 'ArrowLeft') go(current - 1);
    });

    // Geser (swipe) di HP
    var startX = null;
    var track = gallery.querySelector('.gallery-track');
    track.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    track.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    });

    // Hemat: berhenti saat tidak terlihat atau tab disembunyikan
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        setPause('offscreen', !entries[0].isIntersecting);
      }, { threshold: 0.25 }).observe(gallery);
    }
    document.addEventListener('visibilitychange', function () { setPause('hidden', document.hidden); });

    // Pengguna yang memilih "reduce motion": tidak autoplay, navigasi manual saja
    if (reduceMotion) reasons.motion = true;

    go(0);
  }

  /* ---------- Tabs Pendidikan / Pengalaman / Sertifikat ---------- */
  var tabList = document.querySelector('.tabs');
  if (tabList) {
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll('[role="tab"]'));
    var indicator = tabList.querySelector('.tab-indicator');

    function selectTab(tab, focus) {
      tabs.forEach(function (t, i) {
        var active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !active;
        panel.classList.toggle('active', active);
        if (active) indicator.style.transform = 'translateX(' + i * 100 + '%)';
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
  }

  /* ---------- Tahun di footer ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
