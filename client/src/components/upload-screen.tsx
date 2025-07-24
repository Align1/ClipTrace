import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SearchHistory } from "@shared/schema";
import type { AnalysisResult } from "@/pages/home";

interface UploadScreenProps {
  onStartAnalysis: (file?: File) => void;
  searchHistory: SearchHistory[];
}

export default function UploadScreen({ onStartAnalysis, searchHistory }: UploadScreenProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const { toast } = useToast();

  const analyzeUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/analyze-url", { url });
      return response.json() as Promise<AnalysisResult>;
    },
    onSuccess: (result) => {
      onStartAnalysis();
      // The LoadingScreen will handle the actual result display
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze video URL",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a video file (MP4, MOV, AVI)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB
        toast({
          title: "File Too Large",
          description: "Please upload a video file smaller than 100MB",
          variant: "destructive",
        });
        return;
      }

      onStartAnalysis(file);
    }
  };

  const handleUrlSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && videoUrl.trim()) {
      analyzeUrlMutation.mutate(videoUrl.trim());
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="px-6 py-8 bg-gradient-to-br from-[hsl(142,76%,36%)] to-emerald-600">
        <div className="text-center text-white">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Discover Any Movie</h1>
          <p className="text-emerald-100 text-sm">Upload a short video clip and instantly find which movie it's from</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-6 space-y-6">
        {/* Upload Methods */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">Choose Upload Method</h3>
          
          {/* Video Upload */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[hsl(142,76%,36%)] transition-colors cursor-pointer"
            onClick={() => document.getElementById('videoFile')?.click()}
          >
            <svg className="w-12 h-12 mx-auto mb-4 brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h4 className="font-semibold text-gray-900 mb-2">Upload Video File</h4>
            <p className="text-sm brand-gray mb-4">Drag & drop or click to select<br />MP4, MOV, AVI (max 100MB)</p>
            <button className="brand-green text-white px-6 py-2 rounded-lg font-medium">
              Choose File
            </button>
            <input 
              type="file" 
              id="videoFile" 
              accept="video/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>

          {/* URL Input */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <svg className="w-5 h-5 text-[hsl(142,76%,36%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h4 className="font-semibold text-gray-900">Paste Video Link</h4>
            </div>
            <input 
              type="url" 
              placeholder="https://youtube.com/shorts/..." 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[hsl(142,76%,36%)] focus:border-transparent"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={handleUrlSubmit}
              disabled={analyzeUrlMutation.isPending}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">YouTube</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">TikTok</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Instagram</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Facebook</span>
            </div>
          </div>
        </div>

        {/* Recent Searches */}
        {searchHistory.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Recent Searches</h3>
            <div className="space-y-2">
              {searchHistory.slice(0, 3).map((search) => (
                <div 
                  key={search.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {search.fileName || search.videoUrl?.slice(0, 30) + '...' || 'Unknown clip'}
                    </p>
                    <p className="text-xs brand-gray">
                      {search.createdAt ? formatTimeAgo(new Date(search.createdAt)) : 'Unknown time'}
                    </p>
                  </div>
                  <svg className="w-4 h-4 brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
