import readline from 'readline';
import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import ollama from './ollama';
import logger from '../utils/logger';
import browserAgent from '../agents/browser';
import coder from '../agents/coder';
import packageJson from '../../package.json';

interface Session {
    id: string;
    startTime: number;
    toolCalls: number;
    successRate: number;
}

class REPL {
    private rl: readline.Interface;
    private session: Session;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.gray('> ')
        });
        this.session = {
            id: Math.random().toString(36).substring(2, 15),
            startTime: Date.now(),
            toolCalls: 0,
            successRate: 100
        };
    }

    start(): void {
        console.clear();
        this.printHeader();
        this.printStatus();
        this.rl.prompt();

        this.rl.on('line', async (line: string) => {
            const input = line.trim();
            if (!input) {
                this.printStatus();
                this.rl.prompt();
                return;
            }

            if (input === '/exit' || input === '/quit') {
                this.rl.close();
                return;
            }

            if (input === '/clear') {
                console.clear();
                this.printHeader();
                this.printStatus();
                this.rl.prompt();
                return;
            }

            if (input.startsWith('/')) {
                this.session.toolCalls++;
                await this.handleCommand(input);
            } else {
                const thinkingMessages = [
                    'AI is thinking deeply...',
                    'AI is analyzing your request...',
                    'AI is searching for answers...',
                    'AI is looking through context...',
                    'AI is formulating a response...'
                ];
                const randomMsg = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
                const spinner = logger.spinner(randomMsg!).start();
                
                try {
                    let firstToken = true;
                    await ollama.streamChat(input, (token) => {
                        if (firstToken) {
                            spinner.stop();
                            // Clear the spinner line and start the AI prefix
                            process.stdout.write(chalk.cyan('🤖 AI: '));
                            firstToken = false;
                        }
                        process.stdout.write(token);
                    });
                    console.log('\n');
                } catch (error: any) {
                    spinner.fail(error.message);
                }
            }

            this.printStatus();
            this.rl.prompt();
        });

        this.rl.on('close', () => {
            this.printSummary();
            process.exit(0);
        });
    }

    private printHeader(): void {
        const logo = figlet.textSync('LCLI', { font: 'Slant' });
        console.log(chalk.magenta(logo));
        console.log(chalk.bold(`LCLI v${packageJson.version}`));
        console.log(chalk.dim('Local Agentic CLI Interface\n'));

        const announcement = boxen(
            chalk.yellow('We are making changes to LCLI that may impact your workflow.\n') +
            chalk.white('New: Migrated to TypeScript for professional development!\n') +
            chalk.blue('Read more: https://github.com/mon2708/open-local'),
            { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'yellow' }
        );
        console.log(announcement);

        console.log(chalk.bold('Tips for getting started:'));
        console.log('1. /help for more information');
        console.log('2. Ask coding questions, edit code or run commands');
        console.log('3. Be specific for the best results\n');
    }

    private printStatus(): void {
        const workspace = process.cwd();
        const model = ollama.getModel();
        const bar = chalk.bgGray.white(` workspace (${workspace})    sandbox (no sandbox)    /model (${model})    quota (unlimited) `);
        console.log(bar);
    }

    private printSummary(): void {
        const duration = ((Date.now() - this.session.startTime) / 1000).toFixed(1);
        const summary = boxen(
            chalk.cyan('Agent powering down. Goodbye!\n\n') +
            chalk.bold('Interaction Summary\n') +
            `Session ID:       ${chalk.blue(this.session.id)}\n` +
            `Tool Calls:       ${chalk.green(this.session.toolCalls)}\n` +
            `Success Rate:     ${chalk.magenta(this.session.successRate + '%')}\n\n` +
            chalk.bold('Performance\n') +
            `Wall Time:        ${chalk.blue(duration + 's')}\n\n` +
            chalk.dim(`To resume this session: lcli --resume '${this.session.id}'`),
            { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'magenta' }
        );
        console.log(summary);
    }

    private async handleCommand(input: string): Promise<void> {
        const [cmd, ...args] = input.split(' ');
        const query = args.join(' ');

        switch (cmd) {
            case '/browse':
                const [url, ...taskArr] = args;
                const task = taskArr.join(' ');
                if (!url || !task) {
                    logger.error('Usage: /browse <url> <task>');
                    break;
                }
                const bSpinner = logger.spinner('Browsing...').start();
                try {
                    const result = await browserAgent.browse(url, task);
                    bSpinner.succeed('Done!');
                    logger.ai(result);
                } catch (e: any) { bSpinner.fail(e.message); }
                break;

            case '/code':
                const cSpinner = logger.spinner('Analyzing...').start();
                try {
                    const result = await coder.execute(query);
                    cSpinner.succeed('Done!');
                    logger.ai(result);
                } catch (e: any) { cSpinner.fail(e.message); }
                break;

            case '/model':
                const models = await ollama.listModels();
                if (!query) {
                    console.log(chalk.bold('\nAvailable Models:'));
                    models.forEach((m, i) => {
                        const active = m.name === ollama.getModel() ? chalk.green(' (active)') : '';
                        console.log(`${i + 1}. ${chalk.cyan(m.name)}${active}`);
                    });
                    console.log(chalk.dim('\nUsage: /model <name> or /model <number>\n'));
                    break;
                }

                // Check if query is a number
                const index = parseInt(query) - 1;
                if (!isNaN(index) && models[index]) {
                    ollama.setModel(models[index].name);
                    logger.success(`Model switched to: ${chalk.cyan(models[index].name)}`);
                } else {
                    // Check if model exists in the list
                    const found = models.find(m => m.name === query || m.name.split(':')[0] === query);
                    if (found) {
                        ollama.setModel(found.name);
                        logger.success(`Model switched to: ${chalk.cyan(found.name)}`);
                    } else {
                        logger.error(`Model "${query}" not found locally.`);
                    }
                }
                break;

            case '/help':
                console.log(chalk.bold('\nAvailable Commands:'));
                console.log('/browse <url> <task>  - Visit a website');
                console.log('/code <prompt>        - Coding assistant');
                console.log('/model <name>         - Switch Ollama model');
                console.log('/clear               - Clear screen');
                console.log('/exit                - Quit\n');
                break;

            default:
                logger.error(`Unknown command: ${cmd}`);
        }
    }
}

export default new REPL();
