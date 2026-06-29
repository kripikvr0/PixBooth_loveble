import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getFrame } from "@/lib/frames";
import { savePhoto } from "@/lib/gallery";

export const Route = createFileRoute("/result")({
  component: ResultPage,
});

function ResultPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ frameId: string; dataUrl: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("pixbooth:last");
    if (!raw) {
      navigate({ to: "/" });
      return;
    }
    setData(JSON.parse(raw));
  }, [navigate]);

  if (!data) return null;
  const frame = getFrame(data.frameId);

  async function handleSave() {
    if (!data || !frame) return;
    const id = crypto.randomUUID();
    await savePhoto({
      id,
      frameId: data.frameId,
      frameName: frame.name,
      dataUrl: data.dataUrl,
      createdAt: Date.now(),
    });
    setSaved(true);
  }

  function handleDownload() {
    if (!data) return;
    const a = document.createElement("a");
    a.href = data.dataUrl;
    a.download = `pixbooth-${Date.now()}.jpg`;
    a.click();
  }

  async function handleShare() {
    if (!data) return;
    try {
      const blob = await (await fetch(data.dataUrl)).blob();
      const file = new File([blob], "pixbooth.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "PixBooth" });
      } else {
        handleDownload();
      }
    } catch {
      // user cancelled or share failed
    }
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
        <div className="mx-auto flex max-w-md gap-2">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"
          >
            {saved ? "Tersimpan ✓" : "Simpan"}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20"
          >
            Download
          </button>
          <button
            onClick={handleShare}
            className="flex-1 rounded-full bg-pink-500 px-4 py-3 text-sm font-semibold shadow-lg shadow-pink-500/30"
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
