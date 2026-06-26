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

type RouteNode = {
  id: string;
  point: RoutePoint;
  neighbors: string[];
};

const infoDeskNodeId = "info-desk";
const verticalAccessNodeId = "elevator";

const floorGraphs: Record<Floor, RouteNode[]> = {
  B1: [
    node("elevator", 50, 28, ["main-corridor"]),
    node("main-corridor", 50, 58, ["elevator", "parking"]),
    node("parking", 78, 68, ["main-corridor"])
  ],
  "1F": [
    node("info-desk", 20, 82, ["south-west"]),
    node("south-west", 30, 82, ["info-desk", "south-center", "west-hall"]),
    node("south-center", 44, 82, ["south-west", "south-east", "center-lobby"]),
    node("south-east", 62, 82, ["south-center", "east-hall"]),
    node("west-hall", 30, 58, ["south-west", "north-west", "center-lobby"]),
    node("north-west", 30, 40, ["west-hall", "elevator"]),
    node("elevator", 50, 25, ["north-west", "center-lobby", "north-east"]),
    node("center-lobby", 50, 58, ["elevator", "west-hall", "south-center", "east-hall"]),
    node("north-east", 64, 40, ["elevator", "east-hall"]),
    node("east-hall", 70, 58, ["north-east", "center-lobby", "south-east", "east-shops"]),
    node("east-shops", 78, 72, ["east-hall"])
  ],
  "2F": [
    node("elevator", 50, 28, ["center-lobby", "north-east"]),
    node("center-lobby", 50, 55, ["elevator", "west-hall", "east-hall", "south-center"]),
    node("west-hall", 34, 55, ["center-lobby", "west-lounge"]),
    node("west-lounge", 28, 42, ["west-hall"]),
    node("east-hall", 66, 55, ["center-lobby", "north-east", "east-clinic"]),
    node("north-east", 70, 40, ["elevator", "east-hall"]),
    node("east-clinic", 76, 48, ["east-hall"]),
    node("south-center", 50, 72, ["center-lobby", "south-east", "south-west"]),
    node("south-west", 38, 72, ["south-center"]),
    node("south-east", 68, 72, ["south-center"])
  ],
  "3F": [
    node("elevator", 50, 28, ["center-lobby", "north-west"]),
    node("center-lobby", 50, 55, ["elevator", "west-hall", "east-hall", "south-center"]),
    node("north-west", 36, 38, ["elevator", "west-hall"]),
    node("west-hall", 30, 52, ["north-west", "center-lobby", "west-lounge"]),
    node("west-lounge", 24, 38, ["west-hall"]),
    node("east-hall", 64, 55, ["center-lobby", "print-zone"]),
    node("print-zone", 58, 54, ["east-hall"]),
    node("south-center", 50, 72, ["center-lobby"])
  ]
};

export function createIndoorRoute(store: Store): IndoorRoute {
  const floor = store.floor as Floor;
  const destination = { x: store.x, y: store.y };
  const startNodeId = floor === "1F" ? infoDeskNodeId : verticalAccessNodeId;
  const graph = floorGraphs[floor] ?? floorGraphs["1F"];
  const destinationNodeId = findNearestNodeId(graph, destination);
  const corridorPoints = findRoutePoints(graph, startNodeId, destinationNodeId);
  const points = appendDestination(corridorPoints, destination);

  if (floor === "1F") {
    return {
      floor,
      points,
      instructionKo: "1층 안내데스크에서 출발해 복도 경유점을 따라 표시된 파란 경로로 이동하세요.",
      instructionEn: "Start from the 1F information desk and follow the blue route along the corridor waypoints."
    };
  }

  return {
    floor,
    points,
    instructionKo: `1층 안내데스크에서 중앙 엘리베이터 또는 에스컬레이터로 이동해 ${floor}로 올라간 뒤, 해당 층의 엘리베이터 홀에서 파란 경로를 따라 이동하세요.`,
    instructionEn: `From the 1F information desk, take the central elevator or escalator to ${floor}, then follow the blue route from the elevator hall on that floor.`
  };
}

function node(id: string, x: number, y: number, neighbors: string[]): RouteNode {
  return { id, point: { x, y }, neighbors };
}

function findNearestNodeId(nodes: RouteNode[], destination: RoutePoint) {
  return nodes.reduce((nearest, node) => {
    const nearestDistance = distance(nearest.point, destination);
    const nodeDistance = distance(node.point, destination);
    return nodeDistance < nearestDistance ? node : nearest;
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
    if (!previousId) return [startId, endId];
    path.unshift(previousId);
    currentId = previousId;
  }

  return path;
}

function appendDestination(points: RoutePoint[], destination: RoutePoint) {
  const lastPoint = points[points.length - 1];
  if (!lastPoint || distance(lastPoint, destination) < 1) return points;
  return [...points, destination];
}

function distance(a: RoutePoint, b: RoutePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
