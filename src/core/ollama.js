const { Ollama } = require('ollama');

class OllamaService {
    constructor() {
        this.ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });
        this.model = process.env.OLLAMA_MODEL || 'llama3';
    }

    async chat(message, systemPrompt = 'You are a helpful assistant.') {
        try {
            const response = await this.ollama.chat({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
            });
            return response.message.content;
        } catch (error) {
            throw new Error(`Ollama Error: ${error.message}`);
        }
    }

    async streamChat(message, onToken, systemPrompt = 'You are a helpful assistant.') {
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
        } catch (error) {
            throw new Error(`Ollama Error: ${error.message}`);
        }
    }
}

module.exports = new OllamaService();
