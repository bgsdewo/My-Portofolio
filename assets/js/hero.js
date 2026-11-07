/* ==========================================================
   HERO — motion & 3D
   - GSAP     : animasi intro, tombol magnetik, cahaya kursor
   - Lenis    : smooth scroll di seluruh halaman
   - Three.js : grafik kontribusi GitHub versi 3D (InstancedMesh)
   Semua bagian punya fallback: kalau CDN gagal dimuat atau user
   memilih "reduce motion", halaman tetap tampil normal.
   ========================================================== */
(function () {
  'use strict';

  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';

  var yearEl = document.getElementById('hero-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
    var gsap = window.gsap;
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
      .from('.marquee, .hero-caption', { autoAlpha: 0, y: 20, duration: 0.8 }, '-=0.6');

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
      var xTo = window.gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = window.gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
      });
      btn.addEventListener('mouseleave', function () {
        window.gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      });
    });
  }

  /* ---------- 4. Cahaya mengikuti kursor ---------- */
  var glow = document.getElementById('cursor-glow');
  if (glow && hasGsap && finePointer && !reduceMotion) {
    var gx = window.gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3.out' });
    var gy = window.gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3.out' });
    window.addEventListener('mousemove', function (e) {
      gx(e.clientX);
      gy(e.clientY);
      glow.classList.add('on');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
  }

  /* ---------- 5. Smooth scroll (Lenis) ---------- */
  if (typeof window.Lenis !== 'undefined' && !reduceMotion) {
    var lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
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

  /* ---------- 6. Scene 3D ---------- */
  var canvas = document.getElementById('hero-canvas');
  var hero = document.getElementById('home');
  if (!canvas || !hero) return;

  import(THREE_URL).then(initScene).catch(function (err) {
    // Tanpa WebGL / CDN gagal: biarkan background CSS biasa
    console.warn('Scene 3D tidak dimuat:', err);
  });

  function initScene(THREE) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

    var isMobile = window.innerWidth < 900;
    var COLS = isMobile ? 26 : 52;
    var ROWS = 7;
    var STEP = 1.3;

    /* Palet resmi grafik kontribusi GitHub */
    var PALETTES = {
      dark: ['#1b2333', '#0e4429', '#006d32', '#26a641', '#39d353'],
      light: ['#dfe4ea', '#9be9a8', '#40c463', '#30a14e', '#216e39']
    };
    var HOT = { dark: new THREE.Color('#9dffb0'), light: new THREE.Color('#0f5c2a') };

    /* Level kontribusi: pola acak deterministik, makin ke kanan (akhir tahun)
       makin rajin — sesuai misi "kompetitif di akhir tahun" 😄 */
    var seed = 7;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var levels = [];
    for (var c = 0; c < COLS; c++) {
      var progress = c / (COLS - 1);
      for (var r = 0; r < ROWS; r++) {
        var weekend = r === 0 || r === 6 ? 0.55 : 1;
        var chance = (0.12 + Math.pow(progress, 1.6) * 0.85) * weekend;
        var lvl = rand() < chance ? 1 + Math.floor(rand() * (1 + progress * 3.2)) : 0;
        levels.push(Math.min(lvl, 4));
      }
    }

    var group = new THREE.Group();
    scene.add(group);

    var geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0); // skala Y tumbuh dari dasar
    var mat = new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.15 });
    var count = COLS * ROWS;
    var mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(mesh);

    var cells = [];
    var offX = ((COLS - 1) * STEP) / 2;
    var offZ = ((ROWS - 1) * STEP) / 2;
    for (var i = 0; i < count; i++) {
      var col = Math.floor(i / ROWS);
      var row = i % ROWS;
      cells.push({ x: col * STEP - offX, z: row * STEP - offZ, level: levels[i], lift: 0, base: new THREE.Color() });
    }

    /* Partikel "debu" hijau melayang */
    var P = isMobile ? 120 : 260;
    var pPos = new Float32Array(P * 3);
    var pSpeed = new Float32Array(P);
    for (var p = 0; p < P; p++) {
      pPos[p * 3] = (Math.random() - 0.5) * COLS * STEP * 1.1;
      pPos[p * 3 + 1] = Math.random() * 9;
      pPos[p * 3 + 2] = (Math.random() - 0.5) * 22;
      pSpeed[p] = 0.004 + Math.random() * 0.012;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    var pMat = new THREE.PointsMaterial({ size: 0.09, transparent: true, opacity: 0.7, depthWrite: false });
    var points = new THREE.Points(pGeo, pMat);
    group.add(points);

    /* Cahaya */
    var ambient = new THREE.AmbientLight(0xffffff, 0.7);
    var sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(-12, 22, 14);
    var cursorLight = new THREE.PointLight(0x39d353, 40, 16, 1.6);
    cursorLight.position.set(0, 3, 0);
    scene.add(ambient, sun);
    group.add(cursorLight);

    scene.fog = new THREE.Fog(0x000000, 28, 70);

    /* Tema: warna kotak, partikel & fog mengikuti dark/light */
    var theme;
    function applyTheme() {
      theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var pal = PALETTES[theme];
      cells.forEach(function (cell) { cell.base.set(pal[cell.level]); });
      var styles = getComputedStyle(root);
      scene.fog.color.set(styles.getPropertyValue('--bg').trim() || '#0b1120');
      var accent = styles.getPropertyValue('--accent').trim() || '#39d353';
      pMat.color.set(accent);
      cursorLight.color.set(accent);
      cursorLight.intensity = theme === 'light' ? 18 : 40;
      ambient.intensity = theme === 'light' ? 1.5 : 0.7;
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    /* Ukuran & posisi kamera */
    function resize() {
      var w = hero.clientWidth;
      var h = hero.clientHeight;
      isMobile = w < 900;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      if (isMobile) {
        camera.position.set(0, 13, 30);
        camera.lookAt(0, 4, 0);
        group.position.set(0, -4.5, 0);
      } else {
        camera.position.set(0, 12, 34);
        camera.lookAt(0, 0, 0);
        group.position.set(16, -3.2, -2);
      }
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    /* Pointer → titik di bidang grid */
    var raycaster = new THREE.Raycaster();
    var ndc = new THREE.Vector2(9, 9);
    var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    var hit = new THREE.Vector3();
    var local = new THREE.Vector3(999, 0, 999);
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    var pointerActive = false;

    function onPointer(e) {
      var r = canvas.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      mouse.tx = ndc.x;
      mouse.ty = ndc.y;
      pointerActive = true;
    }
    hero.addEventListener('pointermove', onPointer, { passive: true });
    hero.addEventListener('pointerleave', function () { pointerActive = false; });

    var dummy = new THREE.Object3D();
    var tmpColor = new THREE.Color();
    var clock = new THREE.Clock();
    var running = true;

    function frame() {
      var t = clock.getElapsedTime();

      // Parallax halus mengikuti mouse
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // Scroll: grid miring & turun saat keluar hero
      var sp = Math.min(window.scrollY / hero.clientHeight, 1);
      group.rotation.set(0.12 + mouse.y * 0.05 + sp * 0.5, -0.62 + mouse.x * 0.12 + sp * 0.25, 0);

      // Posisi pointer dalam koordinat grid
      if (pointerActive) {
        group.updateMatrixWorld();
        raycaster.setFromCamera(ndc, camera);
        plane.normal.set(0, 1, 0).applyQuaternion(group.quaternion);
        plane.constant = -plane.normal.dot(group.position);
        if (raycaster.ray.intersectPlane(plane, hit)) {
          local.copy(hit);
          group.worldToLocal(local);
        }
      } else {
        // Tanpa pointer: "spotlight" otomatis menyapu grid
        local.set(Math.sin(t * 0.35) * offX * 0.85, 0, Math.cos(t * 0.5) * offZ);
      }
      cursorLight.position.x += (local.x - cursorLight.position.x) * 0.15;
      cursorLight.position.z += (local.z - cursorLight.position.z) * 0.15;

      for (var i = 0; i < count; i++) {
        var cell = cells[i];
        var dx = cell.x - local.x;
        var dz = cell.z - local.z;
        var target = Math.exp(-(dx * dx + dz * dz) / 7);
        cell.lift += (target - cell.lift) * 0.12;

        var wave = Math.sin(t * 1.5 - cell.x * 0.22 - cell.z * 0.4) * 0.16;
        var h = 0.22 + cell.level * 0.62 + wave + cell.lift * 2.6;

        dummy.position.set(cell.x, 0, cell.z);
        dummy.scale.set(0.88, Math.max(h, 0.08), 0.88);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        tmpColor.copy(cell.base).lerp(HOT[theme], Math.min(cell.lift * 0.85, 0.85));
        mesh.setColorAt(i, tmpColor);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;

      // Partikel naik perlahan
      for (var p = 0; p < P; p++) {
        pPos[p * 3 + 1] += pSpeed[p];
        if (pPos[p * 3 + 1] > 9) pPos[p * 3 + 1] = 0;
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    function loop() {
      if (!running) return;
      frame();
      requestAnimationFrame(loop);
    }

    if (reduceMotion) {
      frame();
      hero.removeEventListener('pointermove', onPointer);
    } else {
      // Hemat baterai: berhenti render saat hero tidak terlihat / tab disembunyikan
      var visible = true;
      function setRunning(on) {
        if (on && !running) { running = true; clock.getDelta(); requestAnimationFrame(loop); }
        running = on;
      }
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        setRunning(visible && !document.hidden);
      }).observe(hero);
      document.addEventListener('visibilitychange', function () { setRunning(visible && !document.hidden); });
      requestAnimationFrame(loop);
      window.addEventListener('resize', function () { if (!running) frame(); });
    }

    requestAnimationFrame(function () { canvas.classList.add('ready'); });
  }
})();
