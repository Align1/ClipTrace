import type { Movie, InsertMovie } from "@shared/schema";

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  adult: boolean;
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  runtime: number | null;
  director?: string;
  cast?: { name: string; character: string; profile_path: string | null }[];
  watch_providers?: any;
}

interface TMDBCredits {
  cast: {
    name: string;
    character: string;
    profile_path: string | null;
  }[];
  crew: {
    name: string;
    job: string;
    department: string;
  }[];
}

export class TMDBService {
  private apiKey: string;
  private baseUrl = "https://api.themoviedb.org/3";
  private imageBaseUrl = "https://image.tmdb.org/t/p/w500";
  private profileBaseUrl = "https://image.tmdb.org/t/p/w185";
  private isEnabled: boolean;

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    this.isEnabled = !!this.apiKey;
    
    if (!this.isEnabled) {
      console.warn('TMDB_API_KEY not found. TMDB features will be disabled and fallback to mock data.');
    }
  }

  private async fetchFromTMDB(endpoint: string): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('TMDB service is disabled');
    }
    
    const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText} for ${url}`);
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async searchMovies(query: string): Promise<Movie[]> {
    try {
      const data = await this.fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}`);
      return data.results.slice(0, 10).map((movie: TMDBMovie) => this.transformMovie(movie));
    } catch (error) {
      console.error('Error searching movies:', error);
      return this.getFallbackMovies().filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async getMovieById(tmdbId: number): Promise<Movie | null> {
    try {
      const [movieData, creditsData] = await Promise.all([
        this.fetchFromTMDB(`/movie/${tmdbId}`),
        this.fetchFromTMDB(`/movie/${tmdbId}/credits`)
      ]);

      return this.transformDetailedMovie(movieData, creditsData);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  async getPopularMovies(): Promise<Movie[]> {
    try {
      const data = await this.fetchFromTMDB('/movie/popular');
      return data.results.slice(0, 20).map((movie: TMDBMovie) => this.transformMovie(movie));
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return this.getFallbackMovies();
    }
  }

  private transformMovie(tmdbMovie: TMDBMovie): Movie {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 0,
      director: "Unknown", // Will be filled in detailed view
      genre: "Unknown", // Will be filled in detailed view  
      rating: tmdbMovie.adult ? "R" : "PG-13",
      imdbRating: tmdbMovie.vote_average.toFixed(1),
      poster: tmdbMovie.poster_path ? `${this.imageBaseUrl}${tmdbMovie.poster_path}` : null,
      description: tmdbMovie.overview,
      cast: [], // Will be filled in detailed view
      platforms: this.getMockPlatforms()
    };
  }

  private transformDetailedMovie(movieData: TMDBMovieDetails, creditsData: TMDBCredits): Movie {
    const director = creditsData.crew.find(person => person.job === 'Director')?.name || "Unknown";
    const genres = movieData.genres.map(g => g.name).join(', ') || "Unknown";
    
    const cast = creditsData.cast.slice(0, 10).map(actor => ({
      name: actor.name,
      character: actor.character,
      image: actor.profile_path ? `${this.profileBaseUrl}${actor.profile_path}` : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400"
    }));

    return {
      id: movieData.id,
      title: movieData.title,
      year: movieData.release_date ? new Date(movieData.release_date).getFullYear() : 0,
      director,
      genre: genres,
      rating: movieData.runtime && movieData.runtime > 120 ? "R" : "PG-13", // Simple heuristic
      imdbRating: movieData.vote_average.toFixed(1),
      poster: movieData.poster_path ? `${this.imageBaseUrl}${movieData.poster_path}` : null,
      description: movieData.overview,
      cast,
      platforms: this.getMockPlatforms()
    };
  }

  private getMockPlatforms() {
    // In a real app, you'd integrate with JustWatch API or similar
    const allPlatforms = [
      { name: "Netflix", type: "subscription", available: true },
      { name: "Prime Video", type: "rental", price: "Rent $3.99 | Buy $12.99", available: true },
      { name: "Hulu", type: "subscription", available: true },
      { name: "Disney+", type: "subscription", available: true },
      { name: "HBO Max", type: "subscription", available: true },
      { name: "Apple TV+", type: "rental", price: "Rent $4.99 | Buy $14.99", available: true }
    ];

    // Randomly select 2-4 platforms
    const shuffled = allPlatforms.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  async getRandomPopularMovie(): Promise<Movie | null> {
    try {
      const movies = await this.getPopularMovies();
      if (movies.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * movies.length);
      const selectedMovie = movies[randomIndex];
      
      // Get full details for the selected movie
      return await this.getMovieById(selectedMovie.id);
    } catch (error) {
      console.error('Error getting random movie:', error);
      const fallbackMovies = this.getFallbackMovies();
      if (fallbackMovies.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackMovies.length);
        return fallbackMovies[randomIndex];
      }
      return null;
    }
  }

  private getFallbackMovies(): Movie[] {
    return [
      {
        id: 550,
        title: "Fight Club",
        year: 1999,
        director: "David Fincher",
        genre: "Drama",
        rating: "R",
        imdbRating: "8.8",
        poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into an anarchist organization.",
        cast: [
          { name: "Brad Pitt", character: "Tyler Durden", image: "https://image.tmdb.org/t/p/w185/cckcYc2v0yh1tc9QjRelptcOBko.jpg" },
          { name: "Edward Norton", character: "The Narrator", image: "https://image.tmdb.org/t/p/w185/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg" },
          { name: "Helena Bonham Carter", character: "Marla Singer", image: "https://image.tmdb.org/t/p/w185/DDeITcCpnBd0CkAIRPhggy9bt5.jpg" }
        ],
        platforms: this.getMockPlatforms()
      },
      {
        id: 155,
        title: "The Dark Knight",
        year: 2008,
        director: "Christopher Nolan",
        genre: "Action, Crime, Drama",
        rating: "PG-13",
        imdbRating: "9.0",
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        cast: [
          { name: "Christian Bale", character: "Bruce Wayne / Batman", image: "https://image.tmdb.org/t/p/w185/vecCuUwdcCwCzNqTAUhqnHktNte.jpg" },
          { name: "Heath Ledger", character: "The Joker", image: "https://image.tmdb.org/t/p/w185/5Y9HnYYa9jF4NunY9lSgJGjSe8E.jpg" },
          { name: "Aaron Eckhart", character: "Harvey Dent / Two-Face", image: "https://image.tmdb.org/t/p/w185/keMg4eNjgcSQP7xjBzOJx4CyEG.jpg" }
        ],
        platforms: this.getMockPlatforms()
      },
      {
        id: 13,
        title: "Forrest Gump",
        year: 1994,
        director: "Robert Zemeckis",
        genre: "Drama, Romance",
        rating: "PG-13",
        imdbRating: "8.8",
        poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
        cast: [
          { name: "Tom Hanks", character: "Forrest Gump", image: "https://image.tmdb.org/t/p/w185/xndWFsBlClOJFRdhSt4NBwiPq2o.jpg" },
          { name: "Robin Wright", character: "Jenny Curran", image: "https://image.tmdb.org/t/p/w185/sQsf6vWL73p2JmKlVjnMAmRYSdL.jpg" },
          { name: "Gary Sinise", character: "Lieutenant Dan Taylor", image: "https://image.tmdb.org/t/p/w185/7ZhpoHwq3m0F3qslEvGKXPi6OhY.jpg" }
        ],
        platforms: this.getMockPlatforms()
      },
      {
        id: 122,
        title: "The Lord of the Rings: The Return of the King",
        year: 2003,
        director: "Peter Jackson",
        genre: "Adventure, Drama, Fantasy",
        rating: "PG-13",
        imdbRating: "9.0",
        poster: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
        description: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
        cast: [
          { name: "Elijah Wood", character: "Frodo Baggins", image: "https://image.tmdb.org/t/p/w185/7UKRbJBNG7mxBl2QQc5XsAh6F8B.jpg" },
          { name: "Ian McKellen", character: "Gandalf", image: "https://image.tmdb.org/t/p/w185/coJJDqeHJSVU5cBBd7kJR3k9PFx.jpg" },
          { name: "Viggo Mortensen", character: "Aragorn", image: "https://image.tmdb.org/t/p/w185/vH5gVSpHAMhDaFWfh0Q7BG61O1y.jpg" }
        ],
        platforms: this.getMockPlatforms()
      },
      {
        id: 680,
        title: "Pulp Fiction",
        year: 1994,
        director: "Quentin Tarantino",
        genre: "Crime, Drama",
        rating: "R",
        imdbRating: "8.9",
        poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        cast: [
          { name: "John Travolta", character: "Vincent Vega", image: "https://image.tmdb.org/t/p/w185/9GVufE87MMIrSn0CbJFLudkALdL.jpg" },
          { name: "Uma Thurman", character: "Mia Wallace", image: "https://image.tmdb.org/t/p/w185/xuxgPXyv6KjUHIM8cZaxx4ry25L.jpg" },
          { name: "Samuel L. Jackson", character: "Jules Winnfield", image: "https://image.tmdb.org/t/p/w185/AiAYAqwpM5xmiFrAIeQvUXDCVvo.jpg" }
        ],
        platforms: this.getMockPlatforms()
      }
    ];
  }
}

export const tmdbService = new TMDBService();