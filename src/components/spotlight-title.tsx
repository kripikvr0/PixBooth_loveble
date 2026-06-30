import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = { text: string; className?: string };

/**
 * Interactive title — kursor/sentuhan jadi spotlight aurora di atas teks.
 * Plus tilt 3D halus dan letter-scale di hover.
 */
export function SpotlightTitle({ text, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const t = textRef.current;
    if (!wrap || !t) return;

    let raf = 0;
    let targetX = 50, targetY = 50, curX = 50, curY = 50;
    let tiltX = 0, tiltY = 0, curTiltX = 0, curTiltY = 0;

    const animate = () => {
      curX += (targetX - curX) * 0.15;
      curY += (targetY - curY) * 0.15;
      curTiltX += (tiltX - curTiltX) * 0.1;
      curTiltY += (tiltY - curTiltY) * 0.1;
      t.style.setProperty("--mx", `${curX}%`);
      t.style.setProperty("--my", `${curY}%`);
      wrap.style.transform = `perspective(800px) rotateX(${curTiltX}deg) rotateY(${curTiltY}deg)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onMove = (clientX: number, clientY: number) => {
      const rect = wrap.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      targetX = Math.max(0, Math.min(100, x));
      targetY = Math.max(0, Math.min(100, y));
      tiltY = ((x - 50) / 50) * 8;
      tiltX = -((y - 50) / 50) * 6;
    };

    const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onLeave = () => {
      targetX = 50;
      targetY = 50;
      tiltX = 0;
      tiltY = 0;
    };

    wrap.addEventListener("pointermove", onPointer);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onPointer);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="inline-block transition-transform duration-300 will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      <span
        ref={textRef}
        data-text={text}
        className={cn(
          "spotlight-text font-display font-bold tracking-tight select-none",
          className,
        )}
      >
        {text}
      </span>
    </div>
  );
}
