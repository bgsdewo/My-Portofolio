# Portofolio — Bagus Sadewo

Website portofolio pribadi sebagai **Full Stack Developer**, dibangun dengan **Vite + Tailwind CSS v4** dan JavaScript.

## Tech

| Tools / Library | Fungsi |
| --- | --- |
| [Vite](https://vite.dev) | Dev server super cepat (hot reload) & build untuk production |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling dengan utility class langsung di `index.html` |
| [Three.js](https://threejs.org) | Scene 3D "Full Stack" di hero: lapisan Frontend / Backend / Database dengan aliran data (`src/js/stack-scene.js`) |
| [GSAP](https://gsap.com) | Animasi intro, huruf judul, tombol magnetik, cahaya kursor |
| [Lenis](https://lenis.darkroom.engineering) | Smooth scroll |

Semua library diinstal lewat npm (tidak lagi dari CDN). Three.js dimuat terpisah (lazy) supaya halaman tetap cepat tampil.

## Menjalankan di lokal

Butuh [Node.js](https://nodejs.org) versi 20 ke atas.

```bash
npm install
```

```bash
npm run dev
```

Buka alamat yang muncul di terminal (biasanya http://localhost:5173). Setiap kali file disimpan, browser otomatis ter-update.

> Sejak memakai Vite, `index.html` **tidak bisa lagi dibuka dengan klik dua kali** — selalu jalankan lewat `npm run dev`.

Build untuk production (hasilnya di folder `dist/`):

```bash
npm run build
```

```bash
npm run preview
```

## Struktur

```
.
├── index.html            # Markup + utility class Tailwind
├── vite.config.js
├── package.json
├── public/
│   └── assets/img/       # Gambar (disalin apa adanya saat build)
│       ├── certificates/ # Sertifikat
│       ├── gallery/      # Foto tab Pendidikan & Pengalaman
│       └── project-*.svg # Gambar proyek (placeholder)
└── src/
    ├── main.js           # Entry point
    ├── styles/main.css   # Token desain Tailwind (warna, font, animasi) + komponen kecil
    └── js/
        ├── app.js        # Tema, navbar, tabs, pagination, sertifikat, form, dll.
        ├── hero.js       # GSAP & Lenis, memuat scene 3D
        └── stack-scene.js # Scene 3D "Full Stack" (Three.js)
```

## Styling (Tailwind)

- Hampir semua styling ditulis sebagai class di `index.html`, mis. `rounded-full bg-accent px-4 text-on-accent`.
- Warna tema ada di `src/styles/main.css` (`--accent`, `--bg`, dll.) dan tersedia sebagai class: `bg-bg`, `bg-surface`, `text-heading`, `text-muted`, `border-line`, `text-accent`, `bg-accent-soft`, …
- Ganti warna aksen cukup di satu tempat: variabel `--accent` (dark & light).
- Varian `dark:` / `light:` mengikuti tombol tema (atribut `data-theme`).
- Komponen yang dipakai berulang: `.btn`, `.btn-primary`, `.btn-ghost`, `.section-tag`, `.section-title`, `.date-chip`.

## Fitur

- Responsif (mobile-first), tema gelap/terang
- Navbar sticky + highlight section aktif
- Hero 3D interaktif: stack Frontend / Backend / Database, paket data request/response, hover lapisan, parallax mouse & scroll
- About dengan tab Pendidikan / Pengalaman / Sertifikat, grid foto, pagination kartu, panel detail sertifikat
- Filter proyek, form kontak dengan validasi (membuka aplikasi email via `mailto`)
- Aksesibel: skip link, label ARIA, dukungan `prefers-reduced-motion`

## Yang perlu kamu ganti

| Apa | Di mana |
| --- | --- |
| Email (`email@contoh.com`) | `index.html` & `CONTACT_EMAIL` di `src/js/app.js` |
| LinkedIn (`linkedin.com/in/username`) | `index.html` |
| Deskripsi tab (masih lorem ipsum) | Section `#about` di `index.html` |
| Foto tab Pendidikan / Pengalaman | Simpan di `public/assets/img/gallery/`, lalu ganti `src`, `alt` & label di `<ul class="photo-grid …">` |
| Sertifikat | Gambar di `public/assets/img/certificates/`, lalu salin satu `<li class="cert-item …">` di `#panel-cert` dan ganti atribut `data-img`, `data-date`, `data-title`, `data-desc`, `data-code` |
| Proyek, link demo & repo | Section `#projects` di `index.html` |
| Jumlah kartu per halaman | Atribut `data-per-page` / `data-per-page-sm` pada `<ol class="card-grid …">` |

## Deploy gratis

Karena sekarang perlu proses build, deploy bisa lewat:

- **Vercel / Netlify**: hubungkan repo, build command `npm run build`, output folder `dist`.
- **GitHub Pages**: jalankan `npm run build` lalu publish isi folder `dist/` (bisa diotomatiskan dengan GitHub Actions).
