import { supabaseClient } from "./supabaseClient";

type RealtimeErrorHandler = (error: Error) => void;

export function subscribeStoresRealtime(onChange: () => void, onError?: RealtimeErrorHandler) {
  if (!supabaseClient) return () => undefined;

  const client = supabaseClient;
  const channel = client
    .channel("stores-sync")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "stores"
      },
      onChange
    )
    .subscribe((status, error) => {
      if (error) onError?.(error);
      if (status === "CHANNEL_ERROR") onError?.(new Error("Supabase Realtime stores channel error"));
      if (status === "TIMED_OUT") onError?.(new Error("Supabase Realtime stores subscription timed out"));
    });

  return () => {
    void client.removeChannel(channel);
  };
}
