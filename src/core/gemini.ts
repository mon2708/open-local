import axios from 'axios';
import chalk from 'chalk';

class GeminiService {
    private versions: string[] = ['v10', 'v9', 'v8', 'v7', 'v6', 'v5', 'v4', 'v3', 'v2', 'v1'];
    private currentVersion: string = 'v10';

    async chat(message: string): Promise<string> {
        let lastError: any;

        for (const version of this.versions) {
            this.currentVersion = version;
            const endpoint = `https://wudysoft.xyz/api/ai/gemini/${version}`;
            
            try {
                process.stdout.write(chalk.dim(`[Gemini] Trying ${version}... `));
                
                const response = await axios.post(endpoint, {
                    prompt: message
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 8000 // Slightly faster timeout
                });

                let result = response.data.result || response.data.data || response.data.response || response.data;
                
                if (result && typeof result === 'object') {
                    result = result.text || result.content || result.message || result;
                }

                if (result) {
                    const finalMsg = typeof result === 'string' ? result.trim() : JSON.stringify(result);
                    if (finalMsg && finalMsg !== 'undefined' && finalMsg !== 'null' && finalMsg.length > 0) {
                        process.stdout.write(chalk.green('OK\n'));
                        return finalMsg;
                    }
                }
                
                throw new Error('Empty or invalid response');
            } catch (error: any) {
                const errMsg = error.response?.status ? `HTTP ${error.response.status}` : error.message;
                process.stdout.write(chalk.yellow(`Failed (${errMsg})\n`));
                lastError = error;
                continue;
            }
        }

        throw new Error(`All Gemini versions (v10-v1) failed. Try switching back to Ollama with /provider ollama`);
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
