import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Camera, Images, Bug } from "lucide-react";
import { cn } from "@/lib/utils";
import { FRAMES } from "@/lib/frames";

// Dynamic first frame ID so nav never breaks if frames change
const DEFAULT_FRAME_ID = FRAMES[0]?.id ?? "the-1975";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: `/capture/${DEFAULT_FRAME_ID}` as const, icon: Camera, label: "Kamera" },
  { to: "/gallery", icon: Images, label: "Galeri" },
  { to: "/debug", icon: Bug, label: "Debug" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="glass pointer-events-auto flex items-center gap-1 rounded-full p-1.5 shadow-[var(--shadow-glass)]">
        {items.map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/"
              : item.to.startsWith("/capture")
                ? pathname.startsWith("/capture")
                : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "relative flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-300",
                active
                  ? "text-primary-foreground [background:var(--gradient-aurora)] shadow-[var(--shadow-glow)]"
                  : "text-foreground/70 hover:text-foreground hover:bg-glass",
              )}
            >
              <Icon className="size-4" strokeWidth={2.2} />
              <span className={cn("transition-all", active ? "inline" : "hidden sm:inline")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
