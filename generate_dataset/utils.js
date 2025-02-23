import { 
  WEIGHTS, LOCATIONS, IDENTIFIERS, VARIATIONS} from './types.js';
import { DateTime } from 'luxon';

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shouldInclude(probability) {
  return Math.random() < probability;
}

// Safe string handling helper
function safeString(text) {
  if (!text || typeof text !== 'string') return '';
  return text;
}

// Enhanced typo generation
const TYPO_TYPES = {
  missingLetter: (text) => {
    text = safeString(text);
    if (text.length < 2) return text;
    const pos = randomInt(0, text.length - 1);
    return text.slice(0, pos) + text.slice(pos + 1);
  },
  
  doubleLetter: (text) => {
    text = safeString(text);
    if (text.length < 1) return text;
    const pos = randomInt(0, text.length - 1);
    return text.slice(0, pos) + text[pos] + text[pos] + text.slice(pos + 1);
  },
  
  swapLetters: (text) => {
    text = safeString(text);
    if (text.length < 2) return text;
    const pos = randomInt(0, text.length - 2);
    return text.slice(0, pos) + text[pos + 1] + text[pos] + text.slice(pos + 2);
  },
  
  missingSpace: (text) => {
    text = safeString(text);
    return text.replace(' ', '');
  },
  
  commonReplacements: (text) => {
    text = safeString(text);
    const replacements = {
      'ç': 'c',
      'ã': 'a',
      'á': 'a',
      'à': 'a',
      'â': 'a',
      'é': 'e',
      'ê': 'e',
      'í': 'i',
      'ó': 'o',
      'ô': 'o',
      'õ': 'o',
      'ú': 'u',
      'ü': 'u'
    };
    return [...text].map(char => replacements[char] || char).join('');
  },
  
  keyboardMistake: (text) => {
    text = safeString(text);
    if (text.length < 1) return text;
    
    const keyboard = {
      'a': 'qwsz', 'b': 'vghn', 'c': 'xdfv', 'd': 'erfcxs', 'e': 'rdsw',
      'f': 'rtgvcd', 'g': 'tyhbvf', 'h': 'yujnbg', 'i': 'ujko', 'j': 'uikmnh',
      'k': 'iolmj', 'l': 'opk', 'm': 'njk', 'n': 'bhjm', 'o': 'iklp',
      'p': 'ol', 'q': 'wa', 'r': 'etf', 's': 'awdzx', 't': 'ryfg',
      'u': 'yhji', 'v': 'cfgb', 'w': 'qeas', 'x': 'zsdc', 'y': 'tghu',
      'z': 'asx'
    };
    
    const pos = randomInt(0, text.length - 1);
    const char = text[pos].toLowerCase();
    if (keyboard[char]) {
      const replacement = randomChoice(keyboard[char]);
      return text.slice(0, pos) + replacement + text.slice(pos + 1);
    }
    return text;
  }
};

export function generateTypos(text) {
  // Early return for invalid input
  if (!text || typeof text !== 'string') return '';

  // Determine max possible typos based on text length
  const maxTypos = Math.min(3, Math.floor(text.length / 3));
  let result = text;
  const typoFunctions = Object.values(TYPO_TYPES);
  
  // Para cada typo possível, diminui exponencialmente a chance
  for (let i = 0; i < maxTypos; i++) {
    // Probabilidade diminui pela metade a cada typo adicional
    const probability = WEIGHTS.typo / Math.pow(2, i);
    
    if (shouldInclude(probability)) {
      const typoFunction = randomChoice(typoFunctions);
      const newResult = typoFunction(result);
      
      // Só aplica se o typo realmente mudou o texto
      if (newResult && newResult !== result) {
        result = newResult;
      }
    } else {
      // Se um typo foi rejeitado, para de tentar adicionar mais
      break;
    }
  }

  return result || text; // Fallback to original text if result is empty
}

export function generateDateRange(useRelative = true) {
  if (useRelative && shouldInclude(0.4)) {
    return generateRelativeDateRange();
  }

  const now = DateTime.now();
  const generators = {
    lastWeek: () => ({
      start: now.minus({ weeks: 1 }).startOf('week').toISODate(),
      end: now.minus({ weeks: 1 }).endOf('week').toISODate(),
      description: 'semana passada'
    }),
    lastMonth: () => ({
      start: now.minus({ months: 1 }).startOf('month').toISODate(),
      end: now.minus({ months: 1 }).endOf('month').toISODate(),
      description: 'mês passado'
    }),
    lastQuarter: () => ({
      start: now.minus({ quarters: 1 }).startOf('quarter').toISODate(),
      end: now.minus({ quarters: 1 }).endOf('quarter').toISODate(),
      description: 'último trimestre'
    }),
    thisYear: () => ({
      start: now.startOf('year').toISODate(),
      end: now.toISODate(),
      description: 'este ano'
    }),
    specific: () => {
      const randomYear = randomInt(2010, now.year);
      const randomMonth = randomInt(1, 12);
      const start = DateTime.local(randomYear, randomMonth, 1);
      const end = start.plus({ months: randomInt(1, 6) });
      return {
        start: start.toISODate(),
        end: end.toISODate(),
        description: `entre ${start.toFormat('MM/yyyy')} e ${end.toFormat('MM/yyyy')}`
      };
    }
  };

  return randomChoice(Object.values(generators))();
}

export function generateIdentifier(invalid = false) {
  if (!shouldInclude(WEIGHTS.keyword)) return null;

  if (invalid && shouldInclude(WEIGHTS.invalidData)) {
    const invalidPatterns = [
      () => `${randomInt(1000, 9999)}-${randomInt(1, 9)}-${randomChoice(['NO', 'NE', 'SO', 'SE'])}`,
      () => `${randomChoice(['SA', 'SB', 'SC', 'SD'])}-${randomInt(10, 99)}-${randomChoice(['X', 'Y', 'Z'])}`
    ];
    return invalidPatterns[Math.floor(Math.random() * invalidPatterns.length)]();
  }

  // Get valid identifier
  const type = randomChoice(['MI', 'INOM']);
  const identifiers = IDENTIFIERS[type.toLowerCase()];
  const value = randomChoice(identifiers);
  
  // 50% chance to include prefix
  const includePrefix = Math.random() < 0.5;
  return includePrefix ? `${type} ${value}` : value;
}

export function generateLocation(invalid = false) {
  if (!shouldInclude(WEIGHTS.locationGroup)) return {};
  
  let state = null;
  let city = null;
  let stateAbbr = null;

  // Generate state
  if (shouldInclude(WEIGHTS.state)) {
    let stateobj = randomChoice(LOCATIONS.states);
    state = stateobj.name
  }

  // Generate city with proper validation
  if (shouldInclude(WEIGHTS.city)) {
    if (state && !invalid) {
      // Get cities from that state
      const stateCities = Object.entries(LOCATIONS.cities)
        .filter(([_, stateMatch]) => stateMatch === stateAbbr)
        .map(([city]) => city);
      
      if (stateCities.length > 0) {
        city = randomChoice(stateCities);
      }
    } else if (invalid && shouldInclude(WEIGHTS.invalidData)) {
      const invalidCities = ['Cidade Inexistente', 'Nova Lugar', 'São Nowhere'];
      city = randomChoice(invalidCities);
    } else {
      // Random valid city
      city = randomChoice(Object.keys(LOCATIONS.cities));
    }
  }

  return { state, city };
}


export function generateLimit() {
  if (!shouldInclude(WEIGHTS.limit)) return null;
  
  if (shouldInclude(WEIGHTS.invalidData)) {
    return randomInt(-10, 1000); // Invalid limits
  }
  
  return randomInt(1, 100); // Valid limits
}

export function generateSortParams() {
  if (!shouldInclude(0.3)) return {};
  
  return {
    sortField: randomChoice(['publicationDate', 'creationDate']),
    sortDirection: randomChoice(['ASC', 'DESC'])
  };
}

export function getVariation(type, canonicalValue) {
  if (!VARIATIONS[type] || !VARIATIONS[type][canonicalValue]) {
    return canonicalValue;
  }

  const variations = [...VARIATIONS[type][canonicalValue], canonicalValue];
  return randomChoice(variations);
}

// Encontra o valor canônico para uma variação
export function getCanonicalValue(type, value) {
  if (!VARIATIONS[type]) {
    return value;
  }

  // Procura em todas as entradas do tipo
  for (const [canonical, variations] of Object.entries(VARIATIONS[type])) {
    if (canonical === value || variations.includes(value)) {
      return canonical;
    }
  }

  return value;
}

// Verifica se um valor é uma variação
export function isVariation(type, value) {
  if (!VARIATIONS[type]) {
    return false;
  }

  return Object.entries(VARIATIONS[type]).some(([canonical, variations]) => 
    variations.includes(value) && canonical !== value
  );
}

// Gera texto de normalização para o reasoning
export function getReasoningText(type, usedValue, canonicalValue, context = {}) {
  if (!usedValue || !canonicalValue) return null;
  
  if (!isVariation(type, usedValue) && usedValue === canonicalValue) {
    return null;
  }

  const templates = {
    SCALE: {
      inference: `Scale "${usedValue}" indicates ${canonicalValue}`,
      variation: `Scale "${usedValue}" standardizes to ${canonicalValue}`,
      context: `"${usedValue}" represents ${canonicalValue} scale`
    },
    PRODUCT_TYPE: {
      inference: `Product type "${canonicalValue}" inferred from "${usedValue}"`,
      variation: `"${usedValue}" refers to product type ${canonicalValue}`,
      context: `"${usedValue}" matches product type ${canonicalValue}`
    },
    SUPPLY_AREA: {
      inference: `Supply area "${canonicalValue}" derived from "${usedValue}"`,
      variation: `"${usedValue}" translates to ${canonicalValue}`,
      context: `"${usedValue}" indicates ${canonicalValue}`
    },
    STATE: {
      inference: `State reference "${canonicalValue}" extracted from "${usedValue}"`,
      variation: `"${usedValue}" normalized to state ${canonicalValue}`,
      context: `State "${usedValue}" refers to ${canonicalValue}`
    },
    PROJECT: {
      inference: `Project "${canonicalValue}" identified from "${usedValue}"`,
      variation: `"${usedValue}" refers to project ${canonicalValue}`,
      context: `Project reference "${usedValue}" matches ${canonicalValue}`
    }
  };

  const template = templates[type]?.[context.type || 'inference'] || 
    `"${usedValue}" corresponds to ${canonicalValue}`;

  return template
    .replace(/\${usedValue}/g, usedValue)
    .replace(/\${canonicalValue}/g, canonicalValue);
}


export function getSimilarityScore(params1, params2) {
  const weights = {
    keyword: 0.3,
    scale: 0.1,
    productType: 0.2,
    state: 0.15,
    city: 0.15,
    supplyArea: 0.05,
    project: 0.05
  };

  let score = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (params1[key] && params2[key]) {
      if (params1[key] === params2[key]) {
        score += weight;
      }
      totalWeight += weight;
    }
  }

  // Check date ranges overlap if they exist
  if (params1.publicationPeriod && params2.publicationPeriod) {
    const overlap = checkDateOverlap(
      params1.publicationPeriod,
      params2.publicationPeriod
    );
    if (overlap) score += 0.1;
    totalWeight += 0.1;
  }

  return totalWeight > 0 ? score / totalWeight : 0;
}

function checkDateOverlap(range1, range2) {
  const start1 = DateTime.fromISO(range1.start);
  const end1 = DateTime.fromISO(range1.end);
  const start2 = DateTime.fromISO(range2.start);
  const end2 = DateTime.fromISO(range2.end);

  return start1 <= end2 && start2 <= end1;
}

function generateRelativeDateRange() {
  const now = DateTime.now();
  const patterns = [
    {
      description: 'última semana',
      generate: () => ({
        start: now.minus({ weeks: 1 }).startOf('week'),
        end: now.minus({ weeks: 1 }).endOf('week')
      })
    },
    {
      description: 'últimos 3 meses',
      generate: () => ({
        start: now.minus({ months: 3 }),
        end: now
      })
    },
    {
      description: 'último trimestre',
      generate: () => ({
        start: now.minus({ quarters: 1 }).startOf('quarter'),
        end: now.minus({ quarters: 1 }).endOf('quarter')
      })
    },
    {
      description: 'ano passado',
      generate: () => ({
        start: now.minus({ years: 1 }).startOf('year'),
        end: now.minus({ years: 1 }).endOf('year')
      })
    }
  ];

  const pattern = randomChoice(patterns);
  const dates = pattern.generate();

  return {
    start: dates.start.toISODate(),
    end: dates.end.toISODate(),
    description: pattern.description
  };
}

export const PARAM_GROUPS = {
  identifier: ['keyword'],
  location: ['state', 'city'],
  metadata: ['scale', 'productType'],
  organization: ['supplyArea', 'project'],
  temporal: ['publicationPeriod', 'creationPeriod', 'sortField', 'sortDirection']
};

export function calculateGroupDecay(params) {
  const usedGroups = new Set();
  
  // Count which groups are used
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      for (const [group, fields] of Object.entries(PARAM_GROUPS)) {
        if (fields.includes(key)) {
          usedGroups.add(group);
          break;
        }
      }
    }
  });

  // Apply decay based on number of groups used
  return Math.pow(WEIGHTS.parameterDecay, usedGroups.size);
}