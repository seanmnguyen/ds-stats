import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign-in error · DS Stats",
};

// Landing page for failed OAuth callbacks. The /auth/callback route redirects
// here when there is no code in the URL or exchangeCodeForSession fails — most
// often because the Google account is not on the allowlist, or the link expired.
export default function AuthCodeErrorPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex max-w-prose flex-col gap-4">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Sign-in was not completed
        </h1>

        <p className="text-sm text-muted">
          We were unable to finish signing you in. This usually means the
          sign-in link expired, or the Google account you used is not on the
          access list for this invite-only app.
        </p>

        <p className="text-sm text-muted">
          Please try signing in again. If it keeps failing, make sure you are
          using an invited Google account, or contact the site admin to be
          added.
        </p>
      </div>

      <Link href="/" className="btn btn-ghost rounded-full px-5">
        Return home
      </Link>
    </main>
  );
}
