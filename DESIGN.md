---
name: Prawira POS
description: High-performance mobile retail cashier cockpit for Prawira Tobacco
colors:
  canvas: "#06090f"
  surface-base: "#0a0f18"
  surface-card: "#101726"
  surface-elevated: "#151f33"
  border: "#1e2b42"
  border-subtle: "#141c2c"
  primary: "#4f46e5"
  primary-light: "#6366f1"
  primary-muted: "#818cf8"
  signal-emerald: "#10b981"
  signal-amber: "#f59e0b"
  signal-danger: "#ef4444"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-muted: "#64748b"
typography:
  display:
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.5px"
  headline:
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.3px"
  title:
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  label:
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.6px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
---

# Design System: Prawira POS

## Overview

**Creative North Star: "Console Cockpit Kasir Industri & Meteran Presisi"**

Prawira POS dibangun dengan filosofi instrumen industri presisi tinggi yang melayani kecepatan operasional kasir fisik di meja counter toko tembakau dan retail eceran. Sistem visual menolak layout dashboard web yang pasif dan lambat, menggantikannya dengan pembagian split-screen berkecepatan tinggi: jendela optik live scanner di 34% atas dan cockpit keranjang transaksi taktil di 66% bawah.

Setiap elemen antarmuka dirancang untuk jangkauan satu jempol (thumb-zone ergonomics), dengan kontras tajam standar OLED dark mode agar mudah terbaca di segala kondisi pencahayaan toko. Transisi antar-langkah (pemindaian barang, penyesuaian timbangan ons, pemilihan pecahan uang pas, hingga cetak struk thermal Bluetooth) berlangsung minim ketukan dan tanpa jeda animasi yang menghambat antrean.

**Key Characteristics:**
- **Split Cockpit Architecture:** Pemindaian kamera continuous berkecepatan tinggi dipadukan langsung dengan antrean keranjang tanpa pergantian layar.
- **Tonal Contrast Hierarchy:** Kanvas gelap OLED (#06090f) dengan kartu bernuansa slate (#101726) dan garis batas terukur (#1e2b42).
- **Vibrant Functional Signals:** Warna zamrud (#10b981) khusus untuk kesiapan kasir dan tombol aksi bayar; indigo (#4f46e5, #818cf8) untuk status koneksi printer dan bobot timbangan; amber (#f59e0b) untuk produk favorit dan promo.
- **Tactile Touch Targets:** Chip timbangan dan stepper kuantitas berukuran minimum 44×44 dp dengan haptic feedback pada setiap aksi penting.

## Colors

Palet warna menggunakan pendekatan committed functional dark theme, di mana warna bukan sekadar hiasan melainkan indikator status operasional toko dan instrumen kalkulasi uang.

### Primary
- **Cobalt Indigo** (#4f46e5): Warna primer untuk chip terpilih, tombol interaksi utama non-finansial, dan badge identitas sistem.
- **Signal Indigo Muted** (#818cf8): Teks subtotal angka belanja, status Bluetooth printer, dan reticle sudut optik.

### Secondary
- **Signal Emerald** (#10b981): Indikator status toko 'Online', tombol utama 'BAYAR', dan notifikasi kembalian tunai.

### Tertiary
- **Signal Amber** (#f59e0b / #fbbf24): Bintang produk favorit, diskon paket, lampu senter kamera (torch), dan peringatan stok.
- **Signal Crimson** (#ef4444): Peringatan uang tunai kurang, tombol hapus keranjang, dan status scanner jeda.

### Neutral
- **Deep OLED Canvas** (#06090f): Latar belakang utama aplikasi, meminimalkan konsumsi daya saat kamera terus aktif.
- **Surface Base** (#0a0f18): Bidang dasar kontainer keranjang kasir.
- **Surface Card** (#101726): Kartu item keranjang dan blok informasi modal.
- **Surface Elevated** (#151f33): Chip tombol tidak aktif, input teks, dan kontainer stepper.
- **Text Primary** (#f8fafc): Teks judul, angka kuantitas, dan label utama dengan kontras tertinggi.
- **Text Secondary** (#94a3b8): Teks harga satuan, label status, dan informasi pembantu.
- **Text Muted** (#64748b): Placeholder dan teks sekunder non-esensial.

### Named Rules
**The Single-Hero Emerald Rule.** Warna hijau zamrud (#10b981) dikhususkan secara eksklusif untuk aliran keberhasilan transaksi kasir: status online, tombol checkout 'BAYAR', dan kepastian uang kembalian. Tidak boleh digunakan untuk kartu atau teks biasa.

## Typography

Sistem tipografi mengutamakan keterbacaan angka finansial (tabular numerals) dengan bobot tebal yang tegas untuk mencegah kekeliruan kasir dalam melihat total belanja dan kembalian.

### Hierarchy
- **Display** (800 Bold, 28px): Angka total tagihan pada Checkout Modal dan banner struk.
- **Headline** (800 Bold, 22px): Total grand amount pada CartSummaryBar.
- **Title** (700 Bold, 16px): Judul modal dan header kartu transaksi.
- **Body Large** (700 Semi-Bold, 14px): Nama item produk pada daftar keranjang belanja.
- **Body** (500 Medium, 13px): Teks deskripsi dan instruksi operasional.
- **Caption** (600 Semi-Bold, 11px): Harga per unit timbangan (ons/pcs) dan catatan diskon.
- **Label** (700 Bold, 10px uppercase): Badge status koneksi dan reticle watermark.

### Named Rules
**The Tabular Clarity Rule.** Seluruh nominal uang rupiah (`Rp`) wajib menggunakan bobot minimal 700 (Bold) agar angka ribuan dan jutaan langsung tertangkap mata kasir dalam sekilas pandang.

## Layout

Tata letak membagi viewport perangkat menjadi dua zona vertikal utama:
1. **Zona Sensor (Top 34%):** Viewfinder kamera live scanning dengan sudut reticle optik, laser scan beam, dan toast feedback melayang.
2. **Zona Kasir & Cockpit (Bottom 66%):** Dimulai dengan header bar brand & printer, diikuti rak produk cepat (quick shelf), daftar keranjang scrollable, dan diakhiri dengan sticky summary bar di dasar layar.

Area kontrol interaktif (stepper, tombol bayar, chip nominal) diposisikan di paruh bawah layar agar dapat dioperasikan secara ergonomis hanya dengan satu jempol tangan kasir.

## Elevation & Depth

Kedalaman visual dicapai melalui tonal elevation berlapis (level permukaan dari `#06090f` ke `#0a0f18`, `#101726`, lalu `#151f33`) yang dipertegas garis batas presisi 1px (`#1e2b42` dan `#141c2c`). 

Tombol aksi primer (seperti tombol 'BAYAR') dilengkapi dengan soft glow shadow berwarna zamrud untuk menarik fokus mata secara instan.

## Shapes

- **Sudut Kartu:** Radius 12–16px untuk kartu keranjang dan modal sheet.
- **Sudut Chip & Tombol:** Radius 6–8px untuk chip timbangan ons, kuantitas stepper, dan tombol kontrol.
- **Sudut Badge & Pil:** Radius 999px (full capsule) untuk status koneksi, banner deteksi scan, dan counter item.
- **Batas Presisi:** Garis pembatas border konsisten 1px dengan kontras terukur.

## Components

### Live Scanner Viewfinder
- Frame optik dengan 4 sudut reticle berwarna indigo (`#818cf8`).
- Garis laser scanning bercahaya horizontal.
- Toast feedback melayang kapsul gelap di dasar viewfinder yang memunculkan nama produk dan harga seketika terdeteksi.

### Cart Item Card
- Latar belakang `#101726` dengan border `#141c2c`.
- Baris atas: Nama barang, harga satuan/ons, potongan diskon (jika ada), dan subtotal harga.
- Baris bawah: Chip timbangan taktil (`1/2`, `1`, `2`, `5 ons`) untuk barang curah, atau stepper `- / +` untuk barang kemasan pcs. Tombol edit pensil dan hapus keranjang di sisi kanan.

### Cart Summary Deck
- Sticky bar di dasar layar keranjang dengan latar `#0a0f18`.
- Sisi kiri: Counter item, tombol Reset keranjang, dan grand total besar (`Rp 85.000`).
- Sisi kanan: Tombol primary zamrud `BAYAR` dengan ikon panah.

### Tender Modal & Cash Calculator
- Sheet geser atas dengan total tagihan format hero display.
- Tab pilihan metode pembayaran (Tunai, QRIS, Transfer).
- Chip jalan pintas nominal uang tunai (`Uang Pas`, `10k`, `20k`, `50k`, `100k`) yang otomatis menghitung kembalian atau kekurangan secara real-time.

### Thermal Receipt Preview
- Tampilan kertas thermal realistis monospaced dengan rincian toko, nomor nota, item belanja, metode pembayaran, kembalian, dan tombol langsung Cetak Bluetooth (ESC/POS) serta Share WhatsApp.

## Do's and Don'ts

### Do:
- **Do** pertahankan pemindaian kamera dan keranjang pada satu layar split cockpit tanpa mengharuskan kasir berpindah screen untuk scan barang berikutnya.
- **Do** sediakan chip timbangan cepat (`1/2`, `1`, `2`, `5`) untuk semua produk berbobot ons/gram/kg.
- **Do** gunakan haptic feedback pada saat pemindaian berhasil dan konfirmasi pembayaran.
- **Do** pastikan target sentuh tombol minimal 44×44 dp untuk kecepatan jempol kasir.

### Don't:
- **Don't** gunakan tema terang menyilaukan yang membuat kasir silau saat mengoperasikan scanner di bawah lampu toko.
- **Don't** buat tombol Bayar tersembunyi di dalam menu lain; harus selalu sticky di dasar keranjang.
- **Don't** gunakan bayangan blur berlebihan tanpa struktur tonal yang solid.
- **Don't** blokir jalannya transaksi kasir saat koneksi internet offline; antrean lokal harus tetap bekerja lancar.
