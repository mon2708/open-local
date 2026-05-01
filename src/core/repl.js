const readline = require('readline');
const chalk = require('chalk');
const boxen = require('boxen');
const figlet = require('figlet');
const ollama = require('./ollama');
const logger = require('../utils/logger');
const packageJson = require('../../package.json');

class REPL {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.gray('> ')
        });
        this.session = {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            startTime: Date.now(),
            toolCalls: 0,
            successRate: 100
        };
    }

    start() {
        console.clear();
        this.printHeader();
        this.printStatus();
        this.rl.prompt();

        this.rl.on('line', async (line) => {
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

            // Handle commands
            if (input.startsWith('/')) {
                this.session.toolCalls++;
                await this.handleCommand(input);
            } else {
                // Simple chat
                const spinner = logger.spinner('AI is thinking...').start();
                try {
                    spinner.stop();
                    process.stdout.write(chalk.cyan('🤖 AI: '));
                    await ollama.streamChat(input, (token) => {
                        process.stdout.write(token);
                    });
                    console.log('\n');
                } catch (error) {
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

    printHeader() {
        const logo = figlet.textSync('LCLI', { font: 'Slant' });
        console.log(chalk.magenta(logo));
        console.log(chalk.bold(`LCLI v${packageJson.version}`));
        console.log(chalk.dim('Local Agentic CLI Interface\n'));

        const announcement = boxen(
            chalk.yellow('We are making changes to LCLI that may impact your workflow.\n') +
            chalk.white('New: Added premium UI and session tracking!\n') +
            chalk.blue('Read more: https://github.com/mon2708/open-local'),
            { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'yellow' }
        );
        console.log(announcement);

        console.log(chalk.bold('Tips for getting started:'));
        console.log('1. /help for more information');
        console.log('2. Ask coding questions, edit code or run commands');
        console.log('3. Be specific for the best results\n');
    }

    printStatus() {
        const workspace = process.cwd();
        const model = process.env.OLLAMA_MODEL || 'llama3';
        const bar = chalk.bgGray.white(` workspace (${workspace})    sandbox (no sandbox)    /model (${model})    quota (unlimited) `);
        console.log(bar);
    }

    printSummary() {
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

    async handleCommand(input) {
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
                const browserAgent = require('../agents/browser');
                const bSpinner = logger.spinner('Browsing...').start();
                try {
                    const result = await browserAgent.browse(url, task);
                    bSpinner.succeed('Done!');
                    logger.ai(result);
                } catch (e) { bSpinner.fail(e.message); }
                break;

            case '/code':
                const coder = require('../agents/coder');
                const cSpinner = logger.spinner('Analyzing...').start();
                try {
                    const result = await coder.execute(query);
                    cSpinner.succeed('Done!');
                    logger.ai(result);
                } catch (e) { cSpinner.fail(e.message); }
                break;

            case '/help':
                console.log(chalk.bold('\nAvailable Commands:'));
                console.log('/browse <url> <task>  - Visit a website');
                console.log('/code <prompt>        - Coding assistant');
                console.log('/clear               - Clear screen');
                console.log('/exit                - Quit\n');
                break;

            default:
                logger.error(`Unknown command: ${cmd}`);
        }
    }
}

module.exports = new REPL();
