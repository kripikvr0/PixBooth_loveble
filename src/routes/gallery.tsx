import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { deletePhoto, listPhotos, type SavedPhoto } from "@/lib/gallery";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
});

function GalleryPage() {
  const [items, setItems] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<SavedPhoto | null>(null);

  useEffect(() => {
    listPhotos().then((p) => {
      setItems(p);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    await deletePhoto(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    setOpen(null);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-4 backdrop-blur-xl">
        <Link to="/" className="rounded-full px-3 py-1 text-sm text-white/70 hover:bg-white/10">
          ← Beranda
        </Link>
        <h1 className="text-base font-bold">Galeri</h1>
        <div className="w-16" />
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {loading ? (
          <p className="text-center text-sm text-white/50">Memuat…</p>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-white/70">Belum ada foto tersimpan.</p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold"
            >
              Bikin foto pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpen(p)}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/30"
              >
                <img src={p.dataUrl} alt={p.frameName} className="aspect-[3/5] w-full object-cover" />
                <div className="p-2 text-left">
                  <div className="text-xs font-medium">{p.frameName}</div>
                  <div className="text-[10px] text-white/50">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {open && (
        <div
          className="fixed inset-0 z-20 flex flex-col bg-black/95 p-4 backdrop-blur"
          onClick={() => setOpen(null)}
        >
          <div className="flex justify-end">
            <button
              onClick={() => setOpen(null)}
              className="rounded-full bg-white/10 px-3 py-1 text-sm"
            >
              Tutup
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <img src={open.dataUrl} alt="" className="max-h-[80vh] w-auto rounded-xl" />
          </div>
          <div
            className="mx-auto flex max-w-md gap-2 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={open.dataUrl}
              download={`pixbooth-${open.id}.jpg`}
              className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold"
            >
              Download
            </a>
            <button
              onClick={() => handleDelete(open.id)}
              className="flex-1 rounded-full border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-200"
            >
              Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
