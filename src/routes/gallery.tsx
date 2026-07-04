import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { deletePhoto, listPhotos, type SavedPhoto } from "@/lib/gallery";
import { Trash2, X, Download, ImageOff } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
});

function GalleryPage() {
  const [items, setItems] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<SavedPhoto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const photos = await listPhotos();
        if (!cancelled) {
          setItems(photos);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Gagal memuat galeri. Coba refresh halaman.");
          console.error("Gallery load failed:", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteConfirm(id);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  async function handleDeleteConfirm(id: string) {
    setDeleting(true);
    try {
      await deletePhoto(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      setOpen(null);
      setDeleteConfirm(null);
    } catch (e) {
      setError("Gagal menghapus foto. Coba lagi.");
      console.error("Delete failed:", e);
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(timestamp: number): string {
    try {
      return new Date(timestamp).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-4 backdrop-blur-xl">
        <Link to="/" className="rounded-full px-3 py-1 text-sm text-white/70 hover:bg-white/10 transition">
          ← Beranda
        </Link>
        <h1 className="text-base font-bold">Galeri</h1>
        <div className="w-16" />
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-white/60 underline hover:text-white"
            >
              Refresh halaman
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-sm text-white/50">Memuat foto…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ImageOff className="size-12 text-white/30 mb-4" />
            <p className="text-white/70">Belum ada foto tersimpan.</p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold transition hover:brightness-110"
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
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="relative aspect-[3/5] w-full overflow-hidden">
                  <img
                    src={p.dataUrl}
                    alt={p.frameName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 text-left">
                  <div className="text-xs font-medium truncate">{p.frameName}</div>
                  <div className="text-[10px] text-white/50">{formatDate(p.createdAt)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Photo Detail Modal */}
      {open && (
        <div
          className="fixed inset-0 z-20 flex flex-col bg-black/95 p-4 backdrop-blur"
          onClick={() => setOpen(null)}
        >
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-white/70">{open.frameName}</div>
            <button
              onClick={() => setOpen(null)}
              className="rounded-full bg-white/10 p-2 text-sm transition hover:bg-white/20"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center py-4">
            <img
              src={open.dataUrl}
              alt={open.frameName}
              className="max-h-[80vh] w-auto rounded-xl"
            />
          </div>
          <div
            className="mx-auto flex max-w-md w-full gap-2 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={open.dataUrl}
              download={`pixbooth-${open.id}.jpg`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
            >
              <Download className="size-4" />
              Download
            </a>
            <button
              onClick={() => handleDeleteRequest(open.id)}
              className="flex items-center justify-center gap-2 rounded-full border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/30"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center">
            <Trash2 className="mx-auto size-10 text-red-400 mb-3" />
            <h3 className="text-lg font-semibold">Hapus foto?</h3>
            <p className="mt-2 text-sm text-white/60">
              Foto ini akan dihapus permanen dari galeri. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/20 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirm)}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Menghapus…" : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
