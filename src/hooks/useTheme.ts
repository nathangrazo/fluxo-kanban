import { useEffect } from "react";
import { useSettings } from "../store/ui";

export function useThemeClass() {
  const theme = useSettings((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}
