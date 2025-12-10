import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ServerError from './ServerError';
import OfflineMode from './OfflineMode';

interface NetworkHandlerProps {
  children: React.ReactNode;
}

const NetworkHandler: React.FC<NetworkHandlerProps> = ({ children }) => {
  const { isOnline, serverError, retryConnection } = useAuth();
  const [showOffline, setShowOffline] = useState(false);
  const [showServerError, setShowServerError] = useState(false);

  useEffect(() => {
    // Debounce offline detection to avoid flickering
    if (!isOnline) {
      const timer = setTimeout(() => {
        setShowOffline(true);
      }, 2000); // Wait 2 seconds before showing offline screen
      return () => clearTimeout(timer);
    } else {
      setShowOffline(false);
    }
  }, [isOnline]);

  useEffect(() => {
    // Debounce server error detection
    if (serverError) {
      const timer = setTimeout(() => {
        setShowServerError(true);
      }, 1000); // Wait 1 second before showing server error
      return () => clearTimeout(timer);
    } else {
      setShowServerError(false);
    }
  }, [serverError]);

  const handleRetry = async () => {
    setShowOffline(false);
    setShowServerError(false);
    await retryConnection();
  };

  // Show offline mode if user has been offline for more than 2 seconds
  if (showOffline && !isOnline) {
    return <OfflineMode onRetry={handleRetry} />;
  }

  // Show server error if there's a persistent server error
  if (showServerError && serverError && isOnline) {
    return <ServerError onRetry={handleRetry} />;
  }

  return <>{children}</>;
};

export default NetworkHandler;
