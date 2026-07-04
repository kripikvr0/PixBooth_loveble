import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { getFrame } from "@/lib/frames";
import { captureFromVideo, composeFrame } from "@/lib/compose";

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

async function saveTempCapture(data: { frameId: string; dataUrl: string }): Promise<void> {
  const db = await openTempDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TEMP_STORE, "readwrite");
    tx.objectStore(TEMP_STORE).put(data, TEMP_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const Route = createFileRoute("/capture/$frameId")({
  component: CapturePage,
});

function useDebugFlag() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);
  return on;
}

function CapturePage() {
  const debug = useDebugFlag();
  const { frameId } = Route.useParams();
  const navigate = useNavigate();
  const frame = getFrame(frameId);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shotIndex, setShotIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [composing, setComposing] = useState(false);

  // Camera initialization
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            (e as Error)?.message ||
              "Tidak bisa akses kamera. Pastikan izin kamera diaktifkan.",
          );
        }
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const wait = useCallback((ms: number, signal?: AbortSignal) => {
    return new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Cancelled", "AbortError"));
        return;
      }
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Cancelled", "AbortError"));
      });
    });
  }, []);

  async function runSession() {
    if (!frame || !videoRef.current || running) return;

    // Create new abort controller for this session
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setRunning(true);
    setError(null);
    const photos: string[] = [];

    try {
      for (let i = 0; i < frame.slots.length; i++) {
        if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
        setShotIndex(i);

        // Countdown 3..1
        for (let c = 3; c > 0; c--) {
          if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
          setCountdown(c);
          await wait(1000, signal);
        }

        if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
        setCountdown(0);

        // Capture photo
        const video = videoRef.current;
        if (!video) throw new DOMException("Video element lost", "AbortError");
        photos.push(captureFromVideo(video));

        await wait(400, signal);
        setCountdown(null);
        if (i < frame.slots.length - 1) await wait(700, signal);
      }

      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");

      setComposing(true);
      const composed = await composeFrame(frame, photos);

      await saveTempCapture({ frameId: frame.id, dataUrl: composed });
      navigate({ to: "/result" });
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        // User cancelled - cleanup state
        setCountdown(null);
        setShotIndex(0);
        setRunning(false);
        setComposing(false);
        return;
      }
      setError((e as Error)?.message || "Terjadi kesalahan saat mengambil foto.");
      setRunning(false);
      setComposing(false);
    }
  }

  function cancelSession() {
    abortRef.current?.abort();
  }

  if (!frame) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-white">
        <p>Frame tidak ditemukan.</p>
        <Link to="/" className="mt-4 underline">
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        {running ? (
          <button
            onClick={cancelSession}
            className="rounded-full px-3 py-1 text-sm text-red-400 hover:bg-red-500/20 transition"
          >
            ✕ Batal
          </button>
        ) : (
          <Link to="/" className="rounded-full px-3 py-1 text-sm text-white/70 hover:bg-white/10">
            ← Batal
          </Link>
        )}
        <div className="text-sm font-semibold">{frame.name}</div>
        <div className="w-16 text-right text-xs text-white/50">
          {shotIndex + (running ? 1 : 0)}/{frame.slots.length}
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="relative aspect-[9/16] h-full max-h-[80vh] w-auto overflow-hidden rounded-2xl bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          {countdown !== null && countdown > 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black/50 text-7xl font-bold backdrop-blur-md">
                {countdown}
              </div>
            </div>
          )}
          {countdown === 0 && (
            <div className="pointer-events-none absolute inset-0 animate-[flash_400ms_ease-out] bg-white" />
          )}
          {debug && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                aspectRatio: `${frame.width} / ${frame.height}`,
                height: "100%",
              }}
            >
              <img src={frame.overlay} alt="" className="absolute inset-0 h-full w-full object-contain opacity-40" />
              <svg viewBox={`0 0 ${frame.width} ${frame.height}`} className="absolute inset-0 h-full w-full">
                {frame.slots.map((s, i) => (
                  <g key={i}>
                    <rect
                      x={s.x}
                      y={s.y}
                      width={s.w}
                      height={s.h}
                      fill={i === shotIndex ? "rgba(255,59,154,0.25)" : "rgba(0,212,255,0.1)"}
                      stroke={i === shotIndex ? "#ff3b9a" : "#00d4ff"}
                      strokeWidth={i === shotIndex ? 5 : 3}
                      strokeDasharray={i === shotIndex ? "none" : "10 8"}
                    />
                    <text x={s.x + 8} y={s.y + 28} fill="#fff" fontSize={22} fontWeight="bold" fontFamily="monospace">
                      #{i}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 px-4 py-4">
        {error ? (
          <div className="text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => { setError(null); setRunning(false); setComposing(false); }}
              className="mt-2 text-sm text-white/60 underline hover:text-white"
            >
              Coba lagi
            </button>
          </div>
        ) : !ready ? (
          <p className="text-center text-sm text-white/60">Menyiapkan kamera…</p>
        ) : composing ? (
          <p className="text-center text-sm text-white/70">Merangkai foto…</p>
        ) : running ? (
          <div className="text-center">
            <p className="text-sm text-white/70 mb-2">Foto ke {shotIndex + 1} dari {frame.slots.length}…</p>
            <button
              onClick={cancelSession}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Batalkan sesi
            </button>
          </div>
        ) : (
          <button
            onClick={runSession}
            className="mx-auto block w-full max-w-xs rounded-full bg-pink-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/30 transition active:scale-95"
          >
            Mulai ({frame.slots.length} foto)
          </button>
        )}
      </footer>

      <style>{`
        @keyframes flash { 0% { opacity: .9 } 100% { opacity: 0 } }
      `}</style>
    </div>
  );
}
