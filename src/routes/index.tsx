import { createFileRoute, Link } from "@tanstack/react-router";
import { FRAMES } from "@/lib/frames";
import TrueFocus from "@/components/true-focus";
import { GlassButton, GlassCard } from "@/components/glass";
import { ThemeToggle } from "@/components/theme-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { Camera, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PixBooth — Photobooth Frame Estetik" },
      {
        name: "description",
        content: "Bikin foto photobooth estetik pakai frame Instagramable, gratis di browser kamu.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = FRAMES.slice(0, 5);

  return (
    <div className="relative min-h-screen overflow-hidden pb-28">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl animate-pulse-glow" />
        <div
          className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-accent/40 blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 px-4 pt-4">
        <div className="glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-4 py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" strokeWidth={2.4} />
            <span className="font-display tracking-tight">PixBooth</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-10 text-center sm:pt-16">
        <div className="font-display text-6xl sm:text-7xl md:text-8xl leading-[0.95]">
          <TrueFocus
            sentence="Pix Booth"
            blurAmount={5}
            borderColor="oklch(0.78 0.2 330)"
            glowColor="oklch(0.78 0.2 330 / 0.7)"
            animationDuration={0.5}
            pauseBetweenAnimations={0.8}
          />
        </div>

        <p className="mx-auto mt-5 max-w-md text-sm text-foreground/70 sm:text-base">
          Photobooth estetik dengan frame Instagramable. Jepret, susun, share — semua di browser HP kamu.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/capture/$frameId" params={{ frameId: FRAMES[0].id }}>
            <GlassButton variant="primary" size="lg">
              <Camera className="size-4" strokeWidth={2.4} />
              Mulai jepret
            </GlassButton>
          </Link>
          <Link to="/gallery">
            <GlassButton size="lg">Galeri saya</GlassButton>
          </Link>
        </div>

        {/* Floating frame stack */}
        <div className="relative mx-auto mt-12 h-72 w-full max-w-md sm:h-80">
          {featured.map((frame, i) => {
            const offset = i - 2;
            const rotate = offset * 8;
            return (
              <Link
                key={frame.id}
                to="/capture/$frameId"
                params={{ frameId: frame.id }}
                className="absolute left-1/2 top-0 -translate-x-1/2 animate-float-slow"
                style={{
                  transform: `translateX(calc(-50% + ${offset * 56}px)) rotate(${rotate}deg)`,
                  ["--r" as never]: `${rotate}deg`,
                  zIndex: 10 - Math.abs(offset),
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                <div className="glass overflow-hidden rounded-2xl p-1.5 shadow-[var(--shadow-glass)] transition-transform hover:scale-105">
                  <img
                    src={frame.overlay}
                    alt={frame.name}
                    className="h-56 w-32 rounded-xl object-cover sm:h-64 sm:w-36"
                    loading="lazy"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Frame grid */}
      <section className="mx-auto mt-8 max-w-5xl px-4 sm:mt-16">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Pilih frame</h2>
            <p className="mt-1 text-sm text-foreground/60">
              Tap salah satu, langsung jepret pakai kamera.
            </p>
          </div>
          <span className="text-xs text-foreground/50">{FRAMES.length} frame</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {FRAMES.map((frame, idx) => (
            <Link
              key={frame.id}
              to="/capture/$frameId"
              params={{ frameId: frame.id }}
              className="group relative"
              style={{ animation: `fade-in 0.5s ease-out ${idx * 0.05}s both` }}
            >
              <GlassCard className="relative overflow-hidden p-1.5 transition-all duration-300 hover:scale-[1.03] hover:shadow-[var(--shadow-glow)]">
                <div className="relative aspect-[3/5] w-full overflow-hidden rounded-xl">
                  <img
                    src={frame.overlay}
                    alt={frame.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="text-sm font-semibold text-white">{frame.name}</div>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/70">
                      <span>{frame.slots.length} foto</span>
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
