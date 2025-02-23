import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* @ts-expect-error - SignedOut */}
      <SignedOut>
        <SignInButton />
      </SignedOut>
      {/* @ts-expect-error - SignedIn */}
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
