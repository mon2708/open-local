import puppeteer from 'puppeteer';
import ollama from '../core/ollama';
import logger from '../utils/logger';

class BrowserAgent {
    async browse(url: string, task: string): Promise<string> {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        try {
            logger.info(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle2' });
            
            const content = await page.evaluate(() => document.body.innerText);
            const title = await page.title();
            
            await browser.close();
            
            const prompt = `Page Title: ${title}\nContent: ${content.substring(0, 5000)}\n\nTask: ${task}`;
            return await ollama.chat(prompt, 'You are a browser assistant that summarizes web pages.');
        } catch (error) {
            await browser.close();
            throw error;
        }
    }
}

export default new BrowserAgent();
