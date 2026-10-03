import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Expand, Gamepad2, Play, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { catalog } from "@/lib/games";

export const Route = createFileRoute("/games/$slug")({
  head: () => ({ meta: [
    { title: "Game details — Z Games" },
    { name: "description", content: "Discover game details and play titles from approved external providers on Z Games." },
    { property: "og:title", content: "Game details — Z Games" },
    { property: "og:description", content: "Discover game details and play titles from approved external providers on Z Games." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: GameDetail,
});

function GameDetail() {
  const { slug } = Route.useParams();
  const game = catalog.games.find((item) => item.slug === slug);

  return <div className="min-h-screen bg-background text-foreground">
    <SiteHeader />
    <main className="mx-auto max-w-[1440px] px-5 pb-28 pt-10 md:px-10 xl:px-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" /> Back to games</Link>
      {game ? <>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase text-primary">{game.category} · {game.providerName}</p><h1 className="mt-3 font-display text-4xl font-bold">{game.title}</h1></div><Button asChild variant="outline"><a href={game.playUrl} target="_blank" rel="noopener noreferrer">Play on {game.providerName} <ArrowUpRight /></a></Button></div>
        <div className="mt-8 overflow-hidden rounded-md border border-border bg-secondary"><img src={game.thumbnailUrl} alt={game.title} className="aspect-video w-full object-cover" /></div>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild><a href={game.playUrl} target="_blank" rel="noopener noreferrer"><Play /> Play game</a></Button><Button variant="outline" disabled title="Fullscreen is available when a provider supports embedded play"><Expand /> Fullscreen</Button></div>
        <section className="mt-16 max-w-2xl"><h2 className="font-display text-2xl font-bold">About the game</h2><p className="mt-4 leading-7 text-muted-foreground">{game.description}</p><p className="mt-3 text-sm text-muted-foreground">Provided by {game.providerName}. This game is hosted by its provider, not Z Games.</p></section>
        <section className="mt-20 border-t border-border pt-10"><h2 className="font-display text-2xl font-bold">Related games</h2><p className="mt-5 text-muted-foreground">More games in {game.category} will appear here as the catalog grows.</p></section>
      </> : <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16 text-center"><span className="flex size-16 items-center justify-center rounded-lg border border-border bg-secondary text-primary"><PlugZap className="size-7" /></span><p className="mt-7 text-xs font-semibold uppercase text-primary">Catalog not connected</p><h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">No game to show yet.</h1><p className="mt-4 max-w-md leading-7 text-muted-foreground">Game pages will show the title, thumbnail, category, description and play link supplied by an approved external provider. No games are hosted here yet.</p><Button asChild className="mt-8"><Link to="/"><Gamepad2 /> Explore Z Games</Link></Button></section>}
    </main>
  </div>;
}