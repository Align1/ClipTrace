import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { tmdbService } from "./tmdb-service";
import { insertVideoUploadSchema, insertSearchHistorySchema } from "@shared/schema";

// Extend Request type for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get search history
  app.get("/api/search-history", async (req, res) => {
    try {
      const history = await storage.getSearchHistory();
      res.json(history);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  // Upload video file
  app.post("/api/upload-video", upload.single('video'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const videoUpload = await storage.createVideoUpload({
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        duration: null // Would be extracted from video metadata
      });

      res.json({ uploadId: videoUpload.id });
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Analyze video by URL
  app.post("/api/analyze-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "Video URL is required" });
      }

      // Mock processing for URL
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock upload record for URL
      const videoUpload = await storage.createVideoUpload({
        fileName: `url_video_${Date.now()}.mp4`,
        filePath: url,
        fileSize: 0,
        mimeType: "video/mp4",
        duration: null
      });

      const analysis = await storage.analyzeVideo(videoUpload.id);
      
      // Get movie and scene details
      const movie = await storage.getMovie(analysis.movieId);
      const scene = await storage.getScene(analysis.sceneId);

      if (!movie || !scene) {
        return res.status(404).json({ message: "Movie or scene not found" });
      }

      // Create search history record
      await storage.createSearchHistory({
        videoUrl: url,
        fileName: null,
        movieId: analysis.movieId,
        confidence: analysis.confidence.toString()
      });

      res.json({
        movie,
        scene,
        confidence: analysis.confidence,
        uploadId: videoUpload.id
      });
    } catch (error) {
      console.error("Error analyzing video URL:", error);
      res.status(500).json({ message: "Failed to analyze video URL" });
    }
  });

  // Analyze uploaded video
  app.post("/api/analyze-video/:uploadId", async (req, res) => {
    try {
      const uploadId = parseInt(req.params.uploadId);
      
      if (isNaN(uploadId)) {
        return res.status(400).json({ message: "Invalid upload ID" });
      }

      const videoUpload = await storage.getVideoUpload(uploadId);
      if (!videoUpload) {
        return res.status(404).json({ message: "Video upload not found" });
      }

      const analysis = await storage.analyzeVideo(uploadId);
      
      // Get movie and scene details
      const movie = await storage.getMovie(analysis.movieId);
      const scene = await storage.getScene(analysis.sceneId);

      if (!movie || !scene) {
        return res.status(404).json({ message: "Movie or scene not found" });
      }

      // Create search history record
      await storage.createSearchHistory({
        videoUrl: null,
        fileName: videoUpload.fileName,
        movieId: analysis.movieId,
        confidence: analysis.confidence.toString()
      });

      res.json({
        movie,
        scene,
        confidence: analysis.confidence,
        uploadId
      });
    } catch (error) {
      console.error("Error analyzing video:", error);
      res.status(500).json({ message: "Failed to analyze video" });
    }
  });

  // Get movie details
  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      const movie = await storage.getMovie(movieId);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      const scenes = await storage.getScenesByMovieId(movieId);
      
      res.json({ movie, scenes });
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie details" });
    }
  });

  // Get all movies
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  // Search movies via TMDB
  app.get("/api/search/movies", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const movies = await tmdbService.searchMovies(q);
      res.json(movies);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
