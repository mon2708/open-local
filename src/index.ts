#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import ollama from './core/ollama';
import logger from './utils/logger';
import repl from './core/repl';
import chalk from 'chalk';
import packageJson from '../package.json';

import { checkForUpdates } from './utils/updater';

const program = new Command();

program
  .name('lcli')
  .description('Local CommandLine Interface - Agentic AI on your terminal')
  .version(packageJson.version)
  .action(async () => {
    await checkForUpdates();
    repl.start();
  });

program
  .command('interactive')
  .description('Enter interactive shell mode')
  .action(async () => {
    await checkForUpdates();
    repl.start();
  });

program
  .command('chat')
  .description('Chat with the local AI')
  .argument('<message>', 'Message to send')
  .action(async (message) => {
    const spinner = logger.spinner('AI is thinking...').start();
    try {
      spinner.stop();
      process.stdout.write(chalk.cyan('🤖 AI: '));
      await ollama.streamChat(message, (token) => {
        process.stdout.write(token);
      });
      console.log('\n');
    } catch (error: any) {
      spinner.fail(error.message);
    }
  });

program
  .command('code')
  .description('Coding assistant')
  .argument('<prompt>', 'What to do?')
  .option('-f, --file <path>', 'File to analyze')
  .action(async (prompt, options) => {
    const coder = (await import('./agents/coder')).default;
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
    } catch (error: any) {
      spinner.fail(error.message);
    }
  });

program.parse();
