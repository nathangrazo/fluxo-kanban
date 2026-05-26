import { Sidebar } from "./components/Sidebar";
import { useHashRoute } from "./hooks/useHashRoute";
import { useThemeClass } from "./hooks/useTheme";

export default function App() {
  const route = useHashRoute();
  useThemeClass();

  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar route={route} />
      <main className="flex min-w-0 flex-1 flex-col">{route}</main>
    </div>
  );
}
