import type { 
    TestCase, 
    ScoringConfig,
    FieldScore
} from './types.js';
import type { SearchParams } from '../src/types/api.js';

const DEFAULT_CONFIG: ScoringConfig = {
    difficultyMultipliers: {
        easy: 1,
        medium: 1.5,
        hard: 2
    },
    fieldWeights: {
        scale: {
            basePoints: 10,
            keyPoints: 3,
            valuePoints: 7,
            approximationPoints: 4
        },
        productType: {
            basePoints: 10,
            keyPoints: 3,
            valuePoints: 7,
            approximationPoints: 4
        },
        state: {
            basePoints: 8,
            keyPoints: 2,
            valuePoints: 6,
            approximationPoints: 4
        },
        city: {
            basePoints: 8,
            keyPoints: 2,
            valuePoints: 6,
            approximationPoints: 4
        },
        supplyArea: {
            basePoints: 10,
            keyPoints: 3,
            valuePoints: 7,
            approximationPoints: 4
        },
        project: {
            basePoints: 10,
            keyPoints: 3,
            valuePoints: 7,
            approximationPoints: 4
        },
        publicationPeriod: {
            basePoints: 12,
            keyPoints: 4,
            valuePoints: 8,
            approximationPoints: 5
        },
        creationPeriod: {
            basePoints: 12,
            keyPoints: 4,
            valuePoints: 8,
            approximationPoints: 5
        },
        sortField: {
            basePoints: 6,
            keyPoints: 2,
            valuePoints: 4,
            approximationPoints: 3
        },
        sortDirection: {
            basePoints: 6,
            keyPoints: 2,
            valuePoints: 4,
            approximationPoints: 3
        },
        limit: {
            basePoints: 6,
            keyPoints: 2,
            valuePoints: 4,
            approximationPoints: 0
        },
        keyword: {
            basePoints: 6,
            keyPoints: 2,
            valuePoints: 4,
            approximationPoints: 3
        }
    }
};

export class Scorer {
    private config: ScoringConfig;

    constructor(config: Partial<ScoringConfig> = {}) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config
        };
    }

    evaluateTestCase(
        testCase: TestCase,
        result: Partial<SearchParams>
    ): {
        score: number;
        maxScore: number;
        mismatches: string[];
        fieldScores: { [key: string]: FieldScore }
    } {
        const mismatches: string[] = [];
        const fieldScores: { [key: string]: FieldScore } = {};
        let totalScore = 0;
        let maxScore = 0;

        // Avalia cada campo esperado
        for (const [key, expectedValue] of Object.entries(testCase.expected)) {
            const fieldWeight = this.config.fieldWeights[key];
            if (!fieldWeight) continue; // Pula campos não configurados

            const basePoints = fieldWeight.basePoints * this.config.difficultyMultipliers[testCase.difficulty];
            const resultValue = result[key as keyof SearchParams];
            let fieldScore = 0;
            let fieldMaxScore = basePoints;

            // Campo presente
            if (resultValue !== undefined) {
                fieldScore += fieldWeight.keyPoints;

                // Valor correto
                if (this.compareValues(expectedValue, resultValue)) {
                    fieldScore += fieldWeight.valuePoints;
                } 
                // Valor aproximado
                else if (this.isApproximateMatch(key, expectedValue, resultValue)) {
                    fieldScore += fieldWeight.approximationPoints;
                    mismatches.push(`${key}: Valor aproximado - esperado: ${JSON.stringify(expectedValue)}, recebido: ${JSON.stringify(resultValue)}`);
                } else {
                    mismatches.push(`${key}: Valor incorreto - esperado: ${JSON.stringify(expectedValue)}, recebido: ${JSON.stringify(resultValue)}`);
                }
            } else {
                mismatches.push(`${key}: Campo ausente`);
            }

            fieldScores[key] = {
                correct: fieldScore,
                total: fieldMaxScore,
                percentage: (fieldScore / fieldMaxScore) * 100
            };

            totalScore += fieldScore;
            maxScore += fieldMaxScore;
        }

        return {
            score: totalScore,
            maxScore,
            mismatches,
            fieldScores
        };
    }

    private isApproximateMatch(field: string, expected: unknown, received: unknown): boolean {
        // Implementar lógica específica para cada tipo de campo
        switch (field) {
            case 'scale':
                return this.approximateScaleMatch(expected as string, received as string);
            case 'state':
                return this.approximateStateMatch(expected as string, received as string);
            default:
                return false;
        }
    }

    private approximateScaleMatch(expected: string, received: string): boolean {
        // Implementar lógica específica para escalas
        const normalizeScale = (scale: string) => scale.replace(/[:.]/g, '');
        return normalizeScale(expected) === normalizeScale(received);
    }

    private compareValues(expected: any, received: any): boolean {
        if (typeof expected !== typeof received) return false;
        if (expected === null || received === null) return expected === received;

        if (typeof expected === 'object') {
            if (Array.isArray(expected)) {
                return Array.isArray(received) &&
                    expected.length === received.length &&
                    expected.every((val, idx) => this.compareValues(val, received[idx]));
            }

            // Para períodos de data, permite uma margem de erro de 1 dia
            if ('start' in expected && 'end' in expected) {
                const expectedStart = new Date(expected.start);
                const expectedEnd = new Date(expected.end);
                const receivedStart = new Date(received.start);
                const receivedEnd = new Date(received.end);

                const dayDiffStart = Math.abs(expectedStart.getTime() - receivedStart.getTime()) / (1000 * 60 * 60 * 24);
                const dayDiffEnd = Math.abs(expectedEnd.getTime() - receivedEnd.getTime()) / (1000 * 60 * 60 * 24);

                return dayDiffStart <= 1 && dayDiffEnd <= 1;
            }

            return Object.keys(expected).every(key =>
                this.compareValues(expected[key], received[key])
            );
        }

        return expected === received;
    }

    private approximateStateMatch(expected: string, received: string): boolean {
        const stateAbbreviations: Record<string, string> = {
            'RJ': 'Rio de Janeiro',
            'SP': 'São Paulo',
            'MG': 'Minas Gerais',
            'ES': 'Espírito Santo',
            'PR': 'Paraná',
            'SC': 'Santa Catarina',
            'RS': 'Rio Grande do Sul',
            'MS': 'Mato Grosso do Sul',
            'MT': 'Mato Grosso',
            'GO': 'Goiás',
            'DF': 'Distrito Federal',
            'BA': 'Bahia',
            'SE': 'Sergipe',
            'AL': 'Alagoas',
            'PE': 'Pernambuco',
            'PB': 'Paraíba',
            'RN': 'Rio Grande do Norte',
            'CE': 'Ceará',
            'PI': 'Piauí',
            'MA': 'Maranhão',
            'PA': 'Pará',
            'AP': 'Amapá',
            'AM': 'Amazonas',
            'RR': 'Roraima',
            'AC': 'Acre',
            'RO': 'Rondônia',
            'TO': 'Tocantins'
        };
        
        // Função para normalizar texto (remover acentos, etc)
        const normalizeText = (text: string): string => {
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();
        };

        // Normaliza os valores de entrada
        const normalizedExpected = normalizeText(expected);
        const normalizedReceived = normalizeText(received);

        // Verificação direta
        if (normalizedExpected === normalizedReceived) {
            return true;
        }

        // Verifica se é uma sigla
        if (expected.length === 2) {
            const fullName = stateAbbreviations[expected.toUpperCase()];
            return fullName ? normalizeText(fullName) === normalizedReceived : false;
        }

        // Verifica o caso inverso (received é sigla)
        if (received.length === 2) {
            const fullName = stateAbbreviations[received.toUpperCase()];
            return fullName ? normalizedExpected === normalizeText(fullName) : false;
        }

        // Verificação de substring significativa (mais de 3 caracteres)
        if (normalizedExpected.length > 3 && normalizedReceived.length > 3) {
            return normalizedExpected.includes(normalizedReceived) || 
                   normalizedReceived.includes(normalizedExpected);
        }

        return false;
    }
}