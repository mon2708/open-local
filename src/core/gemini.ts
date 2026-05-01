import axios from 'axios';
import chalk from 'chalk';

class GeminiService {
    private versions: string[] = ['v10', 'v9', 'v8', 'v7', 'v6', 'v5', 'v4', 'v3', 'v2', 'v1'];
    private currentVersion: string = 'v10';

    async chat(message: string): Promise<string> {
        let lastError: any;

        for (const version of this.versions) {
            try {
                this.currentVersion = version;
                const endpoint = `https://wudysoft.xyz/api/ai/gemini/${version}`;
                
                const response = await axios.post(endpoint, {
                    prompt: message
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });

                // Extracting result from common API patterns
                const result = response.data.result || response.data.data;
                if (result) {
                    // Handle if result is an object (from v10.js logic)
                    if (typeof result === 'object' && result.text) return result.text;
                    return typeof result === 'string' ? result : JSON.stringify(result);
                }
                
                // If no result but response is ok, maybe the data itself is the answer
                if (response.data && typeof response.data === 'string') return response.data;
                
                throw new Error('Empty response');
            } catch (error: any) {
                console.log(chalk.yellow(`\n[Gemini] Version ${version} failed, trying fallback...`));
                lastError = error;
                continue;
            }
        }

        throw new Error(`All Gemini versions failed. Last error: ${lastError?.message}`);
    }

    async streamChat(message: string, onToken: (token: string) => void): Promise<void> {
        const result = await this.chat(message);
        onToken(result);
    }

    getModel(): string {
        return `Gemini (${this.currentVersion})`;
    }

    setModel(name: string) {
        // No-op
    }
}

export default new GeminiService();
