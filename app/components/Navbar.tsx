"use client";
import { useEffect, useState } from "react";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import { createUserLevelClient } from "@/lib/supabase/client";
import SignOutButton from "./SignOutButton";
import { postgrestErrorToHttpStatus } from "@/database/utils";
import Link from "next/link";

export default function Navbar() {
  // null = signed out; otherwise the display name (username, else email)
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createUserLevelClient();
    let lastUserId: string | null = null;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      if (!user) {
        lastUserId = null;
        setUsername(null);
        return;
      }
      if (user.id === lastUserId) return; // ignore TOKEN_REFRESHED / re-fires
      lastUserId = user.id;

      setTimeout(async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, email")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (error) console.error(postgrestErrorToHttpStatus(error));
        if (lastUserId !== user.id) return; // signed out while fetching
        setUsername(data?.username ?? data?.email ?? user.email ?? "commander");
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-[var(--nav-h)] flex-row items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-md">
      <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em]">
        <Link href="/">
          Direct Strike <span className="text-accent">Stats</span>
        </Link>
      </h1>
      {username !== null ? (
        <div className="flex items-center gap-4">
          <p className="max-w-56 truncate text-sm text-muted" title={username}>
            {username}
          </p>
          <span aria-hidden className="h-5 w-px bg-border" />
          <SignOutButton />
        </div>
      ) : (
        <SignInWithGoogleButton />
      )}
    </header>
  );
}
