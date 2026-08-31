import type { Subscription } from "@supabase/supabase-js";
import { supabaseClient } from "./supabaseClient";

// This UUID is not a secret. The database policy is the authority that enforces it.
const administratorUserId = "e0218862-5c5b-4b90-b885-7e36eb02c326";

export async function getAdminSessionState() {
  if (!supabaseClient) return false;

  const { data, error } = await supabaseClient.auth.getUser();
  return !error && data.user?.id === administratorUserId;
}

export async function signInAdmin(email: string, password: string) {
  if (!supabaseClient) {
    throw new Error("Supabase 연결 설정을 찾을 수 없습니다.");
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;

  if (data.user?.id !== administratorUserId) {
    await supabaseClient.auth.signOut();
    throw new Error("이 계정에는 관리자 권한이 없습니다.");
  }
}

export async function signOutAdmin() {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

export function subscribeAdminSession(callback: () => void) {
  if (!supabaseClient) return () => undefined;

  const { data } = supabaseClient.auth.onAuthStateChange(() => callback());
  const subscription: Subscription = data.subscription;
  return () => subscription.unsubscribe();
}
