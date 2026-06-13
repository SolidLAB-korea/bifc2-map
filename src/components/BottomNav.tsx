import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "지도", icon: "⌖" },
  { to: "/favorites", label: "즐겨찾기", icon: "★" }
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white safe-bottom lg:hidden" aria-label="하단 네비게이션">
      <div className="grid grid-cols-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-bold ${
                isActive ? "text-accent" : "text-slate-500"
              }`
            }
            aria-label={`${item.label} 페이지로 이동`}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
