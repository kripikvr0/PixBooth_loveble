## Debug Mode: Visualisasi Slot Frame

Tambah mode debug supaya bisa lihat posisi & ukuran tiap slot foto di atas overlay frame, jadi gampang ngecek frame mana yang masih meleset dan berapa banyak.

### Yang dibangun

**1. Halaman baru `/debug` (route `src/routes/debug.tsx`)**
- Grid 10 frame (mirip home) → klik salah satu → masuk ke debug view.
- Debug view per frame menampilkan:
  - Overlay frame di-render pada ukuran asli (di-scale responsive, tapi koordinat dihitung di ruang asli 736×1308 dll).
  - Setiap slot digambar sebagai kotak overlay semi-transparan (warna beda per slot) dengan border tegas.
  - Label di tiap slot: `#index  x,y  w×h`.
  - Ruler / grid opsional (garis tiap 50px) untuk bantu perkiraan koordinat.

**2. Panel kontrol di sisi kanan / bawah**
- Toggle: Show slots / Show grid / Show labels / Show ruler.
- Pilih slot aktif → nudge dengan tombol ◀ ▲ ▼ ▶ (step 1px / 5px / 10px) untuk `x`, `y`, `w`, `h`.
- Nilai slot ditampilkan live sebagai JSON siap-copy:
  ```ts
  { x: 170, y: 469, w: 292, h: 286 }
  ```
- Tombol **Copy JSON** untuk seluruh array `slots` frame aktif → tinggal paste ke `src/lib/frames.ts`.
- Tombol **Reset** kembali ke nilai default dari `FRAMES`.
- Nilai tweak disimpan ke `localStorage` per `frameId` biar ga hilang saat refresh.

**3. Preview kompositing test**
- Tombol "Test with sample photo" → isi tiap slot dengan gambar placeholder (kotak berwarna + nomor) via `composeFrame`, tampilkan hasilnya di sebelah view slot.
- Biar keliatan langsung apakah slot sudah pas nutupin placeholder di frame JPG.

**4. Debug overlay di halaman `/capture/$frameId`**
- Query param `?debug=1` → saat kamera aktif, tampilkan outline slot (posisi + label) di atas preview video (di-scale ke ukuran video), plus counter slot yang sedang aktif dibold.
- Kalau `?debug=1` tidak ada, capture jalan normal (zero cost di production).

**5. Entry point**
- Tombol kecil "Debug" di footer home (atau di bottom-nav dev-only) yang ngarah ke `/debug`.
- Bisa juga diakses langsung dari URL.

### File yang disentuh

- `src/routes/debug.tsx` — halaman debug + panel kontrol (baru).
- `src/components/slot-inspector.tsx` — komponen render overlay slot + ruler + labels (baru).
- `src/lib/frames.ts` — export helper `getDefaultSlots(frameId)` untuk reset.
- `src/routes/capture.$frameId.tsx` — tambah overlay `?debug=1`.
- `src/routes/index.tsx` — link kecil ke `/debug`.
- `src/routeTree.gen.ts` — auto-generated route baru.

### Alur pakai

1. Buka `/debug` → pilih frame yang meleset.
2. Toggle slots + labels, lihat mana yang keluar dari kotak kosong di overlay.
3. Klik slot → nudge sampai pas.
4. Klik **Copy JSON** → paste ke `FRAMES` di `src/lib/frames.ts`.
5. Test dengan sample photo untuk konfirmasi.

### Catatan

- Debug mode tidak mengubah data foto user, tidak menyentuh IndexedDB gallery.
- Semua kalkulasi tetap di ruang koordinat asli frame — scaling untuk display cuma di layer CSS transform, biar copy-paste ke `FRAMES` langsung akurat.