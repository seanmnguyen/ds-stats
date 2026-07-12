"use client";

import { Database } from "@/database/database.types";
import { createBrowserClient } from "@supabase/ssr";

export function createUserLevelClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
