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
    
    this.seedData();
  }

  private seedData() {
    // Seed with John Wick movie data
    const johnWick: Movie = {
      id: this.currentMovieId++,
      title: "John Wick",
      year: 2014,
      director: "Chad Stahelski",
      genre: "Action, Thriller",
      rating: "R",
      imdbRating: "7.4",
      poster: "https://images.unsplash.com/photo-1489599032470-841ea88893b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
      description: "An ex-hit-man comes out of retirement to track down the gangsters that took everything from him.",
      cast: [
        { name: "Keanu Reeves", character: "John Wick", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
        { name: "Bridget Moynahan", character: "Helen", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
        { name: "Ian McShane", character: "Winston", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" }
      ],
      platforms: [
        { name: "Netflix", type: "subscription", available: true },
        { name: "Prime Video", type: "rental", price: "Rent $3.99 | Buy $12.99", available: true },
        { name: "Hulu", type: "subscription", available: true }
      ]
    };
    
    this.movies.set(johnWick.id, johnWick);
    
    const scene: Scene = {
      id: this.currentSceneId++,
      movieId: johnWick.id,
      timestamp: "1:23:45 - 1:24:15",
      description: "Continental Hotel Fight",
      chapter: "Final Confrontation",
      fingerprint: "sample_fingerprint_hash"
    };
    
    this.scenes.set(scene.id, scene);
    
    // Add some recent searches
    const search1: SearchHistory = {
      id: this.currentSearchId++,
      fileName: "action_scene_clip.mp4",
      movieId: johnWick.id,
      confidence: "97.0",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      videoUrl: null
    };
    
    const search2: SearchHistory = {
      id: this.currentSearchId++,
      fileName: "romantic_dialogue.mp4",
      movieId: null,
      confidence: null,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      videoUrl: null
    };
    
    this.searchHistories.set(search1.id, search1);
    this.searchHistories.set(search2.id, search2);
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
    const newMovie: Movie = { ...movie, id };
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

    // Return mock match to John Wick
    const movieId = Array.from(this.movies.values())[0]?.id || 1;
    const sceneId = Array.from(this.scenes.values())[0]?.id || 1;
    
    return {
      movieId,
      confidence: 97,
      sceneId
    };
  }
}

export const storage = new MemStorage();
