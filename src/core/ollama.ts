import { Ollama } from 'ollama';

class OllamaService {
    private ollama: Ollama;
    private model: string;

    constructor() {
        this.ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });
        this.model = process.env.OLLAMA_MODEL || 'llama3';
    }

    setModel(modelName: string) {
        this.model = modelName;
    }

    getModel(): string {
        return this.model;
    }

    async chat(message: string, systemPrompt: string = 'You are a helpful assistant.'): Promise<string> {
        try {
            const response = await this.ollama.chat({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
            });
            return response.message.content;
        } catch (error: any) {
            throw new Error(`Ollama Error: ${error.message}`);
        }
    }

    async streamChat(message: string, onToken: (token: string) => void, systemPrompt: string = 'You are a helpful assistant.'): Promise<void> {
        try {
            const response = await this.ollama.chat({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                stream: true
            });
            for await (const part of response) {
                onToken(part.message.content);
            }
        } catch (error: any) {
            throw new Error(`Ollama Error: ${error.message}`);
        }
    }
}

export default new OllamaService();
