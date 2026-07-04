import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FRAMES, type Frame, type Slot } from "@/lib/frames";
import { composeFrame } from "@/lib/compose";
import { GlassButton, GlassCard } from "@/components/glass";
import { ArrowLeft, Copy, RotateCcw, Eye, EyeOff, Grid3x3, Ruler, Play } from "lucide-react";

export const Route = createFileRoute("/debug")({
  head: () => ({
    meta: [{ title: "Debug — PixBooth" }, { name: "robots", content: "noindex" }],
  }),
  component: DebugPage,
});

const STORAGE_PREFIX = "pixbooth:debug:slots:";

function loadOverride(frameId: string): Slot[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + frameId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveOverride(frameId: string, slots: Slot[]) {
  localStorage.setItem(STORAGE_PREFIX + frameId, JSON.stringify(slots));
}
function clearOverride(frameId: string) {
  localStorage.removeItem(STORAGE_PREFIX + frameId);
}

const SLOT_COLORS = [
  "#ff3b9a", "#00d4ff", "#ffcc00", "#7c3aed", "#22c55e",
  "#ef4444", "#f97316", "#06b6d4", "#a855f7", "#84cc16",
];

function samplePhoto(index: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;
  const c = SLOT_COLORS[index % SLOT_COLORS.length];
  ctx.fillStyle = c;
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  for (let i = 0; i < 400; i += 40) {
    ctx.fillRect(i, 0, 1, 400);
    ctx.fillRect(0, i, 400, 1);
  }
  ctx.fillStyle = "#fff";
  ctx.font = "bold 160px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1), 200, 210);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function DebugPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const frame = FRAMES.find((f) => f.id === activeId) ?? null;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/70 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
            <ArrowLeft className="size-4" /> Home
          </Link>
          <div className="font-display text-lg font-bold">Debug Slot Inspector</div>
          <div className="w-16" />
        </div>
      </header>

      {!frame ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <p className="mb-4 text-sm text-foreground/70">
            Pilih frame untuk lihat & tuning koordinat slot. Nilai tersimpan otomatis di browser.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {FRAMES.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className="group text-left"
              >
                <GlassCard className="overflow-hidden p-1.5 transition hover:scale-[1.03]">
                  <div className="relative aspect-[3/5] overflow-hidden rounded-xl">
                    <img src={f.overlay} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <div className="text-sm font-semibold text-white">{f.name}</div>
                      <div className="text-[10px] uppercase text-white/70">{f.slots.length} slot</div>
                    </div>
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <Inspector frame={frame} onBack={() => setActiveId(null)} />
      )}
    </div>
  );
}

function Inspector({ frame, onBack }: { frame: Frame; onBack: () => void }) {
  const [slots, setSlots] = useState<Slot[]>(() => loadOverride(frame.id) ?? frame.slots);
  const [activeIdx, setActiveIdx] = useState(0);
  const [step, setStep] = useState(5);
  const [showSlots, setShowSlots] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [composed, setComposed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const [displayW, setDisplayW] = useState(0);

  useEffect(() => {
    saveOverride(frame.id, slots);
  }, [frame.id, slots]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDisplayW(el.clientWidth));
    ro.observe(el);
    setDisplayW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const scale = displayW / frame.width;

  function updateSlot(patch: Partial<Slot>) {
    setSlots((prev) => prev.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)));
  }
  function nudge(dx: number, dy: number, dw = 0, dh = 0) {
    const s = slots[activeIdx];
    updateSlot({ x: s.x + dx, y: s.y + dy, w: s.w + dw, h: s.h + dh });
  }
  function reset() {
    clearOverride(frame.id);
    setSlots(frame.slots);
    setComposed(null);
  }
  async function testCompose() {
    const photos = slots.map((_, i) => samplePhoto(i));
    const dataUrl = await composeFrame({ ...frame, slots }, photos);
    setComposed(dataUrl);
  }
  function copyJson() {
    const json = JSON.stringify(slots, null, 2)
      .replace(/"([a-z])":/g, "$1:")
      .replace(/\n\s+/g, " ")
      .replace(/\[ /, "[\n  ")
      .replace(/ \]$/, ",\n]")
      .replace(/}, /g, "},\n  ");
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const jsonPreview = useMemo(
    () =>
      "[\n" +
      slots
        .map((s) => `  { x: ${Math.round(s.x)}, y: ${Math.round(s.y)}, w: ${Math.round(s.w)}, h: ${Math.round(s.h)} },`)
        .join("\n") +
      "\n]",
    [slots],
  );

  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1fr_360px]">
      {/* Canvas */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-foreground/70 hover:text-foreground">
            ← Ganti frame
          </button>
          <div className="text-sm font-semibold">{frame.name}</div>
          <div className="text-xs text-foreground/50">
            {frame.width}×{frame.height}
          </div>
        </div>

        <div
          ref={boxRef}
          className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black/40"
          style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
        >
          <img src={frame.overlay} alt="" className="absolute inset-0 h-full w-full object-cover" />

          {/* Ruler */}
          {showRuler && scale > 0 && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              {Array.from({ length: Math.ceil(frame.width / 50) + 1 }).map((_, i) => (
                <line key={"vx" + i} x1={i * 50 * scale} y1={0} x2={i * 50 * scale} y2="100%" stroke="rgba(255,255,255,0.15)" />
              ))}
              {Array.from({ length: Math.ceil(frame.height / 50) + 1 }).map((_, i) => (
                <line key={"hy" + i} x1={0} y1={i * 50 * scale} x2="100%" y2={i * 50 * scale} stroke="rgba(255,255,255,0.15)" />
              ))}
            </svg>
          )}

          {/* Grid overlay lines every 100 */}
          {showGrid && scale > 0 && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              {Array.from({ length: Math.ceil(frame.width / 100) + 1 }).map((_, i) => (
                <line key={"gx" + i} x1={i * 100 * scale} y1={0} x2={i * 100 * scale} y2="100%" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
              ))}
              {Array.from({ length: Math.ceil(frame.height / 100) + 1 }).map((_, i) => (
                <line key={"gy" + i} x1={0} y1={i * 100 * scale} x2="100%" y2={i * 100 * scale} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
              ))}
            </svg>
          )}

          {/* Slots */}
          {showSlots &&
            slots.map((s, i) => {
              const color = SLOT_COLORS[i % SLOT_COLORS.length];
              const active = i === activeIdx;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="absolute cursor-pointer transition"
                  style={{
                    left: s.x * scale,
                    top: s.y * scale,
                    width: s.w * scale,
                    height: s.h * scale,
                    background: active ? `${color}55` : `${color}25`,
                    border: `2px ${active ? "solid" : "dashed"} ${color}`,
                    boxShadow: active ? `0 0 0 2px rgba(255,255,255,0.6)` : "none",
                  }}
                >
                  {showLabels && (
                    <span
                      className="absolute -top-1 left-0 -translate-y-full whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-white"
                      style={{ borderLeft: `3px solid ${color}` }}
                    >
                      #{i} {Math.round(s.x)},{Math.round(s.y)} · {Math.round(s.w)}×{Math.round(s.h)}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {composed && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/60">Test compose</div>
            <img src={composed} alt="composed" className="mx-auto w-full max-w-[520px] rounded-2xl border border-white/10" />
          </div>
        )}
      </div>

      {/* Panel */}
      <aside className="space-y-4">
        <GlassCard className="p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/60">View</div>
          <div className="grid grid-cols-2 gap-2">
            <ToggleBtn active={showSlots} onClick={() => setShowSlots((v) => !v)} icon={showSlots ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}>
              Slots
            </ToggleBtn>
            <ToggleBtn active={showLabels} onClick={() => setShowLabels((v) => !v)}>Labels</ToggleBtn>
            <ToggleBtn active={showGrid} onClick={() => setShowGrid((v) => !v)} icon={<Grid3x3 className="size-3.5" />}>Grid 100</ToggleBtn>
            <ToggleBtn active={showRuler} onClick={() => setShowRuler((v) => !v)} icon={<Ruler className="size-3.5" />}>Ruler 50</ToggleBtn>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
              Slot #{activeIdx}
            </div>
            <div className="flex gap-1">
              {slots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`h-6 w-6 rounded text-[10px] font-mono ${i === activeIdx ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20"}`}
                  style={i === activeIdx ? undefined : { color: SLOT_COLORS[i % SLOT_COLORS.length] }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3 grid grid-cols-4 gap-2 text-center font-mono text-xs">
            <NumField label="x" value={slots[activeIdx].x} onChange={(v) => updateSlot({ x: v })} />
            <NumField label="y" value={slots[activeIdx].y} onChange={(v) => updateSlot({ y: v })} />
            <NumField label="w" value={slots[activeIdx].w} onChange={(v) => updateSlot({ w: v })} />
            <NumField label="h" value={slots[activeIdx].h} onChange={(v) => updateSlot({ h: v })} />
          </div>

          <div className="mb-2 flex items-center gap-2 text-xs">
            <span className="text-foreground/60">step</span>
            {[1, 5, 10, 25].map((n) => (
              <button
                key={n}
                onClick={() => setStep(n)}
                className={`rounded px-2 py-0.5 font-mono ${step === n ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20"}`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="mb-2 text-[10px] uppercase text-foreground/50">Position</div>
          <div className="mx-auto mb-3 grid w-32 grid-cols-3 gap-1">
            <span />
            <NudgeBtn onClick={() => nudge(0, -step)}>▲</NudgeBtn>
            <span />
            <NudgeBtn onClick={() => nudge(-step, 0)}>◀</NudgeBtn>
            <span />
            <NudgeBtn onClick={() => nudge(step, 0)}>▶</NudgeBtn>
            <span />
            <NudgeBtn onClick={() => nudge(0, step)}>▼</NudgeBtn>
            <span />
          </div>

          <div className="mb-1 text-[10px] uppercase text-foreground/50">Size</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <NudgeBtn onClick={() => nudge(0, 0, -step, 0)}>w −</NudgeBtn>
            <NudgeBtn onClick={() => nudge(0, 0, step, 0)}>w +</NudgeBtn>
            <NudgeBtn onClick={() => nudge(0, 0, 0, -step)}>h −</NudgeBtn>
            <NudgeBtn onClick={() => nudge(0, 0, 0, step)}>h +</NudgeBtn>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">slots JSON</div>
            <div className="flex gap-1">
              <button
                onClick={copyJson}
                className="flex items-center gap-1 rounded bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
              >
                <Copy className="size-3" />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] hover:bg-white/20"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            </div>
          </div>
          <pre className="max-h-64 overflow-auto rounded bg-black/40 p-2 font-mono text-[10px] leading-relaxed text-foreground/80">
{jsonPreview}
          </pre>
        </GlassCard>

        <GlassButton onClick={testCompose} size="lg" variant="primary" className="w-full">
          <Play className="size-4" /> Test with sample photos
        </GlassButton>
      </aside>
    </section>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
        active ? "bg-primary text-primary-foreground" : "bg-white/10 text-foreground/70 hover:bg-white/20"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function NudgeBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded bg-white/10 py-1.5 text-center font-mono text-xs hover:bg-white/20 active:scale-95"
    >
      {children}
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col items-center">
      <span className="text-[10px] uppercase text-foreground/50">{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded bg-white/10 px-1 py-1 text-center font-mono text-xs outline-none focus:bg-white/20"
      />
    </label>
  );
}
