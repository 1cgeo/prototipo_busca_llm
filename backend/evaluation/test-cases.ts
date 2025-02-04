import type { TestCase } from './types.js';

export const testCases: TestCase[] = [
    // Casos Fáceis - Consultas diretas e simples
    {
        query: 'cartas topográficas de São Paulo',
        expected: {
            productType: 'Carta Topográfica',
            state: 'São Paulo'
        },
        difficulty: 'easy',
        description: 'Tipo de produto e estado diretos',
        focus: ['type', 'location']
    },
    {
        query: 'mapas do RJ escala 1:25.000',
        expected: {
            state: 'Rio de Janeiro',
            scale: '1:25.000'
        },
        difficulty: 'easy',
        description: 'Estado (sigla) e escala direta',
        focus: ['scale', 'location']
    },
    {
        query: '1º CGEO cartas em 25k',
        expected: {
            supplyArea: '1° Centro de Geoinformação',
            scale: '1:25.000'
        },
        difficulty: 'easy',
        description: 'Área de suprimento e escala abreviada',
        focus: ['scale']
    },
    {
        query: '10 cartas mais recentes',
        expected: {
            limit: 10,
            sortField: 'publicationDate',
            sortDirection: 'DESC'
        },
        difficulty: 'easy',
        description: 'Limite e ordenação simples',
        focus: ['sorting']
    },

    // Casos Médios - Múltiplos parâmetros e algumas variações
    {
        query: 'preciso de cartas topográficas do 2o cgeo em escala 50k ou 25k publicadas esse ano',
        expected: {
            productType: 'Carta Topográfica',
            supplyArea: '2° Centro de Geoinformação',
            scale: '1:25.000',
            publicationPeriod: {
                start: '2025-01-01',
                end: '2025-12-31'
            }
        },
        difficulty: 'medium',
        description: 'Múltiplos campos com variações de escrita',
        focus: ['type', 'scale', 'dates']
    },
    {
        query: 'ultimas 20 cartas da bahia ordenadas por data de criacao',
        expected: {
            state: 'Bahia',
            limit: 20,
            sortField: 'creationDate',
            sortDirection: 'DESC'
        },
        difficulty: 'medium',
        description: 'Estado, limite e ordenação específica',
        focus: ['location', 'sorting']
    },
    {
        query: 'cartas do projeto olimpiadas na grande escala do rio',
        expected: {
            project: 'Olimpíadas',
            scale: '1:25.000',
            state: 'Rio de Janeiro'
        },
        difficulty: 'medium',
        description: 'Projeto, escala por descrição e estado',
        focus: ['project', 'scale']
    },
    {
        query: 'mapeamento do terceiro cgeo em média escala feito no primeiro semestre',
        expected: {
            supplyArea: '3° Centro de Geoinformação',
            scale: '1:100.000',
            creationPeriod: {
                start: '2025-01-01',
                end: '2025-06-30'
            }
        },
        difficulty: 'medium',
        focus: ['scale', 'dates']
    },

    // Casos Difíceis - Combinações complexas e variações
    {
        query: 'cartas ortoimg do projeto copa 2014 na escala 50k ou 25k do rio publicadas entre 2013 e 2014 ord por criacao mais antiga',
        expected: {
            productType: 'Carta Ortoimagem',
            project: 'Copa do Mundo 2014',
            scale: '1:25.000',
            state: 'Rio de Janeiro',
            publicationPeriod: {
                start: '2013-01-01',
                end: '2014-12-31'
            },
            sortField: 'creationDate',
            sortDirection: 'ASC'
        },
        difficulty: 'hard',
        description: 'Múltiplos campos com variações e período específico',
        focus: ['type', 'project', 'dates', 'scale']
    },
    {
        query: '15 cartas mais recentes do 4 cgeo em pequena escala do para criadas nos ultimos 6 meses',
        expected: {
            limit: 15,
            supplyArea: '4° Centro de Geoinformação',
            scale: '1:250.000',
            state: 'Pará',
            creationPeriod: {
                start: '2024-08-03',
                end: '2025-02-03'
            },
            sortField: 'publicationDate',
            sortDirection: 'DESC'
        },
        difficulty: 'hard',
        description: 'Combinação complexa com data relativa',
        focus: ['scale', 'dates', 'sorting']
    },
    {
        query: 'mapas do proj beca em sc e pr em grande escala pub no mes passado por data de criacao',
        expected: {
            project: 'BECA',
            state: 'Santa Catarina',
            scale: '1:25.000',
            publicationPeriod: {
                start: '2025-01-01',
                end: '2025-01-31'
            },
            sortField: 'creationDate',
            sortDirection: 'DESC'
        },
        difficulty: 'hard',
        focus: ['project', 'location', 'dates']
    },
    {
        query: 'cartas topo publicadas em 2023 do quinto cgeo em mg e es em media ou pequena escala',
        expected: {
            productType: 'Carta Topográfica',
            publicationPeriod: {
                start: '2023-01-01',
                end: '2023-12-31'
            },
            supplyArea: '5° Centro de Geoinformação',
            state: 'Minas Gerais',
            scale: '1:100.000'
        },
        difficulty: 'hard',
        focus: ['type', 'location', 'dates']
    },

    // Casos com Variações de Escrita
    {
        query: 'cartas tematicas do primeiro centro de geoinformacao',
        expected: {
            productType: 'Carta Temática',
            supplyArea: '1° Centro de Geoinformação'
        },
        difficulty: 'medium',
        focus: ['type']
    },
    {
        query: 'cartas mais antigas da regiao norte em 1:250000',
        expected: {
            scale: '1:250.000',
            sortField: 'publicationDate',
            sortDirection: 'ASC'
        },
        difficulty: 'medium',
        focus: ['scale', 'sorting']
    },

    // Casos com Datas Relativas
    {
        query: 'cartas criadas no último trimestre do segundo cgeo',
        expected: {
            supplyArea: '2° Centro de Geoinformação',
            creationPeriod: {
                start: '2024-10-01',
                end: '2024-12-31'
            }
        },
        difficulty: 'medium',
        focus: ['dates']
    },
    {
        query: 'produtos da semana passada do terceiro cgeo',
        expected: {
            supplyArea: '3° Centro de Geoinformação',
            publicationPeriod: {
                start: '2024-01-27',
                end: '2024-02-02'
            }
        },
        difficulty: 'medium',
        focus: ['dates']
    },

    // Casos com Projetos Específicos
    {
        query: 'cartas do mapeamento sistematico em goias',
        expected: {
            project: 'Mapeamento Sistemático',
            state: 'Goiás'
        },
        difficulty: 'medium',
        focus: ['project', 'location']
    },
    {
        query: 'produtos da copa das confederacoes em fortaleza',
        expected: {
            project: 'Copa das Confederações 2013',
            city: 'Fortaleza'
        },
        difficulty: 'medium',
        focus: ['project', 'location']
    },

    // Casos com Múltiplas Localidades
    {
        query: 'cartas de rondonia e acre em grande escala',
        expected: {
            state: 'Rondônia',
            scale: '1:25.000'
        },
        difficulty: 'hard',
        focus: ['location', 'scale']
    },

    // Casos com Ordenação Complexa
    {
        query: 'ultimas atualizacoes do projeto olimpiadas ordenado por data de criacao mais antiga',
        expected: {
            project: 'Olimpíadas',
            sortField: 'creationDate',
            sortDirection: 'ASC'
        },
        difficulty: 'medium',
        focus: ['project', 'sorting']
    }
,
    // Casos com Expressões Temporais Complexas
    {
        query: 'cartas de 6 meses atras ate 3 meses atras do amazonas',
        expected: {
            state: 'Amazonas',
            publicationPeriod: {
                start: '2024-08-03',
                end: '2024-11-03'
            }
        },
        difficulty: 'hard',
        focus: ['dates', 'location']
    },
    {
        query: 'mapeamento feito entre o natal e o ano novo',
        expected: {
            publicationPeriod: {
                start: '2024-12-25',
                end: '2025-01-01'
            }
        },
        difficulty: 'hard',
        focus: ['dates']
    },

    // Casos com Combinações Complexas de Escala
    {
        query: 'todas as cartas em escala maior que 100k do rio grande do sul',
        expected: {
            state: 'Rio Grande do Sul',
            scale: '1:25.000'
        },
        difficulty: 'medium',
        focus: ['scale', 'location']
    },
    {
        query: 'mapeamento detalhado (25k ou 50k) de brasilia',
        expected: {
            scale: '1:25.000',
            city: 'Brasília'
        },
        difficulty: 'medium',
        focus: ['scale', 'location']
    },

    // Variações de Escrita de Projetos
    {
        query: 'cartas do projeto copa do mundo em curitiba',
        expected: {
            project: 'Copa do Mundo 2014',
            city: 'Curitiba'
        },
        difficulty: 'medium',
        focus: ['project', 'location']
    },
    {
        query: 'mapeamento das olimpiadas do rio',
        expected: {
            project: 'Olimpíadas',
            state: 'Rio de Janeiro'
        },
        difficulty: 'easy',
        focus: ['project', 'location']
    },

    // Casos com Contexto Regional
    {
        query: 'cartas do litoral nordestino em média escala',
        expected: {
            scale: '1:100.000'
        },
        difficulty: 'medium',
        focus: ['scale']
    },
    {
        query: 'mapeamento da amazônia legal do projeto beca',
        expected: {
            project: 'BECA'
        },
        difficulty: 'medium',
        focus: ['project']
    },

    // Casos com Priorização de Escala
    {
        query: 'carta mais detalhada de salvador',
        expected: {
            scale: '1:25.000',
            city: 'Salvador'
        },
        difficulty: 'medium',
        focus: ['scale', 'location']
    },
    {
        query: 'visao geral do estado do para em pequena escala',
        expected: {
            state: 'Pará',
            scale: '1:250.000'
        },
        difficulty: 'medium',
        focus: ['scale', 'location']
    },

    // Casos com Inferência de Tipo
    {
        query: 'imagens de satelite de manaus',
        expected: {
            productType: 'Carta Ortoimagem',
            city: 'Manaus'
        },
        difficulty: 'medium',
        focus: ['type', 'location']
    },
    {
        query: 'mapas com curvas de nivel do rio',
        expected: {
            productType: 'Carta Topográfica',
            state: 'Rio de Janeiro'
        },
        difficulty: 'medium',
        focus: ['type', 'location']
    },

    // Casos com Ordenação Implícita
    {
        query: 'primeiro mapeamento feito em cuiaba',
        expected: {
            city: 'Cuiabá',
            sortField: 'creationDate',
            sortDirection: 'ASC'
        },
        difficulty: 'medium',
        focus: ['location', 'sorting']
    },
    {
        query: 'ultima atualizacao do para',
        expected: {
            state: 'Pará',
            sortField: 'publicationDate',
            sortDirection: 'DESC'
        },
        difficulty: 'medium',
        focus: ['location', 'sorting']
    },

    // Casos de Limite Implícito
    {
        query: 'algumas cartas recentes de porto alegre',
        expected: {
            city: 'Porto Alegre',
            limit: 5,
            sortField: 'publicationDate',
            sortDirection: 'DESC'
        },
        difficulty: 'hard',
        focus: ['location', 'sorting']
    },
    {
        query: 'todos os mapas de belem',
        expected: {
            city: 'Belém',
            limit: 100
        },
        difficulty: 'medium',
        focus: ['location']
    },

    // Casos Extremamente Complexos
    {
        query: 'preciso das 5 cartas mais antigas do tipo ortoimg em escala detalhada do segundo cgeo na bahia publicadas depois de 2020',
        expected: {
            limit: 5,
            productType: 'Carta Ortoimagem',
            scale: '1:25.000',
            supplyArea: '2° Centro de Geoinformação',
            state: 'Bahia',
            publicationPeriod: {
                start: '2020-01-01',
                end: '2025-02-03'
            },
            sortField: 'publicationDate',
            sortDirection: 'ASC'
        },
        difficulty: 'hard',
        focus: ['type', 'scale', 'location', 'dates', 'sorting']
    },
    {
        query: 'mapeamento sistematico do quarto cgeo no sudeste em media e pequena escala criado entre 2022 e 2023 ordem cronologica',
        expected: {
            project: 'Mapeamento Sistemático',
            supplyArea: '4° Centro de Geoinformação',
            scale: '1:100.000',
            creationPeriod: {
                start: '2022-01-01',
                end: '2023-12-31'
            },
            sortField: 'creationDate',
            sortDirection: 'ASC'
        },
        difficulty: 'hard',
        focus: ['project', 'scale', 'dates', 'sorting']
    }
];