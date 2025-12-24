import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectDelay?: number;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ 
  isOpen, 
  onClose,
  redirectDelay = 10 
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(redirectDelay);

  useEffect(() => {
    if (isOpen) {
      setCountdown(redirectDelay);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, redirectDelay]);

  const handleRedirect = () => {
    onClose();
    navigate('/login', { state: { sessionExpired: true } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <i className="fas fa-clock text-yellow-600 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Session Expired
          </h2>
          <p className="text-gray-600">
            Your session has expired due to inactivity. Please log in again to continue.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>You'll be redirected to the login page</li>
                <li>Your unsaved changes may be lost</li>
                <li>Log in again to continue working</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Redirecting in</p>
          <div className="text-4xl font-bold text-gray-900">
            {countdown}
          </div>
          <p className="text-xs text-gray-500 mt-1">seconds</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRedirect}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Go to Login Now
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            <i className="fas fa-times mr-2"></i>
            Stay on Page
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            <i className="fas fa-shield-alt mr-1"></i>
            This is for your security and privacy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
