import { useEffect, useMemo, useState, type FormEvent } from "react";
import { categories, floors } from "../data/stores";
import type { Floor, Store } from "../types/store";
import { isAdminSignedIn, setAdminSignedIn } from "../utils/storage";

type StoreManagerProps = {
  stores: Store[];
  onCreate: (store: Store) => void;
  onUpdate: (store: Store) => void;
  onDelete: (storeId: string) => void;
  onReset: () => void;
  onSelectStore: (store: Store) => void;
};

type StoreForm = Omit<Store, "keywords"> & {
  keywordsText: string;
};

const emptyForm: StoreForm = {
  id: "",
  name: "",
  category: "카페",
  floor: "1F",
  location: "",
  hours: "",
  phone: "",
  description: "",
  keywordsText: "",
  x: 50,
  y: 50,
  image: ""
};

const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "bifc2-admin";

export default function StoreManager({
  stores,
  onCreate,
  onUpdate,
  onDelete,
  onReset,
  onSelectStore
}: StoreManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(() => isAdminSignedIn());
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<StoreForm>(emptyForm);

  const editableCategories = useMemo(() => categories.filter((category) => category !== "전체"), []);
  const isEditing = editingId.length > 0;

  useEffect(() => {
    if (!editingId) {
      setForm(emptyForm);
      return;
    }

    const store = stores.find((item) => item.id === editingId);
    if (!store) {
      setEditingId("");
      setForm(emptyForm);
      return;
    }

    setForm({
      ...store,
      keywordsText: store.keywords.join(", "),
      image: store.image ?? ""
    });
  }, [editingId, stores]);

  const updateField = (field: keyof StoreForm, value: string | number) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const store: Store = {
      ...form,
      id: isEditing ? form.id : createStoreId(form.name),
      floor: form.floor as Floor,
      x: clampPercent(form.x),
      y: clampPercent(form.y),
      keywords: form.keywordsText
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      image: form.image?.trim() || undefined
    };

    if (isEditing) {
      onUpdate(store);
    } else {
      onCreate(store);
      setEditingId(store.id);
    }

    onSelectStore(store);
  };

  const handleNew = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const selectedStore = stores.find((store) => store.id === editingId);

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === adminPassword) {
      setAdminSignedIn(true);
      setIsSignedIn(true);
      setPassword("");
      setLoginError("");
      return;
    }

    setLoginError("관리자 비밀번호가 올바르지 않습니다.");
  };

  const handleSignOut = () => {
    setAdminSignedIn(false);
    setIsSignedIn(false);
    setIsOpen(false);
    handleNew();
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-panel" aria-label="매장 데이터 관리">
      {!isSignedIn ? (
        <>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
            aria-expanded={isOpen}
            aria-label="관리자 로그인 열기"
          >
            <span>
              <span className="block text-xs font-bold text-slate-500">관리자 전용</span>
              <span className="block text-lg font-black text-primary">매장 데이터 관리</span>
            </span>
            <span className="text-2xl font-black text-accent" aria-hidden="true">
              {isOpen ? "−" : "+"}
            </span>
          </button>

          {isOpen && (
            <div className="border-t border-slate-200 p-4">
              <form className="grid gap-2" onSubmit={handleSignIn}>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  관리자 비밀번호
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:border-accent"
                    autoComplete="current-password"
                  />
                </label>
                {loginError && <p className="text-sm font-bold text-rose-600">{loginError}</p>}
                <button type="submit" className="min-h-11 rounded-lg bg-primary px-4 text-sm font-black text-white">
                  관리자 로그인
                </button>
              </form>
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
          aria-expanded={isOpen}
          aria-label="매장 데이터 관리 열기"
        >
          <span>
            <span className="block text-xs font-bold text-slate-500">관리자 모드</span>
            <span className="block text-lg font-black text-primary">매장 추가/수정/삭제</span>
          </span>
          <span className="text-2xl font-black text-accent" aria-hidden="true">
            {isOpen ? "−" : "+"}
          </span>
        </button>
      )}

      {isSignedIn && isOpen && (
        <div className="border-t border-slate-200 p-4">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 py-2">
            <span className="text-sm font-bold text-primary">관리자 로그인 상태입니다.</span>
            <button type="button" onClick={handleSignOut} className="rounded-lg bg-white px-3 py-2 text-sm font-black text-primary">
              로그아웃
            </button>
          </div>
          <label className="block text-sm font-bold text-slate-700" htmlFor="manager-store-select">
            수정할 매장 선택
          </label>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
            <select
              id="manager-store-select"
              value={editingId}
              onChange={(event) => setEditingId(event.target.value)}
              className="min-h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800"
            >
              <option value="">새 매장 추가</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.floor} · {store.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleNew}
              className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-primary"
            >
              새로 입력
            </button>
          </div>

          <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="매장명" value={form.name} onChange={(value) => updateField("name", value)} required />
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                카테고리
                <select
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-200 px-3 text-slate-900"
                >
                  {editableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                층
                <select
                  value={form.floor}
                  onChange={(event) => updateField("floor", event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-200 px-3 text-slate-900"
                >
                  {floors.map((floor) => (
                    <option key={floor} value={floor}>
                      {floor}
                    </option>
                  ))}
                </select>
              </label>
              <NumberField label="X 좌표 (%)" value={form.x} onChange={(value) => updateField("x", value)} />
              <NumberField label="Y 좌표 (%)" value={form.y} onChange={(value) => updateField("y", value)} />
            </div>

            <TextField label="위치 설명" value={form.location} onChange={(value) => updateField("location", value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="영업시간" value={form.hours} onChange={(value) => updateField("hours", value)} />
              <TextField label="전화번호" value={form.phone} onChange={(value) => updateField("phone", value)} />
            </div>
            <TextField label="키워드" value={form.keywordsText} onChange={(value) => updateField("keywordsText", value)} placeholder="쉼표로 구분" />
            <TextField label="대표 이미지 URL" value={form.image ?? ""} onChange={(value) => updateField("image", value)} />
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              소개글
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-accent"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-3">
              <button type="submit" className="min-h-12 rounded-lg bg-accent px-4 text-sm font-black text-white">
                {isEditing ? "수정 저장" : "매장 추가"}
              </button>
              <button
                type="button"
                onClick={() => selectedStore && onSelectStore(selectedStore)}
                disabled={!selectedStore}
                className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-primary disabled:opacity-40"
              >
                지도에서 보기
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingId) return;
                  onDelete(editingId);
                  handleNew();
                }}
                disabled={!editingId}
                className="min-h-12 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 disabled:opacity-40"
              >
                삭제
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onReset();
                handleNew();
              }}
              className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-600"
            >
              기본 데이터로 되돌리기
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className="min-h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:border-accent"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      <input
        type="number"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:border-accent"
      />
    </label>
  );
}

function createStoreId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug || "store"}-${Date.now()}`;
}

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 50;
  return Math.min(100, Math.max(0, value));
}
