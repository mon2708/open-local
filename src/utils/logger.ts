import chalk from 'chalk';
import ora, { Ora } from 'ora';

const logger = {
    info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
    success: (msg: string) => console.log(chalk.green('✔'), msg),
    warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
    error: (msg: string) => console.log(chalk.red('✖'), msg),
    ai: (msg: string) => console.log(chalk.cyan('🤖 AI:'), msg),
    spinner: (text: string): Ora => ora(chalk.blue(text))
};

export default logger;
