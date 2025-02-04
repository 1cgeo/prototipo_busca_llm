import type { SearchParams } from '../src/types/api.js';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TestFocus = 'scale' | 'dates' | 'location' | 'project' | 'type' | 'sorting';

export interface TimingMetrics {
    totalTime: number;       // Tempo total da execução
    averageTime: number;     // Tempo médio por query
    minTime: number;         // Tempo mínimo de uma query
    maxTime: number;         // Tempo máximo de uma query
    slowestQueries: Array<{  // Top 5 queries mais lentas
        query: string;
        time: number;
    }>;
}

export interface TestCase {
    query: string;
    expected: Partial<SearchParams> & { [key: string]: any };
    difficulty: Difficulty;
    description?: string;
    focus?: TestFocus[];
}

export interface FieldScore {
    correct: number;
    total: number;
    percentage: number;
}

export interface DetailedScores {
    byDifficulty: {
        easy: number;
        medium: number;
        hard: number;
        totalEasy: number;
        totalMedium: number;
        totalHard: number;
    };
    byField: {
        [key: string]: FieldScore;
    };
}

export interface TestResult {
    totalScore: number;
    maxPossibleScore: number;
    percentageScore: number;
    detailedScores: DetailedScores;
    failedCases: Array<{
        query: string;
        description?: string;
        difficulty: Difficulty;
        expected: Partial<SearchParams>;
        received: Partial<SearchParams>;
        mismatches: string[];
    }>;
    timing: TimingMetrics; 
}

export interface FieldWeight {
    basePoints: number;
    keyPoints: number;
    valuePoints: number;
    approximationPoints: number;
}

export interface ScoringConfig {
    difficultyMultipliers: {
        easy: number;
        medium: number;
        hard: number;
    };
    fieldWeights: {
        [K in keyof SearchParams]: FieldWeight;
    } & {
        [key: string]: FieldWeight;
    };
}