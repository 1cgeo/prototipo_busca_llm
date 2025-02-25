import { 
  QUERY_FORMATS, WEIGHTS,
} from './types.js';
import {
  randomChoice, shouldInclude, generateTypos,
  getVariation, addParameterConnector, addSemanticNoise,
  applyFormalityShift, addQueryContext, randomInt
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
    },
    // Nova opção: Multi-sentence (10% chance retirada de cada um dos anteriores)
    {
      weight: 0.1,
      generate: (params) => {
        const template = randomChoice(QUERY_FORMATS.multiSentence);
        return {
          template,
          type: 'multiSentence'
        };
      }
    },
    // Nova opção: Contextual format (10% chance retirada de cada um dos anteriores)
    {
      weight: 0.1,
      generate: (params) => {
        const localRef = randomChoice([
          'região amazônica', 'região nordeste', 'região central',
          'litoral', 'zona de fronteira', 'área urbana',
          'área de conservação', 'região metropolitana', 'serra'
        ]);
        const template = randomChoice(QUERY_FORMATS.contextualFormats).replace('{localRef}', localRef);
        return {
          template,
          type: 'contextual'
        };
      }
    },
    // Nova opção: List format (10% chance retirada de cada um dos anteriores)
    {
      weight: 0.1,
      generate: (params) => {
        const template = randomChoice(QUERY_FORMATS.listFormats);
        return {
          template,
          type: 'list'
        };
      }
    }
  ];

  // Normaliza os pesos para garantir que somem 1.0
  const totalWeight = structures.reduce((sum, structure) => sum + structure.weight, 0);
  structures.forEach(structure => {
    structure.weight = structure.weight / totalWeight;
  });

  let random = Math.random();
  for (const structure of structures) {
    random -= structure.weight;
    if (random <= 0) return structure.generate();
  }
  
  return structures[0].generate();
}

function generateParamOrder(params, queryType) {
  const orders = {
    keyword: 1,
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
    keyword: params.keyword ? [params.keyword] : [],
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
      `publicado ${params.publicationPeriod.description}`
    );
  } else if (params.creationPeriod) {
    groups.dates.push(
      `criado ${params.creationPeriod.description}`
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
  if (shouldInclude(0.5)) { // Increased chance (from 0.3 to 0.5) to swap parameters for more variety
    // Potentially swap multiple adjacent groups
    for (let i = 1; i < orderedGroups.length; i++) {
      if (shouldInclude(0.4)) { // Increased chance (from 0.3 to 0.4)
        [orderedGroups[i-1], orderedGroups[i]] = [orderedGroups[i], orderedGroups[i-1]];
      }
    }
    
    // Occasionally do a more radical reordering
    if (shouldInclude(0.2) && orderedGroups.length >= 3) {
      const pos1 = randomInt(0, orderedGroups.length - 1);
      let pos2 = randomInt(0, orderedGroups.length - 1);
      // Make sure pos2 is different from pos1
      while (pos2 === pos1) {
        pos2 = randomInt(0, orderedGroups.length - 1);
      }
      [orderedGroups[pos1], orderedGroups[pos2]] = [orderedGroups[pos2], orderedGroups[pos1]];
    }
  }

  // Flatten groups
  let flatParams = orderedGroups.flat();
  
  // CORREÇÃO: Utilizar addParameterConnector para adicionar conectores entre parâmetros
  if (shouldInclude(0.4) && flatParams.length >= 2) {
    flatParams = addParameterConnector(flatParams);
  }

  return flatParams;
}

function generateVariations(params, queryType) {
  const variations = [];

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;

    const variationType = {
      scale: 'SCALE',
      productType: 'PRODUCT_TYPE',
      supplyArea: 'SUPPLY_AREA',
      project: 'PROJECT'
    }[key];

    if (variationType && shouldInclude(0.6)) { // Increased chance from 0.4 to 0.6 for more variation
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
  if (structure.type !== 'question' && shouldInclude(0.4)) { // Increased chance from 0.2 to 0.4
    query += ` ${randomChoice(QUERY_FORMATS.suffixes)}`;
  }

  // Add semantic noise/context for more variation
  if (shouldInclude(WEIGHTS.semanticNoise)) {
    query = addSemanticNoise(query);
  }

  // Apply formality shifts for more variation
  if (shouldInclude(WEIGHTS.formalityShift)) {
    query = applyFormalityShift(query, shouldInclude(0.5));
  }

  // Add contextual information
  if (shouldInclude(WEIGHTS.contextualInfo)) {
    query = addQueryContext(query);
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

// Nova função: Expandir a partir de uma query bem-sucedida
export function expandQueryVariations(originalQuery, numberOfVariations = 3) {
  if (!originalQuery || !originalQuery.query) return [];
  
  const variations = [];
  const { query, structure, usedParams } = originalQuery;
  
  // Diferentes tipos de expansão
  const expansionTypes = [
    // Typos diferentes
    () => {
      const typoQuery = generateTypos(query);
      return {
        query: typoQuery,
        usedParams,
        structure,
        expansionType: 'typo'
      };
    },
    
    // Mudança de estrutura (pergunta para comando ou vice-versa)
    () => {
      let newQuery = query;
      let newStructure = structure;
      
      if (structure === 'question') {
        // Converter pergunta para comando
        newQuery = query.replace(/\?$/, '');
        const prefixes = ['preciso', 'buscar', 'localizar', 'encontrar', 'quero'];
        newQuery = `${randomChoice(prefixes)} ${newQuery}`;
        newStructure = 'command';
      } else {
        // Converter comando/statement para pergunta
        const questions = ['onde posso encontrar', 'como faço para localizar', 'seria possível mostrar', 'existe'];
        newQuery = `${randomChoice(questions)} ${query}?`;
        newStructure = 'question';
      }
      
      return {
        query: newQuery,
        usedParams,
        structure: newStructure,
        expansionType: 'structure'
      };
    },
    
    // Adicionar contexto
    () => {
      return {
        query: addQueryContext(query),
        usedParams,
        structure,
        expansionType: 'context'
      };
    },
    
    // Adicionar ruído semântico
    () => {
      return {
        query: addSemanticNoise(query),
        usedParams,
        structure,
        expansionType: 'semantic'
      };
    },
    
    // Mudar formalidade
    () => {
      return {
        query: applyFormalityShift(query, shouldInclude(0.5)),
        usedParams,
        structure,
        expansionType: 'formality'
      };
    },
    
    // Adicionar urgência ou especificação temporal
    () => {
      const urgencyPhrases = [
        'urgente: ', 'com urgência: ', 'prioridade máxima: ',
        'para hoje: ', 'necessário imediatamente: ', 'preciso para ontem: '
      ];
      
      return {
        query: `${randomChoice(urgencyPhrases)}${query}`,
        usedParams,
        structure,
        expansionType: 'urgency'
      };
    },
    
    // Convertendo para formato de lista
    () => {
      const listFormats = [
        `Preciso do seguinte material: 1. ${query}`,
        `Solicito acesso aos produtos cartográficos listados: - ${query}`,
        `Necessito dos seguintes dados para análise: item 1: ${query}`,
        `Equipe de campo solicitou: • ${query}`
      ];
      
      return {
        query: randomChoice(listFormats),
        usedParams,
        structure: 'list',
        expansionType: 'list'
      };
    },
    
    // Adicionando múltiplas frases
    () => {
      const introductions = [
        'Estou trabalhando em um projeto importante. ',
        'Somos uma equipe em campo. ',
        'A coordenação solicitou um relatório detalhado. ',
        'Estamos com dificuldades na área de operação. ',
        'Olá, bom dia. ',
        'Prezados, conforme conversado anteriormente. ',
        'Boa tarde. Estamos com uma situação crítica em campo. ',
        'Sou da equipe técnica do projeto X. ',
        'Olá. Acabei de receber uma solicitação urgente. '
      ];
      
      return {
        query: `${randomChoice(introductions)}${query}`,
        usedParams,
        structure: 'multiSentence',
        expansionType: 'multiSentence'
      };
    }
  ];
  
  // Gerar o número desejado de variações
  for (let i = 0; i < numberOfVariations; i++) {
    const expansionFunction = randomChoice(expansionTypes);
    const variation = expansionFunction();
    
    // Garantir que não haja duplicatas
    if (!variations.some(v => v.query === variation.query)) {
      variations.push(variation);
    }
  }
  
  return variations;
}