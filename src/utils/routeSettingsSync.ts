import { hydrateRouteSettings } from "./indoorRoute";
import { loadRouteSettingsFromDatabase } from "./routeSettingsRepository";
import { hydrateWalkableMasks } from "./walkableMask";

export async function syncRouteSettingsFromDatabase() {
  const settings = await loadRouteSettingsFromDatabase();
  if (settings.length === 0) return;

  hydrateRouteSettings(settings);
  hydrateWalkableMasks(settings);
}
