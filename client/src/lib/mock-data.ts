import type { Movie, Scene } from "@shared/schema";

export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "John Wick",
    year: 2014,
    director: "Chad Stahelski",
    genre: "Action, Thriller",
    rating: "R",
    imdbRating: "7.4",
    poster: "https://images.unsplash.com/photo-1489599032470-841ea88893b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
    description: "An ex-hit-man comes out of retirement to track down the gangsters that took everything from him.",
    cast: [
      {
        name: "Keanu Reeves",
        character: "John Wick",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400"
      },
      {
        name: "Bridget Moynahan",
        character: "Helen",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400"
      },
      {
        name: "Ian McShane",
        character: "Winston",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400"
      }
    ],
    platforms: [
      { name: "Netflix", type: "subscription", available: true },
      { name: "Prime Video", type: "rental", price: "Rent $3.99 | Buy $12.99", available: true },
      { name: "Hulu", type: "subscription", available: true }
    ]
  }
];

export const mockScenes: Scene[] = [
  {
    id: 1,
    movieId: 1,
    timestamp: "1:23:45 - 1:24:15",
    description: "Continental Hotel Fight",
    chapter: "Final Confrontation",
    fingerprint: "sample_fingerprint_hash"
  }
];
