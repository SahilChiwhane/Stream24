export const moviesMock = {
  hero: {
    id: 1,
    title: "Mock Hero Movie",
    overview: "This is mock hero content for layout testing.",
    poster: "/kqjL17yufvn9OVLyXYpvtyrFfak.jpg",
    backdrop: "/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg",
    year: "2024",
    rating: 8.4,
    mediaType: "movie",
  },
  trending: new Array(12).fill(0).map((_, i) => ({
    id: i + 10,
    title: `Trending ${i + 1}`,
    poster: "/kqjL17yufvn9OVLyXYpvtyrFfak.jpg",
    mediaType: "movie",
  })),
  popularMovies: new Array(12).fill(0).map((_, i) => ({
    id: i + 30,
    title: `Popular Movie ${i + 1}`,
    poster: "/kqjL17yufvn9OVLyXYpvtyrFfak.jpg",
    mediaType: "movie",
  })),
  popularTV: new Array(12).fill(0).map((_, i) => ({
    id: i + 50,
    title: `Popular TV ${i + 1}`,
    poster: "/kqjL17yufvn9OVLyXYpvtyrFfak.jpg",
    mediaType: "tv",
  })),
};

export const animeMock = {
  hero: moviesMock.hero,
  topRated: moviesMock.trending,
  popular: moviesMock.popularMovies,
  recent: moviesMock.popularTV,
  movies: moviesMock.trending,
};

export const tvMock = {
  hero: moviesMock.hero,
  trending: moviesMock.trending,
  topRated: moviesMock.popularMovies,
  airing: moviesMock.popularTV,
  india: moviesMock.trending,
};
