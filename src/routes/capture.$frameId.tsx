import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getFrame } from "@/lib/frames";
import { captureFromVideo, composeFrame } from "@/lib/compose";

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
  const { frameId } = Route.useParams();
  const navigate = useNavigate();
  const frame = getFrame(frameId);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shotIndex, setShotIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [composing, setComposing] = useState(false);

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
        setError(
          (e as Error)?.message ||
            "Tidak bisa akses kamera. Pastikan izin kamera diaktifkan.",
        );
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function runSession() {
    if (!frame || !videoRef.current || running) return;
    setRunning(true);
    const photos: string[] = [];
    for (let i = 0; i < frame.slots.length; i++) {
      setShotIndex(i);
      // countdown 3..1
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await wait(1000);
      }
      setCountdown(0);
      // flash effect handled by CSS via countdown === 0
      photos.push(captureFromVideo(videoRef.current!));
      await wait(400);
      setCountdown(null);
      if (i < frame.slots.length - 1) await wait(700);
    }
    setComposing(true);
    const composed = await composeFrame(frame, photos);
    // pass via sessionStorage
    sessionStorage.setItem(
      "pixbooth:last",
      JSON.stringify({ frameId: frame.id, dataUrl: composed }),
    );
    navigate({ to: "/result" });
  }

  function wait(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
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
        <Link to="/" className="rounded-full px-3 py-1 text-sm text-white/70 hover:bg-white/10">
          ← Batal
        </Link>
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
        </div>
      </main>

      <footer className="border-t border-white/10 px-4 py-4">
        {error ? (
          <p className="text-center text-sm text-red-400">{error}</p>
        ) : !ready ? (
          <p className="text-center text-sm text-white/60">Menyiapkan kamera…</p>
        ) : composing ? (
          <p className="text-center text-sm text-white/70">Merangkai foto…</p>
        ) : (
          <button
            onClick={runSession}
            disabled={running}
            className="mx-auto block w-full max-w-xs rounded-full bg-pink-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/30 transition active:scale-95 disabled:opacity-50"
          >
            {running ? `Foto ke ${shotIndex + 1}…` : `Mulai (${frame.slots.length} foto)`}
          </button>
        )}
      </footer>

      <style>{`
        @keyframes flash { 0% { opacity: .9 } 100% { opacity: 0 } }
      `}</style>
    </div>
  );
}
