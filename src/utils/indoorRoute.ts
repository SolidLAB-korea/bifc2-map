import type { Floor, Store } from "../types/store";

export type RoutePoint = {
  x: number;
  y: number;
};

export type IndoorRoute = {
  floor: Floor;
  points: RoutePoint[];
  instructionKo: string;
  instructionEn: string;
};

const infoDeskPoint: RoutePoint = { x: 50, y: 72 };

const elevatorPoints: Record<Floor, RoutePoint> = {
  B1: { x: 50, y: 25 },
  "1F": { x: 50, y: 25 },
  "2F": { x: 50, y: 28 },
  "3F": { x: 50, y: 28 }
};

export function createIndoorRoute(store: Store): IndoorRoute {
  const floor = store.floor as Floor;
  const destination = { x: store.x, y: store.y };

  if (floor === "1F") {
    return {
      floor,
      points: createDoglegRoute(infoDeskPoint, destination),
      instructionKo: "1층 안내데스크에서 출발해 지도에 표시된 파란 경로를 따라 이동하세요.",
      instructionEn: "Start from the 1F information desk and follow the blue route on the map."
    };
  }

  const floorEntry = elevatorPoints[floor] ?? elevatorPoints["1F"];

  return {
    floor,
    points: createDoglegRoute(floorEntry, destination),
    instructionKo: `1층 안내데스크에서 중앙 엘리베이터로 이동한 뒤 ${floor}로 올라가, 지도에 표시된 파란 경로를 따라 이동하세요.`,
    instructionEn: `From the 1F information desk, take the central elevator to ${floor}, then follow the blue route on the map.`
  };
}

function createDoglegRoute(start: RoutePoint, end: RoutePoint): RoutePoint[] {
  const midY = Math.min(86, Math.max(14, (start.y + end.y) / 2));
  return [
    start,
    { x: start.x, y: midY },
    { x: end.x, y: midY },
    end
  ];
}
