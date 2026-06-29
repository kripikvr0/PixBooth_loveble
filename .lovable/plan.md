## PixBooth — Photobooth dengan 10 Frame Kamu (1:1)

Pakai 10 gambar yang kamu upload **persis seperti aslinya** sebagai frame overlay. Foto user diisi ke kotak kosong (hitam/putih) di tiap frame, semua collage/stiker/teks di sekitarnya tetap utuh.

### 10 Frame
1. Baby Girl (gingham merah + receipt) — 3 foto
2. The 1975 "About You" (koran b&w) — 3 foto
3. Polaroid Film Strip (denim) — 4 foto
4. Leopard Sepia — 3 foto
5. Kate & Jackson Airmail — 3 foto
6. Sasana Inbox (dual strip) — 8 foto (4+4)
7. Allday Project Receipt — 1 foto portrait
8. Airmail Blank — 3 foto
9. Leopard Brown + Lily — 3 foto
10. Personalab Breaking News — 4 foto

### Cara kerja
- Tiap frame disimpan sebagai gambar overlay (PNG/JPG asli kamu) + koordinat slot foto (x, y, w, h per kotak kosong, diukur manual dari tiap gambar).
- User pilih frame → kamera depan (mirror) → countdown 3-2-1 → ambil N foto otomatis (sesuai jumlah slot) dengan jeda 3 detik.
- Canvas compositing: gambar foto user di tiap slot, lalu timpa overlay frame di atasnya → export JPEG portrait beresolusi sama dengan frame asli (~736×1308 mengikuti aspect ratio upload).
- Hasil bisa di-download / share / disimpan ke gallery (IndexedDB).

### Halaman
- `/` — grid 10 thumbnail frame
- `/capture/$frameId` — kamera + countdown
- `/result` — preview hasil + tombol Save / Share / Retake
- `/gallery` — daftar foto tersimpan

### Stack
- TanStack Start (sudah ada), Canvas 2D, getUserMedia, IndexedDB (`idb`), Web Share API.
- Frame images masuk ke `src/assets/frames/` via Lovable Assets dari upload kamu.
- Bahasa UI: Indonesia (default) + English toggle.

### Catatan
- v1: 10 frame fixed, belum ada filter/AR/upload frame custom.
- Koordinat slot di-tune manual per frame supaya foto ngepas di kotak kosong.

Approve kalau oke, atau bilang frame mana yang mau diprioritaskan dulu (kalau mau bertahap, bukan 10 sekaligus).