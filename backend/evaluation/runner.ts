import { LLMService } from '../src/services/llm/index.js';
import { Scorer } from './scorer.js';
import type { TestCase, TestResult } from './types.js';

export class TestRunner {
    private llmService: LLMService;
    private scorer: Scorer;

    constructor(llmBaseUrl: string) {
        this.llmService = new LLMService(llmBaseUrl);
        this.scorer = new Scorer();
    }

    async runTests(testCases: TestCase[]): Promise<TestResult> {
        const startTime = Date.now();
        const queryTimes: Array<{ query: string; time: number }> = [];

        const result: TestResult = {
            totalScore: 0,
            maxPossibleScore: 0,
            percentageScore: 0,
            detailedScores: {
                byDifficulty: {
                    easy: 0,
                    medium: 0,
                    hard: 0,
                    totalEasy: 0,
                    totalMedium: 0,
                    totalHard: 0
                },
                byField: {}
            },
            failedCases: [],
            timing: {
                totalTime: 0,
                averageTime: 0,
                minTime: 0,
                maxTime: 0,
                slowestQueries: []
            }
        };

        for (const testCase of testCases) {
            const queryStart = Date.now();
            
            // Processa a query através do pipeline completo
            const { searchParams } = await this.llmService.processQuery({
                query: testCase.query
            });

            // Registra o tempo da query
            const queryTime = Date.now() - queryStart;
            queryTimes.push({
                query: testCase.query,
                time: queryTime
            });

            // Avalia o resultado
            const evaluation = this.scorer.evaluateTestCase(testCase, searchParams);

            // Atualiza pontuações
            result.totalScore += evaluation.score;
            result.maxPossibleScore += evaluation.maxScore;

            // Atualiza scores por dificuldade
            switch (testCase.difficulty) {
                case 'easy':
                    result.detailedScores.byDifficulty.easy += evaluation.score;
                    result.detailedScores.byDifficulty.totalEasy += evaluation.maxScore;
                    break;
                case 'medium':
                    result.detailedScores.byDifficulty.medium += evaluation.score;
                    result.detailedScores.byDifficulty.totalMedium += evaluation.maxScore;
                    break;
                case 'hard':
                    result.detailedScores.byDifficulty.hard += evaluation.score;
                    result.detailedScores.byDifficulty.totalHard += evaluation.maxScore;
                    break;
            }

            // Atualiza scores por campo
            for (const [field, score] of Object.entries(evaluation.fieldScores)) {
                result.detailedScores.byField[field] = result.detailedScores.byField[field] || {
                    correct: 0,
                    total: 0,
                    percentage: 0
                };
                result.detailedScores.byField[field].correct += score.correct;
                result.detailedScores.byField[field].total += score.total;
            }

            // Registra casos falhos
            if (evaluation.mismatches.length > 0) {
                result.failedCases.push({
                    query: testCase.query,
                    description: testCase.description,
                    difficulty: testCase.difficulty,
                    expected: testCase.expected,
                    received: searchParams,
                    mismatches: evaluation.mismatches
                });
            }
        }

        // Calcula métricas de tempo
        const times = queryTimes.map(qt => qt.time);
        result.timing = {
            totalTime: Date.now() - startTime,
            averageTime: times.reduce((a, b) => a + b, 0) / times.length,
            minTime: Math.min(...times),
            maxTime: Math.max(...times),
            slowestQueries: queryTimes
                .sort((a, b) => b.time - a.time)
                .slice(0, 5)
        };

        // Calcula percentagens finais
        result.percentageScore = (result.totalScore / result.maxPossibleScore) * 100;

        // Calcula percentagens por campo
        Object.values(result.detailedScores.byField).forEach(fieldScore => {
            fieldScore.percentage = (fieldScore.correct / fieldScore.total) * 100;
        });

        return result;
    }
}