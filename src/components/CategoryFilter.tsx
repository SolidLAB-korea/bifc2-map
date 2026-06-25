import { useI18n } from "../i18n";

type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
};

export default function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  const { categoryLabel, t } = useI18n();

  return (
    <div className="min-w-0" aria-label={t("categoryFilter")}>
      <label className="sr-only" htmlFor="mobile-category-filter">
        {t("categorySelect")}
      </label>
      <select
        id="mobile-category-filter"
        value={selectedCategory}
        onChange={(event) => onSelect(event.target.value)}
        className="block h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:hidden"
        aria-label={t("categorySelect")}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </select>

      <div className="hidden flex-wrap gap-2 sm:flex">
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`min-h-11 rounded-lg border px-4 text-sm font-bold ${
                isSelected ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700"
              }`}
              aria-label={`${categoryLabel(category)} ${t("categoryFilter")}`}
              aria-pressed={isSelected}
            >
              {categoryLabel(category)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
