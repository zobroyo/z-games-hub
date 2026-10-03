import gameData from "@/data/games.json";

/** Playgama catalog entries supplied for Z Games, retaining each external host URL. */
export type ExternalGame = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  genres: string[];
  description: string;
  playUrl: string;
  providerName: string;
  featured?: boolean;
  popular?: boolean;
};

export type CatalogState =
  | { status: "unconnected"; games: ExternalGame[] }
  | { status: "loading"; games: ExternalGame[] }
  | { status: "error"; games: ExternalGame[]; message: string }
  | { status: "ready"; games: ExternalGame[] };

export const catalog: CatalogState = {
  status: "ready",
  games: gameData as ExternalGame[],
};

// Keep the quick filters useful and compact; search still covers every supplied genre.
export const categories = [
  "All games",
  "puzzle",
  "arcade",
  "action",
  "adventure",
  "strategy",
  "simulation",
  "racing",
  "sports",
  "multiplayer",
  "casual",
  "kids",
] as const;
