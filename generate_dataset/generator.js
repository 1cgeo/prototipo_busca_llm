import {
  SCALES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
  WEIGHTS,
  PRODUCT_TYPE_WEIGHTS,
  PRODUCT_TYPES,
  LOCATIONS,
  KEYWORDS,
  LOCAL_REFERENCES,
  PROJECT_CONTEXTS
} from './types.js';

import {
  randomChoice,
  shouldInclude,
  generateDateRange,
  generateLocation,
  randomInt,
  generateFictionalPlace
} from './utils.js';
import { generateQuery, expandQueryVariations } from './templates.js';
import { DateTime } from 'luxon';

class ExampleGenerator {
  constructor() {
    this.usedQueries = new Set();
    this.usedCombinations = new Set();
    this.successfulQueries = []; // Para armazenar exemplos bem-sucedidos
  }

  generateInvalidParams(baseParams) {
    const params = { ...baseParams };
    const invalidElements = [];

    if (shouldInclude(0.4)) {
      // Identificador inválido
      if (shouldInclude(0.5)) {
        const invalidId = this.generateIdentifier(true);
        if (invalidId) {
          params.keyword = invalidId;
          invalidElements.push({
            type: 'keyword',
            value: invalidId.value,
            reason: `invalid ${invalidId.type} format`
          });
        }
      }

      // Escala inválida
      if (shouldInclude(0.5)) {
        const invalidScale = randomChoice([
          '1:999999',
          '1:123',
          '1:1000000',
          'grande escala',
          '1:0',
          'escala municipal',
          '1:3000',
          '1:15000',
          '1:75000',
          'escala regional',
          'micro escala',
          'escala urbana detalhada',
          '1:300.000',
          '1:500.000'
        ]);
        params.scale = invalidScale;
        invalidElements.push({
          type: 'scale',
          value: invalidScale,
          reason: 'invalid scale format'
        });
      }

      // Centro de Geoinformação inválido
      if (shouldInclude(0.5)) {
        const invalidCGEO = randomChoice([
          '6° Centro de Geoinformação',
          '7° CGEO',
          'Centro Geo',
          'CGEO Principal',
          '0° Centro de Geoinformação',
          '8CGEO',
          'CGeo Brasil',
          'CGEO Nacional',
          'Diretoria de Geoinformação',
          'Centro Cartográfico'
        ]);
        params.supplyArea = invalidCGEO;
        invalidElements.push({
          type: 'supplyArea',
          value: invalidCGEO,
          reason: 'invalid supply area reference'
        });
      }

      // Localização inválida
      if (shouldInclude(0.5)) {
        const invalidLocation = generateLocation(true);
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
      if (shouldInclude(0.5)) {
        const localRef = randomChoice(LOCAL_REFERENCES);
        const futureDate = DateTime.now().plus({ years: randomInt(1, 5) }).toISODate();
        const endDate = DateTime.fromISO(futureDate).plus({ months: randomInt(1, 6) }).toISODate();
        params.publicationPeriod = {
          start: futureDate,
          end: endDate
        };
        invalidElements.push({
          type: 'date',
          value: `${futureDate} (em ${localRef})`,
          reason: 'future date specified'
        });
      }
      
      // Formato inválido de período
      if (shouldInclude(0.3) && !params.publicationPeriod) {
        const now = DateTime.now();
        const projectContext = randomChoice(PROJECT_CONTEXTS);
        const start = now.minus({ months: randomInt(1, 24) }).toISODate();
        const end = now.minus({ months: randomInt(25, 48) }).toISODate(); // End date is before start date
        params.publicationPeriod = { start, end };
        invalidElements.push({
          type: 'date',
          value: `período ${start} a ${end} para ${projectContext}`,
          reason: 'end date before start date'
        });
      }
      
      // Limite inválido
      if (shouldInclude(0.4)) {
        const invalidLimits = [-10, -5, 0, 500, 1000, 5000];
        params.limit = randomChoice(invalidLimits);
        invalidElements.push({
          type: 'limit',
          value: params.limit,
          reason: 'invalid limit value'
        });
      }
    }

    return { params, invalidElements };
  }

  generateIdentifier(invalid = false) {
    if (!invalid) {
      const type = randomChoice(['MI', 'INOM']);
      return randomChoice(KEYWORDS[type.toLowerCase()]);
    }

    const type = randomChoice(['MI', 'INOM']);
    const invalidPatterns = {
      MI: ['99999-9-XX', '1234-Z-NE', 'MI2965', '2965.2.NE', 'MI-0', 'MI-ABC', '2965/2-NE', 'MI@2901', 'MI_2901'],
      INOM: ['XX-22-Y-D', 'SF-99-Z-Z', 'SF22YD', 'SF.22.Y.D', 'INOM-SF', 'SF/22/Y/D', 'SF_22_Y_D', 'SF99YD', 'SFXXYD']
    };
    return randomChoice(invalidPatterns[type]);
  }

  generateLocation(invalid = false) {
    if (!invalid) {
      const state = randomChoice(LOCATIONS.states);
      const city = shouldInclude(WEIGHTS.city) ? 
        randomChoice(LOCATIONS.cities[state.abbr] || []) : 
        null;
      return { state, city };
    }

    // Gerar localização inválida
    const state = randomChoice(LOCATIONS.states);
    const invalidCities = [
      'Cidade Inexistente', 'Nova Lugar', 'São Nowhere', 'Porto Imaginário',
      'Santa Ilusão', 'Montanha Verde', 'Vila Fictícia', 'Lagoa Seca',
      'Rio Perdido', 'Campo dos Sonhos', 'Costa Irreal', 'Cidade Fantasia',
      'Vilarejo Perdido', 'São Invenção', 'Nova Utopia', generateFictionalPlace()
    ];
    return {
      state,
      city: randomChoice(invalidCities)
    };
  }

  generateParamsHash(params) {
    const relevantKeys = ['keyword', 'productType', 'scale', 'location', 'supplyArea', 'project'];
    const sortedKeys = relevantKeys.filter(key => params[key]).sort();
    
    // Create detailed hash including parameter values
    const hashParts = sortedKeys.map(key => {
      if (key === 'location') {
        return `location:${params[key].state?.name || ''}-${params[key].city || ''}`;
      }
      if (key === 'keyword') {
        return `keyword:${params[key]}`;
      }
      return `${key}:${params[key]}`;
    });
    
    return hashParts.join('|');
  }

  // Verificação simplificada de combinações válidas para permitir mais exemplos
  isValidCombination(params) {
    // Reject if any parameter is undefined
    if (Object.values(params).some(v => v === undefined)) {
      return false;
    }
    
    // Limite o número de verificações de combinações
    if (this.usedCombinations.size > 10000) {
      // Após 10 mil combinações, fazer verificação simplificada
      return true;
    }
  
    // Verificação normal para os primeiros 10 mil exemplos
    const hash = this.generateParamsHash(params);
    if (this.usedCombinations.has(hash)) {
      return false;
    }
  
    this.usedCombinations.add(hash);
    return true;
  }

  // IMPORTANTE: Modificado para trabalhar com a distribuição de número de parâmetros
  generateValidParams() {
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      const params = {};
      
      // Decidir quantos parâmetros incluir usando a distribuição em WEIGHTS.paramCount
      const paramCountRandom = Math.random();
      let targetParamCount = 1; // Valor padrão
      let cumulativeProb = 0;
      
      for (const [count, prob] of Object.entries(WEIGHTS.paramCount)) {
        cumulativeProb += prob;
        if (paramCountRandom <= cumulativeProb) {
          targetParamCount = parseInt(count);
          break;
        }
      }
      
      // Gerar parâmetros com base no número alvo
      // Lista de todos os parâmetros possíveis
      const allParams = [
        'keyword', 'scale', 'productType', 'state', 'city', 
        'supplyArea', 'project', 'publicationPeriod', 'creationPeriod', 
        'sortField', 'sortDirection', 'limit'
      ];
      
      // Embaralhar a lista para seleção aleatória
      const shuffledParams = [...allParams].sort(() => Math.random() - 0.5);
      
      // Selecionar o número alvo de parâmetros 
      const selectedParams = shuffledParams.slice(0, targetParamCount);
      
      // Gerar valores para os parâmetros selecionados
      for (const param of selectedParams) {
        // Gerar valores especiais para city e state para garantir consistência
        if (param === 'state' || param === 'city') {
          // Se state ou city estiver selecionado, gerar ambos juntos
          if (!params.location) {
            const location = generateLocation(false);
            // Corrigido: Inicializar o objeto location completamente
            params.location = {
              state: location.state,
              city: location.city
            };
          }
        } 
        // Gerar valores especiais para sortField e sortDirection
        else if (param === 'sortField' || param === 'sortDirection') {
          // Se um está selecionado, incluir ambos
          if (!params.sortField) params.sortField = randomChoice(SORT_FIELDS);
          if (!params.sortDirection) params.sortDirection = randomChoice(SORT_DIRECTIONS);
        }
        // Gerar valor para outros parâmetros
        else {
          const value = this.generateParamValue(param);
          if (value !== null) params[param] = value;
        }
      }

      // Verificar se tem pelo menos um parâmetro
      if (Object.keys(params).length > 0 && this.isValidCombination(params)) {
        return params;
      }

      attempts++;
    }

    // Após muitas tentativas, criar um exemplo simples
    return {
      productType: randomChoice(PRODUCT_TYPES),
      scale: randomChoice(SCALES)
    };
  }

  generateParamValue(field) {
    switch (field) {
      case 'keyword': {
        return this.generateIdentifier(false);
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

  weightedChoice(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (const [item, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) return item;
    }
    
    return Object.keys(weights)[0];
  }

  // Melhorado para evitar redundâncias
  generateReasoning(params, invalidElements = [], usedVariations = []) {
    // Organizar variações por forma canônica para fácil consulta
    const variationsByParam = {};
    usedVariations.forEach(variation => {
      const key = variation.type.toLowerCase();
      if (!variationsByParam[key]) {
        variationsByParam[key] = {};
      }
      variationsByParam[key][variation.canonical] = variation.used;
    });
    
    // Lista para passos de raciocínio
    const reasoningSteps = [];
    
    // Começar com uma introdução
    reasoningSteps.push("Analisando a consulta para identificar os parâmetros de busca");
    
    // Processar keyword/identifier
    if (params.keyword) {
      const productTypeVariations = variationsByParam.product_type || {};
      if (variationsByParam.keyword && variationsByParam.keyword[params.keyword]) {
        reasoningSteps.push(`Identifico "${variationsByParam.keyword[params.keyword]}" como uma referência ao identificador "${params.keyword}"`);
      } else {
        reasoningSteps.push(`A consulta menciona o identificador "${params.keyword}"`);
      }
    }
    
    // Processar tipo de produto
    if (params.productType) {
      if (variationsByParam.product_type && variationsByParam.product_type[params.productType]) {
        reasoningSteps.push(`O termo "${variationsByParam.product_type[params.productType]}" se refere ao tipo de produto "${params.productType}"`);
      } else {
        reasoningSteps.push(`O tipo de produto solicitado é "${params.productType}"`);
      }
    }
    
    // Processar escala
    if (params.scale) {
      if (variationsByParam.scale && variationsByParam.scale[params.scale]) {
        reasoningSteps.push(`A expressão "${variationsByParam.scale[params.scale]}" indica a escala ${params.scale}`);
      } else {
        reasoningSteps.push(`A escala especificada é "${params.scale}"`);
      }
    }
    
    // Processar localização (estado/cidade)
    if (params.location) {
      if (params.location.state && params.location.city) {
        const stateName = params.location.state.name;
        const cityName = params.location.city;
        reasoningSteps.push(`A localização é na cidade de "${cityName}" no estado de "${stateName}"`);
      } else if (params.location.state) {
        const stateName = params.location.state.name;
        reasoningSteps.push(`A localização é no estado de "${stateName}"`);
      } else if (params.location.city) {
        reasoningSteps.push(`A localização é na cidade de "${params.location.city}"`);
      }
    }
    
    // Processar área de fornecimento
    if (params.supplyArea) {
      if (variationsByParam.supply_area && variationsByParam.supply_area[params.supplyArea]) {
        reasoningSteps.push(`"${variationsByParam.supply_area[params.supplyArea]}" se refere à área de fornecimento "${params.supplyArea}"`);
      } else {
        reasoningSteps.push(`A área de fornecimento identificada é "${params.supplyArea}"`);
      }
    }
    
    // Processar projeto
    if (params.project) {
      if (variationsByParam.project && variationsByParam.project[params.project]) {
        reasoningSteps.push(`A referência "${variationsByParam.project[params.project]}" é para o projeto "${params.project}"`);
      } else {
        reasoningSteps.push(`O projeto especificado é "${params.project}"`);
      }
    }
    
    // Processar intervalos de data
    if (params.publicationPeriod) {
      const period = params.publicationPeriod;
      if (period.description) {
        reasoningSteps.push(`A expressão "${period.description}" indica um período de publicação de ${period.start} até ${period.end}`);
      } else {
        reasoningSteps.push(`O período de publicação é de ${period.start} até ${period.end}`);
      }
    }
    
    if (params.creationPeriod) {
      const period = params.creationPeriod;
      if (period.description) {
        reasoningSteps.push(`O termo "${period.description}" se refere a um período de criação de ${period.start} até ${period.end}`);
      } else {
        reasoningSteps.push(`O período de criação é de ${period.start} até ${period.end}`);
      }
    }
    
    // Processar parâmetros de ordenação
    if (params.sortField) {
      const sortTypes = {
        publicationDate: 'data de publicação',
        creationDate: 'data de criação'
      };
      const directions = {
        ASC: 'mais antigas primeiro',
        DESC: 'mais recentes primeiro'
      };
      
      const fieldType = sortTypes[params.sortField] || params.sortField;
      const direction = directions[params.sortDirection] || params.sortDirection;
      
      reasoningSteps.push(`Os resultados devem ser ordenados por ${fieldType}, ${direction}`);
    }
    
    // Processar limite
    if (params.limit) {
      reasoningSteps.push(`A consulta solicita limitar os resultados a ${params.limit} itens`);
    }
    
    // Processar elementos inválidos
    invalidElements.forEach(invalid => {
      switch(invalid.type) {
        case 'scale':
          reasoningSteps.push(`"${invalid.value}" parece ser uma referência de escala, mas é inválida - ignorando`);
          break;
        case 'keyword':
          reasoningSteps.push(`"${invalid.value}" parece um identificador de mapa, mas tem formato inválido - ignorando`);
          break;
        case 'location':
          reasoningSteps.push(`"${invalid.value}" parece uma referência de localização, mas não é reconhecida - ignorando`);
          break;
        case 'date':
          reasoningSteps.push(`A especificação de data "${invalid.value}" é inválida ou fora do intervalo - ignorando`);
          break;
        case 'supplyArea':
          reasoningSteps.push(`"${invalid.value}" parece referir-se a uma área de fornecimento, mas não é válida - ignorando`);
          break;
        case 'limit':
          reasoningSteps.push(`O valor de limite "${invalid.value}" é inválido (deve ser um número positivo) - ignorando`);
          break;
        default:
          reasoningSteps.push(`Ignorando ${invalid.type} inválido: "${invalid.value}"`);
      }
    });
    
    // Finalizar com uma conclusão
    if (Object.keys(params).length === 0 && invalidElements.length === 0) {
      reasoningSteps.push("Não consegui identificar nenhum parâmetro de busca válido nesta consulta");
    } else {
      reasoningSteps.push("Estes são todos os parâmetros que pude extrair da consulta");
    }
    
    // Unir todos os passos com pontuação adequada
    return reasoningSteps.join(". ");
  }

  generateExample(includeInvalid = false) {
    let attempt = 0;
    const maxAttempts = 20;
  
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

      const result = generateQuery(queryParams);
      const query = result.query;
      const usedParams = result.usedParams;
      const usedVariations = result.usedVariations;
  
      // Validação mais relaxada para permitir maior variabilidade
      const isQueryValid = (
        query && 
        query.trim().length >= 10 && 
        query.length <= 300 && 
        !query.includes('undefined') && 
        Object.keys(usedParams).length > 0
      );
      
      // Verificação simplificada de duplicidade
      let isDuplicate = false;
      
      // Para os primeiros 5K exemplos, verificar duplicados exatos
      if (this.usedQueries.size < 5000) {
        isDuplicate = this.usedQueries.has(query);
      } else {
        // Após 5K exemplos, não verificar duplicados
        isDuplicate = false;
      }

      if (isQueryValid && !isDuplicate) {
        this.usedQueries.add(query);
  
        const reasoning = this.generateReasoning(usedParams, invalidElements, usedVariations);
        
        // CORREÇÃO: Construir resposta no formato correto conforme o esquema especificado
        const answer = {
          reasoning: reasoning,
          keyword: null,
          scale: null,
          productType: null, 
          state: null,
          city: null,
          supplyArea: null,
          project: null,
          publicationPeriod: null,
          creationPeriod: null,
          sortField: null,
          sortDirection: null,
          limit: null
        };
  
        // Add valid parameters to answer with correct format
        Object.entries(usedParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Special handling for location
            if (key === 'location') {
              if (value.state) answer.state = value.state.name;
              if (value.city) answer.city = value.city;
            } else if (key === 'publicationPeriod' || key === 'creationPeriod') {
              // Incluir apenas start e end
              answer[key] = {
                start: value.start,
                end: value.end
              };
            }
            else {
              answer[key] = value;
            }
          }
        });
        
        // Armazenar o par query/answer para expansão posterior
        const examplePair = { 
          query, 
          answer,
          structure: result.structure
        };
        
        // Limitando o tamanho para economizar memória
        if (this.successfulQueries.length < 5000) {
          this.successfulQueries.push(examplePair);
        } else {
          // Substituir aleatoriamente um exemplo existente
          const idx = Math.floor(Math.random() * this.successfulQueries.length);
          this.successfulQueries[idx] = examplePair;
        }
  
        // CORREÇÃO: Retornar o par, não apenas um dos elementos
        return {
          query,
          answer: { ...answer }  // Clone para evitar referências
        };
      }

      attempt++;
    }
  
    // Exemplo simples como último recurso
    const answer = {
      reasoning: `Product type specified: '${randomChoice(PRODUCT_TYPES)}'. Scale '${randomChoice(SCALES)}' selected.`,
      keyword: null,
      scale: randomChoice(SCALES),
      productType: randomChoice(PRODUCT_TYPES), 
      state: null,
      city: null,
      supplyArea: null,
      project: null,
      publicationPeriod: null,
      creationPeriod: null,
      sortField: null,
      sortDirection: null,
      limit: null
    };

    return {
      query: `Preciso de ${answer.productType} na escala ${answer.scale}`,
      answer
    };
  }
  
  // Usando expandQueryVariations para criar variações
  expandSuccessfulExamples(numberOfExpansions = 3) {
    if (this.successfulQueries.length === 0) return [];
    
    const expansions = [];
    
    // Seleciona vários exemplos base diferentes para maior variedade
    for (let i = 0; i < numberOfExpansions; i++) {
      // Escolher um exemplo base aleatório
      const baseIndex = Math.floor(Math.random() * this.successfulQueries.length);
      const baseExample = this.successfulQueries[baseIndex];
      
      // Usar expandQueryVariations para criar várias variações
      const variations = expandQueryVariations(baseExample, 2);
      
      for (const variation of variations) {
        if (variation.query && 
            variation.query.length >= 10 && 
            variation.query.length <= 300) {
          
          // Verificação simplificada para aceitar mais variações
          if (!this.usedQueries.has(variation.query)) {
            this.usedQueries.add(variation.query);
            
            // CORREÇÃO: Precisamos criar novas expansões com a mesma resposta
            expansions.push({
              query: variation.query,
              answer: { ...baseExample.answer }  // Clone profundo para evitar referências
            });
          }
        }
      }
    }
    
    return expansions;
  }

  generateDataset(size, invalidRatio = 0.1) {
    const dataset = [];
    const totalInvalid = Math.floor(size * invalidRatio);
    const totalValid = size - totalInvalid;
    
    // Configuração para expansões
    const expansionRatio = 0.6; // 60% de exemplos são expansões
    const expansionsPerExample = 10; 
    
    // Calcular metas para gerações diretas vs. expansões
    const directGenerationTarget = Math.floor(totalValid * (1 - expansionRatio));
    const expansionTarget = totalValid - directGenerationTarget;
    
    // Safety limits
    const maxTotalAttempts = size * 10;
    let totalAttempts = 0;
    
    console.log(`\nStarting dataset generation:`);
    console.log(`- Target total examples: ${size}`);
    console.log(`- Valid examples: ${totalValid}`);
    console.log(`- Direct generation target: ${directGenerationTarget}`);
    console.log(`- Expansion target: ${expansionTarget}`);
    console.log(`- Invalid examples: ${totalInvalid}`);

    // Gerar exemplos válidos diretamente
    let validCount = 0;
    while (validCount < directGenerationTarget && totalAttempts < maxTotalAttempts) {
      const example = this.generateExample(false);
      totalAttempts++;
      
      if (example && example.query.trim().length > 0) {
        // CORREÇÃO: Adicionar apenas o par query/answer no dataset
        dataset.push(example);
        validCount++;
        
        if (validCount % 100 === 0) {
          console.log(`Generated ${validCount}/${directGenerationTarget} direct valid examples (attempts: ${totalAttempts})`);
        }
        
        // A cada N exemplos, gerar expansões com base nos já existentes
        if (validCount % 500 === 0 && this.successfulQueries.length > 0) {
          const expansions = this.expandSuccessfulExamples(20);
          // Adicionar apenas a quantidade necessária de expansões
          const expansionsToAdd = Math.min(expansions.length, 1000);
          for (let i = 0; i < expansionsToAdd; i++) {
            dataset.push(expansions[i]);
            validCount++;
            
            if (validCount >= directGenerationTarget) break;
          }
          console.log(`Added ${expansionsToAdd} expansions, now at ${validCount}/${directGenerationTarget} examples`);
        }
      }
    }
    
    // Gerar mais expansões para atingir o alvo
    if (validCount < totalValid && this.successfulQueries.length > 0) {
      console.log(`\nGenerating more expansions to reach target of ${totalValid} valid examples`);
      
      // Calcular quantas expansões ainda precisamos
      const remainingExpansions = totalValid - validCount;
      const batchSize = 1000; // Quantidade para processar de cada vez
      let expansionsMade = 0;
      
      while (expansionsMade < remainingExpansions) {
        const currentBatch = Math.min(batchSize, remainingExpansions - expansionsMade);
        console.log(`Generating batch of ${currentBatch} expansions...`);
        
        // Gerar uma grande quantidade de expansões
        const expansions = this.expandSuccessfulExamples(currentBatch / 2); // 2 expansões por exemplo
        
        const expansionsToAdd = Math.min(expansions.length, currentBatch);
        for (let i = 0; i < expansionsToAdd; i++) {
          dataset.push(expansions[i]);
          expansionsMade++;
        }
        
        console.log(`Added ${expansionsToAdd} expansions, total valid examples: ${validCount + expansionsMade}/${totalValid}`);
        
        // Se não conseguimos gerar expansões suficientes, usar exemplos diretamente gerados
        if (expansionsToAdd < currentBatch) {
          const remaining = currentBatch - expansionsToAdd;
          console.log(`Need ${remaining} more examples, generating directly...`);
          
          for (let i = 0; i < remaining; i++) {
            const example = this.generateExample(false);
            if (example && example.query.trim().length > 0) {
              dataset.push(example);
              expansionsMade++;
            }
          }
        }
      }
      
      validCount += expansionsMade;
      console.log(`Completed expansion phase, now at ${validCount}/${totalValid} valid examples`);
    }

    // Gerar exemplos inválidos
    let invalidCount = 0;
    while (invalidCount < totalInvalid && totalAttempts < maxTotalAttempts) {
      const example = this.generateExample(true);
      totalAttempts++;
      
      if (example && example.query.trim().length > 0) {
        dataset.push(example);
        invalidCount++;
        
        if (invalidCount % 100 === 0) {
          console.log(`Generated ${invalidCount}/${totalInvalid} invalid examples (attempts: ${totalAttempts})`);
        }
      }
    }

    // Report generation results
    console.log(`\nGeneration complete:`);
    console.log(`- Valid examples: ${validCount}/${totalValid}`);
    console.log(`- Invalid examples: ${invalidCount}/${totalInvalid}`);
    console.log(`- Total examples: ${dataset.length}/${size}`);
    console.log(`- Total attempts: ${totalAttempts}`);
    console.log(`- Success rate: ${((dataset.length/totalAttempts) * 100).toFixed(1)}%`);

    // Embaralhar dataset para misturar exemplos diretos, expansões e inválidos
    return dataset.sort(() => Math.random() - 0.5);
  }
}

export async function generateTrainingData(size = 10000, invalidRatio = 0.1) {
  const generator = new ExampleGenerator();
  return generator.generateDataset(size, invalidRatio);
}