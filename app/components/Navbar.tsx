"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import { createUserLevelClient } from "@/lib/supabase/client";
import SignOutButton from "./SignOutButton";
import { postgrestErrorToHttpStatus } from "@/database/utils";

const NAV_LINKS = [
  { href: "/", label: "Compare" },
  { href: "/matchup", label: "Matchup" },
];

export default function Navbar() {
  // null = signed out; otherwise the display name (username, else email)
  const [username, setUsername] = useState<string | null>(null);
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 flex h-[var(--nav-h)] items-center justify-between gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:gap-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-6">
        <Link
          href="/"
          aria-label="Direct Strike Stats — home"
          className="shrink-0 font-display font-bold uppercase tracking-[0.15em] transition-colors hover:text-accent-strong sm:tracking-[0.2em]"
        >
          {/* Monogram on mobile, full wordmark from sm up (keeps the navbar from overflowing) */}
          <span className="text-base sm:hidden">
            DS <span className="text-accent">Stats</span>
          </span>
          <span className="hidden text-lg sm:inline">
            Direct Strike <span className="text-accent">Stats</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-2.5 py-1.5 font-display text-xs font-semibold uppercase tracking-wide transition-colors sm:px-3 sm:text-sm ${
                  active
                    ? "bg-surface text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {username !== null ? (
          <>
            <p
              className="hidden max-w-40 truncate text-sm text-muted sm:block"
              title={username}
            >
              {username}
            </p>
            <span aria-hidden className="hidden h-5 w-px bg-border sm:block" />
            <SignOutButton />
          </>
        ) : (
          <SignInWithGoogleButton />
        )}
      </div>
    </header>
  );
}
