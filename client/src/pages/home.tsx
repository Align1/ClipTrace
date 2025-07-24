import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UploadScreen from "@/components/upload-screen";
import LoadingScreen from "@/components/loading-screen";
import ResultsScreen from "@/components/results-screen";
import BottomNavigation from "@/components/bottom-navigation";
import type { Movie, Scene, SearchHistory } from "@shared/schema";

export type AnalysisResult = {
  movie: Movie;
  scene: Scene;
  confidence: number;
  uploadId: number;
};

export type AppScreen = "upload" | "loading" | "results";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("upload");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { data: searchHistory = [] } = useQuery<SearchHistory[]>({
    queryKey: ["/api/search-history"],
  });

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentScreen("results");
  };

  const handleStartAnalysis = (file?: File) => {
    if (file) {
      setUploadedFile(file);
    }
    setCurrentScreen("loading");
  };

  const handleBackToUpload = () => {
    setCurrentScreen("upload");
    setAnalysisResult(null);
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 brand-green rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold brand-dark">ClipTrace</span>
          </div>
          <button className="p-2 brand-gray hover:text-brand-dark transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main App Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {currentScreen === "upload" && (
          <UploadScreen 
            onStartAnalysis={handleStartAnalysis}
            searchHistory={searchHistory}
          />
        )}
        
        {currentScreen === "loading" && (
          <LoadingScreen
            uploadedFile={uploadedFile}
            onAnalysisComplete={handleAnalysisComplete}
            onBack={handleBackToUpload}
          />
        )}
        
        {currentScreen === "results" && analysisResult && (
          <ResultsScreen
            result={analysisResult}
            onBack={handleBackToUpload}
          />
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
