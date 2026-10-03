import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { completeZChatSignIn } from "@/lib/zchat-oauth";

export const Route = createFileRoute("/auth/zchat/callback")({
  head: () => ({ meta: [{ title: "Signing in with ZChat - Z Games" }] }),
  component: ZChatCallback,
});

function ZChatCallback() {
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void completeZChatSignIn().then((returnTo) => {
      window.location.replace(returnTo);
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Could not finish ZChat sign-in.");
    });
  }, []);

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
    <section className="w-full max-w-md rounded-lg border border-border bg-card p-7 text-center shadow-2xl">
      <h1 className="font-display text-2xl font-bold">{error ? "Sign-in didn’t finish" : "Connecting to ZChat…"}</h1>
      {error ? <><p role="alert" className="mt-3 text-sm leading-6 text-destructive">{error}</p><a href="/" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">Back to Z Games</a></> : <p className="mt-3 text-sm text-muted-foreground">You’ll return to your game in a moment.</p>}
    </section>
  </main>;
}
