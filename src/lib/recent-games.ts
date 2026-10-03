const STORAGE_KEY = "z-games-recently-played";
const MAX_RECENT_GAMES = 5;

export type RecentlyPlayedGame = {
  slug: string;
  title: string;
  playedAt: string;
};

export function getRecentlyPlayedGames(): RecentlyPlayedGame[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (game): game is RecentlyPlayedGame =>
        typeof game?.slug === "string" &&
        typeof game?.title === "string" &&
        typeof game?.playedAt === "string",
    ).slice(0, MAX_RECENT_GAMES);
  } catch {
    return [];
  }
}

export function recordRecentlyPlayed(game: { slug: string; title: string }) {
  if (typeof window === "undefined") return;

  const next = [
    { ...game, playedAt: new Date().toISOString() },
    ...getRecentlyPlayedGames().filter((recent) => recent.slug !== game.slug),
  ].slice(0, MAX_RECENT_GAMES);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("z-games:recently-played"));
  } catch {
    // Browsing still works when local storage is unavailable.
  }
}
