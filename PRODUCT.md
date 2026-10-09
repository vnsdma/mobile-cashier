# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Pemilik toko (owner) sekaligus kasir toko tembakau dan retail eceran (Prawira Tobacco, Cigombong, Bogor). Mengoperasikan kasir di meja counter fisik, melayani antrean pelanggan secara cepat dengan navigasi satu tangan pada smartphone atau handheld POS Android. Membutuhkan kecepatan input belanja, akurasi perhitungan harga timbangan/eceran, dan kemudahan monitoring transaksi harian.

## Product Purpose

Aplikasi Point of Sale (POS) mobile performa tinggi yang memadukan pemindaian barcode/QR kamera split-screen instan, mesin harga ganda (satuan pcs dan timbangan ons/gram/kg dengan aturan 1/2 unit & diskon paket), kalkulator tender pembayaran tunai/QRIS/transfer, pencetakan struk printer thermal Bluetooth ESC/POS (58mm/80mm), dan pengiriman nota digital via WhatsApp. Keberhasilan diukur dari kecepatan transaksi per pelanggan (di bawah 10 detik), nol kesalahan hitung kembalian/timbangan, dan keandalan operasional tanpa henti.

## Positioning

POS mobile retail eceran dan tembakau spesifik dengan integrasi split-screen live scanner dan quick-weight selector (ons/gram/kg) langsung pada keranjang, didukung pencetakan thermal Bluetooth instan dan ketahanan offline-first dengan sinkronisasi Supabase.

## Operating Context

- Digunakan pada smartphone Android (portrait) atau perangkat POS genggam (smart POS terminal).
- Lingkungan counter toko fisik dengan pencahayaan dinamis; kasir berdiri atau duduk melayani antrean pelanggan tatap muka.
- Interaksi fisik: satu tangan memegang ponsel/terminal kasir, tangan lain memindai barang fisik atau menerima uang tunai dari pelanggan.
- Perangkat pendukung: Printer thermal Bluetooth mini 58mm/80mm (via RawBT driver), kode QRIS statis / EDC toko, dan WhatsApp pelanggan.

## Capabilities and Constraints

- **Live Viewfinder Continuous Scanner**: Menggunakan Expo Camera (`CameraView`) dengan reticle presisi, kontrol torch senter, haptic feedback (`expo-haptics`), dan throttling otomatis untuk scan tanpa sentuh layar.
- **Dual-Mode Pricing Engine**: Dukungan barang kemasan (`pcs`) dengan stepper kuantitas dan barang timbangan (`ons`, `gram`, `kg`) dengan chip cepat (1/2, 1, 2, 5) serta harga kustom/diskon paket per item.
- **Tender Multi-Metode**: Tunai (quick cash chips: Uang Pas, 10k, 20k, 50k, 100k, kalkulator kembalian dan peringatan uang kurang real-time), QRIS toko, dan Transfer Bank.
- **Pencetakan & Pembagian Struk**: Cetak thermal Bluetooth ESC/POS (58mm/80mm), PDF invoice share, dan format pesan teks rapi untuk WhatsApp.
- **Ketahanan Offline & Sync**: Penyimpanan lokal `@react-native-async-storage/async-storage` untuk katalog produk, keranjang aktif, dan antrean transaksi offline; sinkronisasi cloud Supabase (`products`, `orders`, `order_items`, `decrement_stock` RPC).
- **Teknologi**: React Native 0.86, Expo SDK 57, TypeScript, lucide-react-native.

## Brand Commitments

- Nama Usaha: **Prawira Tobacco** / **Prawira POS**
- Lokasi Toko: Jl. Raya Cigombong, Bogor
- Kontak: 0812-3456-7890
- Tagline Struk: "Kualitas & Rasa Terbaik"
- Catatan Kaki: "Terima kasih atas kunjungan Anda"

## Evidence on Hand

- Source code lengkap di `src/` dengan komponen scanner, cart, checkout, receipt, katalog, dan printer modal.
- Skema database di `supabase-migration.sql`.
- Brand & icons di `assets/`.
- Tidak ada data fiktif atau klaim yang tidak didukung fungsionalitas aplikasi.

## Product Principles

1. **Kecepatan & Ergonomi Kasir (Zero-Friction Velocity)**: Setiap ketukan dan gesture dioptimalkan untuk efisiensi kecepatan transaksi; area kontrol utama berada di zona jangkauan ibu jari (thumb-zone ergonomics).
2. **Kejelasan Finansial & Akurasi Seketika (Tactile Financial Clarity)**: Angka total tagihan, nominal tunai, kembalian, dan potongan diskon ditampilkan tegas dan kontras tanpa ambiguitas visual.
3. **Ketahanan Operasional (Offline-First Resilience)**: Kasir tidak boleh terblokir atau melambat oleh fluktuasi jaringan seluler; status sinkronisasi transparan dan stabil.
4. **Craft & Keberwibawaan Visual (Modern Retail Precision)**: Desain berstandar tinggi yang profesional, terstruktur, solid, dan memancarkan kualitas retail modern terpercaya.

## Accessibility & Inclusion

- Target sentuh minimal 44x44 dp untuk seluruh tombol dan chip interaktif kasir.
- Kontras rasio teks dan latar belakang tinggi (standar OLED dark mode kontras tinggi) agar mudah dibaca di bawah pencahayaan toko yang terang maupun redup.
- Feedback haptik pada pemindaian barcode dan konfirmasi checkout penting.
