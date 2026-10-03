import { Link } from "@tanstack/react-router";
import { Gamepad2, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ZChatUser } from "@/lib/zchat-oauth";
import { Button } from "@/components/ui/button";
import { getRecentlyPlayedGames, type RecentlyPlayedGame } from "@/lib/recent-games";
import { beginZChatSignIn, getZChatOAuthUser, signOutOfZChatOnThisDevice, subscribeToZChatAuth } from "@/lib/zchat-oauth";

function metadataValue(user: ZChatUser | null, keys: string[]) {
  const metadata = user?.user_metadata;
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

export function SiteHeader({ onSearch }: { onSearch?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<ZChatUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [recentGames, setRecentGames] = useState<RecentlyPlayedGame[]>([]);

  useEffect(() => {
    let mounted = true;
    const refreshUser = async () => {
      try {
        const nextUser = await getZChatOAuthUser();
        if (mounted) setUser(nextUser);
      } catch (error) {
        if (mounted) setAuthError(error instanceof Error ? error.message : "Could not check your ZChat session.");
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
    const refresh = () => setRecentGames(getRecentlyPlayedGames());
    refresh();
    window.addEventListener("z-games:recently-played", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("z-games:recently-played", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const openAccount = () => {
    setAuthError("");
    setAccountOpen(true);
  };

  const signIn = async () => {
    setAuthBusy(true);
    setAuthError("");
    try {
      await beginZChatSignIn("/");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not start ZChat sign-in.");
      setAuthBusy(false);
    }
  };
  const signOut = async () => {
    setAuthBusy(true);
    setAuthError("");
    signOutOfZChatOnThisDevice();
    setUser(null);
    setAuthBusy(false);
  };
  const displayName =
    metadataValue(user, ["display_name", "displayName", "full_name", "name"]) ??
    user?.email ??
    "ZChat member";
  const avatarUrl = metadataValue(user, ["avatar_url", "avatar", "picture"]);

  return (
    <>
      <header className="relative z-30 border-b border-border/70 bg-background/95">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-7 px-5 md:px-10 xl:px-16">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Z Games home">
            <span className="flex size-9 items-center justify-center rounded-[7px] bg-primary font-display text-[25px] font-extrabold leading-none text-primary-foreground">Z</span>
            <span className="font-display text-xl font-extrabold text-foreground">GAMES<span className="text-primary">.</span></span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            <Link to="/" className="text-sm font-semibold text-foreground">Discover</Link>
            <Link to="/" hash="catalog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">All games</Link>
            <Link to="/" hash="categories" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Categories</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            {onSearch && <Button variant="ghost" size="icon" aria-label="Search games" title="Search games" onClick={onSearch}><Search /></Button>}
            <Button variant="outline" onClick={openAccount} className="hidden max-w-56 items-center gap-2 border-border bg-secondary text-foreground hover:bg-accent sm:inline-flex">
              {user && avatarUrl ? <img src={avatarUrl} alt="" className="size-5 rounded-full object-cover" /> : <UserRound />}
              <span className="truncate">{user ? displayName : "Sign in with ZChat"}</span>
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Account" title="Account" onClick={openAccount}>
              {user && avatarUrl ? <img src={avatarUrl} alt="" className="size-6 rounded-full object-cover" /> : <UserRound />}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {menuOpen && <nav className="flex flex-col gap-1 border-t border-border px-5 py-4 md:hidden" aria-label="Mobile navigation">
          <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold">Discover</Link>
          <Link to="/" hash="catalog" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-muted-foreground">All games</Link>
          <Link to="/" hash="categories" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-muted-foreground">Categories</Link>
        </nav>}
      </header>
      {accountOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-overlay px-4 py-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setAccountOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="account-title" className="my-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="flex size-11 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
              {user && avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : <UserRound className="size-5" />}
            </span>
            <Button variant="ghost" size="icon" aria-label="Close account dialog" onClick={() => setAccountOpen(false)}><X /></Button>
          </div>
          <h2 id="account-title" className="mt-6 font-display text-2xl font-bold">{user ? "Welcome, " + displayName : "Your Z Games account"}</h2>
          {authLoading ? <p className="mt-3 text-sm text-muted-foreground">Checking your ZChat session…</p> : user ? <>
            <p className="mt-2 break-all text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-5 flex items-center justify-between border-y border-border py-4 text-sm">
              <span className="text-muted-foreground">Account status</span><span className="font-medium text-primary">Connected with ZChat</span>
            </div>
            <div className="mt-5">
              <h3 className="text-sm font-semibold">Recently played</h3>
              {recentGames.length ? <ul className="mt-3 space-y-2">{recentGames.map((game) => <li key={game.slug}><Link to="/games/$slug" params={{ slug: game.slug }} onClick={() => setAccountOpen(false)} className="block rounded-md bg-secondary px-3 py-2 text-sm hover:bg-accent">{game.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Games you play on this device will appear here.</p>}
            </div>
            {authError && <p role="alert" className="mt-4 text-sm text-destructive">{authError}</p>}
            <Button className="mt-6 w-full" variant="outline" onClick={() => void signOut()} disabled={authBusy}>{authBusy ? "Signing out…" : "Sign out"}</Button>
          </> : <>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Continue to ZChat to sign in. If you are already signed in there, Z Games will return you here.</p>
            <div className="mt-6 space-y-3">
              <Button className="w-full" onClick={() => void signIn()} disabled={authBusy}>{authBusy ? "Opening ZChat…" : "Login with ZChat"}</Button>
              {authError && <p role="alert" className="text-sm text-destructive">{authError}</p>}
            </div>            <div className="mt-5 flex items-start gap-3 rounded-md bg-secondary p-4 text-sm leading-6 text-muted-foreground"><Gamepad2 className="mt-1 size-4 shrink-0 text-primary" /><p>Sign-in is handled by ZChat and Supabase. Z Games receives an approved sign-in session and never sees your password.</p></div>
          </>}
        </section>
      </div>}
    </>
  );
}
