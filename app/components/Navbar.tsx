import SignInWithGoogleButton from "./SignInWithGoogleButton";

export default function Navbar() {
  return (
    <div className="flex flex-row justify-between">
      <h1 className="my-auto ml-5 text-2xl">Direct Strike Stats</h1>
      <SignInWithGoogleButton></SignInWithGoogleButton>
    </div>
  );
}
