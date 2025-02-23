import {
  SCALES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
  WEIGHTS,
  PRODUCT_TYPE_WEIGHTS,
  LOCATIONS,
  IDENTIFIERS
} from './types.js';

import {
  randomChoice,
  shouldInclude,
  generateDateRange,
  generateLocation,
  calculateGroupDecay,
  getReasoningText,
  randomInt,
  PARAM_GROUPS
} from './utils.js';
import { generateQuery } from './templates.js';
import { DateTime } from 'luxon';

class ExampleGenerator {
  constructor() {
    this.usedQueries = new Set();
    this.usedCombinations = new Set();
  }

  generateInvalidParams(baseParams) {
    const params = { ...baseParams };
    const invalidElements = [];

    if (this.shouldInclude(0.4)) {
      // Identificador inválido
      if (this.shouldInclude(0.5)) {
        const invalidId = this.generateIdentifier(true);
        if (invalidId) {
          params.identifier = invalidId;
          invalidElements.push({
            type: 'identifier',
            value: invalidId.value,
            reason: `invalid ${invalidId.type} format`
          });
        }
      }

      // Escala inválida
      if (this.shouldInclude(0.5)) {
        const invalidScale = this.randomChoice([
          '1:999999',
          '1:123',
          '1:1000000',
          'grande escala',
          '1:0',
          'escala municipal'
        ]);
        params.scale = invalidScale;
        invalidElements.push({
          type: 'scale',
          value: invalidScale,
          reason: 'invalid scale format'
        });
      }

      // Centro de Geoinformação inválido
      if (this.shouldInclude(0.5)) {
        const invalidCGEO = this.randomChoice([
          '6° Centro de Geoinformação',
          '7° CGEO',
          'Centro Geo',
          'CGEO Principal',
          '0° Centro de Geoinformação'
        ]);
        params.supplyArea = invalidCGEO;
        invalidElements.push({
          type: 'supplyArea',
          value: invalidCGEO,
          reason: 'invalid supply area reference'
        });
      }

      // Localização inválida
      if (this.shouldInclude(0.5)) {
        const invalidLocation = this.generateLocation(true);
        if (invalidLocation.city) {
          params.location = invalidLocation;
          invalidElements.push({
            type: 'location',
            value: invalidLocation.city,
            reason: 'invalid city name'
          });
        }
      }

      // Data inválida
      if (this.shouldInclude(0.5)) {
        const futureDate = DateTime.now().plus({ years: 2 }).toISODate();
        params.publicationPeriod = {
          start: futureDate,
          end: futureDate
        };
        invalidElements.push({
          type: 'date',
          value: futureDate,
          reason: 'future date specified'
        });
      }
    }

    return { params, invalidElements };
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  weightedChoice(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (const [item, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) return item;
    }
    
    return Object.keys(weights)[0];
  }

  shouldInclude(probability) {
    return Math.random() < probability;
  }

  generateDateRange() {
    const now = DateTime.now();
    const randomMonths = Math.floor(Math.random() * 24);
    const start = now.minus({ months: randomMonths });
    const end = start.plus({ months: Math.floor(Math.random() * 3) + 1 });

    return {
      start: start.toISODate(),
      end: end.toISODate()
    };
  }

  generateIdentifier(invalid = false) {
    if (!invalid) {
      const type = this.randomChoice(['MI', 'INOM']);
      return {
        type,
        value: this.randomChoice(IDENTIFIERS[type.toLowerCase()])
      };
    }

    const type = this.randomChoice(['MI', 'INOM']);
    const invalidPatterns = {
      MI: ['99999-9-XX', '1234-Z-NE', 'MI2965', '2965.2.NE'],
      INOM: ['XX-22-Y-D', 'SF-99-Z-Z', 'SF22YD', 'SF.22.Y.D']
    };
    return {
      type,
      value: this.randomChoice(invalidPatterns[type])
    };
  }

  generateLocation(invalid = false) {
    if (!invalid) {
      const state = this.randomChoice(LOCATIONS.states);
      const city = this.shouldInclude(WEIGHTS.city) ? 
        this.randomChoice(LOCATIONS.cities[state.abbr] || []) : 
        null;
      return { state, city };
    }

    // Gerar localização inválida
    const state = this.randomChoice(LOCATIONS.states);
    const invalidCities = ['Cidade Inexistente', 'Nova Lugar', 'São Nowhere'];
    return {
      state,
      city: this.randomChoice(invalidCities)
    };
  }

  generateParamsHash(params) {
    const relevantKeys = ['identifier', 'productType', 'scale', 'location', 'supplyArea', 'project'];
    const sortedKeys = relevantKeys.filter(key => params[key]).sort();
    
    // Create detailed hash including parameter values
    const hashParts = sortedKeys.map(key => {
      if (key === 'location') {
        return `location:${params[key].state?.name || ''}-${params[key].city || ''}`;
      }
      if (key === 'identifier') {
        return `identifier:${params[key].type}-${params[key].value}`;
      }
      return `${key}:${params[key]}`;
    });
    
    return hashParts.join('|');
  }

  hashToParams(hash) {
    if (!hash) return {};
    
    const params = {};
    const parts = hash.split('|');
    
    parts.forEach(part => {
      const [key, value] = part.split(':');
      
      if (key === 'location') {
        const [state, city] = value.split('-');
        params.location = {
          state: state ? { name: state } : null,
          city: city || null
        };
      } else if (key === 'identifier') {
        const [type, idValue] = value.split('-');
        params.identifier = {
          type,
          value: idValue
        };
      } else {
        params[key] = value;
      }
    });
    
    return params;
  }
  
  checkSimilarity(params, recentParams) {
    for (const recent of recentParams) {
      const score = getSimilarityScore(params, recent);
      if (score > 0.85) {
        return true;
      }
    }
    return false;
  }

  isValidCombination(params) {
    // Reject if any parameter is undefined
    if (Object.values(params).some(v => v === undefined)) {
      return false;
    }
  
    const hash = this.generateParamsHash(params);
    
    if (this.usedCombinations.has(hash)) {
      return false;
    }
  
    this.usedCombinations.add(hash);
    return true;
  }

  generateParamValue(field) {
    switch (field) {
      case 'keyword': {
        const id = this.generateIdentifier(false);
        // Return only the value, not the type/value object
        return id ? id.value : null;
      }
      case 'scale':
        return randomChoice(SCALES);
      case 'productType':
        return this.weightedChoice(PRODUCT_TYPE_WEIGHTS);
      case 'state':
      case 'city': {
        const location = generateLocation(false);
        return location[field];
      }
      case 'supplyArea':
        return randomChoice(SUPPLY_AREAS);
      case 'project':
        return randomChoice(PROJECTS);
      case 'publicationPeriod':
      case 'creationPeriod':
        return generateDateRange();
      case 'sortField':
        return randomChoice(SORT_FIELDS);
      case 'sortDirection':
        return randomChoice(SORT_DIRECTIONS);
      case 'limit':
        return shouldInclude(WEIGHTS.limit) ? randomInt(1, 100) : null;
      default:
        return null;
    }
  }

  generateValidParams() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const params = {};
      const groupProbability = {};
      
      // Initialize group probabilities
      Object.keys(PARAM_GROUPS).forEach(group => {
        groupProbability[group] = Math.random();
      });

      // Must have at least one primary parameter
      const primaryGroups = ['identifier', 'location', 'metadata'];
      const hasPrimary = primaryGroups.some(group => groupProbability[group] < WEIGHTS.primaryGroup);
      
      if (!hasPrimary) {
        const randomPrimary = randomChoice(primaryGroups);
        groupProbability[randomPrimary] = 0; // Force inclusion
      }

      // Generate parameters based on group probabilities
      Object.entries(PARAM_GROUPS).forEach(([group, fields]) => {
        if (groupProbability[group] < calculateGroupDecay(params)) {
          fields.forEach(field => {
            if (shouldInclude(WEIGHTS[field])) {
              const value = this.generateParamValue(field);
              if (value) params[field] = value;
            }
          });
        }
      });

      // Validate the generated parameters
      if (this.isValidCombination(params) && Object.keys(params).length > 0) {
        return params;
      }

      attempts++;
    }

    return null;
  }

  generateQuery(params) {
    const queryParts = [];
    const usedParams = {};

    // Função auxiliar para adicionar parte à query
    function addToParts(text, paramType, value) {
      if (text && text.trim()) {
        queryParts.push(text.trim());
        if (paramType) usedParams[paramType] = value;
      }
    }

    // Formato da query
    const isQuestion = Math.random() > 0.7;
    
    if (!isQuestion && this.shouldInclude(0.7)) {
      addToParts(this.randomChoice(QUERY_FORMATS.prefixes));
    }

    // Identificador
    if (params.identifier) {
      addToParts(`${params.identifier.type} ${params.identifier.value}`, 'identifier', params.identifier);
    }

    // Tipo de produto
    if (params.productType) {
      addToParts(params.productType, 'productType', params.productType);
    }

    // Escala
    if (params.scale) {
      addToParts(`na escala ${params.scale}`, 'scale', params.scale);
    }

    // Localização
    if (params.location) {
      const locationParts = [];
      if (params.location.city) {
        locationParts.push(`em ${params.location.city}`);
        usedParams.city = params.location.city;
      }
      if (params.location.state) {
        locationParts.push(`no ${params.location.state.name}`);
        usedParams.state = params.location.state.name;
      }
      if (locationParts.length > 0) {
        addToParts(locationParts.join(' '));
      }
    }

    // Centro de Geoinformação
    if (params.supplyArea) {
      addToParts(`do ${params.supplyArea}`, 'supplyArea', params.supplyArea);
    }

    // Projeto
    if (params.project) {
      addToParts(`do projeto ${params.project}`, 'project', params.project);
    }

    // Datas
    if (params.publicationPeriod) {
      addToParts(
        `publicado entre ${params.publicationPeriod.start} e ${params.publicationPeriod.end}`,
        'publicationPeriod',
        params.publicationPeriod
      );
    } else if (params.creationPeriod) {
      addToParts(
        `criado entre ${params.creationPeriod.start} e ${params.creationPeriod.end}`,
        'creationPeriod',
        params.creationPeriod
      );
    }

    // Ordenação
    if (params.sortField) {
      const sortText = params.sortDirection === 'ASC' ? 'mais antigas' : 'mais recentes';
      addToParts(sortText, 'sort', { field: params.sortField, direction: params.sortDirection });
    }

    // Limite
    if (params.limit) {
      addToParts(`mostrar ${params.limit} resultados`, 'limit', params.limit);
    }

    let query = queryParts.join(' ').trim();

    if (isQuestion) {
      query = `${query}?`;
    } else if (this.shouldInclude(0.2)) {
      query += ` ${this.randomChoice(QUERY_FORMATS.suffixes)}`;
    }

    // Aplicar typos se necessário
    if (this.shouldInclude(WEIGHTS.typo)) {
      query = this.generateTypos(query);
    }

    return { query, usedParams };
  }

  generateTypos(text) {
    if (!text) return text;
    
    const words = text.split(' ');
    const numTypos = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numTypos; i++) {
      const wordIndex = Math.floor(Math.random() * words.length);
      const word = words[wordIndex];
      
      const typoType = Math.random();
      if (typoType < 0.3) {
        // Troca de letras
        const charIndex = Math.floor(Math.random() * (word.length - 1));
        const chars = [...word];
        [chars[charIndex], chars[charIndex + 1]] = [chars[charIndex + 1], chars[charIndex]];
        words[wordIndex] = chars.join('');
      } else if (typoType < 0.6) {
        // Letra duplicada
        const charIndex = Math.floor(Math.random() * word.length);
        words[wordIndex] = word.slice(0, charIndex) + word[charIndex] + word.slice(charIndex);
      } else {
        // Letra faltando
        const charIndex = Math.floor(Math.random() * word.length);
        words[wordIndex] = word.slice(0, charIndex) + word.slice(charIndex + 1);
      }
    }
    
    return words.join(' ');
  }

  generateReasoning(params, invalidElements = [], usedVariations = []) {
    const parts = [];
  
    // 1. Process identifier/keyword
    if (params.keyword) {
      // Check for MI/INOM pattern
        parts.push(`Found map identifier "${params.keyword}"`);
    }
  
    // 2. Process product type with special cases
    if (params.productType) {
        parts.push(`Product type specified: '${params.productType}'`);
    }
  
    // 3. Process scale with context
    if (params.scale) {
      parts.push(`Scale '${params.scale}' selected`);
    }
  
    // 4. Process location (state/city)
    if (params.state) {
      parts.push(`State location: "${params.state}"`);
    }
    if (params.city) {
      if (params.state) {
        parts.push(`City location: "${params.city}" in ${params.state}`);
      } else {
        parts.push(`City location: "${params.city}"`);
      }
    }
  
    // 5. Process supply area with full name
    if (params.supplyArea) {
      const cgeoNumber = params.supplyArea.charAt(0);
      parts.push(`Supply area identified as ${params.supplyArea} (${cgeoNumber}° CGEO)`);
    }
  
    // 6. Process project with context
    if (params.project) {
        parts.push(`Project specified: '${params.project}'`);
    }
  
    // 7. Process date ranges
    if (params.publicationPeriod) {
      parts.push(
        `Publication period from ${params.publicationPeriod.start} to ${params.publicationPeriod.end}`
      );
    }
    if (params.creationPeriod) {
      parts.push(
        `Creation period from ${params.creationPeriod.start} to ${params.creationPeriod.end}`
      );
    }
  
    // 8. Process sorting parameters
    if (params.sortField) {
      const sortTypes = {
        publicationDate: 'publication date',
        creationDate: 'creation date'
      };
      const directions = {
        ASC: 'oldest first',
        DESC: 'newest first'
      };
      parts.push(
        `Results ordered by ${sortTypes[params.sortField]}, ${directions[params.sortDirection]}`
      );
    }
  
    // 9. Process limit
    if (params.limit) {
      parts.push(`Results limited to ${params.limit} items`);
    }
  
    // 10. Process variations using getReasoningText
    usedVariations.forEach(variation => {
      const reasoningText = getReasoningText(
        variation.type,
        variation.used,
        variation.canonical
      );
      if (reasoningText) {
        parts.push(reasoningText);
      }
    });
  
    // 11. Process invalid elements
    invalidElements.forEach(invalid => {
      const contextMap = {
        scale: 'invalid scale format',
        identifier: 'invalid identifier format',
        supplyArea: 'invalid supply area reference',
        date: 'invalid date specification',
        location: 'invalid location reference'
      };
      const context = contextMap[invalid.type] || invalid.reason;
      parts.push(`Ignored ${context}: "${invalid.value}"`);
    });
  
    // Handle empty parameters case
    if (parts.length === 0) {
      parts.push('No valid search parameters identified in query');
    }
  
    // Return complete reasoning with proper punctuation
    return parts.join('. ') + '.';
  }

  generateExample(includeInvalid = false) {
    let attempt = 0;
    const maxAttempts = 10;
  
    while (attempt < maxAttempts) {
      const validParams = this.generateValidParams();
      
      if (!validParams) {
        attempt++;
        continue;
      }
  
      let queryParams = validParams;
      let invalidElements = [];
  
      if (includeInvalid) {
        const invalid = this.generateInvalidParams(validParams);
        queryParams = invalid.params;
        invalidElements = invalid.invalidElements;
      }

      const { query, usedParams } = generateQuery(queryParams);
  
      // Validate query content
      if (!query || query.trim().length < 10 || 
          query.length > 200 || 
          query.includes('undefined') || 
          this.usedQueries.has(query) ||
          Object.keys(usedParams).length === 0) {
        attempt++;
        continue;
      }
  
      this.usedQueries.add(query);
  
      const reasoning = this.generateReasoning(usedParams, invalidElements);
      
      // Format answer according to backend expectations
      const answer = {
        reasoning,
      };
  
      // Add valid parameters to answer with correct format
      Object.entries(usedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Special handling for location
          if (key === 'location') {
            if (value.state) answer.state = value.state;
            if (value.city) answer.city = value.city;
          } else {
            answer[key] = value;
          }
        }
      });
  
      return { query, answer };
    }
  
    return null;
  }

  generateDataset(size, invalidRatio = 0.1) {
    const dataset = [];
    const totalInvalid = Math.floor(size * invalidRatio);
    const totalValid = size - totalInvalid;
    
    // Safety limits
    const maxAttemptsPerExample = 10;
    const maxTotalAttempts = size * maxAttemptsPerExample;
    let totalAttempts = 0;
    
    console.log(`\nStarting dataset generation:`);
    console.log(`- Target total examples: ${size}`);
    console.log(`- Valid examples: ${totalValid}`);
    console.log(`- Invalid examples: ${totalInvalid}`);

    // Generate valid examples
    while (dataset.length < totalValid && totalAttempts < maxTotalAttempts) {
      const example = this.generateExample(false);
      totalAttempts++;
      
      if (example && example.query.trim().length > 0) {
        dataset.push(example);
        if (dataset.length % 100 === 0) {
          console.log(`Generated ${dataset.length}/${size} examples (attempts: ${totalAttempts})`);
        }
      }
    }

    // Generate invalid examples
    while (dataset.length < size && totalAttempts < maxTotalAttempts) {
      const example = this.generateExample(true);
      totalAttempts++;
      
      if (example && example.query.trim().length > 0) {
        dataset.push(example);
        if (dataset.length % 100 === 0) {
          console.log(`Generated ${dataset.length}/${size} examples (attempts: ${totalAttempts})`);
        }
      }
    }

    // Report generation results
    console.log(`\nGeneration complete:`);
    console.log(`- Generated examples: ${dataset.length}/${size}`);
    console.log(`- Total attempts: ${totalAttempts}`);
    console.log(`- Success rate: ${((dataset.length/totalAttempts) * 100).toFixed(1)}%`);

    if (dataset.length < size) {
      console.log(`\nWarning: Could only generate ${dataset.length} examples out of ${size} requested`);
    }

    return dataset.sort(() => Math.random() - 0.5);
  }
}

export async function generateTrainingData(size = 10000, invalidRatio = 0.1) {
  const generator = new ExampleGenerator();
  return generator.generateDataset(size, invalidRatio);
}