import { hydrateRouteSettings } from "./indoorRoute";
import { loadRouteSettingsFromDatabase } from "./routeSettingsRepository";
import { supabaseClient } from "./supabaseClient";
import { hydrateWalkableMasks } from "./walkableMask";

export async function syncRouteSettingsFromDatabase() {
  const settings = await loadRouteSettingsFromDatabase();
  if (settings.length === 0) return;

  hydrateRouteSettings(settings);
  hydrateWalkableMasks(settings);
}

export function subscribeRouteSettingsRealtime(onError?: (error: Error) => void) {
  if (!supabaseClient) return () => undefined;
  const client = supabaseClient;

  const channel = client
    .channel("route-settings-sync")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "route_settings"
      },
      () => {
        syncRouteSettingsFromDatabase().catch((error: Error) => onError?.(error));
      }
    )
    .subscribe((status, error) => {
      if (error) onError?.(error);
      if (status === "CHANNEL_ERROR") onError?.(new Error("Supabase Realtime route settings channel error"));
      if (status === "TIMED_OUT") onError?.(new Error("Supabase Realtime route settings subscription timed out"));
    });

  return () => {
    void client.removeChannel(channel);
  };
}
