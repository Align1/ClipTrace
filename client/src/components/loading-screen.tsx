import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@/pages/home";

interface LoadingScreenProps {
  uploadedFile: File | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onBack: () => void;
}

export default function LoadingScreen({ uploadedFile, onAnalysisComplete, onBack }: LoadingScreenProps) {
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      const uploadResponse = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const { uploadId } = await uploadResponse.json();
      
      const analysisResponse = await apiRequest("POST", `/api/analyze-video/${uploadId}`, {});
      return analysisResponse.json() as Promise<AnalysisResult>;
    },
    onSuccess: onAnalysisComplete,
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze video",
        variant: "destructive",
      });
      onBack();
    },
  });

  useEffect(() => {
    if (uploadedFile) {
      uploadMutation.mutate(uploadedFile);
    }
  }, [uploadedFile]);

  return (
    <div className="px-6 py-8 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 mr-3 brand-gray hover:text-brand-dark">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Analyzing Video</h2>
      </div>

      {/* Video Preview */}
      <div className="mb-8">
        <div className="bg-black rounded-xl overflow-hidden relative">
          <div className="aspect-video flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <p className="text-sm">
                {uploadedFile ? `Uploaded: ${uploadedFile.name}` : 'Video Preview'}
              </p>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
            0:15
          </div>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="flex-1 space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-full h-full border-4 border-[hsl(142,76%,36%)] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 brand-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Finding Your Movie...</h3>
          <p className="text-sm brand-gray">This usually takes 5-15 seconds</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 brand-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Video uploaded successfully</p>
              <p className="text-xs brand-gray">Completed</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 brand-green rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">AI analysis in progress</p>
              <p className="text-xs brand-gray">Analyzing frames and audio...</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 opacity-50">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8L7 4z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-600 text-sm">Matching against movie database</p>
              <p className="text-xs brand-gray">Pending...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <button 
        onClick={onBack}
        className="w-full py-3 brand-gray font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        disabled={uploadMutation.isPending}
      >
        Cancel Analysis
      </button>
    </div>
  );
}
