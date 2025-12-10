import React from 'react';

interface ServerErrorProps {
  onRetry?: () => void;
  message?: string;
}

const ServerError: React.FC<ServerErrorProps> = ({ 
  onRetry, 
  message = "We're having trouble connecting to the server. Please check your internet connection and try again." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <i className="fas fa-server text-blue-600 text-4xl"></i>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Server Connection Issue
        </h2>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <i className="fas fa-redo mr-2"></i>
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <i className="fas fa-home mr-2"></i>
            Go to Dashboard
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            <i className="fas fa-sync mr-2"></i>
            Refresh Page
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <i className="fas fa-info-circle mr-2"></i>
            Your session is still active. You won't be logged out.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
