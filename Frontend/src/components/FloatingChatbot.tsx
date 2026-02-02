import React, { useState } from 'react';
import Chatbot from './Chatbot';

const FloatingChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Floating Chat Icon */}
            {!isOpen && (
                <button
                    onClick={toggleChatbot}
                    className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all duration-300 z-50 hover:scale-110"
                    aria-label="Open Chat"
                >
                    <i className="fas fa-comment-dots text-2xl"></i>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        AI
                    </span>
                </button>
            )}

            {/* Chatbot Modal */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[500px] h-[700px] bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-green-600 text-white p-4 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <i className="fas fa-robot text-xl"></i>
                            <h3 className="font-semibold">WANFAM AI Assistant</h3>
                        </div>
                        <button
                            onClick={toggleChatbot}
                            className="text-white hover:text-gray-200 transition-colors"
                            aria-label="Close Chat"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    {/* Chatbot Content */}
                    <div className="flex-1 overflow-hidden">
                        <Chatbot />
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingChatbot;
