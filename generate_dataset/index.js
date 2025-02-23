import fs from 'fs/promises';
import path from 'path';
import { program } from 'commander';
import ora from 'ora';
import { generateTrainingData } from './generator.js';

program
  .name('llm-training-generator')
  .description('Generate training data for LLM fine-tuning')
  .version('1.0.0')
  .option('-n, --number <number>', 'number of examples to generate', '10000')
  .option('-o, --output <path>', 'output directory', 'output')
  .option('--invalid-ratio <ratio>', 'ratio of invalid examples', '0.1')
  .option('--seed <seed>', 'random seed for reproducibility')
  .parse(process.argv);

const opts = program.opts();

async function setupOutputDir(dir) {
  await fs.mkdir(dir, { recursive: true });
  
  // Clean up old files
  const files = await fs.readdir(dir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      await fs.unlink(path.join(dir, file));
    }
  }
}

async function saveDataset(dataset) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(opts.output, `dataset_${timestamp}.json`);
  
  await fs.writeFile(filePath, JSON.stringify(dataset, null, 2), 'utf8');
  
  return filePath;
}

function validateOptions(options) {
  const number = parseInt(options.number);
  if (isNaN(number) || number <= 0) {
    throw new Error('Number of examples must be a positive integer');
  }

  const invalidRatio = parseFloat(options.invalidRatio);
  if (isNaN(invalidRatio) || invalidRatio < 0 || invalidRatio > 1) {
    throw new Error('Invalid ratio must be between 0 and 1');
  }
}

async function main() {
  try {
    validateOptions(opts);

    if (opts.seed) {
      Math.random = () => {
        let seed = opts.seed;
        seed = seed & 0xffffffff;
        seed = (seed + 0x6D2B79F5) & 0xffffffff;
        seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
        seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
        return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
      };
    }

    const spinner = ora('Generating training data...').start();

    const dataset = await generateTrainingData(
      parseInt(opts.number),
      parseFloat(opts.invalidRatio)
    );

    await setupOutputDir(opts.output);
    const filePath = await saveDataset(dataset);
    
    spinner.succeed(`Generated ${dataset.length} examples`);
    console.log(`\nFile saved: ${filePath}`);

    // Sample examples
    console.log('\nSample Examples:');
    console.log('===============');
    for (let i = 0; i < 3; i++) {
      const example = dataset[Math.floor(Math.random() * dataset.length)];
      console.log(`\nExample ${i + 1}:`);
      console.log(`Query: "${example.query}"`);
      console.log('Answer:', JSON.stringify(example.answer, null, 2));
    }

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();