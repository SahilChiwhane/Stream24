export function getTvMock() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hero: {
          id: 101,
          title: "Breaking Bad",
          overview: "A chemistry teacher becomes a drug kingpin.",
          poster: null,
          mediaType: "tv",
          rating: 9.5,
          year: 2008,
        },
        rows: [
          { title: "Trending", items: [] },
          { title: "Top Rated", items: [] },
          { title: "Popular in India", items: [] },
        ],
      });
    }, 500);
  });
}
