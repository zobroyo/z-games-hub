import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Expand, Gamepad2, Play, PlugZap, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ZChatUser } from "@/lib/zchat-oauth";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { catalog } from "@/lib/games";
import { recordRecentlyPlayed } from "@/lib/recent-games";
import { beginZChatSignIn, getZChatOAuthUser, subscribeToZChatAuth } from "@/lib/zchat-oauth";

export const Route = createFileRoute("/games/$slug")({
  head: () => ({ meta: [
    { title: "Game details - Z Games" },
    { name: "description", content: "Discover game details and play titles from approved external providers on Z Games." },
    { property: "og:title", content: "Game details - Z Games" },
    { property: "og:description", content: "Discover game details and play titles from approved external providers on Z Games." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: GameDetail,
});

function GameDetail() {
  const { slug } = Route.useParams();
  const game = catalog.games.find((item) => item.slug === slug);
  const [playing, setPlaying] = useState(false);
  const [user, setUser] = useState<ZChatUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const playerRef = useRef<HTMLDivElement>(null);
  const canEmbed = game?.playUrl.startsWith("https://") ?? false;

  useEffect(() => {
    let mounted = true;
    const refreshUser = async () => {
      try {
        const nextUser = await getZChatOAuthUser();
        if (mounted) setUser(nextUser);
      } catch (error) {
        if (mounted) setAuthError(error instanceof Error ? error.message : "Could not verify your ZChat session.");
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };
    const unsubscribe = subscribeToZChatAuth(() => void refreshUser());
    void refreshUser();
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    const shouldResumeGame = new URLSearchParams(window.location.search).get("autoplay") === "1";
    if (!authLoading && user && game && shouldResumeGame && !playing) {
      recordRecentlyPlayed(game);
      setPlaying(true);
    }
  }, [authLoading, game, playing, user]);

  const startPlay = () => {
    if (!game || !canEmbed || authLoading) return;
    if (!user) {
      setAuthError("");
      setLoginOpen(true);
      return;
    }
    recordRecentlyPlayed(game);
    setPlaying(true);
  };

  const playOnProvider = () => {
    if (!game || authLoading) return;
    if (!user) {
      setAuthError("");
      setLoginOpen(true);
      return;
    }
    recordRecentlyPlayed(game);
    window.open(game.playUrl, "_blank", "noopener,noreferrer");
  };

  const loginWithZChat = async () => {
    setLoginBusy(true);
    setAuthError("");
    try {
      await beginZChatSignIn(`${window.location.pathname}?autoplay=1`);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not start ZChat sign-in.");
      setLoginBusy(false);
    }
  };

  return <div className="min-h-screen bg-background text-foreground">
    <SiteHeader />
    <main className="mx-auto max-w-[1440px] px-5 pb-28 pt-10 md:px-10 xl:px-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" /> Back to games</Link>
      {game ? <>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase text-primary">{game.category} · {game.providerName}</p><h1 className="mt-3 font-display text-4xl font-bold">{game.title}</h1></div><Button variant="outline" onClick={playOnProvider} disabled={authLoading}>Play on {game.providerName} <ArrowUpRight /></Button></div>
        <div ref={playerRef} className="mt-8 overflow-hidden rounded-md border border-border bg-secondary">{playing && canEmbed ? <iframe src={game.playUrl} title={game.title} allow="fullscreen; autoplay; gamepad" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="aspect-video w-full border-0 bg-background" /> : <img src={game.thumbnailUrl} alt={game.title} className="aspect-video w-full object-cover" />}</div>
        <div className="mt-8 flex flex-wrap gap-3"><Button onClick={startPlay} disabled={!canEmbed || authLoading}><Play /> {playing ? "Playing" : authLoading ? "Checking account…" : "Play game"}</Button><Button variant="outline" disabled={!playing} title="Fullscreen is available during embedded play" onClick={() => void playerRef.current?.requestFullscreen?.()}><Expand /> Fullscreen</Button></div>
        <section className="mt-16 max-w-2xl"><h2 className="font-display text-2xl font-bold">About the game</h2><p className="mt-4 leading-7 text-muted-foreground">{game.description}</p><p className="mt-3 text-sm text-muted-foreground">Provided by {game.providerName}. This game is hosted by its provider, not Z Games.</p></section>
        <section className="mt-20 border-t border-border pt-10"><h2 className="font-display text-2xl font-bold">Related games</h2><p className="mt-5 text-muted-foreground">More games in {game.category} will appear here as the catalog grows.</p></section>
      </> : <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16 text-center"><span className="flex size-16 items-center justify-center rounded-lg border border-border bg-secondary text-primary"><PlugZap className="size-7" /></span><p className="mt-7 text-xs font-semibold uppercase text-primary">Catalog not connected</p><h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">No game to show yet.</h1><p className="mt-4 max-w-md leading-7 text-muted-foreground">Game pages will show the title, thumbnail, category, description and play link supplied by an approved external provider. No games are hosted here yet.</p><Button asChild className="mt-8"><Link to="/"><Gamepad2 /> Explore Z Games</Link></Button></section>}
    </main>
    {loginOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4 py-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setLoginOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="game-login-title" className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4"><span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground"><UserRound className="size-5" /></span><Button variant="ghost" size="icon" aria-label="Close sign-in dialog" onClick={() => setLoginOpen(false)}><X /></Button></div>
        <h2 id="game-login-title" className="mt-6 font-display text-2xl font-bold">Sign in to play</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Continue to ZChat to sign in. If you are already signed in, you’ll return here and your game will start.</p>
        {authError && <p role="alert" className="mt-4 text-sm text-destructive">{authError}</p>}
        <Button className="mt-6 w-full" onClick={() => void loginWithZChat()} disabled={loginBusy}>{loginBusy ? "Opening ZChat…" : "Login with ZChat"}</Button>
      </section>
    </div>}
  </div>;
}
