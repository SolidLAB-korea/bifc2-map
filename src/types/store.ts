export type Store = {
  id: string;
  name: string;
  category: string;
  floor: string;
  location: string;
  hours: string;
  phone: string;
  description: string;
  keywords: string[];
  x: number;
  y: number;
  image?: string;
  links?: StoreLinks;
  translations?: StoreTranslations;
};

export type StoreLinks = {
  naverPlace?: string;
  naverReservation?: string;
  website?: string;
  instagram?: string;
  blogSearch?: string;
  menu?: string;
};

export type StoreTranslations = {
  en?: StoreTranslation;
};

export type StoreTranslation = {
  name?: string;
  location?: string;
  hours?: string;
  description?: string;
  keywords?: string[];
};

export type Floor = "B1" | "1F" | "2F" | "3F";
