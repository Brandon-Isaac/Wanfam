import React, { useState } from 'react';
import ChatbotModal from './ChatbotModal';

const ChatbotButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* Fixed Position Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-30 group"
                title="Open AI Assistant"
            >
                <i className="fas fa-robot text-xl"></i>
                
                {/* Pulse animation */}
                <span className="absolute inset-0 rounded-full bg-purple-400 opacity-75 animate-ping"></span>
            </button>

            {/* Chatbot Modal */}
            <ChatbotModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />

            <style>{`
                @keyframes ping {
                    75%, 100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                
                .animate-ping {
                    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </>
    );
};

export default ChatbotButton;
