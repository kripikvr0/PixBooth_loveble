import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { GlassButton } from "@/components/glass";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  return (
    <GlassButton
      size="icon"
      variant="default"
      aria-label={`Tema: ${theme}`}
      onClick={() => setTheme(next)}
    >
      <Icon className="size-4" strokeWidth={2.2} />
    </GlassButton>
  );
}
