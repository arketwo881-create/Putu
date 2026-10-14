# PANDUAN RILIS GOOGLE PLAY STORE — PLAYVERSE 35

Aplikasi **PLAYVERSE 35** telah dirancang dengan arsitektur web modern yang siap di-bundle menjadi aplikasi Android native menggunakan **Capacitor**.

---

## 1. Identitas Aplikasi & Spesifikasi

- **Nama Aplikasi**: PLAYVERSE 35
- **Paket Android (Application ID)**: `com.playverse35.arcade`
- **Target SDK**: Android 14+ (API Level 34 / 35)
- **Minimum SDK**: Android 7.0 (API Level 24)
- **Kategori Play Store**: Arkade (Arcade) & Teka-Teki (Puzzle)
- **Mode Permainan**: 100% Offline-First (Semua 35 permainan dapat dimainkan tanpa koneksi internet).

---

## 2. Izin Android (Permissions)

Aplikasi menerapkan prinsip izin seminimal mungkin untuk menjaga privasi pengguna:

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Hanya getaran haptik saat bermain -->
    <uses-permission android:name="android.permission.VIBRATE" />
    <!-- Hanya jika mengaktifkan sinkronisasi leaderboard online Supabase -->
    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

---

## 3. Langkah Membangun File APK / AAB (Android App Bundle)

### Langkah A: Build Web Assets
```bash
npm run build
```

### Langkah B: Inisialisasi Platform Android dengan Capacitor
```bash
npx cap add android
npx cap sync
```

### Langkah C: Menghasilkan Keystore Release
Jalankan perintah ini di terminal untuk membuat kunci penandatanganan:
```bash
keytool -genkey -v -keystore playverse35-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias playverse35
```

### Langkah D: Build Release Android App Bundle (.aab)
```bash
cd android
./gradlew bundleRelease
```
File `.aab` yang telah ditandatangani akan berada di:
`android/app/build/outputs/bundle/release/app-release.aab`

File `.aab` ini yang siap diunggah ke Google Play Console.

---

## 4. Materi Listing Google Play Console

### Judul Aplikasi
`PLAYVERSE 35: 35 Mini Games Arcade`

### Deskripsi Singkat (Maks 80 karakter)
`Koleksi 35 mini-game seru, adiktif & offline: puzzle, aksi, catur, dan arkade!`

### Deskripsi Lengkap
```text
Selamat datang di PLAYVERSE 35! Nikmati surga 35 permainan mini dalam satu aplikasi ringan, cepat, dan tanpa perlu kuota internet!

Fitur Unggulan:
★ 35 PERMAINAN LENGKAP & DAPAT DIMAINKAN:
  - Kategori Puzzle: 2048, Sudoku, Tic-Tac-Toe, Memory Match, Minesweeper, Sliding Puzzle, Word Guess, Math Challenge, Color Sort, Connect the Dots.
  - Kategori Arcade: Snake Classic, Brick Breaker, Pong, Flappy Bird, Space Shooter, Endless Runner, Fruit Slice, Whack-a-Mole, Stack Tower, Helicopter Escape.
  - Kategori Strategi: Dam (Checkers), Catur (Chess) dengan AI, Reversi/Othello, Connect Four, Dots and Boxes.
  - Kategori Santai: Bubble Shooter, Jigsaw Puzzle, Mahjong Solitaire, Parking Puzzle (Mobil Merah), Pipe Connect, Tes Refleks, Color Reflex, Rhythm Tap, Target Aim, Tantangan Harian.

★ SISTEM LEVEL & PENCAPAIAN:
Kumpulkan XP, naikkan level profilmu, kumpulkan lencana prestasi, dan catat skor terbaikmu.

★ TANTANGAN HARIAN (DAILY CHALLENGE):
Misi baru setiap hari dengan hadiah XP ekstra untuk menjaga streak bermainmu.

★ 100% OFFLINE FIRST:
Mainkan di mana saja dan kapan saja tanpa perlu khawatir kuota internet habis.

★ KONTROL SENTUH RAMAH MOBILE:
Dirancang khusus dengan tombol yang nyaman, responsif, dan efek suara retro sintetis yang menyenangkan.
```

---

## 5. Pernyataan Data Safety & Privasi
- Aplikasi **tidak mengumpulkan data pribadi** pengguna tanpa izin.
- Skor dan progres tersimpan secara lokal di perangkat (`IndexedDB` / `localStorage`).
- Tidak ada transaksi uang sungguhan ataupun penarikan dana.
