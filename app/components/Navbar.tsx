import SignInWithGoogleButton from "./SignInWithGoogleButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex h-[var(--nav-h)] flex-row items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-md">
      <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em]">
        Direct Strike <span className="text-accent">Stats</span>
      </h1>
      <SignInWithGoogleButton></SignInWithGoogleButton>
    </header>
  );
}
