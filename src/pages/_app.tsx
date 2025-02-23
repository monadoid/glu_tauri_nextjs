import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      allowedRedirectProtocols={["tauri:"]}
      clerkJSVersion="5.39.0"
      signInUrl="/sign-in"
      {...pageProps}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
