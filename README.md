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
| Bio (masih lorem ipsum) | Section `#about` di `index.html` |
| Foto profil | Simpan di `assets/img/foto.jpg`, lalu ganti `.photo-placeholder` dengan `<img>` |
| Proyek, link demo & repo | Section `#projects` di `index.html` |
| Pengalaman & pendidikan | Section `#experience` di `index.html` |
| Warna aksen | Variabel `--accent` di `assets/css/style.css` |

## Deploy gratis

Aktifkan **GitHub Pages**: Settings → Pages → Source: branch utama, folder `/ (root)`.
