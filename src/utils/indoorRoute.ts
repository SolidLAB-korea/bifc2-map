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

export type RouteGraph = Record<Floor, RouteNode[]>;
export type RouteStartNodeMap = Record<Floor, string>;

const routeGraphStorageKey = "bifc2.routeGraph";
const routeStartStorageKey = "bifc2.routeStartNodes";
const routeGraphVersionKey = "bifc2.routeGraphVersion";
const routeGraphVersion = "2026-06-27-escalator-marker-origin";
const infoDeskNodeId = "info-desk";

const defaultFloorStartNodeMap: RouteStartNodeMap = {
  B1: "vertical-access",
  "1F": infoDeskNodeId,
  "2F": "escalator-2f",
  "3F": "escalator-3f"
};

const defaultFloorGraphs: RouteGraph = {
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
    node("escalator-2f", "에스컬레이터", "Escalator", 42, 51, ["escalator-2f-entry"]),
    node("escalator-2f-entry", "에스컬레이터 앞 통행로", "Escalator Corridor Entry", 43, 55, [
      "escalator-2f",
      "central-escalator-corridor"
    ]),
    node("central-escalator-corridor", "중앙 에스컬레이터 통로", "Central Escalator Corridor", 50, 57, [
      "escalator-2f-entry",
      "west-hall",
      "south-center"
    ]),
    node("west-hall", "서측 복도", "West Hall", 37, 55, ["central-escalator-corridor", "west-lounge", "south-west"]),
    node("west-lounge", "서측 라운지 앞", "West Lounge", 29, 42, ["west-hall"]),
    node("south-west", "남서측 복도", "Southwest Corridor", 38, 74, ["west-hall", "south-center"]),
    node("south-center", "남측 중앙 복도", "South Central Corridor", 53, 75, [
      "central-escalator-corridor",
      "south-west",
      "south-east"
    ]),
    node("south-east", "남동측 복도", "Southeast Corridor", 69, 71, ["south-center", "east-lower-corridor"]),
    node("east-lower-corridor", "동측 하단 통로", "East Lower Corridor", 80, 69, ["south-east", "east-hall"]),
    node("east-hall", "동측 복도", "East Hall", 86, 53, ["east-lower-corridor", "east-upper-corridor", "east-clinic"]),
    node("east-upper-corridor", "동측 상단 통로", "East Upper Corridor", 84, 36, ["east-hall", "north-east-corridor"]),
    node("north-east-corridor", "북동측 통로", "Northeast Corridor", 78, 27, ["east-upper-corridor"]),
    node("east-clinic", "메디컬 구역 앞", "Medical Area", 77, 50, ["east-hall"])
  ],
  "3F": [
    node("escalator-3f", "에스컬레이터", "Escalator", 40, 52, ["escalator-3f-entry"]),
    node("escalator-3f-entry", "에스컬레이터 앞 통행로", "Escalator Corridor Entry", 43, 53, [
      "escalator-3f",
      "center-lobby",
      "north-gallery"
    ]),
    node("north-gallery", "북측 라운지 통로", "North Gallery Corridor", 50, 35, ["escalator-3f-entry", "east-terrace"]),
    node("east-terrace", "동측 테라스 통로", "East Terrace Corridor", 69, 33, ["north-gallery", "east-hall"]),
    node("center-lobby", "중앙 복도", "Central Corridor", 48, 52, ["escalator-3f-entry", "west-hall", "east-hall", "south-center"]),
    node("west-hall", "서측 복도", "West Hall", 31, 52, ["center-lobby", "west-lounge", "north-west"]),
    node("north-west", "북서측 복도", "Northwest Corridor", 36, 38, ["west-hall"]),
    node("west-lounge", "서측 라운지 앞", "West Lounge", 24, 39, ["west-hall"]),
    node("east-hall", "동측 복도", "East Hall", 63, 52, ["center-lobby", "east-terrace", "print-zone"]),
    node("print-zone", "프린트존 앞", "Print Zone", 58, 54, ["east-hall"]),
    node("south-center", "남측 중앙 복도", "South Central Corridor", 50, 72, ["center-lobby"])
  ]
};

export function getRouteNodeOptions(floor: Floor) {
  return getRouteGraph()[floor] ?? [];
}

export function getRouteStartNodeMap(): RouteStartNodeMap {
  if (typeof window === "undefined") return { ...defaultFloorStartNodeMap };

  try {
    const rawValue = window.localStorage.getItem(routeStartStorageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;
    return normalizeRouteStartNodeMap(parsedValue, getRouteGraph());
  } catch {
    return { ...defaultFloorStartNodeMap };
  }
}

export function getRouteGraph(): RouteGraph {
  if (typeof window === "undefined") return cloneRouteGraph(defaultFloorGraphs);

  try {
    if (window.localStorage.getItem(routeGraphVersionKey) !== routeGraphVersion) {
      return cloneRouteGraph(defaultFloorGraphs);
    }

    const rawValue = window.localStorage.getItem(routeGraphStorageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;
    return normalizeRouteGraph(parsedValue);
  } catch {
    return cloneRouteGraph(defaultFloorGraphs);
  }
}

export function saveRouteGraph(graph: RouteGraph) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(routeGraphStorageKey, JSON.stringify(normalizeRouteGraph(graph)));
  window.localStorage.setItem(routeGraphVersionKey, routeGraphVersion);
  window.dispatchEvent(new Event("route-graph-updated"));
}

export function saveRouteStartNodeMap(startNodeMap: RouteStartNodeMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(routeStartStorageKey, JSON.stringify(normalizeRouteStartNodeMap(startNodeMap, getRouteGraph())));
  window.localStorage.setItem(routeGraphVersionKey, routeGraphVersion);
  window.dispatchEvent(new Event("route-graph-updated"));
}

export function resetRouteGraph() {
  if (typeof window === "undefined") return cloneRouteGraph(defaultFloorGraphs);
  window.localStorage.removeItem(routeGraphStorageKey);
  window.localStorage.removeItem(routeStartStorageKey);
  window.localStorage.removeItem(routeGraphVersionKey);
  window.dispatchEvent(new Event("route-graph-updated"));
  return cloneRouteGraph(defaultFloorGraphs);
}

export function createIndoorRoute(store: Store, stores: Store[] = []): IndoorRoute {
  const floor = store.floor as Floor;
  const destination = { x: store.x, y: store.y };
  const routeGraph = getRouteGraph();
  const graph = routeGraph[floor] ?? routeGraph["1F"];
  const startNodeId = getSafeStartNodeId(floor, graph);
  const startNode = graph.find((routeNode) => routeNode.id === startNodeId);
  const startPoint = findFloorEscalatorPoint(store, stores) ?? startNode?.point;
  const destinationNodeId = isEscalatorStore(store)
    ? startNodeId
    : hasNode(graph, store.routeAnchorId)
      ? store.routeAnchorId!
      : findNearestNodeId(graph, destination);
  const points = applyStartPoint(findRoutePoints(graph, startNodeId, destinationNodeId), startPoint);

  if (floor === "1F") {
    return {
      floor,
      points,
      startLabelKo: `출발: ${startNode?.labelKo ?? "안내데스크"}`,
      startLabelEn: `Start: ${startNode?.labelEn ?? "Information Desk"}`,
      instructionKo: "1층 안내데스크에서 출발해 파란색 선이 표시하는 통로를 따라 이동하세요.",
      instructionEn: "Start from the 1F information desk and follow the blue route along the corridor."
    };
  }

  return {
    floor,
    points,
    startLabelKo: `출발: ${startNode?.labelKo ?? "에스컬레이터"}`,
    startLabelEn: `Start: ${startNode?.labelEn ?? "Escalator"}`,
    instructionKo: `1층 안내데스크에서 에스컬레이터로 이동해 ${floor}로 올라간 뒤, 해당 층의 ${startNode?.labelKo ?? "에스컬레이터"}에서 파란색 통로 경로를 따라 이동하세요.`,
    instructionEn: `From the 1F information desk, take the escalator to ${floor}, then follow the blue corridor route from ${startNode?.labelEn ?? "the escalator"} on that floor.`
  };
}

function node(id: string, labelKo: string, labelEn: string, x: number, y: number, neighbors: string[]): RouteNode {
  return { id, labelKo, labelEn, point: { x, y }, neighbors };
}

function isEscalatorStore(store: Store) {
  const text = [
    store.name,
    store.category,
    store.translations?.en?.name,
    ...store.keywords,
    ...(store.translations?.en?.keywords ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("에스컬레이터") || text.includes("escalator");
}

function findFloorEscalatorPoint(store: Store, stores: Store[]) {
  if (store.floor === "1F") return undefined;
  if (isEscalatorStore(store)) return { x: store.x, y: store.y };

  const escalator = stores.find((item) => item.floor === store.floor && isEscalatorStore(item));
  return escalator ? { x: escalator.x, y: escalator.y } : undefined;
}

function applyStartPoint(points: RoutePoint[], startPoint?: RoutePoint) {
  if (!startPoint || points.length === 0) return points;
  return [{ x: clampPercent(startPoint.x), y: clampPercent(startPoint.y) }, ...points.slice(1)];
}

function normalizeRouteGraph(value: unknown): RouteGraph {
  const source = isRouteGraphLike(value) ? value : defaultFloorGraphs;
  return {
    B1: normalizeRouteNodes(source.B1),
    "1F": normalizeRouteNodes(source["1F"]),
    "2F": normalizeRouteNodes(source["2F"]),
    "3F": normalizeRouteNodes(source["3F"])
  };
}

function normalizeRouteNodes(nodes: unknown): RouteNode[] {
  if (!Array.isArray(nodes)) return [];
  const validIds = new Set(nodes.map((node) => (isRouteNodeLike(node) ? node.id : "")).filter(Boolean));

  return nodes.filter(isRouteNodeLike).map((routeNode) => ({
    id: routeNode.id,
    labelKo: routeNode.labelKo || routeNode.id,
    labelEn: routeNode.labelEn || routeNode.id,
    point: {
      x: clampPercent(Number(routeNode.point.x)),
      y: clampPercent(Number(routeNode.point.y))
    },
    neighbors: Array.from(new Set(routeNode.neighbors.filter((neighborId) => validIds.has(neighborId) && neighborId !== routeNode.id)))
  }));
}

function normalizeRouteStartNodeMap(value: unknown, graph: RouteGraph): RouteStartNodeMap {
  const source = value && typeof value === "object" ? (value as Partial<RouteStartNodeMap>) : {};

  return {
    B1: getValidStartNodeId("B1", source.B1, graph),
    "1F": getValidStartNodeId("1F", source["1F"], graph),
    "2F": getValidStartNodeId("2F", source["2F"], graph),
    "3F": getValidStartNodeId("3F", source["3F"], graph)
  };
}

function isRouteGraphLike(value: unknown): value is RouteGraph {
  return Boolean(value && typeof value === "object" && "1F" in value && "2F" in value && "3F" in value);
}

function isRouteNodeLike(value: unknown): value is RouteNode {
  if (!value || typeof value !== "object") return false;
  const routeNode = value as RouteNode;
  return (
    typeof routeNode.id === "string" &&
    typeof routeNode.labelKo === "string" &&
    typeof routeNode.labelEn === "string" &&
    Boolean(routeNode.point) &&
    Array.isArray(routeNode.neighbors)
  );
}

function cloneRouteGraph(graph: RouteGraph): RouteGraph {
  return normalizeRouteGraph(JSON.parse(JSON.stringify(graph)));
}

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function hasNode(nodes: RouteNode[], nodeId?: string) {
  return Boolean(nodeId && nodes.some((routeNode) => routeNode.id === nodeId));
}

function getSafeStartNodeId(floor: Floor, nodes: RouteNode[]) {
  const startNodeMap = getRouteStartNodeMap();
  return getValidStartNodeId(floor, startNodeMap[floor], { ...defaultFloorGraphs, [floor]: nodes });
}

function getValidStartNodeId(floor: Floor, nodeId: unknown, graph: RouteGraph) {
  const nodes = graph[floor] ?? [];
  const defaultNodeId = defaultFloorStartNodeMap[floor];
  if (typeof nodeId === "string" && hasNode(nodes, nodeId)) return nodeId;
  if (hasNode(nodes, defaultNodeId)) return defaultNodeId;
  return nodes[0]?.id ?? defaultNodeId;
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
