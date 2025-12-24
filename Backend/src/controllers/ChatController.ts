import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/AsyncHandler';
import { AIService, ChatMessage } from '../services/AIService';

// Lazy initialization of AIService to ensure env vars are loaded
let aiService: AIService;

const getAIService = () => {
    if (!aiService) {
        aiService = new AIService();
    }
    return aiService;
};

// Chat with AI assistant
const chat = asyncHandler(async (req: Request, res: Response) => {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Messages array is required' 
        });
    }

    try {
        // Validate message format
        const isValidFormat = messages.every((msg: any) => 
            msg && typeof msg === 'object' && 
            msg.role && typeof msg.content === 'string'
        );

        if (!isValidFormat) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid message format. Each message must have role and content.' 
            });
        }

        // Define system context to prepend to first message
        const systemContext = `You are WANFAM AI Assistant, an expert in livestock and farm management. 
You help farmers, veterinarians, and farm workers with:
- Animal health and disease management
- Feeding schedules and nutrition
- Breeding programs
- Farm task management
- Financial planning for farms
- Best practices in livestock care
- Treatment and vaccination schedules

Provide practical, actionable advice. Be concise but thorough. 
Always prioritize animal welfare and farm productivity.
Use simple language and provide specific examples when possible.

---

`;

        // Convert incoming messages to ChatMessage format
        // Prepend system context ONLY to the very first user message in the conversation
        let hasAddedSystemContext = false;
        const chatMessages: ChatMessage[] = messages.map((msg: any) => {
            const isUser = msg.role !== 'model';
            
            // Add system context only to the first user message we encounter
            const content = (isUser && !hasAddedSystemContext) 
                ? systemContext + msg.content 
                : msg.content;
            
            if (isUser && !hasAddedSystemContext) {
                hasAddedSystemContext = true;
            }
            
            return {
                role: msg.role === 'model' ? 'model' : 'user',
                content
            };
        });

        const conversationMessages: ChatMessage[] = chatMessages;

        const service = getAIService();
        const response = await service.chat(conversationMessages);

        res.status(200).json({
            success: true,
            response,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Chat error:', error);
        
        // Send user-friendly error messages
        const errorMessage = error.message || 'Failed to process chat request';
        
        res.status(500).json({
            success: false,
            message: errorMessage.includes('API key') ? 
                'AI service configuration error. Please contact support.' : 
                errorMessage.includes('quota') ?
                'Service temporarily unavailable. Please try again later.' :
                errorMessage.includes('safety') ?
                'Your message was blocked by safety filters. Please rephrase your question.' :
                'Failed to process your request. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

const getSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const { context } = req.query;

    const suggestions = {
        general: [
            "How do I improve milk production?",
            "What are signs of common cattle diseases?",
            "Best feeding practices for dairy cows",
            "How to create an effective vaccination schedule?"
        ],
        health: [
            "Symptoms of mastitis in cows",
            "How to handle a sick animal?",
            "Common parasites in livestock",
            "Emergency first aid for farm animals"
        ],
        feeding: [
            "Optimal feed mix for dairy cattle",
            "How much water should cattle drink daily?",
            "Seasonal feeding adjustments",
            "Cost-effective feeding strategies"
        ],
        breeding: [
            "Best time for artificial insemination",
            "How to detect heat in cows?",
            "Pregnancy care for livestock",
            "Genetic improvement strategies"
        ],
        management: [
            "How to organize farm tasks effectively?",
            "Record keeping best practices",
            "Worker task assignment tips",
            "Farm financial planning advice"
        ]
    };

    const contextKey = (context as string) || 'general';
    const selectedSuggestions = suggestions[contextKey as keyof typeof suggestions] || suggestions.general;

    res.status(200).json({
        success: true,
        suggestions: selectedSuggestions
    });
});

export const ChatController = {
    chat,
    getSuggestions
};
