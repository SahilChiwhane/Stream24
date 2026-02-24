export function getAnimeMock() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hero: {
          id: 1,
          title: "Demon Slayer",
          overview: "A boy fights demons after his family is slaughtered.",
          poster: "/sample.jpg",
          mediaType: "tv",
        },
        topRated: [],
        popular: [],
        recent: [],
        movies: [],
      });
    }, 600);
  });
}
