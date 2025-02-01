import type { TestSuite } from '../types';

export const complexQueries: TestSuite = {
  name: 'Complex Query Scenarios',
  description: 'Tests challenging scenarios with complex combinations, abbreviations, and natural language variations',
  tests: [
    {
      name: 'Relative dates and abbreviated terms',
      description: 'Query using relative dates and common abbreviations',
      input: 'Preciso das 20 cartas topo mais recentes do 2CGEO em grande escala',
      expected: {
        productType: 'Carta Topográfica',
        supplyArea: '2° Centro de Geoinformação',
        scale: '1:25.000',
        publicationPeriod: {
          start: '2023-07-31',
          end: '2024-01-31'
        },
        sortField: 'publicationDate',
        sortDirection: 'DESC',
        limit: 20
      }
    },
    {
      name: 'Mixed abbreviations and temporal expressions',
      description: 'Query combining various abbreviations with time expressions',
      input: 'ultimas 30 cartas 1:50k do 3o cgeo ord. por data de criacao',
      expected: {
        scale: '1:50.000',
        supplyArea: '3° Centro de Geoinformação',
        sortField: 'creationDate',
        sortDirection: 'DESC',
        limit: 30
      }
    },
    {
      name: 'Scale descriptions and state variations',
      description: 'Query using scale descriptions and state name variations',
      input: 'cartas em pequena escala do RJ criadas entre jan/2023 e dez/2023',
      expected: {
        scale: '1:250.000',
        state: 'Rio de Janeiro',
        creationPeriod: {
          start: '2023-01-01',
          end: '2023-12-31'
        },
        sortField: 'publicationDate',
        sortDirection: 'DESC'
      }
    },
    {
      name: 'Complex project query with typos',
      description: 'Query with project name variations and typos',
      input: 'cartaz topograficas do projeto olimpiadas em media escala publicadas em 2023',
      expected: {
        productType: 'Carta Topográfica',
        project: 'Olimpíadas',
        scale: '1:100.000',
        publicationPeriod: {
          start: '2023-01-01',
          end: '2023-12-31'
        },
        sortField: 'publicationDate',
        sortDirection: 'DESC'
      }
    },
    {
      name: 'Multiple filters with unconventional terms',
      description: 'Query combining multiple filters with non-standard terminology',
      input: 'mapas do 4o cgeo do tipo imagem na escala 25k feitos ano passado',
      expected: {
        productType: 'Carta Ortoimagem',
        supplyArea: '4° Centro de Geoinformação',
        scale: '1:25.000',
        creationPeriod: {
          start: '2023-01-01',
          end: '2023-12-31'
        },
        sortField: 'publicationDate',
        sortDirection: 'DESC'
      }
    },
    {
      name: 'Informal language with project variations',
      description: 'Query using informal language and project variations',
      input: 'me mostra as cartas mais novas do projeto copa 2014 em qualquer escala',
      expected: {
        project: 'Copa do Mundo 2014',
        publicationPeriod: {
          start: '2023-07-31',
          end: '2024-01-31'
        },
        sortField: 'publicationDate',
        sortDirection: 'DESC'
      }
    },
    {
      name: 'Complex temporal and scale combinations',
      description: 'Query with multiple temporal references and scale variations',
      input: 'cartas 50k ou 25k do primeiro cgeo publicadas esse ano e criadas depois de 2020',
      expected: {
        scale: '1:25.000',
        supplyArea: '1° Centro de Geoinformação',
        publicationPeriod: {
          start: '2024-01-01',
          end: '2024-01-31'
        },
        creationPeriod: {
          start: '2020-01-01',
          end: '2024-01-31'
        },
        sortField: 'publicationDate',
        sortDirection: 'DESC'
      }
    },
    {
      name: 'Poorly structured query with valid information',
      description: 'Badly structured query but containing valid search criteria',
      input: 'quero ver oq tem do para publicado esse mes em carta topo',
      expected: {
        state: 'Pará',
        productType: 'Carta Topográfica',
        publicationPeriod: {
          start: '2024-01-01',
          end: '2024-01-31'
        },
        sortField: 'publicationDate',
        sortDirection: 'DESC'
      }
    },
    {
      name: 'Multiple abbreviations and informal scale',
      description: 'Query combining various abbreviations and informal scale references',
      input: '50 cartas ortoimg do 5cgeo em gde escala pub recentemente ord por criacao',
      expected: {
        productType: 'Carta Ortoimagem',
        supplyArea: '5° Centro de Geoinformação',
        scale: '1:25.000',
        publicationPeriod: {
          start: '2023-07-31',
          end: '2024-01-31'
        },
        sortField: 'creationDate',
        sortDirection: 'DESC',
        limit: 50
      }
    },
    {
      name: 'Complex project and date expressions',
      description: 'Query with project variations and complex date expressions',
      input: 'cartas do proj beca na bahia feitas no primeiro semestre do ano passado',
      expected: {
        project: 'BECA',
        state: 'Bahia',
        creationPeriod: {
          start: '2023-01-01',
          end: '2023-06-30'
        },
        sortField: 'publicationDate',
        sortDirection: 'DESC'
      }
    }
  ]
};