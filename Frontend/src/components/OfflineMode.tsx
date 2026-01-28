import React, { useEffect, useState } from 'react';

interface OfflineModeProps {
  onRetry?: () => void;
}

const OfflineMode: React.FC<OfflineModeProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (onRetry) {
        setTimeout(onRetry, 500);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onRetry]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <i className={`fas ${isOnline ? 'fa-wifi' : 'fa-wifi-slash'} text-gray-600 text-4xl`}></i>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {isOnline ? 'Connection Restored!' : 'No Internet Connection'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isOnline 
            ? 'Your internet connection has been restored. Click below to continue.' 
            : 'Please check your internet connection and try again. Your work will be saved once you reconnect.'}
        </p>
        
        {isOnline ? (
          <button
            onClick={onRetry || (() => window.location.reload())}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold animate-pulse"
          >
            <i className="fas fa-check-circle mr-2"></i>
            Continue Workings
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <i className="fas fa-sync mr-2"></i>
              Check Connection
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Go Back
            </button>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <p className="text-sm text-gray-700 font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Your session remains active. You won't lose your data.</p>
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;
