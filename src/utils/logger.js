const chalk = require('chalk');
const ora = require('ora');

const logger = {
    info: (msg) => console.log(chalk.blue('ℹ'), msg),
    success: (msg) => console.log(chalk.green('✔'), msg),
    warn: (msg) => console.log(chalk.yellow('⚠'), msg),
    error: (msg) => console.log(chalk.red('✖'), msg),
    ai: (msg) => console.log(chalk.cyan('🤖 AI:'), msg),
    spinner: (text) => ora(chalk.blue(text))
};

module.exports = logger;
