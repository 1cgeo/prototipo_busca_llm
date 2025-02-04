import { TestRunner } from './runner.js';
import { testCases } from './test-cases.js';
import { config } from '../src/config/index.js';
import chalk from 'chalk';

function getEmoji(percentage: number): string {
    if (percentage >= 90) return '⭐';
    if (percentage >= 75) return '✅';
    if (percentage >= 60) return '⚠️';
    return '❌';
}

async function runEvaluation() {
    console.log(chalk.bold.blue('\nStarting Evaluation...\n'));

    const runner = new TestRunner(config.llm.baseUrl);
    const results = await runner.runTests(testCases);


    
    // Imprime resultado geral
    console.log(chalk.bold('\nTest Results Summary'));
    console.log(chalk.gray('-------------------'));
    console.log(chalk.bold(`Overall Score: ${results.percentageScore.toFixed(1)}%`));
    console.log(`Total Points: ${results.totalScore}/${results.maxPossibleScore}`);

    // Imprime resultados por dificuldade
    console.log(chalk.bold('\nBy Difficulty:'));
    const { byDifficulty } = results.detailedScores;
    console.log(`- Easy:   ${((byDifficulty.easy / byDifficulty.totalEasy) * 100).toFixed(1)}% (${byDifficulty.easy}/${byDifficulty.totalEasy})`);
    console.log(`- Medium: ${((byDifficulty.medium / byDifficulty.totalMedium) * 100).toFixed(1)}% (${byDifficulty.medium}/${byDifficulty.totalMedium})`);
    console.log(`- Hard:   ${((byDifficulty.hard / byDifficulty.totalHard) * 100).toFixed(1)}% (${byDifficulty.hard}/${byDifficulty.totalHard})`);

    // Imprime resultados por campo
    console.log(chalk.bold('\nBy Field:'));
    Object.entries(results.detailedScores.byField).forEach(([field, score]) => {
        const emoji = getEmoji(score.percentage);
        console.log(`- ${field.padEnd(12)} ${score.percentage.toFixed(1)}% ${emoji}`);
    });

    // Imprime métricas de performance
    console.log(chalk.bold('\nPerformance Results'));
    console.log(chalk.gray('------------------'));
    console.log(`Total Time: ${(results.timing.totalTime / 1000).toFixed(2)}s`);
    console.log(`Average Time per Query: ${(results.timing.averageTime / 1000).toFixed(2)}s`);
    console.log(`Fastest Query: ${(results.timing.minTime / 1000).toFixed(2)}s`);
    console.log(`Slowest Query: ${(results.timing.maxTime / 1000).toFixed(2)}s`);

    console.log(chalk.bold('\nSlowest Queries:'));
    results.timing.slowestQueries.forEach((q, i) => {
        console.log(`${i + 1}. ${(q.time / 1000).toFixed(2)}s - "${q.query}"`);
    });

    // Imprime casos falhos
    if (results.failedCases.length > 0) {
        console.log(chalk.bold('\nFailed Cases:'));
        results.failedCases.forEach((failedCase, index) => {
            console.log(chalk.yellow(`\n${index + 1}. Query: "${failedCase.query}"`));
            if (failedCase.description) {
                console.log(chalk.gray(`   Description: ${failedCase.description}`));
            }
            console.log(chalk.gray(`   Difficulty: ${failedCase.difficulty}`));
            console.log(chalk.red('   Mismatches:'));
            failedCase.mismatches.forEach(mismatch => {
                console.log(`   - ${mismatch}`);
            });
        });
    }

    console.log('\n');
}    

runEvaluation().catch(console.error);
