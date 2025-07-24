import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  director: text("director").notNull(),
  genre: text("genre").notNull(),
  rating: text("rating").notNull(),
  imdbRating: decimal("imdb_rating", { precision: 3, scale: 1 }),
  poster: text("poster"),
  description: text("description"),
  cast: jsonb("cast").$type<Array<{ name: string; character: string; image: string }>>(),
  platforms: jsonb("platforms").$type<Array<{ name: string; type: string; price?: string; available: boolean }>>(),
});

export const scenes = pgTable("scenes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  timestamp: text("timestamp").notNull(),
  description: text("description").notNull(),
  chapter: text("chapter"),
  fingerprint: text("fingerprint"),
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  videoUrl: text("video_url"),
  fileName: text("file_name"),
  movieId: integer("movie_id"),
  confidence: decimal("confidence", { precision: 3, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoUploads = pgTable("video_uploads", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const moviesRelations = relations(movies, ({ many }) => ({
  scenes: many(scenes),
  searchHistory: many(searchHistory),
}));

export const scenesRelations = relations(scenes, ({ one }) => ({
  movie: one(movies, {
    fields: [scenes.movieId],
    references: [movies.id],
  }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  movie: one(movies, {
    fields: [searchHistory.movieId],
    references: [movies.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
});

export const insertSceneSchema = createInsertSchema(scenes).omit({
  id: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});

export const insertVideoUploadSchema = createInsertSchema(videoUploads).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Scene = typeof scenes.$inferSelect;
export type InsertScene = z.infer<typeof insertSceneSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type VideoUpload = typeof videoUploads.$inferSelect;
export type InsertVideoUpload = z.infer<typeof insertVideoUploadSchema>;
