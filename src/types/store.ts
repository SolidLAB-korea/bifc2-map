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
};

export type StoreLinks = {
  naverPlace?: string;
  naverReservation?: string;
  website?: string;
  instagram?: string;
  blogSearch?: string;
  menu?: string;
};

export type Floor = "B1" | "1F" | "2F" | "3F";
