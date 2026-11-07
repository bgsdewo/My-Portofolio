/* ==========================================================
   Portofolio — Bagus Sadewo
   Interaksi: tema, menu mobile, navbar sticky, scroll reveal,
   nav aktif, typing effect, counter, filter proyek, form kontak.
   ========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* Path gambar di data-* / <a href> tidak diproses Vite saat build.
     Sesuaikan dengan base URL (mis. saat di-deploy ke subfolder GitHub Pages). */
  var BASE = import.meta.env.BASE_URL;
  var withBase = function (url) { return url && url.charAt(0) === '/' ? BASE + url.slice(1) : url; };
  if (BASE !== '/') {
    document.querySelectorAll('a[href^="/assets/"]').forEach(function (a) { a.setAttribute('href', withBase(a.getAttribute('href'))); });
    document.querySelectorAll('[data-img^="/"]').forEach(function (el) { el.setAttribute('data-img', withBase(el.getAttribute('data-img'))); });
  }

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

  /* ---------- Susun posisi tile di grid foto (bento) ----------
     Tile yang terlihat diberi data-pos 1..n, grid diberi data-count,
     sehingga layout tetap rapi berapa pun jumlah foto yang tampil. */
  function layoutPhotoGrid(grid) {
    var visible = Array.prototype.filter.call(grid.children, function (t) {
      return !t.classList.contains('is-hidden');
    });
    grid.setAttribute('data-count', Math.min(visible.length, 4));
    visible.forEach(function (t, i) { t.setAttribute('data-pos', i + 1); });
  }
  document.querySelectorAll('.photo-grid').forEach(layoutPhotoGrid);

  /* ---------- Pagination grid kartu di About ----------
     Jumlah kartu per halaman diatur lewat atribut di HTML:
     data-per-page (desktop/tablet) dan data-per-page-sm (HP, < 640px). */
  var smallScreen = window.matchMedia('(max-width: 639px)');

  document.querySelectorAll('[data-paginate]').forEach(function (list) {
    var items = Array.prototype.slice.call(list.children);
    // data-sync="id": daftar lain (mis. gambar sertifikat) ikut berganti halaman
    var synced = list.getAttribute('data-sync') ? document.getElementById(list.getAttribute('data-sync')) : null;
    var syncItems = synced ? Array.prototype.slice.call(synced.children) : [];
    var perPage, pages, page, pager, info, prev, next, nums;

    function makeBtn(parent, html, label, onClick) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pager-btn';
      b.innerHTML = html;
      b.setAttribute('aria-label', label);
      b.addEventListener('click', onClick);
      parent.appendChild(b);
      return b;
    }

    function build() {
      var big = parseInt(list.getAttribute('data-per-page'), 10) || 4;
      var sm = parseInt(list.getAttribute('data-per-page-sm'), 10) || big;
      perPage = smallScreen.matches ? sm : big;
      pages = Math.ceil(items.length / perPage);
      page = 0;
      if (pager) { pager.remove(); pager = null; }

      if (pages < 2) { // semua muat di satu halaman
        items.forEach(function (item) { item.classList.remove('is-hidden'); });
        syncItems.forEach(function (item) { item.classList.remove('is-hidden'); });
        if (synced) layoutPhotoGrid(synced);
        return;
      }

      pager = document.createElement('nav');
      pager.className = 'pager mt-6 flex items-center justify-between gap-4';
      pager.setAttribute('aria-label', 'Halaman daftar');
      info = document.createElement('span');
      info.className = 'pager-info font-mono text-[.78rem] text-muted';
      info.setAttribute('aria-live', 'polite');
      var btns = document.createElement('div');
      btns.className = 'pager-btns flex items-center gap-1.5';

      prev = makeBtn(btns, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>', 'Halaman sebelumnya', function () { show(page - 1, true); });
      nums = [];
      for (var n = 0; n < pages; n++) {
        (function (n) {
          nums.push(makeBtn(btns, String(n + 1), 'Halaman ' + (n + 1), function () { show(n, true); }));
        })(n);
      }
      next = makeBtn(btns, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>', 'Halaman berikutnya', function () { show(page + 1, true); });

      pager.appendChild(info);
      pager.appendChild(btns);
      list.after(pager);
      show(0, false);
    }

    function show(p, animate) {
      page = Math.max(0, Math.min(p, pages - 1));
      var start = page * perPage;
      var end = Math.min(start + perPage, items.length);
      items.forEach(function (item, i) { item.classList.toggle('is-hidden', i < start || i >= end); });
      syncItems.forEach(function (item, i) { item.classList.toggle('is-hidden', i < start || i >= end); });
      if (synced) layoutPhotoGrid(synced);
      nums.forEach(function (b, i) {
        if (i === page) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
      });
      prev.disabled = page === 0;
      next.disabled = page === pages - 1;
      info.textContent = (start + 1) + '–' + end + ' dari ' + items.length;
      list.dispatchEvent(new CustomEvent('pagechange', { detail: { animate: !!animate } }));
      if (animate) {
        list.classList.remove('page-in');
        void list.offsetWidth;
        list.classList.add('page-in');
        if (synced) { synced.classList.remove('page-in'); void synced.offsetWidth; synced.classList.add('page-in'); }
        // Jaga agar awal daftar tetap terlihat setelah pindah halaman
        var top = list.getBoundingClientRect().top;
        var navH = document.getElementById('navbar').offsetHeight;
        if (top < navH) {
          var y = window.scrollY + top - navH - 16;
          if (window.lenis) window.lenis.scrollTo(y); else window.scrollTo(0, y);
        }
      }
    }

    build();
    // Bangun ulang hanya bila benar-benar pindah antara HP <-> desktop
    var wasSmall = smallScreen.matches;
    function onBreakpoint() {
      if (smallScreen.matches === wasSmall) return;
      wasSmall = smallScreen.matches;
      build();
    }
    if (smallScreen.addEventListener) smallScreen.addEventListener('change', onBreakpoint);
    else smallScreen.addListener(onBreakpoint);
  });

  /* ---------- Sertifikat: pilih kartu -> tampilkan detail di kanan ---------- */
  var certList = document.getElementById('cert-list');
  var certDetail = document.getElementById('cert-detail');
  if (certList && certDetail) {
    var certItems = Array.prototype.slice.call(certList.querySelectorAll('.cert-item'));
    var $ = function (id) { return document.getElementById(id); };
    var pad = function (n) { return String(n).padStart(2, '0'); };

    function selectCert(item, userAction) {
      var d = item.dataset;
      certItems.forEach(function (it) {
        var on = it === item;
        it.classList.toggle('is-selected', on);
        it.querySelector('.cert-select').setAttribute('aria-pressed', String(on));
      });
      $('cert-detail-img').src = d.img;
      $('cert-detail-img').alt = 'Sertifikat CodePolitan: ' + d.title;
      $('cert-detail-link').href = d.img;
      $('cert-detail-full').href = d.img;
      $('cert-detail-verify').href = 'https://codepolitan.com/c/' + d.code;
      $('cert-detail-date').textContent = d.date;
      $('cert-detail-title').textContent = d.title;
      $('cert-detail-desc').textContent = d.desc;
      $('cert-detail-count').textContent = pad(certItems.indexOf(item) + 1) + ' / ' + pad(certItems.length);

      certDetail.classList.remove('swap');
      void certDetail.offsetWidth;
      certDetail.classList.add('swap');

      // Di HP detail ada di bawah daftar: gulir ke sana setelah memilih
      if (userAction && smallScreen.matches) {
        var navH = document.getElementById('navbar').offsetHeight;
        var y = window.scrollY + certDetail.getBoundingClientRect().top - navH - 16;
        if (window.lenis) window.lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }

    certItems.forEach(function (item) {
      item.querySelector('.cert-select').addEventListener('click', function () { selectCert(item, true); });
    });

    // Pindah halaman: pilih kartu pertama di halaman itu bila pilihan sebelumnya tersembunyi
    certList.addEventListener('pagechange', function () {
      var current = certList.querySelector('.cert-item.is-selected');
      if (current && !current.classList.contains('is-hidden')) return;
      var first = certItems.filter(function (it) { return !it.classList.contains('is-hidden'); })[0];
      if (first) selectCert(first, false);
    });
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
