const fs = require('fs-extra');
const ollama = require('../core/ollama');
const logger = require('../utils/logger');

class CoderAgent {
    async execute(prompt) {
        const systemPrompt = `You are an expert software engineer. 
        You have access to the local file system. 
        When asked to write code, provide the code clearly.
        Current directory: ${process.cwd()}
        `;
        
        return await ollama.chat(prompt, systemPrompt);
    }

    async analyzeFile(filePath) {
        if (!await fs.exists(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const content = await fs.readFile(filePath, 'utf-8');
        const prompt = `Analyze this file and provide a summary of its purpose and structure:\n\n${content}`;
        return await ollama.chat(prompt, 'You are a code analyst.');
    }
}

module.exports = new CoderAgent();
