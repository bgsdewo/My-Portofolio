/* ==========================================================
   Scene 3D hero: "Full Stack"
   Tiga lapisan kaca melayang — Frontend, Backend, Database —
   dengan paket data yang mengalir naik-turun (request / response).
   - Hover lapisan  : lapisan terangkat & menyala
   - Gerak mouse    : stack miring mengikuti kursor (parallax)
   - Scroll         : lapisan merenggang & stack berputar
   Dipanggil dari hero.js (dimuat lazy bersama Three.js).
   ========================================================== */
export function initStackScene(THREE, opts) {
  var canvas = opts.canvas;
  var hero = opts.hero;
  var reduceMotion = opts.reduceMotion;
  var root = document.documentElement;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return; // WebGL tidak tersedia: biarkan background CSS
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 2.2, 21);
  camera.lookAt(0, 0, 0);

  /* ---------- Data lapisan ---------- */
  var LAYERS = [
    { key: 'frontend', label: 'FRONTEND', tech: 'React · Tailwind', color: { dark: '#38bdf8', light: '#0284c7' } },
    { key: 'backend', label: 'BACKEND', tech: 'Node.js · Laravel', color: { dark: '#39d353', light: '#16a34a' } },
    { key: 'database', label: 'DATABASE', tech: 'PostgreSQL · MongoDB', color: { dark: '#c084fc', light: '#9333ea' } }
  ];
  var GAP = 2.9;          // jarak antar lapisan
  var SIZE = 5.2;         // lebar & panjang lapisan
  var THICK = 0.28;

  var stack = new THREE.Group();
  scene.add(stack);

  var theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  function track(obj) { return obj; } // penanda resource GPU (geometry/material/texture)

  /* Bahan bersama */
  var slabGeo = track(new THREE.BoxGeometry(SIZE, THICK, SIZE));
  var slabEdges = track(new THREE.EdgesGeometry(slabGeo));

  function gridLines(size, divisions) {
    var pts = [];
    var half = size / 2;
    for (var i = 1; i < divisions; i++) {
      var p = -half + (size / divisions) * i;
      pts.push(-half, 0, p, half, 0, p, p, 0, -half, p, 0, half);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return track(g);
  }

  /* Label teks (canvas -> sprite yang selalu menghadap kamera) */
  function makeLabel(title, sub, color) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 160;
    var ctx = c.getContext('2d');
    var tex = track(new THREE.CanvasTexture(c));
    tex.colorSpace = THREE.SRGBColorSpace;
    var mat = track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.2, 1, 1);
    function draw(col, subCol) {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(22, 52, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '700 46px "Space Grotesk", "Inter", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, 46, 54);
      ctx.fillStyle = subCol;
      ctx.font = '500 32px "JetBrains Mono", monospace';
      ctx.fillText(sub, 46, 112);
      tex.needsUpdate = true;
    }
    sprite.userData.draw = draw;
    return sprite;
  }

  var layers = LAYERS.map(function (def, i) {
    var group = new THREE.Group();
    var baseY = (1 - i) * GAP; // frontend di atas, database di bawah
    group.position.y = baseY;
    stack.add(group);

    var accent = new THREE.Color(def.color[theme]);

    // Pelat kaca
    var slabMat = track(new THREE.MeshPhysicalMaterial({
      color: 0x0f1a2e, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.72,
      clearcoat: 1, clearcoatRoughness: 0.2
    }));
    var slab = new THREE.Mesh(slabGeo, slabMat);
    slab.userData.layer = i;
    group.add(slab);

    // Garis tepi menyala
    var edgeMat = track(new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.9 }));
    group.add(new THREE.LineSegments(slabEdges, edgeMat));

    // Grid tipis di permukaan atas
    var gridMat = track(new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.12 }));
    var grid = new THREE.LineSegments(gridLines(SIZE, 8), gridMat);
    grid.position.y = THICK / 2 + 0.002;
    group.add(grid);

    // Isi khas tiap lapisan
    var details = new THREE.Group();
    details.position.y = THICK / 2;
    group.add(details);
    var detailMats = [];
    function dm(params) { var m = track(new THREE.MeshStandardMaterial(params)); detailMats.push(m); return m; }

    if (def.key === 'frontend') {
      // Jendela browser mini dengan blok UI
      var win = new THREE.Mesh(track(new THREE.BoxGeometry(3.4, 0.08, 2.4)), dm({ color: 0x0b1120, roughness: 0.6 }));
      win.position.y = 0.06;
      details.add(win);
      var bar = new THREE.Mesh(track(new THREE.BoxGeometry(3.4, 0.1, 0.36)), dm({ color: accent, emissive: accent, emissiveIntensity: 0.35 }));
      bar.position.set(0, 0.1, -1.02);
      details.add(bar);
      [[-0.9, -0.3, 1.2, 0.9], [0.75, -0.45, 1.5, 0.5], [0.75, 0.25, 1.5, 0.5], [-0.25, 0.75, 2.5, 0.3]].forEach(function (b, k) {
        var block = new THREE.Mesh(track(new THREE.BoxGeometry(b[2], 0.12 + k * 0.04, b[3])),
          dm({ color: accent, emissive: accent, emissiveIntensity: 0.2, transparent: true, opacity: 0.55 + k * 0.1 }));
        block.position.set(b[0], 0.14, b[1]);
        details.add(block);
      });
    } else if (def.key === 'backend') {
      // Rak server dengan lampu indikator berkedip
      var serverGeo = track(new THREE.BoxGeometry(0.9, 0.42, 0.9));
      var ledGeo = track(new THREE.BoxGeometry(0.5, 0.06, 0.12));
      group.userData.leds = [];
      for (var sx = 0; sx < 3; sx++) {
        for (var sz = 0; sz < 2; sz++) {
          var srv = new THREE.Mesh(serverGeo, dm({ color: 0x14213a, roughness: 0.5, metalness: 0.3 }));
          srv.position.set((sx - 1) * 1.3, 0.21, (sz - 0.5) * 1.5);
          details.add(srv);
          var ledMat = dm({ color: accent, emissive: accent, emissiveIntensity: 1 });
          var led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(srv.position.x, 0.44, srv.position.z + 0.3);
          details.add(led);
          group.userData.leds.push({ mat: ledMat, phase: Math.random() * Math.PI * 2, speed: 2 + Math.random() * 3 });
        }
      }
    } else {
      // Tabung database bertumpuk
      var cylGeo = track(new THREE.CylinderGeometry(0.62, 0.62, 0.32, 40));
      var cylEdge = track(new THREE.EdgesGeometry(cylGeo, 30));
      [[-1.3, 0], [0, 0], [1.3, 0]].forEach(function (pos, k) {
        var height = 1 + (k % 2);
        for (var h = 0; h < height; h++) {
          var cyl = new THREE.Mesh(cylGeo, dm({ color: 0x1a1530, roughness: 0.35, metalness: 0.4 }));
          cyl.position.set(pos[0], 0.18 + h * 0.38, pos[1]);
          details.add(cyl);
          var ring = new THREE.LineSegments(cylEdge, edgeMat);
          ring.position.copy(cyl.position);
          details.add(ring);
        }
      });
    }

    // Label di samping lapisan
    var label = makeLabel(def.label, def.tech, def.color[theme]);
    label.position.set(SIZE / 2 + 1.7, 0.1, -SIZE / 2 + 0.8);
    group.add(label);

    return {
      def: def, group: group, slab: slab, slabMat: slabMat, edgeMat: edgeMat, gridMat: gridMat,
      label: label, baseY: baseY, lift: 0, glow: 0, accent: accent
    };
  });

  /* ---------- Paket data (request turun, response naik) ---------- */
  var packetGeo = track(new THREE.SphereGeometry(0.09, 12, 12));
  var COLS = [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6], [0, -1.8], [0, 1.8]];
  var packets = [];
  for (var p = 0; p < 18; p++) {
    var up = p % 2 === 0;
    var mat = track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    var mesh = new THREE.Mesh(packetGeo, mat);
    var col = COLS[p % COLS.length];
    stack.add(mesh);
    packets.push({ mesh: mesh, mat: mat, up: up, x: col[0] + (Math.random() - 0.5) * 0.3, z: col[1] + (Math.random() - 0.5) * 0.3, t: Math.random(), speed: 0.18 + Math.random() * 0.22 });
  }

  // Jalur vertikal tipis tempat paket mengalir
  var railPts = [];
  COLS.forEach(function (c) { railPts.push(c[0], -GAP - 0.2, c[1], c[0], GAP + 0.2, c[1]); });
  var railGeo = new THREE.BufferGeometry();
  railGeo.setAttribute('position', new THREE.Float32BufferAttribute(railPts, 3));
  track(railGeo);
  var railMat = track(new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.12, gapSize: 0.14, transparent: true, opacity: 0.35 }));
  var rails = new THREE.LineSegments(railGeo, railMat);
  rails.computeLineDistances();
  stack.add(rails);

  /* ---------- Partikel latar ---------- */
  var P = 140;
  var pPos = new Float32Array(P * 3);
  for (var i = 0; i < P; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 18;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  var pGeo = track(new THREE.BufferGeometry());
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  var pMat = track(new THREE.PointsMaterial({ size: 0.05, transparent: true, opacity: 0.6, depthWrite: false }));
  var dust = new THREE.Points(pGeo, pMat);
  scene.add(dust);

  /* ---------- Cahaya ---------- */
  var ambient = new THREE.AmbientLight(0xffffff, 0.6);
  var key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-6, 10, 8);
  var rimA = new THREE.PointLight(0x38bdf8, 30, 20, 1.6);
  rimA.position.set(5, 4, 4);
  var rimB = new THREE.PointLight(0xc084fc, 26, 20, 1.6);
  rimB.position.set(-5, -4, 3);
  scene.add(ambient, key, rimA, rimB);

  /* ---------- Tema terang / gelap ---------- */
  function applyTheme() {
    theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var light = theme === 'light';
    var styles = getComputedStyle(root);
    var muted = styles.getPropertyValue('--muted').trim() || '#94a3b8';
    var heading = styles.getPropertyValue('--heading').trim() || '#f8fafc';
    layers.forEach(function (L) {
      L.accent.set(L.def.color[theme]);
      L.edgeMat.color.copy(L.accent);
      L.gridMat.color.copy(L.accent);
      L.slabMat.color.set(light ? 0xffffff : 0x0f1a2e);
      L.slabMat.opacity = light ? 0.8 : 0.72;
      L.label.userData.draw(heading, muted);
      L.group.traverse(function (o) {
        if (o.material && o.material.emissive && o.material.emissiveIntensity > 0.1 && o !== L.slab) {
          o.material.color.copy(L.accent);
          o.material.emissive.copy(L.accent);
        }
      });
    });
    railMat.color.set(muted);
    pMat.color.set(styles.getPropertyValue('--accent').trim() || '#39d353');
    ambient.intensity = light ? 1.4 : 0.6;
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  // Gambar ulang label setelah font web selesai dimuat
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyTheme);

  /* ---------- Ukuran & posisi ---------- */
  var isMobile = false;
  function resize() {
    var w = hero.clientWidth;
    var h = hero.clientHeight;
    isMobile = w < 900;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Lebar area terlihat di bidang z = 0
    var visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    var visW = visH * camera.aspect;
    if (isMobile) {
      stack.position.set(visW * 0.16, -visH * 0.33, 0);
      stack.scale.setScalar(Math.min(0.44, visW / 18));
    } else {
      stack.position.set(visW * 0.17, -0.2, 0);
      stack.scale.setScalar(Math.min(0.9, visW / 26));
    }
    // Label teks terlalu kecil di HP: sembunyikan
    layers.forEach(function (L) { L.label.visible = !isMobile; });
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- Pointer ---------- */
  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2(9, 9);
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var pointerIn = false;
  var hovered = -1;
  var slabs = layers.map(function (L) { return L.slab; });

  function onPointer(e) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    mouse.tx = ndc.x;
    mouse.ty = ndc.y;
    pointerIn = true;
  }
  hero.addEventListener('pointermove', onPointer, { passive: true });
  hero.addEventListener('pointerleave', function () { pointerIn = false; hovered = -1; mouse.tx = 0; mouse.ty = 0; });

  /* ---------- Loop ---------- */
  var timer = new THREE.Timer();
  var running = true;

  function frame() {
    timer.update();
    var t = timer.getElapsed();
    var dt = Math.min(timer.getDelta(), 0.05);

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    var sp = Math.min(window.scrollY / hero.clientHeight, 1);
    stack.rotation.x = 0.42 - mouse.y * 0.12 + sp * 0.25;
    stack.rotation.y = -0.62 + Math.sin(t * 0.25) * 0.18 + mouse.x * 0.35 + sp * 0.8;

    // Lapisan yang di-hover
    if (pointerIn && !isMobile) {
      stack.updateMatrixWorld();
      raycaster.setFromCamera(ndc, camera);
      var hit = raycaster.intersectObjects(slabs, false)[0];
      hovered = hit ? hit.object.userData.layer : -1;
    }
    canvas.style.cursor = hovered >= 0 ? 'pointer' : '';

    var spread = 1 + sp * 0.5;
    layers.forEach(function (L, i) {
      var targetLift = hovered === i ? 0.55 : 0;
      L.lift += (targetLift - L.lift) * 0.12;
      L.glow += ((hovered === i ? 1 : 0) - L.glow) * 0.12;
      L.group.position.y = L.baseY * spread + L.lift + Math.sin(t * 1.2 + i * 1.3) * 0.08;
      L.edgeMat.opacity = 0.7 + L.glow * 0.3;
      L.gridMat.opacity = 0.12 + L.glow * 0.25;
      L.label.material.opacity = hovered < 0 || hovered === i ? 1 : 0.35;
      if (L.group.userData.leds) {
        L.group.userData.leds.forEach(function (led) {
          led.mat.emissiveIntensity = 0.4 + (Math.sin(t * led.speed + led.phase) > 0.2 ? 1.2 : 0.1);
        });
      }
    });

    // Paket data mengalir di antara lapisan
    var top = layers[0].group.position.y;
    var bottom = layers[2].group.position.y;
    packets.forEach(function (pk) {
      pk.t += pk.speed * dt * (hovered >= 0 ? 2 : 1);
      if (pk.t > 1) pk.t -= 1;
      var k = pk.up ? pk.t : 1 - pk.t;
      pk.mesh.position.set(pk.x, bottom + (top - bottom) * k, pk.z);
      // Warna mengikuti lapisan terdekat
      var idx = k > 0.66 ? 0 : k > 0.33 ? 1 : 2;
      pk.mat.color.copy(layers[idx].accent);
      pk.mat.opacity = Math.sin(pk.t * Math.PI); // muncul & menghilang di ujung
    });

    dust.rotation.y = t * 0.02;
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    frame();
    requestAnimationFrame(loop);
  }

  if (reduceMotion) {
    frame();
  } else {
    var visible = true;
    var setRunning = function (on) {
      if (on && !running) { running = true; timer.reset(); requestAnimationFrame(loop); }
      running = on;
    };
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      setRunning(visible && !document.hidden);
    }).observe(hero);
    document.addEventListener('visibilitychange', function () { setRunning(visible && !document.hidden); });
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize', function () { if (!running || reduceMotion) frame(); });

  requestAnimationFrame(function () { canvas.classList.add('ready'); });
}
