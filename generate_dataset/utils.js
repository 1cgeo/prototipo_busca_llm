import {
  WEIGHTS, LOCATIONS, KEYWORDS, VARIATIONS,
  LOCAL_REFERENCES, FORMAL_ROLES, PROJECT_CONTEXTS
} from './types.js';
import { DateTime } from 'luxon';

export function randomChoice(array) {
  if (!array || array.length === 0) {
    return null;
  }
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
    const words = text.split(' ');
    if (words.length < 2) return text;
    const pos = randomInt(0, words.length - 2);
    return words.slice(0, pos).join(' ') + ' ' + words[pos] + words[pos + 1] + ' ' + words.slice(pos + 2).join(' ');
  },

  extraSpace: (text) => {
    text = safeString(text);
    if (text.length < 1) return text;
    const pos = randomInt(1, text.length - 1);
    return text.slice(0, pos) + ' ' + text.slice(pos);
  },

  wrongCase: (text) => {
    text = safeString(text);
    if (text.length < 1) return text;
    const pos = randomInt(0, text.length - 1);
    const char = text[pos];
    const isLower = char === char.toLowerCase();
    return text.slice(0, pos) + (isLower ? char.toUpperCase() : char.toLowerCase()) + text.slice(pos + 1);
  },

  adjacentKeyboard: (text) => {
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

    // Randomly replace one accented character
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (replacements[char]) {
        return text.slice(0, i) + replacements[char] + text.slice(i + 1);
      }
    }
    return text;
  },

  numberForLetter: (text) => {
    text = safeString(text);
    if (text.length < 1) return text;

    const replacements = {
      'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 'b': '8', 't': '7', 'l': '1', 'z': '2'
    };

    // Find a letter to replace
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase();
      if (replacements[char] && Math.random() < 0.7) {
        return text.slice(0, i) + replacements[char] + text.slice(i + 1);
      }
    }
    return text;
  },

  repeatWord: (text) => {
    text = safeString(text);
    const words = text.split(' ');
    if (words.length < 2) return text;
    const index = randomInt(0, words.length - 1);
    words.splice(index, 0, words[index]);
    return words.join(' ');
  },

  missingPunctuation: (text) => {
    text = safeString(text);
    return text.replace(/[,.;:?!]/g, '');
  },

  addRandomPunctuation: (text) => {
    text = safeString(text);
    if (text.length < 2) return text;
    const punctuation = [',', '.', ';', ':', '!', '?'];
    const pos = randomInt(1, text.length - 1);
    return text.slice(0, pos) + randomChoice(punctuation) + text.slice(pos);
  }
};

export function generateTypos(text) {
  // Early return for invalid input
  if (!text || typeof text !== 'string') return '';

  // Determine max possible typos based on text length
  const maxTypos = Math.min(3, Math.floor(text.length / 15));
  let result = text;
  const typoFunctions = Object.values(TYPO_TYPES);

  // Para cada typo possível, diminui exponencialmente a chance
  for (let i = 0; i < maxTypos; i++) {
    // Probabilidade diminui pela metade a cada typo adicional
    const probability = WEIGHTS.typo / Math.pow(1.5, i);

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
    lastYear: () => ({
      start: now.minus({ years: 1 }).startOf('year').toISODate(),
      end: now.minus({ years: 1 }).endOf('year').toISODate(),
      description: 'ano passado'
    }),
    lastSemester: () => ({
      start: now.minus({ months: 6 }).startOf('month').toISODate(),
      end: now.minus({ months: 1 }).endOf('month').toISODate(),
      description: 'último semestre'
    }),
    lastBimester: () => ({
      start: now.minus({ months: 2 }).startOf('month').toISODate(),
      end: now.minus({ months: 1 }).endOf('month').toISODate(),
      description: 'último bimestre'
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
      () => `${randomChoice(['SA', 'SB', 'SC', 'SD'])}-${randomInt(10, 99)}-${randomChoice(['X', 'Y', 'Z'])}`,
      () => `MI-${randomInt(1000, 9999)}`,
      () => `INOM-${randomChoice(['A', 'B', 'C', 'D'])}-${randomInt(10, 99)}`,
      () => `${randomChoice(['MI', 'INOM'])}${randomInt(1000, 9999)}`,
      () => `${randomChoice(['MI', 'INOM'])}.${randomInt(1000, 9999)}`
    ];
    return invalidPatterns[Math.floor(Math.random() * invalidPatterns.length)]();
  }

  // Get valid identifier
  const type = randomChoice(['MI', 'INOM']);
  const keywords = KEYWORDS[type.toLowerCase()];
  const value = randomChoice(keywords);

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
    let stateObj = randomChoice(LOCATIONS.states);
    state = stateObj.name;
    stateAbbr = stateObj.abbr;
  }

  // Generate city with proper validation
  if (shouldInclude(WEIGHTS.city)) {
    if (state && !invalid) {
      // Get cities from that state
      const stateCities = LOCATIONS.cities[stateAbbr];

      if (stateCities && stateCities.length > 0) {
        city = randomChoice(stateCities);
      }
    } else if (invalid && shouldInclude(WEIGHTS.invalidData)) {
      const invalidCities = [
        'Cidade Inexistente', 'Nova Lugar', 'São Nowhere', 'Porto Imaginário',
        'Santa Ilusão', 'Montanha Verde', 'Vila Fictícia', 'Lagoa Seca',
        'Rio Perdido', 'Campo dos Sonhos', 'Costa Irreal'
      ];
      city = randomChoice(invalidCities);
    } else {
      // Random valid city from a random state
      const randomStateAbbr = randomChoice(LOCATIONS.states).abbr;
      const stateCities = LOCATIONS.cities[randomStateAbbr];
      if (stateCities && stateCities.length > 0) {
        city = randomChoice(stateCities);
      }
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
      description: 'na última semana',
      generate: () => ({
        start: now.minus({ weeks: 1 }).startOf('week'),
        end: now.minus({ weeks: 1 }).endOf('week')
      })
    },
    {
      description: 'nos últimos 3 meses',
      generate: () => ({
        start: now.minus({ months: 3 }),
        end: now
      })
    },
    {
      description: 'no último trimestre',
      generate: () => ({
        start: now.minus({ quarters: 1 }).startOf('quarter'),
        end: now.minus({ quarters: 1 }).endOf('quarter')
      })
    },
    {
      description: 'no ano passado',
      generate: () => ({
        start: now.minus({ years: 1 }).startOf('year'),
        end: now.minus({ years: 1 }).endOf('year')
      })
    },
    {
      description: 'no último semestre',
      generate: () => ({
        start: now.minus({ months: 6 }).startOf('month'),
        end: now.minus({ months: 1 }).endOf('month')
      })
    },
    {
      description: 'no último bimestre',
      generate: () => ({
        start: now.minus({ months: 2 }).startOf('month'),
        end: now.minus({ months: 1 }).endOf('month')
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
  keyword: ['keyword'],
  location: ['state', 'city'],
  metadata: ['scale', 'productType'],
  organization: ['supplyArea', 'project'],
  temporal: ['publicationPeriod', 'creationPeriod', 'sortField', 'sortDirection']
};

export function calculateGroupDecay(params) {
  // CORREÇÃO: Não aplicar decay para permitir mais parâmetros
  return 0.9; // Valor alto para aumentar a chance de incluir mais parâmetros
}

// Novas funções para melhorar a variabilidade

// Função para adicionar ruído semântico ao texto
export function addSemanticNoise(text) {
  if (!shouldInclude(WEIGHTS.semanticNoise)) return text;

  const noisePatterns = [
    (t) => `${t}, se possível`,
    (t) => `${t}, por gentileza`,
    (t) => `urgente: ${t}`,
    (t) => `${t} para apresentação amanhã`,
    (t) => `estou com dificuldade para encontrar ${t}`,
    (t) => `preciso com urgência de ${t}`,
    (t) => `${t} para finalizar o projeto`,
    (t) => `${t} - essencial para o trabalho`,
    (t) => `${t}, teria como me ajudar?`,
    (t) => `pela terceira vez solicito ${t}`,
    (t) => `${t}, estamos em campo aguardando`,
    (t) => `conforme falamos na reunião, ${t}`,
    (t) => `consegue me ajudar com ${t}?`,
    (t) => `${t}, é para o comandante`,
    (t) => `${t}, o cliente está esperando`,
    (t) => `${t}, tenho apenas hoje para concluir`,
    (t) => `se ainda estiver disponível, ${t}`,
    (t) => `${t}, foi o que me orientaram a solicitar`,
    (t) => `${t}, conforme procedimento padrão`,
    (t) => `já tentei localizar ${t} em outros lugares`
  ];

  return randomChoice(noisePatterns)(text);
}

// Função para alternar entre diferentes níveis de formalidade
export function applyFormalityShift(text, formal = true) {
  if (!shouldInclude(WEIGHTS.formalityShift)) return text;

  if (formal) {
    // Tornar mais formal
    const formalPatterns = [
      (t) => `Solicito, por gentileza, ${t}`,
      (t) => `Venho por meio desta requisitar ${t}`,
      (t) => `Conforme normativa interna, requisito ${t}`,
      (t) => `Em atendimento às diretrizes técnicas, solicito ${t}`,
      (t) => `Prezados, gostaria de solicitar ${t}`,
      (t) => `Em conformidade com os procedimentos estabelecidos, necessito de ${t}`,
      (t) => `Solicito vossa atenção para ${t}`,
      (t) => `Faz-se necessário o acesso a ${t}`,
      (t) => `Tendo em vista a urgência do assunto, solicito ${t}`,
      (t) => `Em caráter oficial, requeiro ${t}`
    ];
    return randomChoice(formalPatterns)(text);
  } else {
    // Tornar mais informal/coloquial
    const informalPatterns = [
      (t) => `Oi, preciso de ${t}`,
      (t) => `Tô precisando de ${t}`,
      (t) => `Me ajuda a encontrar ${t}`,
      (t) => `Dá pra me mandar ${t}?`,
      (t) => `Tô na correria e preciso de ${t}`,
      (t) => `Tô procurando ${t}, tem como me ajudar?`,
      (t) => `Opa, consegue me enviar ${t}?`,
      (t) => `Ei, cadê ${t}?`,
      (t) => `Valeu por ajudar com ${t}`,
      (t) => `Bom dia! Tô atrás de ${t}`
    ];
    return randomChoice(informalPatterns)(text);
  }
}

// Função para adicionar conectores entre parâmetros
export function addParameterConnector(params) {
  if (params.length < 2) return params;

  const connectors = [
    ' e também ', ' além disso, ', ' adicionalmente, ',
    ' junto com ', ' complementando com ', ' acompanhado de ',
    ' combinado com ', ' em conjunto com ', ' somado a ',
    ' acrescentando ', ' incluindo também ', ' sem esquecer de ',
    ' juntamente com ', ' associado a ', ' vinculado a ',
    ' relacionado com ', ' em paralelo a ', ' em adição a '
  ];

  const result = [...params];
  const insertPosition = randomInt(0, params.length - 2);
  result[insertPosition] = result[insertPosition] + randomChoice(connectors);

  return result;
}

// Função para adicionar contexto a uma query
export function addQueryContext(text) {
  if (!shouldInclude(WEIGHTS.contextualInfo)) return text;

  const contextPatterns = [
    (t) => `Para o projeto de ${randomChoice(PROJECT_CONTEXTS)}, precisamos de ${t}`,
    (t) => `Como ${randomChoice(FORMAL_ROLES)}, solicito ${t}`,
    (t) => `Em trabalho na ${randomChoice(LOCAL_REFERENCES)}, necessito de ${t}`,
    (t) => `Para concluir o relatório sobre ${randomChoice(LOCAL_REFERENCES)}, falta ${t}`,
    (t) => `Durante atividade de campo em ${randomChoice(LOCAL_REFERENCES)}, identificamos a necessidade de ${t}`,
    (t) => `Para o mapeamento de ${randomChoice(LOCAL_REFERENCES)}, precisamos de ${t}`,
    (t) => `Como parte do projeto de ${randomChoice(PROJECT_CONTEXTS)}, solicito acesso a ${t}`,
    (t) => `Para avaliação de riscos em ${randomChoice(LOCAL_REFERENCES)}, estamos buscando ${t}`,
    (t) => `Conforme solicitação do coordenador de ${randomChoice(PROJECT_CONTEXTS)}, necessito de ${t}`,
    (t) => `Para atualização da base de dados de ${randomChoice(LOCAL_REFERENCES)}, preciso de ${t}`
  ];

  return randomChoice(contextPatterns)(text);
}

// Função para gerar um local de referência fictício mas plausível
export function generateFictionalPlace() {
  const prefixes = ['São', 'Santa', 'Nova', 'Porto', 'Ribeirão', 'Vila', 'Campo', 'Morro', 'Lago', 'Serra'];
  const roots = ['Cruz', 'Alegre', 'Verde', 'Feliz', 'Grande', 'Alto', 'Lindo', 'Belo', 'Novo', 'Real'];
  const suffixes = ['do Sul', 'do Norte', 'da Serra', 'do Vale', 'do Campo', 'do Rio', 'da Mata', 'das Flores', 'dos Pinheiros', 'das Águas'];

  // Gera um nome com diferentes combinações
  const pattern = Math.random();

  if (pattern < 0.3) {
    // Apenas prefixo + root
    return `${randomChoice(prefixes)} ${randomChoice(roots)}`;
  } else if (pattern < 0.6) {
    // Prefixo + root + suffix
    return `${randomChoice(prefixes)} ${randomChoice(roots)} ${randomChoice(suffixes)}`;
  } else if (pattern < 0.8) {
    // Apenas root + suffix
    return `${randomChoice(roots)} ${randomChoice(suffixes)}`;
  } else {
    // Apenas prefixo + suffix
    return `${randomChoice(prefixes)}${randomChoice(suffixes)}`;
  }
}