import { NavLink } from "react-router-dom";
import { useI18n } from "../i18n";

const navItems = [
  { to: "/", labelKey: "map", icon: "⌖" },
  { to: "/favorites", labelKey: "favorites", icon: "★" }
] as const;

export default function BottomNav() {
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white safe-bottom lg:hidden" aria-label={t("bottomNav")}>
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
            aria-label={`${t(item.labelKey)} page`}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              {item.icon}
            </span>
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
