# ClipTrace - Movie Scene Recognition App

## Overview

ClipTrace is a mobile-first web application that allows users to upload or link short video clips (from platforms like TikTok, Reels, YouTube Shorts) and instantly discover which movie they're from using AI-powered video and audio recognition. The app provides rich movie details, scene information, and streaming platform availability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints for video upload, analysis, and search history
- **File Upload**: Multer middleware for handling video file uploads (up to 100MB)
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **File Storage**: Local filesystem for uploaded videos (uploads/ directory)

## Key Components

### Video Processing Pipeline
1. **Upload Handler**: Accepts video files or URLs from social media platforms
2. **Analysis Engine**: Placeholder for AI-powered scene matching (currently mock implementation)
3. **Result Generation**: Returns movie matches with confidence scores

### User Interface Components
- **Upload Screen**: Drag-and-drop file upload or URL input
- **Loading Screen**: Progress indicator during video analysis
- **Results Screen**: Movie details, scene information, and streaming options
- **Bottom Navigation**: Mobile navigation for search, history, saved items, and profile

### Database Schema
- **Users**: User account management
- **Movies**: Complete movie information including cast, platforms, and metadata
- **Scenes**: Individual movie scenes with timestamps and descriptions
- **Search History**: User search tracking and analytics
- **Video Uploads**: Uploaded file metadata and processing status

## Data Flow

1. **User Input**: Upload video file or paste social media URL
2. **File Processing**: Server validates and stores uploaded content
3. **Analysis Request**: Video sent to analysis engine (placeholder for AI service)
4. **Scene Matching**: AI identifies movie scenes and generates confidence scores
5. **Result Display**: Movie information, scene details, and streaming options presented
6. **History Tracking**: Search results saved for future reference

## External Dependencies

### UI Framework
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Database & ORM
- **Drizzle ORM**: Type-safe database queries and migrations
- **Neon Database**: Serverless PostgreSQL for production deployment
- **connect-pg-simple**: PostgreSQL session store for Express

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static typing for improved developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Future AI Integration
- Placeholder for computer vision APIs (OpenAI CLIP, custom CNN models)
- Audio fingerprinting services for soundtrack/dialogue matching
- Streaming platform APIs for real-time availability data

## Deployment Strategy

### Development Environment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Hot Reload**: Automatic browser refresh during development
- **Error Overlay**: Runtime error display for debugging

### Production Build
- **Client Build**: Vite builds optimized React application to `dist/public`
- **Server Build**: ESBuild bundles Express server to `dist/index.js`
- **Static Assets**: Served directly by Express in production

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Management**: Secure session handling with PostgreSQL backing
- **File Upload**: Configurable upload limits and validation

### Scalability Considerations
- Memory-based storage implementation included for development/testing
- Database schema designed for horizontal scaling
- Modular architecture supports microservices migration
- CDN-ready static asset structure for global content delivery