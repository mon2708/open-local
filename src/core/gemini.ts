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

                // Smart extraction from varied API response formats
                let result = response.data.result || response.data.data || response.data.response || response.data;
                
                // If the result is the whole data object and has a text field inside
                if (result && typeof result === 'object') {
                    result = result.text || result.content || result.message || result;
                }

                if (result) {
                    const finalMsg = typeof result === 'string' ? result.trim() : JSON.stringify(result);
                    if (finalMsg && finalMsg !== 'undefined' && finalMsg !== 'null') {
                        return finalMsg;
                    }
                }
                
                throw new Error('No valid response text found');
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
