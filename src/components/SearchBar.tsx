type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
      <span className="text-xl font-bold text-accent" aria-hidden="true">
        ⌕
      </span>
      <input
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="매장명, 업종, 층수, 키워드 검색"
        type="search"
        aria-label="스퀘어가든 검색"
      />
    </label>
  );
}
