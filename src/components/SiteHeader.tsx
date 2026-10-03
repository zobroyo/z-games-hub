import { Link } from "@tanstack/react-router";
import { Gamepad2, Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SiteHeader({ onSearch }: { onSearch?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
            <Button variant="outline" onClick={() => setAccountOpen(true)} className="hidden border-border bg-secondary text-foreground hover:bg-accent sm:inline-flex"><UserRound /> <span>Sign in with ZChat</span></Button>
            <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Account" title="Account" onClick={() => setAccountOpen(true)}><UserRound /></Button>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {menuOpen && <nav className="flex flex-col gap-1 border-t border-border px-5 py-4 md:hidden" aria-label="Mobile navigation">
          <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold">Discover</Link>
          <Link to="/" hash="catalog" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-muted-foreground">All games</Link>
          <Link to="/" hash="categories" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-muted-foreground">Categories</Link>
        </nav>}
      </header>
      {accountOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setAccountOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="account-title" className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground"><UserRound className="size-5" /></span>
            <Button variant="ghost" size="icon" aria-label="Close account dialog" onClick={() => setAccountOpen(false)}><X /></Button>
          </div>
          <h2 id="account-title" className="mt-6 font-display text-2xl font-bold">Your Z Games account</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in with your existing ZChat account to keep your identity in one place. Account access is not connected yet.</p>
          <div className="mt-6 border-y border-border py-5">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Account status</span><span className="font-medium text-foreground">Not connected</span></div>
            <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">Recently played</span><span className="font-medium text-foreground">No games yet</span></div>
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-md bg-secondary p-4 text-sm leading-6 text-muted-foreground"><Gamepad2 className="mt-1 size-4 shrink-0 text-primary" /><p>Once connected, your ZChat display name and avatar can appear here. No new password or account will be created.</p></div>
          <Button className="mt-6 w-full" disabled>Sign in with ZChat</Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Available after the shared sign-in connection is configured.</p>
        </section>
      </div>}
    </>
  );
}