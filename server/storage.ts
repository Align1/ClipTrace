import { 
  users, 
  movies, 
  scenes, 
  searchHistory, 
  videoUploads,
  type User, 
  type InsertUser,
  type Movie,
  type InsertMovie,
  type Scene,
  type InsertScene,
  type SearchHistory,
  type InsertSearchHistory,
  type VideoUpload,
  type InsertVideoUpload
} from "@shared/schema";
import { tmdbService } from "./tmdb-service";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getMovie(id: number): Promise<Movie | undefined>;
  getMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  getScene(id: number): Promise<Scene | undefined>;
  getScenesByMovieId(movieId: number): Promise<Scene[]>;
  createScene(scene: InsertScene): Promise<Scene>;
  
  getSearchHistory(): Promise<SearchHistory[]>;
  createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
  
  createVideoUpload(upload: InsertVideoUpload): Promise<VideoUpload>;
  getVideoUpload(id: number): Promise<VideoUpload | undefined>;
  
  analyzeVideo(videoId: number): Promise<{ movieId: number; confidence: number; sceneId: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie || undefined;
  }

  async getMovies(): Promise<Movie[]> {
    return await db.select().from(movies);
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [newMovie] = await db
      .insert(movies)
      .values(movie)
      .returning();
    return newMovie;
  }

  async getScene(id: number): Promise<Scene | undefined> {
    const [scene] = await db.select().from(scenes).where(eq(scenes.id, id));
    return scene || undefined;
  }

  async getScenesByMovieId(movieId: number): Promise<Scene[]> {
    return await db.select().from(scenes).where(eq(scenes.movieId, movieId));
  }

  async createScene(scene: InsertScene): Promise<Scene> {
    const [newScene] = await db
      .insert(scenes)
      .values({
        ...scene,
        chapter: scene.chapter ?? null,
        fingerprint: scene.fingerprint ?? null
      })
      .returning();
    return newScene;
  }

  async getSearchHistory(): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .orderBy(desc(searchHistory.createdAt));
  }

  async createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory> {
    const [newSearch] = await db
      .insert(searchHistory)
      .values({
        ...search,
        videoUrl: search.videoUrl ?? null,
        fileName: search.fileName ?? null,
        movieId: search.movieId ?? null,
        confidence: search.confidence ?? null
      })
      .returning();
    return newSearch;
  }

  async createVideoUpload(upload: InsertVideoUpload): Promise<VideoUpload> {
    const [newUpload] = await db
      .insert(videoUploads)
      .values({
        ...upload,
        duration: upload.duration ?? null
      })
      .returning();
    return newUpload;
  }

  async getVideoUpload(id: number): Promise<VideoUpload | undefined> {
    const [upload] = await db.select().from(videoUploads).where(eq(videoUploads.id, id));
    return upload || undefined;
  }

  async analyzeVideo(videoId: number): Promise<{ movieId: number; confidence: number; sceneId: number }> {
    // Mock analysis - in reality this would use video fingerprinting APIs
    const upload = await this.getVideoUpload(videoId);
    if (!upload) {
      throw new Error("Video upload not found");
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get a random popular movie from TMDB instead of using mock data
    const movie = await tmdbService.getRandomPopularMovie();
    if (!movie) {
      throw new Error("Failed to fetch movie data");
    }

    // Store the movie in the database
    const existingMovie = await this.getMovie(movie.id);
    let movieRecord: Movie;
    
    if (!existingMovie) {
      movieRecord = await this.createMovie({
        title: movie.title,
        year: movie.year,
        director: movie.director,
        genre: movie.genre,
        rating: movie.rating,
        imdbRating: movie.imdbRating,
        poster: movie.poster,
        description: movie.description,
        cast: movie.cast,
        platforms: movie.platforms
      });
    } else {
      movieRecord = existingMovie;
    }

    // Create a mock scene for this movie
    const scene = await this.createScene({
      movieId: movieRecord.id,
      timestamp: this.getRandomTimestamp(),
      description: this.getRandomSceneDescription(),
      chapter: "Random Scene",
      fingerprint: `tmdb_${movieRecord.id}_${Date.now()}`
    });
    
    return {
      movieId: movieRecord.id,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99% confidence
      sceneId: scene.id
    };
  }

  private getRandomTimestamp(): string {
    const hours = Math.floor(Math.random() * 2) + 1; // 1-2 hours
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    const endSeconds = seconds + 30;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${hours}:${minutes.toString().padStart(2, '0')}:${endSeconds.toString().padStart(2, '0')}`;
  }

  private getRandomSceneDescription(): string {
    const descriptions = [
      "Intense action sequence",
      "Dramatic confrontation",
      "Emotional dialogue scene",
      "Chase sequence",
      "Climactic battle",
      "Character introduction",
      "Plot twist reveal",
      "Romantic moment",
      "Suspenseful investigation",
      "Final showdown"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  private scenes: Map<number, Scene>;
  private searchHistories: Map<number, SearchHistory>;
  private videoUploads: Map<number, VideoUpload>;
  private currentUserId: number;
  private currentMovieId: number;
  private currentSceneId: number;
  private currentSearchId: number;
  private currentUploadId: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.scenes = new Map();
    this.searchHistories = new Map();
    this.videoUploads = new Map();
    this.currentUserId = 1;
    this.currentMovieId = 1;
    this.currentSceneId = 1;
    this.currentSearchId = 1;
    this.currentUploadId = 1;
    
    // Seed data asynchronously
    this.seedData().catch(console.error);
  }

  private async seedData() {
    try {
      // Seed with real movie data from TMDB
      const popularMovies = await tmdbService.getPopularMovies();
      
      if (popularMovies.length > 0) {
        // Add first few popular movies to our cache
        popularMovies.slice(0, 3).forEach(movie => {
          this.movies.set(movie.id, movie);
          
          // Create sample scenes for each movie
          const scene: Scene = {
            id: this.currentSceneId++,
            movieId: movie.id,
            timestamp: this.getRandomTimestamp(),
            description: this.getRandomSceneDescription(),
            chapter: "Opening Scene",
            fingerprint: `tmdb_${movie.id}_seed`
          };
          
          this.scenes.set(scene.id, scene);
        });

        // Add some sample search history
        const recentMovie = popularMovies[0];
        const search1: SearchHistory = {
          id: this.currentSearchId++,
          fileName: "movie_clip_sample.mp4",
          movieId: recentMovie.id,
          confidence: "94.0",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          videoUrl: null
        };
        
        const search2: SearchHistory = {
          id: this.currentSearchId++,
          fileName: "unknown_scene.mp4",
          movieId: null,
          confidence: null,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          videoUrl: null
        };
        
        this.searchHistories.set(search1.id, search1);
        this.searchHistories.set(search2.id, search2);
      }
    } catch (error) {
      console.error('Error seeding data from TMDB:', error);
      // Fall back to minimal seed data if TMDB fails
      const search: SearchHistory = {
        id: this.currentSearchId++,
        fileName: "sample_clip.mp4",
        movieId: null,
        confidence: null,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        videoUrl: null
      };
      this.searchHistories.set(search.id, search);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const id = this.currentMovieId++;
    const newMovie: Movie = { 
      ...movie, 
      id,
      imdbRating: movie.imdbRating ?? null,
      poster: movie.poster ?? null,
      description: movie.description ?? null,
      cast: movie.cast ?? null,
      platforms: movie.platforms ?? null
    };
    this.movies.set(id, newMovie);
    return newMovie;
  }

  async getScene(id: number): Promise<Scene | undefined> {
    return this.scenes.get(id);
  }

  async getScenesByMovieId(movieId: number): Promise<Scene[]> {
    return Array.from(this.scenes.values()).filter(scene => scene.movieId === movieId);
  }

  async createScene(scene: InsertScene): Promise<Scene> {
    const id = this.currentSceneId++;
    const newScene: Scene = { ...scene, id };
    this.scenes.set(id, newScene);
    return newScene;
  }

  async getSearchHistory(): Promise<SearchHistory[]> {
    return Array.from(this.searchHistories.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.currentSearchId++;
    const newSearch: SearchHistory = { 
      ...search, 
      id, 
      createdAt: new Date() 
    };
    this.searchHistories.set(id, newSearch);
    return newSearch;
  }

  async createVideoUpload(upload: InsertVideoUpload): Promise<VideoUpload> {
    const id = this.currentUploadId++;
    const newUpload: VideoUpload = { 
      ...upload, 
      id, 
      createdAt: new Date() 
    };
    this.videoUploads.set(id, newUpload);
    return newUpload;
  }

  async getVideoUpload(id: number): Promise<VideoUpload | undefined> {
    return this.videoUploads.get(id);
  }

  async analyzeVideo(videoId: number): Promise<{ movieId: number; confidence: number; sceneId: number }> {
    // Mock analysis - in reality this would use video fingerprinting APIs
    const upload = this.videoUploads.get(videoId);
    if (!upload) {
      throw new Error("Video upload not found");
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get a random popular movie from TMDB instead of using mock data
    const movie = await tmdbService.getRandomPopularMovie();
    if (!movie) {
      throw new Error("Failed to fetch movie data");
    }

    // Store the movie in our local cache
    this.movies.set(movie.id, movie);

    // Create a mock scene for this movie
    const scene: Scene = {
      id: this.currentSceneId++,
      movieId: movie.id,
      timestamp: this.getRandomTimestamp(),
      description: this.getRandomSceneDescription(),
      chapter: "Random Scene",
      fingerprint: `tmdb_${movie.id}_${Date.now()}`
    };
    
    this.scenes.set(scene.id, scene);
    
    return {
      movieId: movie.id,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99% confidence
      sceneId: scene.id
    };
  }

  private getRandomTimestamp(): string {
    const hours = Math.floor(Math.random() * 2) + 1; // 1-2 hours
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    const endSeconds = seconds + 30;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${hours}:${minutes.toString().padStart(2, '0')}:${endSeconds.toString().padStart(2, '0')}`;
  }

  private getRandomSceneDescription(): string {
    const descriptions = [
      "Intense action sequence",
      "Dramatic confrontation",
      "Emotional dialogue scene",
      "Chase sequence",
      "Climactic battle",
      "Character introduction",
      "Plot twist reveal",
      "Romantic moment",
      "Suspenseful investigation",
      "Final showdown"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
}

export const storage = new DatabaseStorage();
