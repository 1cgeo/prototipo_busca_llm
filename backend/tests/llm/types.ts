import type { SearchParams } from '../../src/types/api.js';

export interface TestCase {
  name: string;
  description?: string;
  input: string;
  expected: SearchParams;
}

export interface TestSuite {
  name: string;
  description: string;
  tests: TestCase[];
}