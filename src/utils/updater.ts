import axios from 'axios';
import chalk from 'chalk';
import boxen from 'boxen';
import { execSync } from 'child_process';
import readline from 'readline';
import packageJson from '../../package.json';

const REPO_URL = 'https://raw.githubusercontent.com/mon2708/open-local/main/package.json';

export async function checkForUpdates(): Promise<void> {
    try {
        const response = await axios.get(REPO_URL, { timeout: 3000 });
        const remoteVersion = response.data.version;

        if (remoteVersion !== packageJson.version) {
            console.log(boxen(
                chalk.yellow.bold('Update Available! ') + chalk.white(`v${packageJson.version} -> v${remoteVersion}\n`) +
                chalk.dim('Ada versi baru di GitHub. Mau update sekarang? (y/n)'),
                { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'yellow' }
            ));

            const answer = await askQuestion('> ');
            if (answer.toLowerCase() === 'y') {
                console.log(chalk.blue('Updating... ⏳'));
                try {
                    execSync('git pull origin main', { stdio: 'inherit' });
                    execSync('npm install && npm run build', { stdio: 'inherit' });
                    console.log(chalk.green.bold('\nUpdate sukses! Silakan restart LCLI.'));
                    process.exit(0);
                } catch (err: any) {
                    console.log(chalk.red('\nUpdate gagal: ' + err.message));
                }
            }
        }
    } catch (error) {
        // Silently fail if no internet or timeout
    }
}

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}
