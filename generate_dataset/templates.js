import { 
  QUERY_FORMATS, WEIGHTS,
} from './types.js';
import {
  randomChoice, shouldInclude, generateTypos,
  getVariation
} from './utils.js';

function generateQueryStructure() {
  const structures = [
    // Questions (30% chance)
    {
      weight: 0.3,
      generate: (params) => {
        const base = randomChoice(QUERY_FORMATS.questions);
        return { 
          template: base,
          type: 'question'
        };
      }
    },
    // Direct commands (40% chance)
    {
      weight: 0.4,
      generate: (params) => {
        const prefix = shouldInclude(0.7) ? `${randomChoice(QUERY_FORMATS.prefixes)} ` : '';
        return {
          template: prefix + '{params}',
          type: 'command'
        };
      }
    },
    // Natural statements (30% chance)
    {
      weight: 0.3,
      generate: (params) => {
        const template = randomChoice(QUERY_FORMATS.statements);
        return {
          template,
          type: 'statement'
        };
      }
    }
  ];

  let random = Math.random();
  for (const structure of structures) {
    random -= structure.weight;
    if (random <= 0) return structure.generate();
  }
  
  return structures[0].generate();
}

function generateParamOrder(params, queryType) {
  const orders = {
    identifier: 1,
    productType: 2,
    scale: 3,
    location: 4,
    supplyArea: 5,
    project: 6,
    dates: 7,
    sort: 8,
    limit: 9
  };

  // Group parameters by type
  const groups = {
    identifier: params.identifier ? [`${params.identifier.type} ${params.identifier.value}`] : [],
    productType: params.productType ? [params.productType] : [],
    scale: params.scale ? [`na escala ${params.scale}`] : [],
    location: [],
    supplyArea: params.supplyArea ? [`do ${params.supplyArea}`] : [],
    project: params.project ? [`do projeto ${params.project}`] : [],
    dates: [],
    sort: [],
    limit: params.limit ? [`mostrar ${params.limit} resultados`] : []
  };

  // Handle location group
  if (params.location) {
    if (params.location.city) {
      groups.location.push(`em ${params.location.city}`);
    }
    if (params.location.state) {
      groups.location.push(`no ${params.location.state.name}`);
    }
  }

  // Handle dates group
  if (params.publicationPeriod) {
    groups.dates.push(
      `publicado entre ${params.publicationPeriod.start} e ${params.publicationPeriod.end}`
    );
  } else if (params.creationPeriod) {
    groups.dates.push(
      `criado entre ${params.creationPeriod.start} e ${params.creationPeriod.end}`
    );
  }

  // Handle sort group
  if (params.sortField) {
    const sortText = params.sortDirection === 'ASC' ? 'mais antigas' : 'mais recentes';
    groups.sort.push(sortText);
  }

  // Combine groups based on query type
  const orderedGroups = Object.entries(groups)
    .sort(([a], [b]) => orders[a] - orders[b])
    .filter(([_, items]) => items.length > 0)
    .map(([_, items]) => items);

  // Randomize order slightly within constraints
  if (shouldInclude(0.3)) {
    // 30% chance to swap some adjacent groups
    for (let i = 1; i < orderedGroups.length; i++) {
      if (shouldInclude(0.3)) {
        [orderedGroups[i-1], orderedGroups[i]] = [orderedGroups[i], orderedGroups[i-1]];
      }
    }
  }

  return orderedGroups.flat();
}

function generateVariations(params, queryType) {
  const variations = [];
  
  if (params.identifier && shouldInclude(WEIGHTS.withoutPrefix)) {
    variations.push({
      type: 'IDENTIFIER',
      canonical: `${params.identifier.type} ${params.identifier.value}`,
      used: params.identifier.value
    });
  }

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;

    const variationType = {
      scale: 'SCALE',
      productType: 'PRODUCT_TYPE',
      supplyArea: 'SUPPLY_AREA',
      project: 'PROJECT'
    }[key];

    if (variationType && shouldInclude(0.4)) {
      const variation = getVariation(variationType, value);
      if (variation !== value) {
        variations.push({
          type: variationType,
          canonical: value,
          used: variation
        });
      }
    }
  });

  return variations;
}

export function generateQuery(params) {
  // Get base query structure
  const structure = generateQueryStructure();
  
  // Generate parameter order
  const orderedParams = generateParamOrder(params, structure.type);
  
  // Apply variations
  const variations = generateVariations(params, structure.type);
  let queryText = orderedParams.join(' ');
  
  // Apply variations to the text
  variations.forEach(variation => {
    queryText = queryText.replace(variation.canonical, variation.used);
  });

  // Insert into template
  let query = structure.template.replace('{params}', queryText);

  // Add optional suffix for non-questions
  if (structure.type !== 'question' && shouldInclude(0.2)) {
    query += ` ${randomChoice(QUERY_FORMATS.suffixes)}`;
  }

  // Apply typos if needed
  if (shouldInclude(WEIGHTS.typo)) {
    query = generateTypos(query);
  }

  // Generate reasoning for variations
  const usedParams = {};
  const usedVariations = variations.map(v => ({
    type: v.type,
    canonical: v.canonical,
    used: v.used
  }));

  // Track used parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value) usedParams[key] = value;
  });

  return {
    query,
    usedParams,
    usedVariations,
    structure: structure.type
  };
}