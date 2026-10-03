import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CircleAlert, Gamepad2, LayoutGrid, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { catalog, categories, type ExternalGame } from "@/lib/games";
import arcadeHall from "@/assets/arcade-hall.jpg";

const PAGE_SIZE = 24;

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Z Games — Discover games worth playing" },
    { name: "description", content: "Discover and play games from Playgama on Z Games." },
    { property: "og:title", content: "Z Games — Discover games worth playing" },
    { property: "og:description", content: "A home for discovering games from Playgama." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Home,
});

function GameCard({ game }: { game: ExternalGame }) {
  return <Link to="/games/$slug" params={{ slug: game.slug }} className="group block overflow-hidden rounded-md border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50">
    <div className="relative aspect-[4/3] overflow-hidden bg-secondary"><img src={game.thumbnailUrl} alt={game.title} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" /><span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-md bg-background/85 text-foreground"><ArrowUpRight className="size-4" /></span></div>
    <div className="p-4"><p className="text-xs font-medium capitalize text-primary">{game.category}</p><h3 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold">{game.title}</h3><p className="mt-2 text-xs text-muted-foreground">By {game.providerName}</p></div>
  </Link>;
}

function SectionHeading({ icon: Icon, title, caption }: { icon: typeof Sparkles; title: string; caption: string }) {
  return <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-5"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-primary"><Icon className="size-4" /> {caption}</div><h2 className="font-display text-2xl font-bold sm:text-[28px]">{title}</h2></div></div>;
}

function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All games");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleGames = useMemo(() => catalog.games.filter((game) => (category === "All games" || game.genres.includes(category)) && `${game.title} ${game.genres.join(" ")} ${game.description}`.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);
  const featured = catalog.games.filter((game) => game.featured);
  const popular = catalog.games.filter((game) => game.popular);
  const searching = query.trim().length > 0 || category !== "All games";

  return <div className="min-h-screen bg-background text-foreground">
    <SiteHeader onSearch={() => { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }} />
    <main>
      <section className="relative isolate flex min-h-[460px] items-center overflow-hidden border-b border-border sm:min-h-[530px]" aria-labelledby="hero-title">
        <img src={arcadeHall} alt="Modern arcade cabinets glowing in a dark game hall" width={1536} height={1024} className="absolute inset-0 -z-20 size-full object-cover object-[60%_center]" />
        <div className="absolute inset-0 -z-10 bg-hero-shade" />
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 xl:px-16">
          <div className="max-w-[600px]"><p className="mb-6 inline-flex items-center gap-2 border-l-2 border-primary pl-3 text-xs font-semibold uppercase text-primary">A new place to play</p>
            <h1 id="hero-title" className="font-display text-[clamp(3.3rem,6vw,5.5rem)] font-extrabold leading-[1.03] text-hero-foreground">Z GAMES<span className="text-primary">.</span><br /><span className="text-hero-foreground/85">Play starts here.</span></h1>
            <p className="mt-6 max-w-[440px] text-base leading-7 text-hero-foreground/75 sm:text-lg">A fresh home for great games from Playgama’s catalog. Find your next favorite and jump straight into play.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="h-12 px-6 font-semibold"><Link to="/" hash="catalog">Explore the catalog <ArrowRight /></Link></Button><Button asChild variant="outline" size="lg" className="h-12 border-hero-foreground/30 bg-background/10 px-6 text-hero-foreground hover:bg-background/25 hover:text-hero-foreground"><Link to="/" hash="connection">How games get here <ArrowDown /></Link></Button></div>
          </div>
        </div>
        <div className="absolute bottom-5 right-5 text-[10px] font-medium uppercase text-hero-foreground/55 md:right-10 xl:right-16">Catalog from Playgama · games hosted by their providers</div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10 xl:px-16">
        <section id="catalog" className="scroll-mt-8 pt-14 sm:pt-16" aria-labelledby="discover-title">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-semibold uppercase text-primary">Find your next favorite</p><h2 id="discover-title" className="font-display text-3xl font-bold sm:text-4xl">Discover games<span className="text-primary">.</span></h2></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-primary" /> {catalog.games.length.toLocaleString()} games available</div></div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><div className="relative min-w-0 flex-1"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><input ref={inputRef} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Search games by name, genre, or description..." aria-label="Search games" className="h-12 w-full rounded-md border border-input bg-secondary pl-12 pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" />{query && <Button variant="ghost" size="icon" className="absolute right-1.5 top-1.5" aria-label="Clear search" onClick={() => { setQuery(""); setVisibleCount(PAGE_SIZE); }}><X /></Button>}</div><div className="relative flex items-center sm:w-[192px]"><SlidersHorizontal className="pointer-events-none absolute left-4 size-4 text-muted-foreground" /><select value={category} onChange={(event) => { setCategory(event.target.value); setVisibleCount(PAGE_SIZE); }} aria-label="Filter category" className="h-12 w-full appearance-none rounded-md border border-input bg-secondary pl-11 pr-4 text-sm capitalize text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">{categories.map((item) => <option key={item} className="capitalize">{item}</option>)}</select></div></div>
          <div id="categories" className="mt-5 flex flex-wrap gap-2 scroll-mt-8" aria-label="Game categories">{categories.map((item) => <Button key={item} variant={category === item ? "default" : "outline"} size="sm" aria-pressed={category === item} onClick={() => { setCategory(item); setVisibleCount(PAGE_SIZE); }} className={category === item ? "h-9 capitalize" : "h-9 border-border bg-secondary capitalize text-muted-foreground hover:text-foreground"}>{item}</Button>)}</div>
          {catalog.status === "loading" ? <div role="status" className="mt-10">Loading games…</div> : catalog.status === "error" ? <div role="alert" className="mt-10 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-6"><CircleAlert className="size-5 shrink-0 text-destructive" /><div><h3 className="font-semibold">The catalog couldn’t load</h3><p className="mt-1 text-sm text-muted-foreground">{catalog.message}</p></div></div> : searching ? <div className="mt-9">{visibleGames.length ? <><p className="mb-4 text-sm text-muted-foreground">{visibleGames.length.toLocaleString()} matching games</p><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{visibleGames.slice(0, visibleCount).map((game) => <GameCard key={game.id} game={game} />)}</div>{visibleCount < visibleGames.length && <div className="mt-8 text-center"><Button variant="outline" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Load more games</Button></div>}</> : <div className="flex min-h-[250px] flex-col items-center justify-center rounded-md border border-dashed border-border px-5 text-center"><Search className="size-7 text-muted-foreground" /><h3 className="mt-5 font-display text-lg font-semibold">No games found</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Try a different search or category.</p><Button variant="link" onClick={() => { setQuery(""); setCategory("All games"); setVisibleCount(PAGE_SIZE); }} className="mt-3">Clear filters</Button></div>}</div> : <>
            <div className="mt-12"><SectionHeading icon={Sparkles} title="Featured games" caption="Top picks from the supplied catalog" /><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{featured.map((game) => <GameCard key={game.id} game={game} />)}</div></div>
            {popular.length > 0 && <div className="mt-14"><SectionHeading icon={Gamepad2} title="Popular right now" caption="Tagged popular by Playgama" /><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{popular.slice(0, 8).map((game) => <GameCard key={game.id} game={game} />)}</div></div>}
            <div className="mt-14"><SectionHeading icon={LayoutGrid} title="All games" caption={`${catalog.games.length.toLocaleString()} from Playgama`} /><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{catalog.games.slice(0, visibleCount).map((game) => <GameCard key={game.id} game={game} />)}</div>{visibleCount < catalog.games.length && <div className="mt-8 text-center"><Button variant="outline" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Load more games</Button></div>}</div>
          </>}
        </section>

        <section id="connection" className="mt-20 scroll-mt-8 border-t border-border pt-12"><div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-20"><div><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-primary"><LayoutGrid className="size-4" /> The catalog</div><h2 className="max-w-md font-display text-3xl font-bold leading-tight sm:text-4xl">Real games. Real partners.<br /><span className="text-muted-foreground">No stand-ins.</span></h2></div><div className="text-sm leading-7 text-muted-foreground"><p>Z Games does not make or host these games. Each listing uses artwork and descriptions from the supplied Playgama catalog and links to the external provider listed on its game page.</p><p className="mt-4">Choose a game to open its provider’s embed. Some catalog entries are hosted on Playgama; others use their publisher’s game host.</p><a className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline" href="https://playgama.com/" target="_blank" rel="noopener noreferrer">Visit Playgama <ArrowUpRight className="size-4" /></a></div></div></section>
      </div>
    </main>
    <footer className="border-t border-border bg-secondary/40"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 px-5 py-8 text-xs text-muted-foreground sm:flex-row md:px-10 xl:px-16"><span className="font-display text-sm font-bold text-foreground">Z GAMES<span className="text-primary">.</span></span><span>Independent game discovery. Games belong to their respective providers.</span><span>© Z Games</span></div></footer>
  </div>;
}
