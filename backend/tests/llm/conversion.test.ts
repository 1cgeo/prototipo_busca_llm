import { describe, it, expect, beforeAll } from '@jest/globals';
import { LLMService } from '../../src/services/llm/index.js';
import { complexQueries } from './test-cases/complex_queries.js';
import type { TestSuite, TestCase } from './types.js';
import { preprocessQuery } from '../../src/services/llm/preprocessor.js';

describe('LLM Natural Language to Structured Query Conversion', () => {
  let llmService: LLMService;

  beforeAll(() => {
    llmService = new LLMService('http://localhost:11434');
  });

  const testSuites: TestSuite[] = [
    complexQueries
  ];

  const runTestCase = async (testCase: TestCase) => {
    // Convert query using LLM
    const result = await llmService.processQuery({ query: testCase.input });
    const processedQuery = preprocessQuery(testCase.input);

    // Log the actual result for debugging
    console.log(`Query: ${testCase.input}\nPreprocess:`, `${processedQuery}\nExpected:`, testCase.expected, '\nGot:', result);

    // Type-safe verification of expected fields
    if (testCase.expected.keyword !== undefined) {
      expect(result.keyword).toEqual(testCase.expected.keyword);
    }
    if (testCase.expected.scale !== undefined) {
      expect(result.scale).toEqual(testCase.expected.scale);
    }
    if (testCase.expected.productType !== undefined) {
      expect(result.productType).toEqual(testCase.expected.productType);
    }
    if (testCase.expected.state !== undefined) {
      expect(result.state).toEqual(testCase.expected.state);
    }
    if (testCase.expected.city !== undefined) {
      expect(result.city).toEqual(testCase.expected.city);
    }
    if (testCase.expected.supplyArea !== undefined) {
      expect(result.supplyArea).toEqual(testCase.expected.supplyArea);
    }
    if (testCase.expected.project !== undefined) {
      expect(result.project).toEqual(testCase.expected.project);
    }
    if (testCase.expected.publicationPeriod !== undefined) {
      expect(result.publicationPeriod).toEqual(testCase.expected.publicationPeriod);
    }
    if (testCase.expected.creationPeriod !== undefined) {
      expect(result.creationPeriod).toEqual(testCase.expected.creationPeriod);
    }
    if (testCase.expected.sortField !== undefined) {
      expect(result.sortField).toEqual(testCase.expected.sortField);
    }
    if (testCase.expected.sortDirection !== undefined) {
      expect(result.sortDirection).toEqual(testCase.expected.sortDirection);
    }
    if (testCase.expected.limit !== undefined) {
      expect(result.limit).toEqual(testCase.expected.limit);
    }

    // Verify no unexpected fields
    const allowedKeys = new Set([
      'keyword',
      'scale',
      'productType',
      'state',
      'city',
      'supplyArea',
      'project',
      'publicationPeriod',
      'creationPeriod',
      'sortField',
      'sortDirection',
      'limit'
    ]);

    Object.keys(result).forEach(key => {
      expect(allowedKeys.has(key)).toBeTruthy();
    });
  };

  testSuites.forEach(suite => {
    describe(suite.name, () => {
      suite.tests.forEach(testCase => {
        it(`${testCase.name}${testCase.description ? ` - ${testCase.description}` : ''}`, async () => {
          await runTestCase(testCase);
        });
      });
    });
  });
});