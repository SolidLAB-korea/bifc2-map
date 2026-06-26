import type { Floor, Store } from "../types/store";

export type RoutePoint = {
  x: number;
  y: number;
};

export type IndoorRoute = {
  floor: Floor;
  points: RoutePoint[];
  startLabelKo: string;
  startLabelEn: string;
  instructionKo: string;
  instructionEn: string;
};

export type RouteNode = {
  id: string;
  labelKo: string;
  labelEn: string;
  point: RoutePoint;
  neighbors: string[];
};

const infoDeskNodeId = "info-desk";

const floorStartNodeMap: Record<Floor, string> = {
  B1: "vertical-access",
  "1F": infoDeskNodeId,
  "2F": "escalator-2f",
  "3F": "escalator-3f"
};

const floorGraphs: Record<Floor, RouteNode[]> = {
  B1: [
    node("vertical-access", "엘리베이터/에스컬레이터 홀", "Elevator/Escalator Hall", 50, 28, ["main-corridor"]),
    node("main-corridor", "중앙 통로", "Main Corridor", 50, 58, ["vertical-access", "parking"]),
    node("parking", "주차장 연결 통로", "Parking Access", 78, 68, ["main-corridor"])
  ],
  "1F": [
    node("info-desk", "안내데스크", "Information Desk", 20, 82, ["south-west"]),
    node("south-west", "남서측 복도", "Southwest Corridor", 30, 82, ["info-desk", "south-center", "west-hall"]),
    node("south-center", "남측 중앙 복도", "South Central Corridor", 44, 82, ["south-west", "south-east", "center-lobby"]),
    node("south-east", "남동측 복도", "Southeast Corridor", 62, 82, ["south-center", "east-hall"]),
    node("west-hall", "서측 복도", "West Hall", 30, 58, ["south-west", "north-west", "vertical-access", "center-lobby"]),
    node("north-west", "북서측 복도", "Northwest Corridor", 30, 40, ["west-hall", "vertical-access"]),
    node("vertical-access", "중앙 엘리베이터/에스컬레이터 홀", "Central Elevator/Escalator Hall", 50, 25, [
      "north-west",
      "center-lobby",
      "north-east",
      "west-hall"
    ]),
    node("center-lobby", "중앙 로비", "Central Lobby", 50, 58, ["vertical-access", "west-hall", "south-center", "east-hall"]),
    node("north-east", "북동측 복도", "Northeast Corridor", 64, 40, ["vertical-access", "east-hall"]),
    node("east-hall", "동측 복도", "East Hall", 70, 58, ["north-east", "center-lobby", "south-east", "east-shops"]),
    node("east-shops", "동측 매장 앞 통로", "East Shops Corridor", 78, 72, ["east-hall"])
  ],
  "2F": [
    node("escalator-2f", "에스컬레이터", "Escalator", 87, 15, ["north-east-entry"]),
    node("north-east-entry", "북동측 진입 통로", "Northeast Entry Corridor", 82, 22, ["escalator-2f", "north-east-curve"]),
    node("north-east-curve", "북동측 곡선 통로", "Northeast Curved Corridor", 76, 34, ["north-east-entry", "east-hall"]),
    node("east-hall", "동측 복도", "East Hall", 70, 47, ["north-east-curve", "center-lobby", "east-clinic", "south-east"]),
    node("center-lobby", "중앙 복도", "Central Corridor", 55, 53, ["east-hall", "west-hall", "south-center"]),
    node("west-hall", "서측 복도", "West Hall", 36, 54, ["center-lobby", "west-lounge", "south-west"]),
    node("west-lounge", "서측 라운지 앞", "West Lounge", 29, 42, ["west-hall"]),
    node("east-clinic", "메디컬 구역 앞", "Medical Area", 77, 50, ["east-hall"]),
    node("south-center", "남측 중앙 복도", "South Central Corridor", 52, 74, ["center-lobby", "south-east", "south-west"]),
    node("south-west", "남서측 복도", "Southwest Corridor", 38, 74, ["west-hall", "south-center"]),
    node("south-east", "남동측 복도", "Southeast Corridor", 69, 71, ["east-hall", "south-center"])
  ],
  "3F": [
    node("escalator-3f", "에스컬레이터", "Escalator", 43, 39, ["north-gallery", "center-lobby"]),
    node("north-gallery", "북측 라운지 통로", "North Gallery Corridor", 50, 35, ["escalator-3f", "east-terrace"]),
    node("east-terrace", "동측 테라스 통로", "East Terrace Corridor", 69, 33, ["north-gallery", "east-hall"]),
    node("center-lobby", "중앙 복도", "Central Corridor", 48, 51, ["escalator-3f", "west-hall", "east-hall", "south-center"]),
    node("west-hall", "서측 복도", "West Hall", 31, 52, ["center-lobby", "west-lounge", "north-west"]),
    node("north-west", "북서측 복도", "Northwest Corridor", 36, 38, ["west-hall"]),
    node("west-lounge", "서측 라운지 앞", "West Lounge", 24, 39, ["west-hall"]),
    node("east-hall", "동측 복도", "East Hall", 63, 52, ["center-lobby", "east-terrace", "print-zone"]),
    node("print-zone", "프린트존 앞", "Print Zone", 58, 54, ["east-hall"]),
    node("south-center", "남측 중앙 복도", "South Central Corridor", 50, 72, ["center-lobby"])
  ]
};

export function getRouteNodeOptions(floor: Floor) {
  return floorGraphs[floor] ?? [];
}

export function createIndoorRoute(store: Store): IndoorRoute {
  const floor = store.floor as Floor;
  const destination = { x: store.x, y: store.y };
  const graph = floorGraphs[floor] ?? floorGraphs["1F"];
  const startNodeId = floorStartNodeMap[floor] ?? infoDeskNodeId;
  const destinationNodeId = hasNode(graph, store.routeAnchorId) ? store.routeAnchorId! : findNearestNodeId(graph, destination);
  const points = findRoutePoints(graph, startNodeId, destinationNodeId);

  if (floor === "1F") {
    return {
      floor,
      points,
      startLabelKo: "출발: 안내데스크",
      startLabelEn: "Start: Information Desk",
      instructionKo: "1층 안내데스크에서 출발해 파란색 선이 표시하는 통로를 따라 이동하세요.",
      instructionEn: "Start from the 1F information desk and follow the blue route along the corridor."
    };
  }

  return {
    floor,
    points,
    startLabelKo: "출발: 에스컬레이터",
    startLabelEn: "Start: Escalator",
    instructionKo: `1층 안내데스크에서 에스컬레이터로 이동해 ${floor}로 올라간 뒤, 해당 층의 에스컬레이터에서 파란색 통로 경로를 따라 이동하세요.`,
    instructionEn: `From the 1F information desk, take the escalator to ${floor}, then follow the blue corridor route from the escalator on that floor.`
  };
}

function node(id: string, labelKo: string, labelEn: string, x: number, y: number, neighbors: string[]): RouteNode {
  return { id, labelKo, labelEn, point: { x, y }, neighbors };
}

function hasNode(nodes: RouteNode[], nodeId?: string) {
  return Boolean(nodeId && nodes.some((routeNode) => routeNode.id === nodeId));
}

function findNearestNodeId(nodes: RouteNode[], destination: RoutePoint) {
  return nodes.reduce((nearest, routeNode) => {
    const nearestDistance = distance(nearest.point, destination);
    const nodeDistance = distance(routeNode.point, destination);
    return nodeDistance < nearestDistance ? routeNode : nearest;
  }, nodes[0]).id;
}

function findRoutePoints(nodes: RouteNode[], startId: string, endId: string) {
  const nodeMap = new Map(nodes.map((routeNode) => [routeNode.id, routeNode]));
  const queue = [startId];
  const visited = new Set([startId]);
  const previous = new Map<string, string>();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || currentId === endId) break;

    const currentNode = nodeMap.get(currentId);
    if (!currentNode) continue;

    for (const neighborId of currentNode.neighbors) {
      if (visited.has(neighborId)) continue;
      visited.add(neighborId);
      previous.set(neighborId, currentId);
      queue.push(neighborId);
    }
  }

  const pathIds = buildPathIds(startId, endId, previous);
  return pathIds.map((id) => nodeMap.get(id)?.point).filter(Boolean) as RoutePoint[];
}

function buildPathIds(startId: string, endId: string, previous: Map<string, string>) {
  const path = [endId];
  let currentId = endId;

  while (currentId !== startId) {
    const previousId = previous.get(currentId);
    if (!previousId) return [startId];
    path.unshift(previousId);
    currentId = previousId;
  }

  return path;
}

function distance(a: RoutePoint, b: RoutePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
