import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../services/api";
import MovieCard from "../../browse/components/Card";
import { Search as SearchIcon, X } from "lucide-react";
import Loader from "../../../shared/components/Loader";
import EmptyState from "../../../shared/components/EmptyState";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [didYouMean, setDidYouMean] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  // Sync query with ?q=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setQuery(q);
  }, [location.search]);

  const filterPlayable = (items = []) =>
    (items || []).filter(
      (item) =>
        (item.mediaType === "movie" || item.mediaType === "tv") &&
        !!item.posterUrl,
    );

  const dedupeByIdAndType = (items = []) => {
    const map = new Map();
    items.forEach((item) => {
      // Key must include category, ID and optional season to allow expanded Netflix-style results
      const key = `${item.mediaType}-${item.id}${item.season ? `-${item.season}` : ""}`;
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    const trimmed = (query || "").trim();

    if (!trimmed) {
      setResults([]);
      setSuggestions([]);
      setDidYouMean(null);
      return;
    }

    const id = setTimeout(async () => {
      setLoading(true);
      setDidYouMean(null);
      setSuggestions([]);

      const runSearch = async (term) => {
        if (!term) return [];
        try {
          const res = await api.get("/search/multi", {
            params: {
              query: term,
              page: 1,
            },
          });
          // Backend returns { success: true, data: { results: [...] } }
          return filterPlayable(res.data.data.results);
        } catch {
          return [];
        }
      };

      try {
        let primary = await runSearch(trimmed);

        if (primary.length > 0) {
          primary = dedupeByIdAndType(primary);
          setResults(primary);
          setSuggestions(primary.slice(0, 5));
        } else {
          const tokens = trimmed.split(/\s+/).filter(Boolean);
          const fallbackTerms = new Set(tokens);

          if (trimmed.length > 4) {
            fallbackTerms.add(trimmed.slice(0, trimmed.length - 1));
          }

          const all = await Promise.all(
            Array.from(fallbackTerms).map((t) => runSearch(t)),
          );

          const fallbackResults = dedupeByIdAndType(all.flat());

          if (fallbackResults.length > 0) {
            setResults(fallbackResults);
            setSuggestions(fallbackResults.slice(0, 5));
            const first = fallbackResults[0];
            setDidYouMean(
              first.title ||
                first.name ||
                first.original_title ||
                first.original_name ||
                null,
            );
          } else {
            setResults([]);
            setSuggestions([]);
          }
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(id);
  }, [query]);

  const handleSuggestionClick = (item) => {
    const title =
      item.title ||
      item.name ||
      item.original_title ||
      item.original_name ||
      "";
    if (title) setQuery(title);
  };

  const handleDidYouMeanClick = () => {
    if (didYouMean) setQuery(didYouMean);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Search bar */}
        <div className="mb-6">
          <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-3 shadow-lg focus-within:border-[#2563EB] transition">
            <SearchIcon className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <input
              className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-lg"
              placeholder="Search movies, TV shows, anime..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="ml-2 text-gray-400 hover:text-white transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Did you mean */}
        {didYouMean && (
          <p className="text-gray-300 text-center mb-4">
            Do you mean{" "}
            <button
              type="button"
              onClick={handleDidYouMeanClick}
              className="text-blue-400 hover:underline"
            >
              {didYouMean}
            </button>
            ?
          </p>
        )}

        {loading && (
          <div className="flex justify-center mb-6">
            <Loader fullPage={false} />
          </div>
        )}

        {!loading &&
          results.length === 0 &&
          query.trim() !== "" &&
          !didYouMean && (
            <EmptyState
              icon={SearchIcon}
              title="No matches found"
              description={`We couldn't find anything for "${query}". Try searching for something else or browse our categories.`}
              actionLabel="Browse Movies"
              actionLink="/movies"
            />
          )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-400 mb-2 text-sm">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => {
                const title =
                  item.title ||
                  item.name ||
                  item.original_title ||
                  item.original_name ||
                  "";
                return (
                  <button
                    key={`${item.mediaType}-sugg-${item.id}${item.season ? `-s${item.season}` : ""}`}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    className="text-xs sm:text-sm px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#333] hover:border-gray-400 transition"
                  >
                    {title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 🔥 EXACT Wishlist card layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6">
          {results.map((item) => {
            const title =
              item.title ||
              item.name ||
              item.original_title ||
              item.original_name ||
              "";

            // Intelligence: If query is "Title 2", pass season=2 hint to details
            const queryMatch = query.match(/(\d+)$/);
            const seasonHint =
              item.mediaType === "tv" && queryMatch
                ? parseInt(queryMatch[1])
                : null;

            const movieWithHint = seasonHint
              ? { ...item, season: seasonHint }
              : item;

            return (
              <div
                key={`${item.mediaType}-${item.id}${item.season ? `-s${item.season}` : ""}`}
                className="relative group cursor-pointer transform transition-all duration-200 md:hover:scale-105 md:hover:shadow-2xl rounded-2xl overflow-visible mx-auto w-full"
                title={title}
              >
                <MovieCard
                  movie={movieWithHint}
                  width="100%"
                  height="auto"
                  imageSize="w300"
                  hideTitle={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Search;
