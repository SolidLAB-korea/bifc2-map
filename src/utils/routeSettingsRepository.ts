import type { Floor } from "../types/store";
import type { RouteGraph, RouteStartNodeMap } from "./indoorRoute";
import type { WalkableMask } from "./walkableMask";

type RouteSettingRow = {
  floor: Floor;
  route_graph?: unknown;
  route_start_node_id?: string | null;
  walkable_mask?: unknown;
};

type RouteSettingUpdate = {
  floor: Floor;
  routeGraph?: unknown;
  routeStartNodeId?: string;
  walkableMask?: unknown;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const routeSettingsEndpoint = supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/rest/v1/route_settings` : "";

export const isRouteSettingsDatabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function loadRouteSettingsFromDatabase() {
  if (!isRouteSettingsDatabaseConfigured) return [];
  return requestSupabase<RouteSettingRow[]>("?select=*");
}

export async function saveRouteGraphToDatabase(graph: RouteGraph) {
  if (!isRouteSettingsDatabaseConfigured) return;
  await upsertRouteSettings(
    (Object.keys(graph) as Floor[]).map((floor) => ({
      floor,
      routeGraph: graph[floor]
    }))
  );
}

export async function saveRouteStartNodesToDatabase(startNodeMap: RouteStartNodeMap) {
  if (!isRouteSettingsDatabaseConfigured) return;
  await upsertRouteSettings(
    (Object.keys(startNodeMap) as Floor[]).map((floor) => ({
      floor,
      routeStartNodeId: startNodeMap[floor]
    }))
  );
}

export async function saveWalkableMaskToDatabase(floor: Floor, mask: WalkableMask) {
  if (!isRouteSettingsDatabaseConfigured) return;
  await upsertRouteSettings([{ floor, walkableMask: mask }]);
}

export async function clearWalkableMaskFromDatabase(floor: Floor) {
  if (!isRouteSettingsDatabaseConfigured) return;
  await upsertRouteSettings([{ floor, walkableMask: null }]);
}

async function upsertRouteSettings(settings: RouteSettingUpdate[]) {
  await requestSupabase("?on_conflict=floor", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(settings.map(toRouteSettingRow))
  });
}

async function requestSupabase<T>(query: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${routeSettingsEndpoint}${query}`, {
    ...options,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase route settings request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

function toRouteSettingRow(setting: RouteSettingUpdate) {
  return {
    floor: setting.floor,
    ...(setting.routeGraph !== undefined ? { route_graph: setting.routeGraph } : {}),
    ...(setting.routeStartNodeId !== undefined ? { route_start_node_id: setting.routeStartNodeId } : {}),
    ...(setting.walkableMask !== undefined ? { walkable_mask: setting.walkableMask } : {})
  };
}
