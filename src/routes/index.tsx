import { createFileRoute, Link } from "@tanstack/react-router";
import { FRAMES } from "@/lib/frames";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PixBooth — Photobooth Frame Estetik" },
      {
        name: "description",
        content:
          "Bikin foto photobooth lucu pakai 10 frame estetik. Gratis, langsung di browser HP kamu.",
      },
      { property: "og:title", content: "PixBooth — Photobooth Frame Estetik" },
      {
        property: "og:description",
        content: "Bikin foto photobooth lucu pakai 10 frame estetik.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight">
            Pix<span className="text-pink-400">Booth</span>
          </h1>
          <Link
            to="/gallery"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium hover:bg-white/10"
          >
            Galeri
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Pilih frame kamu</h2>
          <p className="mt-1 text-sm text-white/60">
            Tap salah satu, langsung jepret pakai kamera depan.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {FRAMES.map((frame) => (
            <Link
              key={frame.id}
              to="/capture/$frameId"
              params={{ frameId: frame.id }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/30 hover:scale-[1.02]"
            >
              <div className="relative aspect-[3/5] w-full overflow-hidden">
                <img
                  src={frame.overlay}
                  alt={frame.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-sm font-semibold">{frame.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/60">
                  {frame.slots.length} foto
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
