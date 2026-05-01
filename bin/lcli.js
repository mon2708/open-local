#!/usr/bin/env node
require('dotenv').config();
const { Command } = require('commander');
const ollama = require('../src/core/ollama');
const logger = require('../src/utils/logger');
const packageJson = require('../package.json');

const program = new Command();

program
  .name('lcli')
  .description('Local CommandLine Interface - Agentic AI on your terminal')
  .version(packageJson.version)
  .action(() => {
    require('../src/core/repl').start();
  });

program
  .command('interactive')
  .description('Enter interactive shell mode')
  .action(() => {
    require('../src/core/repl').start();
  });

program
  .command('chat')
  .description('Chat with the local AI')
  .argument('<message>', 'Message to send')
  .action(async (message) => {
    const spinner = logger.spinner('AI is thinking...').start();
    try {
      spinner.stop();
      process.stdout.write(require('chalk').cyan('🤖 AI: '));
      await ollama.streamChat(message, (token) => {
        process.stdout.write(token);
      });
      console.log('\n');
    } catch (error) {
      spinner.fail(error.message);
    }
  });

program
  .command('code')
  .description('Coding assistant')
  .argument('<prompt>', 'What to do?')
  .option('-f, --file <path>', 'File to analyze')
  .action(async (prompt, options) => {
    const coder = require('../src/agents/coder');
    const spinner = logger.spinner('Coding...').start();
    try {
      let result;
      if (options.file) {
        result = await coder.analyzeFile(options.file);
      } else {
        result = await coder.execute(prompt);
      }
      spinner.succeed('Done!');
      logger.ai(result);
    } catch (error) {
      spinner.fail(error.message);
    }
  });

program
  .command('browse')
  .description('Browse a website and answer a question')
  .argument('<url>', 'URL to visit')
  .argument('<task>', 'What to find or do?')
  .action(async (url, task) => {
    const browser = require('../src/agents/browser');
    const spinner = logger.spinner('Browsing...').start();
    try {
      const result = await browser.browse(url, task);
      spinner.succeed('Done!');
      logger.ai(result);
    } catch (error) {
      spinner.fail(error.message);
    }
  });

program
  .command('sum')
  .description('Summarize a file')
  .argument('<file>', 'File to summarize')
  .action(async (file) => {
    const coder = require('../src/agents/coder');
    const spinner = logger.spinner('Summarizing...').start();
    try {
      const result = await coder.analyzeFile(file);
      spinner.succeed('Done!');
      logger.ai(result);
    } catch (error) {
      spinner.fail(error.message);
    }
  });

program.parse();
