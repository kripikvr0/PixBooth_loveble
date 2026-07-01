import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ minHeight: "100vh" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
