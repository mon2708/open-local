const readline = require('readline');
const chalk = require('chalk');
const ollama = require('./ollama');
const logger = require('../utils/logger');

class REPL {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.magenta('LCLI> ')
        });
    }

    start() {
        console.clear();
        console.log(chalk.bold.magenta('========================================'));
        console.log(chalk.bold.white('      LCLI - Interactive Shell          '));
        console.log(chalk.bold.magenta('========================================'));
        console.log(chalk.dim('Type your message or /exit to quit.'));
        console.log(chalk.dim('Available commands: /code, /browse, /sum, /clear\n'));

        this.rl.prompt();

        this.rl.on('line', async (line) => {
            const input = line.trim();
            if (!input) {
                this.rl.prompt();
                return;
            }

            if (input === '/exit' || input === '/quit') {
                this.rl.close();
                return;
            }

            if (input === '/clear') {
                console.clear();
                this.rl.prompt();
                return;
            }

            // Handle commands
            if (input.startsWith('/')) {
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

            this.rl.prompt();
        });

        this.rl.on('close', () => {
            console.log(chalk.yellow('\nGoodbye! Sampai jumpa lagi.'));
            process.exit(0);
        });
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

            default:
                logger.error(`Unknown command: ${cmd}`);
        }
    }
}

module.exports = new REPL();
