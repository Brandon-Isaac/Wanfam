import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            throw new Error(`Gemini API error: ${error}`);
        }
    }

    async generateTextStream(prompt: string): Promise<AsyncIterable<string>> {
        try {
            const result = await this.model.generateContentStream(prompt);
            
            async function* streamGenerator() {
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    yield chunkText;
                }
            }
            
            return streamGenerator();
        } catch (error) {
            throw new Error(`Gemini streaming error: ${error}`);
        }
    }

    async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
        try {
            const chat = this.model.startChat({
                history: messages.slice(0, -1).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }))
            });

            const lastMessage = messages[messages.length - 1];
            const result = await chat.sendMessage(lastMessage.content);
            const response = await result.response;
            return response.text();
        } catch (error) {
            throw new Error(`Gemini chat error: ${error}`);
        }
    }
}