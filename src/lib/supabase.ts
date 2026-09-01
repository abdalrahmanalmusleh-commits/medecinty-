import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ocxygpoafeobehfckymk.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_vZDvJh2pR0AIu6XnLottjw_p3evO2jj";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Universal Cloud Storage & Sync Helper
 * Replaces pure local-only edits with instant live Cloud sync!
 */
export async function getLivePlatformData(key: string, fallbackData: any) {
  try {
    const { data, error } = await supabase
      .from("platform_content")
      .select("content_value")
      .eq("content_key", key)
      .single();

    if (!error && data && data.content_value) {
      // Also cache locally for instant offline loading
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(data.content_value));
      }
      return data.content_value;
    }
  } catch (e) {
    // Fallback to local or default
  }

  if (typeof window !== "undefined") {
    const local = localStorage.getItem(key);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
  }

  return fallbackData;
}

export async function saveLivePlatformData(key: string, value: any) {
  // 1. Instant local update
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("medicinety_cloud_sync"));
  }

  // 2. Instant live Cloud Database sync for all visitors worldwide
  try {
    await supabase
      .from("platform_content")
      .upsert({
        content_key: key,
        content_value: value,
        updated_at: new Date().toISOString()
      }, { onConflict: "content_key" });
  } catch (e) {
    console.error("Cloud sync error:", e);
  }
}
