import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Show notification
        const message = `Invalid route: "${location.pathname}" does not exist. Redirecting to ${user ? 'dashboard' : 'home page'}...`;
        
        // Start countdown
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect based on authentication status
                    navigate(user ? '/dashboard' : '/', { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, location.pathname, user]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                {/* 404 Icon */}
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                        <i className="fas fa-exclamation-triangle text-red-600 text-4xl"></i>
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
                
                {/* Error Title */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Page Not Found
                </h2>

                {/* Error Message */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                        <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                        Invalid Route
                    </p>
                    <p className="text-xs text-gray-500 break-all">
                        <strong>Path:</strong> {location.pathname}
                    </p>
                </div>

                <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Countdown */}
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                        <span className="text-2xl font-bold text-green-600">{countdown}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Redirecting to {user ? 'dashboard' : 'home page'}...
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/', { replace: true })}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                        <i className="fas fa-home mr-2"></i>
                        Go to {user ? 'Dashboard' : 'Home'}
                    </button>
                    
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Go Back
                    </button>
                </div>

                {/* Additional Help */}
                {user && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-3">Quick Links:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={() => navigate('/farms')}
                                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                                Farms
                            </button>
                            <button
                                onClick={() => navigate('/tasks')}
                                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                                Tasks
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                                Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotFound;
