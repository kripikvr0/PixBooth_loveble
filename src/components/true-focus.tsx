import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import "./true-focus.css";

type Props = {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
};

export default function TrueFocus({
  sentence = "True Focus",
  separator = " ",
  manualMode = false,
  blurAmount = 5,
  borderColor = "hsl(var(--primary))",
  glowColor = "rgba(168, 85, 247, 0.6)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className,
}: Props) {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (manualMode) return;
    const interval = setInterval(
      () => setCurrentIndex((p) => (p + 1) % words.length),
      (animationDuration + pauseBetweenAnimations) * 1000,
    );
    return () => clearInterval(interval);
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (currentIndex < 0) return;
    const el = wordRefs.current[currentIndex];
    const parent = containerRef.current;
    if (!el || !parent) return;
    const p = parent.getBoundingClientRect();
    const a = el.getBoundingClientRect();
    setFocusRect({ x: a.left - p.left, y: a.top - p.top, width: a.width, height: a.height });
  }, [currentIndex, words.length]);

  return (
    <div className={`focus-container ${className ?? ""}`} ref={containerRef}>
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => {
              wordRefs.current[index] = el;
            }}
            className={`focus-word ${isActive ? "active" : ""}`}
            style={
              {
                filter: isActive ? "blur(0px)" : `blur(${blurAmount}px)`,
                "--border-color": borderColor,
                "--glow-color": glowColor,
                transition: `filter ${animationDuration}s ease`,
              } as React.CSSProperties
            }
            onMouseEnter={() => {
              if (manualMode) {
                setLastActiveIndex(index);
                setCurrentIndex(index);
              }
            }}
            onMouseLeave={() => {
              if (manualMode && lastActiveIndex !== null) setCurrentIndex(lastActiveIndex);
            }}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0,
        }}
        transition={{ duration: animationDuration }}
        style={
          { "--border-color": borderColor, "--glow-color": glowColor } as React.CSSProperties
        }
      >
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </motion.div>
    </div>
  );
}
