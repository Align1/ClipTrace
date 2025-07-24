import type { AnalysisResult } from "@/pages/home";

interface ResultsScreenProps {
  result: AnalysisResult;
  onBack: () => void;
}

export default function ResultsScreen({ result, onBack }: ResultsScreenProps) {
  const { movie, scene, confidence } = result;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center px-6 py-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 mr-3 brand-gray hover:text-brand-dark">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Match Found!</h2>
        <div className="ml-auto flex space-x-2">
          <button className="p-2 brand-gray hover:text-brand-dark">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          <button className="p-2 brand-gray hover:text-brand-dark">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Match Confidence */}
      <div className="px-6 py-4 bg-green-50 border-b border-green-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">High Confidence Match</p>
            <p className="text-sm text-green-700">{confidence}% accuracy • Scene identified</p>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="px-6 py-6">
        <div className="flex space-x-4 mb-6">
          <img 
            src={movie.poster || "https://images.unsplash.com/photo-1489599032470-841ea88893b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"} 
            alt={`${movie.title} poster`}
            className="w-24 h-36 rounded-lg shadow-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{movie.title}</h3>
            <div className="space-y-1 text-sm brand-gray mb-4">
              <p><span className="font-medium">Year:</span> {movie.year}</p>
              <p><span className="font-medium">Director:</span> {movie.director}</p>
              <p><span className="font-medium">Genre:</span> {movie.genre}</p>
              <p><span className="font-medium">Rating:</span> {movie.rating}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{movie.imdbRating}</span>
              </div>
              <span className="text-xs brand-gray">IMDb</span>
            </div>
          </div>
        </div>

        {/* Scene Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Scene Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="brand-gray">Timestamp:</span>
              <span className="font-medium">{scene.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="brand-gray">Scene:</span>
              <span className="font-medium">{scene.description}</span>
            </div>
            {scene.chapter && (
              <div className="flex justify-between">
                <span className="brand-gray">Chapter:</span>
                <span className="font-medium">{scene.chapter}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scene Preview */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Scene Preview</h4>
          <div className="bg-black rounded-xl overflow-hidden relative">
            <div className="aspect-video flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <p className="text-sm">Official Scene Preview</p>
              </div>
            </div>
            <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
            </button>
            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Preview: 0:30
            </div>
          </div>
        </div>

        {/* Watch Now Options */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Watch Now</h4>
          
          {movie.platforms && movie.platforms.length > 0 && (
            <div className="space-y-3">
              {movie.platforms.slice(0, 3).map((platform, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                      platform.name === 'Netflix' ? 'bg-red-600' :
                      platform.name === 'Prime Video' ? 'bg-blue-600' :
                      platform.name === 'Hulu' ? 'bg-purple-600' :
                      'bg-gray-600'
                    }`}>
                      {platform.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{platform.name}</p>
                      <p className={`text-xs ${
                        platform.type === 'subscription' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {platform.type === 'subscription' 
                          ? 'Available with subscription' 
                          : platform.price || 'Rental available'
                        }
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              ))}

              <button className="w-full py-3 text-[hsl(142,76%,36%)] font-medium border border-[hsl(142,76%,36%)] rounded-lg hover:bg-[hsl(142,76%,36%)] hover:text-white transition-colors">
                View All {movie.platforms.length} Platforms
              </button>
            </div>
          )}
        </div>

        {/* Cast & Crew */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mt-8 space-y-4">
            <h4 className="font-semibold text-gray-900">Cast & Crew</h4>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {movie.cast.slice(0, 5).map((actor, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <img 
                    src={actor.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400"} 
                    alt={`${actor.name} headshot`}
                    className="w-16 h-20 rounded-lg object-cover mb-2"
                  />
                  <p className="text-xs font-medium text-gray-900">{actor.name}</p>
                  <p className="text-xs brand-gray">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-white border-t border-gray-100 space-y-3">
        <button className="w-full brand-green text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-colors">
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Watch on {movie.platforms?.[0]?.name || 'Netflix'}
        </button>
        <div className="flex space-x-3">
          <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save to Watchlist
          </button>
          <button 
            onClick={onBack}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Again
          </button>
        </div>
      </div>
    </div>
  );
}
