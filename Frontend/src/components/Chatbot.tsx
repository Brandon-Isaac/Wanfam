import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/Api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Suggestion {
    text: string;
    context: string;
}

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hello! I\'m WANFAM AI Assistant. I\'m here to help you with livestock management, animal health, feeding schedules, and farm operations. How can I assist you today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load suggestions on mount
    useEffect(() => {
        loadSuggestions('general')
    }, []);

    const loadSuggestions = async (context: string = 'general') => {
        try {
            const response = await api.get(`/chat/suggestions?context=${context}`);
            if (response.data.success) {
                setSuggestions(response.data.suggestions);
                setShowSuggestions(true); // Ensure suggestions panel is shown
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setShowSuggestions(false);

        try {
            // Prepare conversation history for API
            const conversationMessages = [...messages, userMessage].map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                content: msg.content
            }));

            const response = await api.post('/chat/chat', {
                messages: conversationMessages
            });

            if (response.data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: response.data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error: any) {
            const errorMessage: Message = {
                role: 'assistant',
                content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: 'Chat history cleared. How can I help you today?',
            timestamp: new Date()
        }]);
        setShowSuggestions(true);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                    <button onClick={() => window.history.back()} className="mb-4 text-purple-600 hover:text-purple-800 flex items-center space-x-2">
                        <i className="fas fa-arrow-left"></i>
                        <span>
                            Back To Dashboard
                        </span>
                    </button>
                </div>
                {/* Header */}
                <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                <i className="fas fa-robot text-white text-lg"></i>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">WANFAM AI Assistant</h1>
                                <p className="text-xs text-gray-500">Livestock Management Expert</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowSuggestions(!showSuggestions)}
                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Toggle suggestions"
                            >
                                <i className="fas fa-lightbulb"></i>
                            </button>
                            <button
                                onClick={clearChat}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Clear chat"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="bg-white shadow-sm" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
                    <div className="h-full overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                        message.role === 'user' 
                                            ? 'bg-green-500' 
                                            : 'bg-gradient-to-br from-purple-500 to-blue-600'
                                    }`}>
                                        <i className={`fas ${message.role === 'user' ? 'fa-user' : 'fa-robot'} text-white text-xs`}></i>
                                    </div>
                                    
                                    {/* Message Bubble */}
                                    <div className="flex flex-col">
                                        <div className={`rounded-lg px-4 py-2 ${
                                            message.role === 'user'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                        }`}>
                                            {message.role === 'user' ? (
                                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                            ) : (
                                                <div className="text-sm prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900 prose-li:text-gray-900">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-xs text-gray-400 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {formatTime(message.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-start space-x-2 max-w-[80%]">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                        <i className="fas fa-robot text-white text-xs"></i>
                                    </div>
                                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="bg-white border-t border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-xs px-3 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="bg-white rounded-b-lg shadow-sm border-t border-gray-200 p-4">
                    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                        <div className="flex-1">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your question here... (Press Enter to send, Shift+Enter for new line)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                rows={2}
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[56px] flex items-center justify-center"
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-2">
                        <i className="fas fa-info-circle mr-1"></i>
                        AI-generated responses may not always be accurate. Please verify critical information.
                    </p>
                </div>

                {/* Context Tabs */}
                <div className="mt-4 bg-white rounded-lg shadow-sm p-3">
                    <p className="text-xs text-gray-500 mb-2">
                        <i className="fas fa-lightbulb text-yellow-500 mr-1"></i>
                        Quick topics (click to see suggested questions):
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['general', 'health', 'feeding', 'breeding', 'management'].map((context) => (
                            <button
                                key={context}
                                onClick={() => loadSuggestions(context)}
                                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-purple-50 hover:text-purple-700 transition-colors capitalize border border-gray-200 hover:border-purple-300"
                            >
                                <i className={`fas ${
                                    context === 'general' ? 'fa-info-circle' :
                                    context === 'health' ? 'fa-heartbeat' :
                                    context === 'feeding' ? 'fa-utensils' :
                                    context === 'breeding' ? 'fa-dna' :
                                    'fa-tasks'
                                } mr-1`}></i>
                                {context}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;