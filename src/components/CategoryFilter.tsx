type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
};

export default function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="카테고리 필터">
      {categories.map((category) => {
        const isSelected = category === selectedCategory;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`min-h-11 shrink-0 rounded-lg border px-4 text-sm font-bold ${
              isSelected
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-700"
            }`}
            aria-label={`${category} 카테고리 보기`}
            aria-pressed={isSelected}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
