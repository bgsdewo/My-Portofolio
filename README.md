# Portofolio — Bagus Sadewo

Website portofolio pribadi sebagai **Full Stack Developer**. Dibuat dengan HTML, CSS, dan JavaScript — tanpa build tool. Library animasi dimuat dari CDN.

## Tech

| Library | Fungsi |
| --- | --- |
| [Three.js](https://threejs.org) | Scene 3D di hero: grafik kontribusi GitHub versi 3D (`assets/js/hero.js`) |
| [GSAP](https://gsap.com) | Animasi intro, huruf judul, tombol magnetik, cahaya kursor |
| [Lenis](https://lenis.darkroom.engineering) | Smooth scroll |

Kalau CDN gagal dimuat atau pengunjung mengaktifkan *reduce motion*, halaman tetap tampil normal tanpa efek tersebut.

## Fitur

- Responsif (mobile-first)
- Toggle tema gelap/terang (tersimpan di browser, mengikuti preferensi sistem)
- Navbar sticky + highlight section aktif
- Hero 3D interaktif: kotak kontribusi naik mengikuti kursor, gelombang, partikel, parallax
- Animasi halus saat scroll, efek mengetik, counter statistik, marquee tech stack
- Filter proyek (Full Stack / Frontend / Backend)
- Form kontak dengan validasi (membuka aplikasi email via `mailto`)
- Aksesibel: skip link, label ARIA, dukungan `prefers-reduced-motion`

## Struktur

```
.
├── index.html
└── assets
    ├── css/style.css
    ├── js/main.js
    └── img/          # favicon & gambar proyek (placeholder SVG)
```

## Menjalankan di lokal

Cukup buka `index.html` di browser. Atau jalankan server lokal:

```bash
npx serve .
```

## Yang perlu kamu ganti

| Apa | Di mana |
| --- | --- |
| Email (`email@contoh.com`) | `index.html` & `CONTACT_EMAIL` di `assets/js/main.js` |
| LinkedIn (`linkedin.com/in/username`) | `index.html` |
| Tab Pendidikan / Pengalaman / Sertifikat | Section `#about`: tiap tab (`#panel-edu`, `#panel-exp`, `#panel-cert`) punya konten sendiri. Kartu tampil dalam grid; tambah kartu dengan menyalin `<li class="journey-card">` / `<li class="cert-card">`. Jumlah kartu per halaman: atribut `data-per-page` (desktop) & `data-per-page-sm` (HP) |
| Foto (grid 4 foto di kanan tiap tab) | Simpan di `assets/img/gallery/` (mis. `edu-1.jpg`), lalu ganti `src`, `alt` & label di `<ul class="photo-grid">` pada panel terkait. Foto 1–4 otomatis tersusun selang-seling |
| Sertifikat | Gambar di `assets/img/certificates/` (landscape, lebar 1400px). Di `#panel-cert`: salin satu `<li class="journey-card">` (kiri) **dan** satu `<li class="photo-tile">` di `#cert-photos` (kanan) dengan urutan yang sama — grid gambar ikut berganti halaman |
| Proyek, link demo & repo | Section `#projects` di `index.html` |
| Warna aksen | Variabel `--accent` di `assets/css/style.css` |

## Deploy gratis

Aktifkan **GitHub Pages**: Settings → Pages → Source: branch utama, folder `/ (root)`.
