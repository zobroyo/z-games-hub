import { Link } from "@tanstack/react-router";
import { Gamepad2, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { getRecentlyPlayedGames, type RecentlyPlayedGame } from "@/lib/recent-games";
import { supabase } from "@/lib/supabase";

function metadataValue(user: User | null, keys: string[]) {
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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recentGames, setRecentGames] = useState<RecentlyPlayedGame[]>([]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
      if (error) setAuthError(error.message);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
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
    setPassword("");
    setAccountOpen(true);
  };

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setAuthBusy(true);
    setAuthError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setUser(data.user);
        setPassword("");
      }
    } catch {
      setAuthError("Could not reach Supabase. Check your connection and try again.");
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    setAuthBusy(true);
    setAuthError("");
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
    else setUser(null);
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
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the same email and password you use for ZChat. Z Games sends sign-in directly to the shared Supabase project.</p>
            {supabase ? <form className="mt-6 space-y-4" onSubmit={(event) => void signIn(event)}>
              <label className="block text-sm font-medium" htmlFor="zchat-email">Email</label>
              <input id="zchat-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              <label className="block text-sm font-medium" htmlFor="zchat-password">Password</label>
              <input id="zchat-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              {authError && <p role="alert" className="text-sm text-destructive">{authError}</p>}
              <Button className="w-full" type="submit" disabled={authBusy}>{authBusy ? "Signing in…" : "Sign in with ZChat"}</Button>
            </form> : <div className="mt-6 rounded-md border border-border bg-secondary p-4 text-sm leading-6 text-muted-foreground"><p>Sign-in needs the ZChat Supabase project configuration.</p><p className="mt-2 font-mono text-xs">VITE_SUPABASE_URL<br />VITE_SUPABASE_PUBLISHABLE_KEY</p></div>}
            <div className="mt-5 flex items-start gap-3 rounded-md bg-secondary p-4 text-sm leading-6 text-muted-foreground"><Gamepad2 className="mt-1 size-4 shrink-0 text-primary" /><p>Your password is sent directly to Supabase over HTTPS. Z Games does not store your password or create another account.</p></div>
          </>}
        </section>
      </div>}
    </>
  );
}
