import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Store } from "./types/store";

export type Language = "ko" | "en";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  categoryLabel: (category: string) => string;
  storeText: (store: Store, field: "name" | "location" | "hours" | "description") => string;
  storeKeywords: (store: Store) => string[];
};

const languageStorageKey = "bifc2.language";

const translations = {
  ko: {
    title: "스퀘어가든 안내지도",
    homeAria: "BIFC2 스퀘어가든 안내지도 홈",
    favorites: "즐겨찾기",
    favoritesPage: "즐겨찾기",
    savedPlaces: "저장한 장소",
    map: "지도",
    bottomNav: "하단 네비게이션",
    searchPlaceholder: "매장명, 업종, 층수, 키워드 검색",
    searchAria: "스퀘어가든 검색",
    categoryFilter: "카테고리 필터",
    categorySelect: "카테고리 선택",
    floorSelect: "층 선택",
    floorMap: "지도 보기",
    selectedStore: "선택한 매장 정보",
    viewOnMap: "지도에서 위치 보기",
    storeInfo: "매장 정보",
    searchResults: "검색 결과",
    placesCount: "곳",
    noResults: "검색 결과가 없습니다.",
    noFavorites: "즐겨찾기한 매장이 없습니다.",
    addFavorite: "즐겨찾기 추가",
    removeFavorite: "즐겨찾기 삭제",
    close: "닫기",
    storeDetailsClose: "매장 상세 정보 닫기",
    floor: "층수",
    hours: "영업시간",
    location: "위치",
    phone: "전화번호",
    loadingStore: "매장 정보를 불러오는 중입니다.",
    representativeImage: "대표 이미지",
    actions: "바로가기",
    call: "전화하기",
    naverPlace: "네이버 플레이스",
    reservation: "예약하기",
    reviews: "리뷰/블로그 보기",
    officialChannel: "공식 채널",
    menu: "메뉴/가격표",
    adminMenu: "관리자 메뉴 열기",
    languageToggle: "English"
  },
  en: {
    title: "Square Garden Map",
    homeAria: "BIFC2 Square Garden map home",
    favorites: "Favorites",
    favoritesPage: "Favorites",
    savedPlaces: "Saved places",
    map: "Map",
    bottomNav: "Bottom navigation",
    searchPlaceholder: "Search by store, category, floor, or keyword",
    searchAria: "Search Square Garden",
    categoryFilter: "Category filter",
    categorySelect: "Select category",
    floorSelect: "Select floor",
    floorMap: "View floor map",
    selectedStore: "Selected store information",
    viewOnMap: "View on map",
    storeInfo: "Store info",
    searchResults: "Search results",
    placesCount: "places",
    noResults: "No results found.",
    noFavorites: "No favorite stores yet.",
    addFavorite: "Add favorite",
    removeFavorite: "Remove favorite",
    close: "Close",
    storeDetailsClose: "Close store details",
    floor: "Floor",
    hours: "Hours",
    location: "Location",
    phone: "Phone",
    loadingStore: "Loading store information.",
    representativeImage: "Representative image",
    actions: "Quick actions",
    call: "Call",
    naverPlace: "Naver Place",
    reservation: "Reservation",
    reviews: "Reviews / Blog",
    officialChannel: "Official channel",
    menu: "Menu / Price list",
    adminMenu: "Open admin menu",
    languageToggle: "한국어"
  }
} as const;

const categoryLabels: Record<Language, Record<string, string>> = {
  ko: {},
  en: {
    전체: "All",
    음식점: "Restaurants",
    패스트푸드: "Fast Food",
    분식: "Snack Food",
    카페: "Cafe",
    디저트: "Dessert",
    편의점: "Convenience Store",
    "병원/약국": "Clinic / Pharmacy",
    병원: "Clinic",
    약국: "Pharmacy",
    "금융/ATM": "Finance / ATM",
    은행: "Bank",
    ATM: "ATM",
    생활편의: "Services",
    "미용/뷰티": "Beauty",
    "회의/업무": "Business",
    세무: "Tax",
    화장실: "Restroom",
    엘리베이터: "Elevator",
    에스컬레이터: "Escalator",
    계단: "Stairs",
    수유실: "Nursing Room",
    주차장: "Parking"
  }
};

type TranslationKey = keyof typeof translations.ko;

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = window.localStorage.getItem(languageStorageKey);
    return savedLanguage === "en" ? "en" : "ko";
  });

  const value = useMemo<I18nContextValue>(() => {
    const setLanguage = (nextLanguage: Language) => {
      window.localStorage.setItem(languageStorageKey, nextLanguage);
      setLanguageState(nextLanguage);
    };

    return {
      language,
      setLanguage,
      t: (key) => translations[language][key],
      categoryLabel: (category) => categoryLabels[language][category] ?? category,
      storeText: (store, field) => {
        if (language === "en") {
          return store.translations?.en?.[field] || store[field];
        }
        return store[field];
      },
      storeKeywords: (store) => {
        if (language === "en" && Array.isArray(store.translations?.en?.keywords)) {
          return store.translations.en.keywords;
        }
        return store.keywords;
      }
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
