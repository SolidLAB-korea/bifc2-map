type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm sm:min-h-14 sm:gap-3 sm:px-4">
      <span className="text-base font-bold text-accent sm:text-xl" aria-hidden="true">
        ⌕
      </span>
      <input
        className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 sm:text-base"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="매장명, 업종, 층수, 키워드 검색"
        type="search"
        aria-label="스퀘어가든 검색"
      />
    </label>
  );
}
