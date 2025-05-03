import React, { useState, useCallback } from 'react';

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Function to extract YouTube video ID from URL
  const extractVideoId = (url) => {
    if (!url) return '';

    // Regular expressions for different YouTube URL formats
    const regexps = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^#&?]*).*/,
      /youtube\.com\/watch\?.*&v=([^#&?]*).*/,
      /youtube\.com\/shorts\/([^#&?]*).*/
    ];

    for (const regex of regexps) {
      const match = url.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }

    return '';
  };

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    setComments('');

    try {
      const videoId = extractVideoId(youtubeUrl);
      
      if (!videoId) {
        setError('Could not extract video ID from URL. Please check the format.');
        setLoading(false);
        return;
      }

      // Building the query URL
      let queryUrl = `https://youtube-comments-backend-zqbx.onrender.com/comments?video_id=${videoId}`;
      
      if (keyword.trim()) {
        queryUrl += `&keyword=${encodeURIComponent(keyword.trim())}`;
      }

      const response = await fetch(queryUrl);
      
      if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.statusText}`);
      }

      const data = await response.text();
      setComments(data);
    } catch (error) {
      setError(`Failed to fetch comments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchComments();
  };

  // Function to copy comments to clipboard
  const copyToClipboard = useCallback(() => {
    if (!comments) return;
    
    navigator.clipboard.writeText(comments)
      .then(() => {
        setCopySuccess(true);
        // Reset the success message after 3 seconds
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setError('Failed to copy to clipboard');
      });
  }, [comments]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
            YouTube Comments Search
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
                YouTube Video URL
              </label>
              <input
                id="youtubeUrl"
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Accepts standard YouTube URLs, shorts, and embedded formats
              </p>
            </div>
            
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                Keyword (Optional)
              </label>
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword to filter comments"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow transition ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'} flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Search Comments
                </>
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {comments && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-800">Comments</h2>
                <button 
                  onClick={copyToClipboard} 
                  className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition shadow-sm border border-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy Comments
                </button>
              </div>
              {copySuccess && (
                <div className="mb-3 p-2 bg-green-50 text-green-700 rounded-md text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Comments copied to clipboard!
                </div>
              )}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md max-h-96 overflow-y-auto whitespace-pre-wrap">
                {comments}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center mt-8 text-white text-sm opacity-80">
        <p>Search for YouTube comments by video URL and optional keyword</p>
      </div>
    </div>
  );
}

export default App;