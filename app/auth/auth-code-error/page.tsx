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
        <h1 className="text-2xl font-bold">Sign-in was not completed</h1>

        <p className="text-sm opacity-80">
          We were unable to finish signing you in. This usually means the
          sign-in link expired, or the Google account you used is not on the
          access list for this invite-only app.
        </p>

        <p className="text-sm opacity-80">
          Please try signing in again. If it keeps failing, make sure you are
          using an invited Google account, or contact the site admin to be
          added.
        </p>
      </div>

      <Link
        href="/"
        className="rounded-full border border-[#747775] px-4 py-2 text-sm font-medium transition duration-[218ms] hover:bg-black/5 dark:hover:bg-white/10"
      >
        Return home
      </Link>
    </main>
  );
}
