/* ==========================================================
   Scene 3D hero: "Full Stack"
   Tiga lapisan kaca — Frontend, Backend, Database — dan seorang
   developer kecil yang memperagakan alur request -> response:
     1. Frontend : klik tombol, paket request muncul
     2. Lift turun ke Backend : server memproses request
     3. Lift turun ke Database : query data
     4. Lift naik ke Frontend : data tampil di layar (render)
   Balon teks di atas kepalanya menjelaskan tiap langkah.
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
  var GAP = 2.9;    // jarak antar lapisan
  var SIZE = 5.2;   // lebar & panjang lapisan
  var THICK = 0.28;

  var stack = new THREE.Group();
  scene.add(stack);

  var theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

  var slabGeo = new THREE.BoxGeometry(SIZE, THICK, SIZE);
  var slabEdges = new THREE.EdgesGeometry(slabGeo);

  function gridLines(size, divisions) {
    var pts = [];
    var half = size / 2;
    for (var i = 1; i < divisions; i++) {
      var p = -half + (size / divisions) * i;
      pts.push(-half, 0, p, half, 0, p, p, 0, -half, p, 0, half);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }

  /* Sprite teks dari canvas (selalu menghadap kamera) */
  function makeTextSprite(w, h, scaleX) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
    sprite.scale.set(scaleX, scaleX * (h / w), 1);
    sprite.renderOrder = 10;
    sprite.userData.ctx = c.getContext('2d');
    sprite.userData.tex = tex;
    return sprite;
  }

  function drawLabel(sprite, title, sub, col, subCol) {
    var ctx = sprite.userData.ctx;
    ctx.clearRect(0, 0, 512, 160);
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
    sprite.userData.tex.needsUpdate = true;
  }

  /* ---------- Lapisan ---------- */
  var layers = LAYERS.map(function (def, i) {
    var group = new THREE.Group();
    var baseY = (1 - i) * GAP; // frontend di atas, database di bawah
    group.position.y = baseY;
    stack.add(group);

    var accent = new THREE.Color(def.color[theme]);

    var slabMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f1a2e, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.72,
      clearcoat: 1, clearcoatRoughness: 0.2
    });
    var slab = new THREE.Mesh(slabGeo, slabMat);
    slab.userData.layer = i;
    group.add(slab);

    var edgeMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.9 });
    group.add(new THREE.LineSegments(slabEdges, edgeMat));

    var gridMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.12 });
    var grid = new THREE.LineSegments(gridLines(SIZE, 8), gridMat);
    grid.position.y = THICK / 2 + 0.002;
    group.add(grid);

    var details = new THREE.Group();
    details.position.y = THICK / 2;
    group.add(details);

    // Material yang ikut warna aksen lapisan & bisa "menyala" saat ada aksi
    var glowMats = [];
    function glowMat(base, opacity) {
      var m = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: base, transparent: opacity < 1, opacity: opacity });
      m.userData.base = base;
      glowMats.push(m);
      return m;
    }

    if (def.key === 'frontend') {
      // Jendela browser mini (di belakang, menyisakan ruang jalan di depan)
      var win = new THREE.Group();
      win.position.z = -0.45;
      details.add(win);
      var winBase = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 2.1), new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.6 }));
      winBase.position.y = 0.04;
      win.add(winBase);
      var bar = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 0.32), glowMat(0.35, 1));
      bar.position.set(0, 0.09, -0.89);
      win.add(bar);
      [[-0.9, -0.2, 1.2, 0.8], [0.75, -0.35, 1.5, 0.45], [0.75, 0.25, 1.5, 0.45], [-0.25, 0.75, 2.5, 0.28]].forEach(function (b, k) {
        var block = new THREE.Mesh(new THREE.BoxGeometry(b[2], 0.12 + k * 0.04, b[3]), glowMat(0.2, 0.55 + k * 0.1));
        block.position.set(b[0], 0.13, b[1]);
        win.add(block);
      });
    } else if (def.key === 'backend') {
      // Rak server dengan lampu indikator
      var serverGeo = new THREE.BoxGeometry(0.9, 0.42, 0.9);
      var ledGeo = new THREE.BoxGeometry(0.5, 0.06, 0.12);
      group.userData.leds = [];
      for (var sx = 0; sx < 3; sx++) {
        for (var sz = 0; sz < 2; sz++) {
          var srv = new THREE.Mesh(serverGeo, new THREE.MeshStandardMaterial({ color: 0x14213a, roughness: 0.5, metalness: 0.3 }));
          srv.position.set((sx - 1) * 1.3, 0.21, -1.05 + sz * 1.25);
          details.add(srv);
          var ledMat = glowMat(1, 1);
          var led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(srv.position.x, 0.44, srv.position.z + 0.3);
          details.add(led);
          group.userData.leds.push({ mat: ledMat, phase: Math.random() * Math.PI * 2, speed: 2 + Math.random() * 3 });
        }
      }
    } else {
      // Tabung database
      var cylGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.32, 40);
      var cylEdge = new THREE.EdgesGeometry(cylGeo, 30);
      group.userData.cyls = [];
      [-1.3, 0, 1.3].forEach(function (x, k) {
        var height = 1 + (k % 2);
        for (var h = 0; h < height; h++) {
          var cm = new THREE.MeshStandardMaterial({ color: 0x1a1530, roughness: 0.35, metalness: 0.4, emissive: accent, emissiveIntensity: 0 });
          var cyl = new THREE.Mesh(cylGeo, cm);
          cyl.position.set(x, 0.18 + h * 0.38, -0.65);
          details.add(cyl);
          group.userData.cyls.push(cm);
          var ring = new THREE.LineSegments(cylEdge, edgeMat);
          ring.position.copy(cyl.position);
          details.add(ring);
        }
      });
    }

    var label = makeTextSprite(512, 160, 3.2);
    label.position.set(SIZE / 2 + 1.7, 0.1, -SIZE / 2 + 0.8);
    group.add(label);

    return {
      def: def, group: group, slab: slab, slabMat: slabMat, edgeMat: edgeMat, gridMat: gridMat,
      label: label, baseY: baseY, lift: 0, glow: 0, accent: accent, glowMats: glowMats, action: 0
    };
  });

  function floorY(i) { return layers[i].group.position.y + THICK / 2; }

  /* ---------- Lift kaca di sisi kanan-depan ---------- */
  var ELEV = { x: SIZE / 2 + 0.55, z: 1.55 };
  var ENTRY = { x: SIZE / 2 - 0.45, z: 1.55 };
  var tubeH = GAP * 2 + 2.2;
  var tubeMat = new THREE.MeshPhysicalMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.08, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide });
  var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, tubeH, 32, 1, true), tubeMat);
  tube.position.set(ELEV.x, -GAP + tubeH / 2 - 0.3, ELEV.z);
  stack.add(tube);
  var tubeLineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.35 });
  var ringGeo = new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.42, 0.42, 0.01, 32));
  for (var r = 0; r < 3; r++) {
    var ringLine = new THREE.LineSegments(ringGeo, tubeLineMat);
    ringLine.position.set(ELEV.x, (1 - r) * GAP + THICK / 2, ELEV.z);
    stack.add(ringLine);
  }
  var platMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 });
  var platform = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32), platMat);
  platform.position.set(ELEV.x, floorY(0), ELEV.z);
  stack.add(platform);

  /* ---------- Developer kecil ---------- */
  function makeDev() {
    var dev = new THREE.Group();
    var M = function (color, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.55 }, extra || {})); };
    var skin = M(0xf2c39b);
    var hoodie = M(0x22c55e, { emissive: 0x16a34a, emissiveIntensity: 0.15 });
    var pants = M(0x1e293b);
    var dark = M(0x0f172a);
    var white = M(0xf8fafc);

    var body = new THREE.Group(); // semua kecuali kaki (untuk efek memantul)
    dev.add(body);

    var torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.26, 6, 14), hoodie);
    torso.position.y = 0.6;
    body.add(torso);
    var pocket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.02), M(0x16a34a));
    pocket.position.set(0, 0.52, 0.165);
    body.add(pocket);

    var head = new THREE.Group();
    head.position.y = 0.98;
    body.add(head);
    head.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), skin));
    var hair = new THREE.Mesh(new THREE.SphereGeometry(0.168, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), dark);
    hair.rotation.x = -0.25;
    head.add(hair);
    var glasses = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.03), M(0x0b1120, { emissive: 0x38bdf8, emissiveIntensity: 0.9 }));
    glasses.position.set(0, 0.0, 0.15);
    head.add(glasses);
    var phones = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.022, 8, 24, Math.PI), dark);
    phones.position.y = 0.01;
    head.add(phones);
    [-1, 1].forEach(function (s) {
      var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 16), M(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.5 }));
      cup.rotation.z = Math.PI / 2;
      cup.position.set(s * 0.17, 0, 0);
      head.add(cup);
    });

    function limb(radius, length, mat, x, y) {
      var pivot = new THREE.Group();
      pivot.position.set(x, y, 0);
      var mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, 10), mat);
      mesh.position.y = -length / 2 - radius * 0.5;
      pivot.add(mesh);
      return pivot;
    }
    var armL = limb(0.05, 0.24, hoodie, -0.22, 0.76);
    var armR = limb(0.05, 0.24, hoodie, 0.22, 0.76);
    body.add(armL, armR);
    var legL = limb(0.06, 0.24, pants, -0.08, 0.36);
    var legR = limb(0.06, 0.24, pants, 0.08, 0.36);
    dev.add(legL, legR);
    [legL, legR].forEach(function (leg) {
      var shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.18), white);
      shoe.position.set(0, -0.34, 0.03);
      leg.add(shoe);
    });

    // Paket data yang dibawa
    var packetMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.2 });
    var packet = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), packetMat);
    packet.position.set(0, 0.62, 0.3);
    body.add(packet);
    var packetEdges = new THREE.LineSegments(new THREE.EdgesGeometry(packet.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
    packet.add(packetEdges);

    dev.userData = { body: body, head: head, armL: armL, armR: armR, legL: legL, legR: legR, packet: packet, packetMat: packetMat };
    return dev;
  }
  var dev = makeDev();
  dev.scale.setScalar(1.35);
  stack.add(dev);
  var D = dev.userData;

  // Balon teks di atas kepala
  var bubble = makeTextSprite(640, 150, 2.6);
  stack.add(bubble);
  function drawBubble(text, color) {
    var ctx = bubble.userData.ctx;
    var light = theme === 'light';
    ctx.clearRect(0, 0, 640, 150);
    ctx.font = '600 38px "JetBrains Mono", monospace';
    var w = Math.min(ctx.measureText(text).width + 64, 620);
    var x = (640 - w) / 2;
    ctx.fillStyle = light ? 'rgba(255,255,255,.96)' : 'rgba(11,17,32,.92)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, 10, w, 90, 26);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath(); // ekor balon
    ctx.moveTo(300, 98); ctx.lineTo(320, 128); ctx.lineTo(340, 98);
    ctx.fill();
    ctx.fillStyle = light ? '#0f172a' : '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 320, 56);
    bubble.userData.tex.needsUpdate = true;
  }

  /* ---------- Alur cerita (diulang terus) ---------- */
  var SPOT = [{ x: 0, z: 1.25 }, { x: 0, z: 1.25 }, { x: 0, z: 0.95 }];
  var PACKET_COLORS = ['#38bdf8', '#39d353', '#c084fc'];
  var STEPS = [
    { type: 'act', layer: 0, dur: 1.8, action: 'click', bubble: "klik 'Lihat Proyek'", packet: 0, show: true },
    { type: 'walk', layer: 0, to: ENTRY, bubble: 'GET /api/projects' },
    { type: 'walk', layer: 0, to: ELEV },
    { type: 'ride', from: 0, to: 1, dur: 1.4 },
    { type: 'walk', layer: 1, to: ENTRY },
    { type: 'walk', layer: 1, to: SPOT[1] },
    { type: 'act', layer: 1, dur: 1.8, action: 'process', bubble: 'memproses request...', packet: 1 },
    { type: 'walk', layer: 1, to: ENTRY, bubble: 'SELECT * FROM projects' },
    { type: 'walk', layer: 1, to: ELEV },
    { type: 'ride', from: 1, to: 2, dur: 1.4 },
    { type: 'walk', layer: 2, to: ENTRY },
    { type: 'walk', layer: 2, to: SPOT[2] },
    { type: 'act', layer: 2, dur: 1.8, action: 'query', bubble: 'query data ✓', packet: 2 },
    { type: 'walk', layer: 2, to: ENTRY, bubble: '200 OK · JSON' },
    { type: 'walk', layer: 2, to: ELEV },
    { type: 'ride', from: 2, to: 0, dur: 2.2 },
    { type: 'walk', layer: 0, to: ENTRY },
    { type: 'walk', layer: 0, to: SPOT[0] },
    { type: 'act', layer: 0, dur: 2, action: 'render', bubble: 'tampil di layar ✓', hide: true }
  ];
  var WALK_SPEED = 1.5;
  var state = { step: -1, t: 0, dur: 1, from: { x: 0, z: 0 }, layer: 0, y: 0, walkPhase: 0, facing: Math.PI, bubbleText: '', bubbleLayer: 0, packetScale: 0 };
  var dist2 = function (a, b) { return Math.hypot(a.x - b.x, a.z - b.z); };
  var ease = function (k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };

  dev.position.set(SPOT[0].x, floorY(0), SPOT[0].z);

  function startStep(index) {
    state.step = index % STEPS.length;
    state.t = 0;
    var s = STEPS[state.step];
    state.from = { x: dev.position.x, z: dev.position.z };
    if (s.type === 'walk') state.dur = Math.max(dist2(state.from, s.to) / WALK_SPEED, 0.25);
    else state.dur = s.dur;
    if (s.layer !== undefined) state.layer = s.layer;
    if (s.bubble) { state.bubbleText = s.bubble; state.bubbleLayer = s.layer !== undefined ? s.layer : state.layer; drawBubble(s.bubble, LAYERS[state.bubbleLayer].color[theme]); }
    if (s.show) { D.packetMat.color.set(PACKET_COLORS[0]); D.packetMat.emissive.set(PACKET_COLORS[0]); }
  }
  startStep(0);

  function updateStory(dt, t) {
    var s = STEPS[state.step];
    state.t += dt;
    var k = Math.min(state.t / state.dur, 1);
    var walking = false;

    // Reset pose
    var aL = 0, aR = 0, lL = 0, lR = 0, bob = 0;

    if (s.type === 'walk') {
      walking = true;
      dev.position.x = state.from.x + (s.to.x - state.from.x) * k;
      dev.position.z = state.from.z + (s.to.z - state.from.z) * k;
      dev.position.y = floorY(s.layer);
      var dx = s.to.x - state.from.x, dz = s.to.z - state.from.z;
      if (Math.abs(dx) + Math.abs(dz) > 0.01) state.facing = Math.atan2(dx, dz);
    } else if (s.type === 'ride') {
      var e = ease(k);
      dev.position.set(ELEV.x, floorY(s.from) + (floorY(s.to) - floorY(s.from)) * e, ELEV.z);
      state.facing = -Math.PI / 2; // menghadap ke dalam lift
      state.layer = e > 0.5 ? s.to : s.from;
    } else {
      dev.position.y = floorY(s.layer);
      state.facing = Math.PI; // menghadap objek di lapisan
      var L = layers[s.layer];
      L.action = 1;
      if (s.action === 'click') { aR = -1.5 + Math.sin(t * 14) * 0.25; }
      if (s.action === 'process' || s.action === 'query') { aL = -1.1 + Math.sin(t * 22) * 0.18; aR = -1.1 - Math.sin(t * 22) * 0.18; }
      if (s.action === 'render') { aL = aR = -2.6 + Math.sin(t * 6) * 0.2; bob = Math.abs(Math.sin(t * 6)) * 0.06; }
      // Paket berganti warna di pertengahan aksi
      if (s.packet !== undefined && k > 0.5) {
        D.packetMat.color.set(PACKET_COLORS[s.packet]);
        D.packetMat.emissive.set(PACKET_COLORS[s.packet]);
      }
    }

    // Wajah berputar halus ke arah tujuan
    var diff = Math.atan2(Math.sin(state.facing - dev.rotation.y), Math.cos(state.facing - dev.rotation.y));
    dev.rotation.y += diff * 0.2;

    if (walking) {
      state.walkPhase += dt * 10;
      var sw = Math.sin(state.walkPhase);
      lL = sw * 0.7; lR = -sw * 0.7;
      aL = aL || -sw * 0.5; aR = aR || sw * 0.5;
      bob = Math.abs(Math.cos(state.walkPhase)) * 0.04;
      // Saat membawa paket, lengan memegang di depan
      if (state.packetScale > 0.5) { aL = -0.9 - sw * 0.08; aR = -0.9 + sw * 0.08; }
    } else if (s.type === 'ride') {
      if (state.packetScale > 0.5) { aL = aR = -0.9; }
    }

    D.armL.rotation.x += (aL - D.armL.rotation.x) * 0.25;
    D.armR.rotation.x += (aR - D.armR.rotation.x) * 0.25;
    D.legL.rotation.x += (lL - D.legL.rotation.x) * 0.3;
    D.legR.rotation.x += (lR - D.legR.rotation.x) * 0.3;
    D.body.position.y = bob + Math.sin(t * 2) * 0.008;
    D.head.rotation.y = s.type === 'act' ? Math.sin(t * 1.5) * 0.15 : 0;

    // Paket muncul saat klik, hilang setelah render
    var carrying = true;
    if (s.show) carrying = k > 0.45;
    if (s.hide) carrying = k < 0.4;
    state.packetScale += ((carrying ? 1 : 0) - state.packetScale) * 0.15;
    D.packet.scale.setScalar(Math.max(state.packetScale, 0.001));
    D.packet.rotation.y = t * 2;
    D.packet.rotation.x = t * 1.3;

    // Platform lift mengikuti saat naik/turun
    platform.position.y = s.type === 'ride' ? dev.position.y - 0.02 : (dev.position.x > SIZE / 2 ? dev.position.y - 0.02 : platform.position.y);
    platMat.color.set(PACKET_COLORS[state.layer]);
    platMat.emissive.set(PACKET_COLORS[state.layer]);

    // Balon teks
    bubble.position.set(dev.position.x, dev.position.y + 2.0, dev.position.z);

    if (k >= 1) startStep(state.step + 1);
  }

  /* ---------- Paket data ambient di jalur vertikal ---------- */
  var packetGeo = new THREE.SphereGeometry(0.08, 12, 12);
  var COLS = [[-1.6, -1.9], [1.6, -1.9], [-2.2, 0.4], [0, -2.1]];
  var packets = [];
  for (var p = 0; p < 10; p++) {
    var mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
    var mesh = new THREE.Mesh(packetGeo, mat);
    var col = COLS[p % COLS.length];
    stack.add(mesh);
    packets.push({ mesh: mesh, mat: mat, up: p % 2 === 0, x: col[0] + (Math.random() - 0.5) * 0.3, z: col[1] + (Math.random() - 0.5) * 0.3, t: Math.random(), speed: 0.15 + Math.random() * 0.2 });
  }
  var railPts = [];
  COLS.forEach(function (c) { railPts.push(c[0], -GAP - 0.2, c[1], c[0], GAP + 0.2, c[1]); });
  var railGeo = new THREE.BufferGeometry();
  railGeo.setAttribute('position', new THREE.Float32BufferAttribute(railPts, 3));
  var railMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.12, gapSize: 0.14, transparent: true, opacity: 0.3 });
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
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  var pMat = new THREE.PointsMaterial({ size: 0.05, transparent: true, opacity: 0.6, depthWrite: false });
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
      drawLabel(L.label, L.def.label, L.def.tech, heading, muted);
      L.glowMats.forEach(function (m) { m.color.copy(L.accent); m.emissive.copy(L.accent); });
      if (L.group.userData.cyls) L.group.userData.cyls.forEach(function (m) { m.emissive.copy(L.accent); });
    });
    railMat.color.set(muted);
    tubeLineMat.color.set(muted);
    tubeMat.opacity = light ? 0.12 : 0.08;
    pMat.color.set(styles.getPropertyValue('--accent').trim() || '#39d353');
    ambient.intensity = light ? 1.4 : 0.6;
    if (state.bubbleText) drawBubble(state.bubbleText, LAYERS[state.bubbleLayer].color[theme]);
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
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
    var visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    var visW = visH * camera.aspect;
    if (isMobile) {
      stack.position.set(visW * 0.16, -visH * 0.33, 0);
      stack.scale.setScalar(Math.min(0.44, visW / 18));
    } else {
      stack.position.set(visW * 0.17, -0.2, 0);
      stack.scale.setScalar(Math.min(0.9, visW / 26));
    }
    // Label & balon teks terlalu kecil di HP: sembunyikan
    layers.forEach(function (L) { L.label.visible = !isMobile; });
    bubble.visible = !isMobile;
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

  hero.addEventListener('pointermove', function (e) {
    var rect = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouse.tx = ndc.x;
    mouse.ty = ndc.y;
    pointerIn = true;
  }, { passive: true });
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
    stack.rotation.y = -0.62 + Math.sin(t * 0.25) * 0.14 + mouse.x * 0.3 + sp * 0.8;

    if (pointerIn && !isMobile) {
      stack.updateMatrixWorld();
      raycaster.setFromCamera(ndc, camera);
      var hit = raycaster.intersectObjects(slabs, false)[0];
      hovered = hit ? hit.object.userData.layer : -1;
    }
    canvas.style.cursor = hovered >= 0 ? 'pointer' : '';

    var spread = 1 + sp * 0.5;
    layers.forEach(function (L, i) {
      L.action = 0;
      var targetLift = hovered === i ? 0.45 : 0;
      L.lift += (targetLift - L.lift) * 0.12;
      L.group.position.y = L.baseY * spread + L.lift + Math.sin(t * 1.2 + i * 1.3) * 0.06;
    });

    if (!reduceMotion) updateStory(dt, t);

    var activeLayer = state.layer;
    layers.forEach(function (L, i) {
      var on = hovered === i || (hovered < 0 && activeLayer === i);
      L.glow += ((on ? 1 : 0) - L.glow) * 0.08;
      var acting = L.action ? 1 : 0;
      L.edgeMat.opacity = 0.6 + L.glow * 0.4;
      L.gridMat.opacity = 0.1 + L.glow * 0.18 + acting * 0.15;
      L.label.material.opacity = 0.4 + L.glow * 0.6;
      L.glowMats.forEach(function (m) {
        m.emissiveIntensity = m.userData.base + acting * (0.6 + Math.sin(t * 10) * 0.4);
      });
      if (L.group.userData.leds) {
        L.group.userData.leds.forEach(function (led) {
          var speed = acting ? led.speed * 4 : led.speed;
          led.mat.emissiveIntensity = 0.4 + (Math.sin(t * speed + led.phase) > 0.2 ? 1.2 : 0.1);
        });
      }
      if (L.group.userData.cyls) {
        L.group.userData.cyls.forEach(function (m, k) {
          m.emissiveIntensity = acting ? 0.35 + Math.max(0, Math.sin(t * 8 - k * 0.8)) * 0.6 : 0;
        });
      }
    });

    // Paket ambient
    var top = layers[0].group.position.y;
    var bottom = layers[2].group.position.y;
    packets.forEach(function (pk) {
      pk.t += pk.speed * dt;
      if (pk.t > 1) pk.t -= 1;
      var kk = pk.up ? pk.t : 1 - pk.t;
      pk.mesh.position.set(pk.x, bottom + (top - bottom) * kk, pk.z);
      pk.mat.color.copy(layers[kk > 0.66 ? 0 : kk > 0.33 ? 1 : 2].accent);
      pk.mat.opacity = Math.sin(pk.t * Math.PI) * 0.8;
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
    // Pose diam: developer berdiri di frontend sambil membawa paket
    D.packet.scale.setScalar(1);
    bubble.position.set(dev.position.x, dev.position.y + 2.0, dev.position.z);
    dev.rotation.y = 0.5;
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
