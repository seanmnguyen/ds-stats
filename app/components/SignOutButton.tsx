"use client";
import { useState } from "react";
import { createUserLevelClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    const supabase = createUserLevelClient();
    // scope "local" signs out this browser only; signOut does not navigate
    const { error } = await supabase.auth.signOut({ scope: "local" });
    setPending(false);
    if (error) {
      // Sign-out failed server-side; the session is still live, so keep the signed-in UI
      console.error(error);
      return;
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="btn btn-ghost"
    >
      Sign out
    </button>
  );
}
