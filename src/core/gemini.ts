import axios from 'axios';

class GeminiService {
    private endpoint: string = 'https://wudysoft.xyz/api/ai/gemini/v9';

    async chat(message: string): Promise<string> {
        try {
            const response = await axios.get(this.endpoint, {
                params: { text: message }
            });
            
            // Biasanya format response API gratisan itu { result: "..." } atau { status: true, data: "..." }
            // Kita coba handle format umum result
            return response.data.result || response.data.data || JSON.stringify(response.data);
        } catch (error: any) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }

    // Karena API ini biasanya tidak support streaming, kita simulasi chat biasa saja
    async streamChat(message: string, onToken: (token: string) => void): Promise<void> {
        const result = await this.chat(message);
        onToken(result);
    }

    getModel(): string {
        return 'Gemini (Wudysoft)';
    }

    setModel(name: string) {
        // No-op for this specific API
    }
}

export default new GeminiService();
