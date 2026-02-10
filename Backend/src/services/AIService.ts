import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
// Message interface for type safety
export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

// Configuration interface
export interface AIConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
}

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private defaultConfig: AIConfig;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
        }
        
        // Initialize Gemini AI
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        // Default configuration for balanced responses
        this.defaultConfig = {
            temperature: 0.7,  // Balance between creativity and consistency
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048
        };

        // Initialize model with configuration
        this.model = this.genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: this.defaultConfig
        });
    }

    /**
     * Generate text from a simple prompt
     * @param prompt - The text prompt
     * @returns Generated text response
     */
    async generateText(prompt: string): Promise<string> {
        try {
            if (!prompt || typeof prompt !== 'string') {
                throw new Error('Prompt must be a non-empty string');
            }

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            
            if (!response) {
                throw new Error('No response received from AI model');
            }

            return response.text();
        } catch (error: any) {
            console.error('Gemini API error:', error);
            
            // Handle specific error types
            if (error.message?.includes('API key')) {
                throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
            }
            if (error.message?.includes('quota')) {
                throw new Error('API quota exceeded. Please check your Google AI Studio quota.');
            }
            if (error.message?.includes('safety')) {
                throw new Error('Content blocked by safety filters. Please rephrase your request.');
            }
            
            throw new Error(`Failed to generate text: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Generate text with streaming for real-time responses
     * @param prompt - The text prompt
     * @returns Async iterable of text chunks
     */
    async generateTextStream(prompt: string): Promise<AsyncIterable<string>> {
        try {
            if (!prompt || typeof prompt !== 'string') {
                throw new Error('Prompt must be a non-empty string');
            }

            const result = await this.model.generateContentStream(prompt);
            
            async function* streamGenerator() {
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                        yield chunkText;
                    }
                }
            }
            
            return streamGenerator();
        } catch (error: any) {
            console.error('Gemini streaming error:', error);
            throw new Error(`Failed to generate streaming text: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Chat with AI maintaining conversation history
     * @param messages - Array of conversation messages
     * @param config - Optional configuration overrides
     * @returns AI response text
     */
    async chat(messages: ChatMessage[], config?: AIConfig): Promise<string> {
        try {
            // Validate input
            if (!Array.isArray(messages) || messages.length === 0) {
                throw new Error('Messages must be a non-empty array');
            }

            // Filter out system messages (Gemini doesn't support them)
            const conversationMessages = messages.filter(msg => msg.role !== 'system');

            if (conversationMessages.length === 0) {
                throw new Error('At least one user or model message is required');
            }

            // Convert messages to Gemini format (all except the last one become history)
            const history = conversationMessages.slice(0, -1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Gemini requires first message in history to be from 'user'
            // If history starts with 'model', remove leading model messages
            if (history.length > 0 && history[0].role === 'model') {
                while (history.length > 0 && history[0].role === 'model') {
                    history.shift();
                }
            }

            // Create chat session with configuration
            const chatConfig = { ...this.defaultConfig, ...config };
            const chat: ChatSession = this.model.startChat({
                history: history,
                generationConfig: chatConfig
            });

            // Get the last message to send
            const lastMessage = conversationMessages[conversationMessages.length - 1];
            
            if (!lastMessage.content || lastMessage.content.trim().length === 0) {
                throw new Error('Last message content cannot be empty');
            }

            const messageToSend = lastMessage.content;

            // Send message and get response
            const result = await chat.sendMessage(messageToSend);
            const response = result.response;
            
            if (!response) {
                throw new Error('No response received from AI model');
            }

            const text = response.text();
            
            if (!text || text.trim().length === 0) {
                throw new Error('Empty response received from AI model');
            }

            return text;
        } catch (error: any) {
            console.error('Gemini chat error:', error);
            
            // Handle specific error types
            if (error.message?.includes('API key')) {
                throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
            }
            if (error.message?.includes('quota')) {
                throw new Error('API quota exceeded. Please try again later or upgrade your quota.');
            }
            if (error.message?.includes('safety')) {
                throw new Error('Content blocked by safety filters. Please rephrase your request appropriately.');
            }
            if (error.message?.includes('rate limit')) {
                throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
            }
            
            throw new Error(`Chat error: ${error.message || 'Unknown error occurred'}`);
        }
    }

    /**
     * Chat with streaming responses
     * @param messages - Array of conversation messages
     * @param config - Optional configuration overrides
     * @returns Async iterable of text chunks
     */
    async chatStream(messages: ChatMessage[], config?: AIConfig): Promise<AsyncIterable<string>> {
        try {
            // Validate input
            if (!Array.isArray(messages) || messages.length === 0) {
                throw new Error('Messages must be a non-empty array');
            }

            // Filter out system messages (Gemini doesn't support them)
            const conversationMessages = messages.filter(msg => msg.role !== 'system');

            if (conversationMessages.length === 0) {
                throw new Error('At least one user or model message is required');
            }

            // Convert messages to Gemini format (all except the last one become history)
            const history = conversationMessages.slice(0, -1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Gemini requires first message in history to be from 'user'
            // If history starts with 'model', remove leading model messages
            if (history.length > 0 && history[0].role === 'model') {
                while (history.length > 0 && history[0].role === 'model') {
                    history.shift();
                }
            }

            // Create chat session with configuration
            const chatConfig = { ...this.defaultConfig, ...config };
            const chat: ChatSession = this.model.startChat({
                history: history,
                generationConfig: chatConfig
            });

            // Get the last message to send
            const lastMessage = conversationMessages[conversationMessages.length - 1];
            
            if (!lastMessage.content || lastMessage.content.trim().length === 0) {
                throw new Error('Last message content cannot be empty');
            }

            const messageToSend = lastMessage.content;

            // Send message and get streaming response
            const result = await chat.sendMessageStream(messageToSend);

            async function* streamGenerator() {
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                        yield chunkText;
                    }
                }
            }

            return streamGenerator();
        } catch (error: any) {
            console.error('Gemini chat streaming error:', error);
            throw new Error(`Chat streaming error: ${error.message || 'Unknown error occurred'}`);
        }
    }

    /**
     * Check if the service is properly configured
     * @returns Boolean indicating if service is ready
     */
    isConfigured(): boolean {
        return !!process.env.GEMINI_API_KEY;
    }

    /**
     * Get current configuration
     * @returns Current AI configuration
     */
    getConfig(): AIConfig {
        return { ...this.defaultConfig };
    }

    /**
     * Update configuration
     * @param config - New configuration settings
     */
    updateConfig(config: Partial<AIConfig>): void {
        this.defaultConfig = { ...this.defaultConfig, ...config };
        
        // Reinitialize model with new config
        this.model = this.genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: this.defaultConfig
        });
    }
    /**
     * Generate comprehensive farm financial recommendations
     * @param farmData - Comprehensive farm financial data
     * @returns Detailed recommendations and insights
     */
    async getRevenueRecommendations(farmData: any): Promise<string> {
        const prompt = `You are an expert agricultural financial advisor. Analyze the following farm financial data and provide exactly 3 concise, actionable recommendations to improve profitability.

## FARM FINANCIAL DATA
${JSON.stringify(farmData, null, 2)}

## YOUR TASK
Provide exactly 3 specific, actionable recommendations. Each recommendation should be 1-2 sentences maximum.

Format:
1. [First recommendation]
2. [Second recommendation]
3. [Third recommendation]

Focus on the most impactful actions the farmer can take immediately.`;
        
        /* DETAILED PROMPT (COMMENTED OUT FOR SHORTER RESPONSES)
        const prompt = `You are an expert agricultural financial advisor specializing in livestock farm management. Analyze the following farm financial data and provide comprehensive, actionable recommendations.

## FARM FINANCIAL DATA
${JSON.stringify(farmData, null, 2)}

## YOUR TASK
Provide detailed recommendations in the following structure:

### 1. FINANCIAL HEALTH ASSESSMENT
- Overall financial performance evaluation
- Key financial metrics analysis (profit margin, revenue-to-expense ratio)
- Comparison to industry benchmarks where applicable

### 2. REVENUE OPTIMIZATION OPPORTUNITIES
- Identify underperforming revenue streams
- Suggest ways to maximize high-performing revenue sources
- Recommend new revenue opportunities based on current operations
- Pricing strategy recommendations
- Product diversification suggestions

### 3. COST REDUCTION STRATEGIES
- Identify excessive expense categories
- Suggest cost-cutting measures without compromising quality
- Recommend more efficient resource allocation
- Highlight potential waste areas

### 4. PROFITABILITY IMPROVEMENTS
- Short-term actions (next 30 days)
- Medium-term strategies (3-6 months)
- Long-term growth plans (1 year+)

### 5. CASH FLOW MANAGEMENT
- Payment collection recommendations
- Expense timing optimization
- Emergency fund suggestions

### 6. RISK MITIGATION
- Identify financial risks
- Diversification recommendations
- Insurance and protection strategies

### 7. SPECIFIC ACTION ITEMS
Provide 5-10 concrete, prioritized action items the farmer can implement immediately.

### 8. KEY PERFORMANCE INDICATORS (KPIs)
Recommend specific KPIs to track for measuring improvement.

## IMPORTANT GUIDELINES
- Be specific and actionable
- Use the actual numbers from the data provided
- Consider the farm type and size
- Be realistic and practical for small to medium farms
- Prioritize recommendations by potential impact
- Consider seasonal variations in agriculture
- Account for the local context (Kenya/East Africa)

Provide your analysis and recommendations in a clear, well-organized format using markdown.`;
        */
        
        return this.generateText(prompt);
    }

    /**
     * Generate expense reduction recommendations
     * @param expenseData - Detailed expense data
     * @returns Cost-cutting recommendations
     */
    async getExpenseOptimizationRecommendations(expenseData: any): Promise<string> {
        const prompt = `As an agricultural cost management expert, analyze the following farm expense data and provide specific cost reduction strategies:

${JSON.stringify(expenseData, null, 2)}

Provide:
1. Expense categories with highest optimization potential
2. Specific cost-cutting measures for each category
3. Alternative suppliers or methods to reduce costs
4. Efficiency improvements that reduce expenses
5. ROI analysis for any recommended investments

Format your response in markdown with clear sections.`;
        
        return this.generateText(prompt);
    }

    /**
     * Generate revenue growth strategies
     * @param revenueData - Detailed revenue data
     * @returns Revenue growth recommendations
     */
    async getRevenueGrowthStrategies(revenueData: any): Promise<string> {
        const prompt = `As an agricultural revenue growth consultant, analyze the following farm revenue data and provide strategies to increase income:

${JSON.stringify(revenueData, null, 2)}

Provide:
1. High-potential revenue streams to expand
2. New product or service opportunities
3. Market expansion possibilities
4. Value-added product suggestions
5. Pricing optimization strategies
6. Marketing and sales recommendations

Format your response in markdown with actionable steps.`;
        
        return this.generateText(prompt);
    }
}

