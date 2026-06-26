import type { Floor, Store } from "../types/store";

export const floors: Floor[] = ["1F", "2F", "3F"];

export const categories = [
  "전체",
  "음식점",
  "패스트푸드",
  "분식",
  "카페",
  "디저트",
  "편의점",
  "병원/약국",
  "은행",
  "ATM",
  "생활편의",
  "미용/뷰티",
  "회의/업무",
  "세무",
  "화장실",
  "엘리베이터",
  "에스컬레이터",
  "계단",
  "수유실",
  "주차장"
];

export const stores: Store[] = [
  {
    id: "starbucks-1f",
    name: "스타벅스 BIFC2점",
    category: "카페",
    floor: "1F",
    location: "1층 Kiosk Shop 1",
    hours: "08:00 - 21:00",
    phone: "051-000-0001",
    description: "방문객과 입주사가 이용하기 좋은 커피 및 디저트 매장입니다.",
    keywords: ["커피", "라떼", "디저트", "음료", "카페"],
    x: 44,
    y: 90,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
  }
];
