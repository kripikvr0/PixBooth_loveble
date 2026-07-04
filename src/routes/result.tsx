import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { getFrame } from "@/lib/frames";
import { savePhoto } from "@/lib/gallery";

// ---- IndexedDB temp storage (replaces sessionStorage for large data) ----
const TEMP_DB_NAME = "pixbooth-temp";
const TEMP_STORE = "lastCapture";
const TEMP_KEY = "latest";

async function openTempDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(TEMP_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TEMP_STORE)) {
        db.createObjectStore(TEMP_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadTempCapture(): Promise<{ frameId: string; dataUrl: string } | null> {
  const db = await openTempDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TEMP_STORE, "readonly");
    const req = tx.objectStore(TEMP_STORE).get(TEMP_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function clearTempCapture(): Promise<void> {
  const db = await openTempDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TEMP_STORE, "readwrite");
    tx.objectStore(TEMP_STORE).delete(TEMP_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Fallback UUID generator for older browsers
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: RFC 4122 v4 compatible
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const Route = createFileRoute("/result")({
  component: ResultPage,
});

function ResultPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ frameId: string; dataUrl: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Try IndexedDB first
        let captured = await loadTempCapture();

        // Fallback: try sessionStorage for backward compatibility
        if (!captured) {
          const raw = sessionStorage.getItem("pixbooth:last");
          if (raw) {
            try {
              captured = JSON.parse(raw);
            } catch {
              // Invalid JSON, ignore
            }
          }
        }

        if (!captured) {
          if (!cancelled) navigate({ to: "/" });
          return;
        }

        if (!cancelled) {
          setData(captured);
          // Clean up temp storage after successful load
          await clearTempCapture().catch(() => {
            // Ignore cleanup errors
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError("Gagal memuat hasil foto. Silakan coba lagi.");
          console.error("Failed to load capture:", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [navigate]);

  const frame = data ? getFrame(data.frameId) : null;

  const handleSave = useCallback(async () => {
    if (!data || !frame) return;
    try {
      const id = generateId();
      await savePhoto({
        id,
        frameId: data.frameId,
        frameName: frame.name,
        dataUrl: data.dataUrl,
        createdAt: Date.now(),
      });
      setSaved(true);
    } catch (e) {
      setError("Gagal menyimpan foto.");
      console.error("Failed to save photo:", e);
    }
  }, [data, frame]);

  const handleDownload = useCallback(() => {
    if (!data) return;
    try {
      const a = document.createElement("a");
      a.href = data.dataUrl;
      a.download = `pixbooth-${Date.now()}.jpg`;
      a.click();
    } catch (e) {
      setError("Gagal mengunduh foto.");
      console.error("Download failed:", e);
    }
  }, [data]);

  const handleShare = useCallback(async () => {
    if (!data) return;
    try {
      const blob = await (await fetch(data.dataUrl)).blob();
      const file = new File([blob], "pixbooth.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "PixBooth" });
      } else {
        handleDownload();
      }
    } catch (e) {
      // User cancelled or share failed - try download as fallback
      if ((e as Error).name !== "AbortError") {
        handleDownload();
      }
    }
  }, [data, handleDownload]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-white/60">Memuat hasil…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-white">
        <p className="text-red-400">{error || "Data tidak ditemukan."}</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium transition-colors hover:bg-primary/90"
        >
          Ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <Link to="/" className="rounded-full px-3 py-1 text-sm text-white/70 hover:bg-white/10">
          ← Beranda
        </Link>
        <div className="text-sm font-semibold">Hasil</div>
        <div className="w-16" />
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <img
          src={data.dataUrl}
          alt="Hasil"
          className="max-h-[75vh] w-auto rounded-xl shadow-2xl shadow-black/50"
        />
      </main>

      <footer className="space-y-2 border-t border-white/10 px-4 py-4">
        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}
        <div className="mx-auto flex max-w-md gap-2">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20 disabled:opacity-50 transition"
          >
            {saved ? "Tersimpan ✓" : "Simpan"}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20 transition"
          >
            Download
          </button>
          <button
            onClick={handleShare}
            className="flex-1 rounded-full bg-pink-500 px-4 py-3 text-sm font-semibold shadow-lg shadow-pink-500/30 transition active:scale-95"
          >
            Bagikan
          </button>
        </div>
        {frame && (
          <Link
            to="/capture/$frameId"
            params={{ frameId: frame.id }}
            className="mx-auto block max-w-md text-center text-xs text-white/50 underline"
          >
            Foto ulang dengan frame ini
          </Link>
        )}
      </footer>
    </div>
  );
}
