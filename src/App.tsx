import { Navigate, Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";
import { useTheme } from "./hooks/useTheme";
import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import StoreDetailPage from "./pages/StoreDetailPage";

export default function App() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-appbg pb-20 text-slate-900 lg:pb-0">
      <Header selectedTheme={theme} onThemeSelect={setTheme} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/stores/:id" element={<StoreDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
