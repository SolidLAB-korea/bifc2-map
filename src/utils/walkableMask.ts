import type { Floor } from "../types/store";
import type { RoutePoint } from "./indoorRoute";

export type WalkableMask = {
  cells: number[];
  size: number;
};

type PaintMode = "draw" | "erase";

const maskSize = 100;
const maskStoragePrefix = "bifc2.walkableMask.";

export function getWalkableMask(floor: Floor): WalkableMask {
  if (typeof window === "undefined") return createEmptyMask();

  try {
    const rawValue = window.localStorage.getItem(`${maskStoragePrefix}${floor}`);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;
    return normalizeMask(parsedValue);
  } catch {
    return createEmptyMask();
  }
}

export function saveWalkableMask(floor: Floor, mask: WalkableMask) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${maskStoragePrefix}${floor}`, JSON.stringify(normalizeMask(mask)));
  window.dispatchEvent(new Event("route-mask-updated"));
}

export function clearWalkableMask(floor: Floor) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${maskStoragePrefix}${floor}`);
  window.dispatchEvent(new Event("route-mask-updated"));
}

export function hasWalkableCells(mask: WalkableMask) {
  return mask.cells.some(Boolean);
}

export function paintWalkableMask(mask: WalkableMask, point: RoutePoint, brushSize: number, mode: PaintMode): WalkableMask {
  const nextMask = normalizeMask(mask);
  const radius = Math.max(1, Math.round(brushSize / 2));
  const centerX = toGrid(point.x);
  const centerY = toGrid(point.y);

  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      if (!isInsideGrid(x, y)) continue;
      if (Math.hypot(x - centerX, y - centerY) > radius) continue;
      nextMask.cells[toIndex(x, y)] = mode === "draw" ? 1 : 0;
    }
  }

  return nextMask;
}

export function findWalkableRoute(floor: Floor, start: RoutePoint, destination: RoutePoint): RoutePoint[] | null {
  const mask = getWalkableMask(floor);
  if (!hasWalkableCells(mask)) return null;

  const startCell = findNearestWalkableCell(mask, start);
  const endCell = findNearestWalkableCell(mask, destination);
  if (!startCell || !endCell) return null;

  const path = findGridPath(mask, startCell, endCell);
  if (path.length === 0) return null;

  return simplifyRoutePoints(path.map(cellToPoint));
}

function createEmptyMask(): WalkableMask {
  return { cells: Array(maskSize * maskSize).fill(0), size: maskSize };
}

function normalizeMask(value: unknown): WalkableMask {
  if (!value || typeof value !== "object") return createEmptyMask();
  const source = value as Partial<WalkableMask>;
  if (!Array.isArray(source.cells)) return createEmptyMask();

  const cells = Array(maskSize * maskSize)
    .fill(0)
    .map((_, index) => (source.cells?.[index] ? 1 : 0));

  return { cells, size: maskSize };
}

function findNearestWalkableCell(mask: WalkableMask, point: RoutePoint) {
  const startX = toGrid(point.x);
  const startY = toGrid(point.y);
  let bestCell: GridCell | null = null;
  let bestDistance = Infinity;

  for (let y = 0; y < maskSize; y += 1) {
    for (let x = 0; x < maskSize; x += 1) {
      if (!mask.cells[toIndex(x, y)]) continue;
      const cellDistance = Math.hypot(x - startX, y - startY);
      if (cellDistance < bestDistance) {
        bestDistance = cellDistance;
        bestCell = { x, y };
      }
    }
  }

  return bestCell;
}

type GridCell = {
  x: number;
  y: number;
};

function findGridPath(mask: WalkableMask, start: GridCell, end: GridCell) {
  const startKey = toKey(start);
  const endKey = toKey(end);
  const open = new Set([startKey]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map([[startKey, 0]]);
  const fScore = new Map([[startKey, heuristic(start, end)]]);

  while (open.size > 0) {
    const currentKey = getLowestScoreKey(open, fScore);
    const current = fromKey(currentKey);
    if (currentKey === endKey) return rebuildPath(currentKey, cameFrom);

    open.delete(currentKey);

    for (const neighbor of getNeighbors(current)) {
      if (!mask.cells[toIndex(neighbor.x, neighbor.y)]) continue;

      const neighborKey = toKey(neighbor);
      const tentativeScore = (gScore.get(currentKey) ?? Infinity) + heuristic(current, neighbor);
      if (tentativeScore >= (gScore.get(neighborKey) ?? Infinity)) continue;

      cameFrom.set(neighborKey, currentKey);
      gScore.set(neighborKey, tentativeScore);
      fScore.set(neighborKey, tentativeScore + heuristic(neighbor, end));
      open.add(neighborKey);
    }
  }

  return [];
}

function getNeighbors(cell: GridCell) {
  const neighbors: GridCell[] = [];
  for (let y = cell.y - 1; y <= cell.y + 1; y += 1) {
    for (let x = cell.x - 1; x <= cell.x + 1; x += 1) {
      if (x === cell.x && y === cell.y) continue;
      if (!isInsideGrid(x, y)) continue;
      neighbors.push({ x, y });
    }
  }
  return neighbors;
}

function rebuildPath(endKey: string, cameFrom: Map<string, string>) {
  const path = [fromKey(endKey)];
  let currentKey = endKey;

  while (cameFrom.has(currentKey)) {
    currentKey = cameFrom.get(currentKey) ?? currentKey;
    path.unshift(fromKey(currentKey));
  }

  return path;
}

function simplifyRoutePoints(points: RoutePoint[]) {
  if (points.length <= 2) return points;
  const simplified = [points[0]];
  let previousDirection = getDirection(points[0], points[1]);

  for (let index = 1; index < points.length - 1; index += 1) {
    const nextDirection = getDirection(points[index], points[index + 1]);
    if (nextDirection !== previousDirection) {
      simplified.push(points[index]);
      previousDirection = nextDirection;
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

function getDirection(a: RoutePoint, b: RoutePoint) {
  return `${Math.sign(Math.round((b.x - a.x) * 10))},${Math.sign(Math.round((b.y - a.y) * 10))}`;
}

function getLowestScoreKey(keys: Set<string>, score: Map<string, number>) {
  let lowestKey = "";
  let lowestScore = Infinity;
  for (const key of keys) {
    const value = score.get(key) ?? Infinity;
    if (value < lowestScore) {
      lowestScore = value;
      lowestKey = key;
    }
  }
  return lowestKey;
}

function heuristic(a: GridCell, b: GridCell) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cellToPoint(cell: GridCell): RoutePoint {
  return {
    x: Math.round(((cell.x + 0.5) / maskSize) * 1000) / 10,
    y: Math.round(((cell.y + 0.5) / maskSize) * 1000) / 10
  };
}

function toGrid(value: number) {
  return Math.min(maskSize - 1, Math.max(0, Math.floor(value)));
}

function toIndex(x: number, y: number) {
  return y * maskSize + x;
}

function isInsideGrid(x: number, y: number) {
  return x >= 0 && y >= 0 && x < maskSize && y < maskSize;
}

function toKey(cell: GridCell) {
  return `${cell.x},${cell.y}`;
}

function fromKey(key: string): GridCell {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}
