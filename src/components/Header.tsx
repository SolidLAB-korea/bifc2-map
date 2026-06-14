import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-primary text-white shadow-panel">
      <div className="app-container flex items-center justify-between gap-2 py-3 sm:gap-3 sm:py-4">
        <Link to="/" className="min-w-0" aria-label="BIFC2 스퀘어가든 안내지도 홈">
          <p className="text-[10px] font-bold leading-none text-blue-100 sm:text-xs">BIFC2</p>
          <h1 className="truncate text-xl font-black leading-tight tracking-normal sm:text-3xl">스퀘어가든 안내지도</h1>
        </Link>
        <Link
          to="/favorites"
          className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary sm:px-4 sm:py-3 sm:text-sm"
          aria-label="즐겨찾기 페이지로 이동"
        >
          즐겨찾기
        </Link>
      </div>
    </header>
  );
}
