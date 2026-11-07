/* ==========================================================
   HERO — motion & 3D
   - GSAP     : animasi intro, tombol magnetik, cahaya kursor
   - Lenis    : smooth scroll di seluruh halaman
   - Three.js : scene 3D "Full Stack" (lihat stack-scene.js)
   Library diinstal lewat npm dan di-bundle oleh Vite.
   Kalau WebGL tidak tersedia atau user memilih "reduce motion",
   halaman tetap tampil normal.
   ========================================================== */
import { gsap } from 'gsap';
import Lenis from 'lenis';

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = true;

  /* ---------- 1. Pecah judul menjadi huruf ---------- */
  var title = document.getElementById('hero-title');
  var chars = [];
  title.querySelectorAll('.word').forEach(function (word) {
    var text = word.textContent;
    word.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = text[i];
      word.appendChild(span);
      chars.push(span);
    }
  });

  /* ---------- 2. Animasi intro ---------- */
  if (hasGsap && !reduceMotion) {
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.navbar', { y: -30, autoAlpha: 0, duration: 0.8 })
      .from('[data-hero]:not(.hero-role):not(.hero-desc):not(.hero-cta):not(.hero-social)', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, '-=0.5')
      .from(chars, {
        yPercent: 120,
        rotateX: -90,
        autoAlpha: 0,
        transformOrigin: '50% 100%',
        duration: 1.1,
        stagger: 0.035
      }, '-=0.4')
      .from('.hero-role, .hero-desc, .hero-cta, .hero-social', { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, '-=0.7')
      .from('.marquee', { autoAlpha: 0, y: 20, duration: 0.8 }, '-=0.6');

    // Huruf memantul saat di-hover
    chars.forEach(function (c) {
      c.addEventListener('mouseenter', function () {
        gsap.fromTo(c, { y: 0 }, { y: -18, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 });
      });
    });
  }

  /* ---------- 3. Tombol magnetik ---------- */
  if (hasGsap && finePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      });
    });
  }

  /* ---------- 4. Cahaya mengikuti kursor ---------- */
  var glow = document.getElementById('cursor-glow');
  if (glow && hasGsap && finePointer && !reduceMotion) {
    var gx = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3.out' });
    var gy = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3.out' });
    window.addEventListener('mousemove', function (e) {
      gx(e.clientX);
      gy(e.clientY);
      glow.classList.add('on');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
  }

  /* ---------- 5. Smooth scroll (Lenis) ---------- */
  if (!reduceMotion) {
    var lenis = new Lenis({ duration: 1.15, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    window.lenis = lenis;
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());

    // Link anchor (#projects, dst) ikut di-smooth-kan, dikurangi tinggi navbar
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      var target = id === '#' ? null : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = document.getElementById('navbar').offsetHeight;
      lenis.scrollTo(target, { offset: id === '#home' ? 0 : -navH + 1 });
      history.replaceState(null, '', id);
    });
  }

  /* ---------- 6. Scene 3D "Full Stack" (src/js/stack-scene.js) ---------- */
  var canvas = document.getElementById('hero-canvas');
  var hero = document.getElementById('home');
  if (!canvas || !hero) return;

  // Three.js & scene dimuat terpisah (code-splitting) agar halaman tampil lebih cepat
  Promise.all([import('three'), import('./stack-scene.js')])
    .then(function (mods) {
      mods[1].initStackScene(mods[0], { canvas: canvas, hero: hero, reduceMotion: reduceMotion });
    })
    .catch(function (err) {
      // Tanpa WebGL / gagal dimuat: biarkan background CSS biasa
      console.warn('Scene 3D tidak dimuat:', err);
    });
})();
