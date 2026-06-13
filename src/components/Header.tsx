import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-primary text-white shadow-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="min-w-0" aria-label="BIFC2 상가 안내지도 홈">
          <p className="text-xs font-bold text-blue-100">BIFC2</p>
          <h1 className="truncate text-2xl font-black tracking-normal sm:text-3xl">상가 안내지도</h1>
        </Link>
        <Link
          to="/favorites"
          className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-primary"
          aria-label="즐겨찾기 페이지로 이동"
        >
          즐겨찾기
        </Link>
      </div>
    </header>
  );
}
