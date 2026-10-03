/** Provider-neutral catalog contract. No catalog is connected or represented as connected. */
export type ExternalGame = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  description: string;
  playUrl: string;
  providerName: string;
  featured?: boolean;
  popular?: boolean;
  addedAt?: string;
};

export type CatalogState =
  | { status: "unconnected"; games: ExternalGame[] }
  | { status: "loading"; games: ExternalGame[] }
  | { status: "error"; games: ExternalGame[]; message: string }
  | { status: "ready"; games: ExternalGame[] };

export const catalog: CatalogState = { status: "unconnected", games: [] };

export const categories = ["All games", "Action", "Puzzle", "Strategy", "Racing", "Adventure"] as const;