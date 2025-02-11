import type { TestCase } from './types.js';

export const testCases: TestCase[] = [
    // Casos com MI (Military Index)
    {
        query: 'preciso da carta MI 2965-2-NE do segundo cgeo',
        expected: {
            keyword: '2965-2-NE',
            supplyArea: '2° Centro de Geoinformação'
        },
        difficulty: 'easy',
        description: 'MI code with directional suffix and supply area',
        focus: ['location']
    },
    {
        query: 'folha MI 2866-3 em escala 50k',
        expected: {
            keyword: '2866-3',
            scale: '1:50.000'
        },
        difficulty: 'easy',
        description: 'MI code for 50k scale map',
        focus: ['scale']
    },
    {
        query: 'MI 2901 do projeto olimpiadas',
        expected: {
            keyword: '2901',
            project: 'Olimpíadas Rio 2016'
        },
        difficulty: 'easy',
        description: 'Simple MI code with project',
        focus: ['project']
    },
    {
        query: 'carta 530 em pequena escala',
        expected: {
            keyword: '530',
            scale: '1:250.000'
        },
        difficulty: 'easy',
        description: 'MI code for small scale map',
        focus: ['scale']
    },

    // Casos com INOM (Index of Nomenclature)
    {
        query: 'buscar folha SF-22-Y-D-II-4 do RS publicada esse ano',
        expected: {
            keyword: 'SF-22-Y-D-II-4',
            state: 'Rio Grande do Sul',
            publicationPeriod: {
                start: '2025-01-01',
                end: '2025-12-31'
            }
        },
        difficulty: 'medium',
        description: 'INOM code with state and current year',
        focus: ['location', 'dates']
    },
    {
        query: 'carta SF-22-Y-D do tipo ortoimg',
        expected: {
            keyword: 'SF-22-Y-D',
            productType: 'SCN Carta Ortoimagem'
        },
        difficulty: 'easy',
        description: 'INOM code with product type',
        focus: ['type']
    },
    {
        query: 'inom SF-22-Y-D-II-4-SE criado pelo primeiro cgeo',
        expected: {
            keyword: 'SF-22-Y-D-II-4-SE',
            supplyArea: '1° Centro de Geoinformação'
        },
        difficulty: 'medium',
        description: 'Complete INOM code with supply area',
        focus: ['location']
    },

    // Casos com Nomes de Cartas
    {
        query: 'carta topográfica Passo da Seringueira em 1:25.000',
        expected: {
            keyword: 'Passo da Seringueira',
            scale: '1:25.000',
            productType: 'SCN Carta Topografica Matricial'
        },
        difficulty: 'medium',
        description: 'Map name with scale and type',
        focus: ['scale', 'type']
    },
    {
        query: 'folha Porto Velho publicada em 2024',
        expected: {
            keyword: 'Porto Velho',
            publicationPeriod: {
                start: '2024-01-01',
                end: '2024-12-31'
            }
        },
        difficulty: 'medium',
        description: 'Map name with publication year',
        focus: ['dates']
    },
    {
        query: 'carta Vale do Guaporé do projeto rondonia',
        expected: {
            keyword: 'Vale do Guaporé',
            project: 'Base Cartográfica Digital de Rondônia'
        },
        difficulty: 'medium',
        description: 'Map name with specific project',
        focus: ['project']
    },

    // Casos com Combinações Complexas
    {
        query: 'MI 2965-2-NE e SF-22-Y-D do terceiro cgeo em grande escala',
        expected: {
            keyword: '2965-2-NE',
            supplyArea: '3° Centro de Geoinformação',
            scale: '1:25.000'
        },
        difficulty: 'hard',
        description: 'Multiple references with supply area and scale',
        focus: ['scale', 'location']
    },
    {
        query: 'cartas do tipo topo com MI 530 ou SF-22 publicadas esse ano',
        expected: {
            keyword: '530',
            productType: 'SCN Carta Topografica Matricial',
            publicationPeriod: {
                start: '2025-01-01',
                end: '2025-12-31'
            }
        },
        difficulty: 'hard',
        description: 'Multiple index codes with type and date',
        focus: ['type', 'dates']
    },

    // Casos Específicos de Escala
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

    // Casos de Data Relativa
    {
        query: 'cartas criadas no último trimestre do ano passado do segundo cgeo',
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
                start: '2025-01-27',
                end: '2025-02-02'
            }
        },
        difficulty: 'medium',
        focus: ['dates']
    },

    // Casos Especiais de Projeto
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
            project: 'Copa das Confederações',
            city: 'Fortaleza'
        },
        difficulty: 'medium',
        focus: ['project', 'location']
    },

    // Casos de Ordenação
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
            sortField: 'creationDate',
            sortDirection: 'DESC'
        },
        difficulty: 'medium',
        focus: ['location', 'sorting']
    },

    // Casos Extremamente Complexos
    {
        query: 'preciso das 5 cartas mais antigas do tipo ortoimg em escala detalhada do terceiro cgeo em pernambuco publicadas depois de 2020',
        expected: {
            limit: 5,
            productType: 'SCN Carta Ortoimagem',
            scale: '1:25.000',
            supplyArea: '3° Centro de Geoinformação',
            state: 'Pernambuco',
            publicationPeriod: {
                start: '2020-01-01',
                end: '2025-02-07'
            },
            sortField: 'creationDate',
            sortDirection: 'ASC'
        },
        difficulty: 'hard',
        focus: ['type', 'scale', 'location', 'dates', 'sorting']
    },
    {
        query: 'MI 2901 ou SF-22 do quarto cgeo no sudeste em pequena escala criado entre 2022 e 2023 ordem cronologica',
        expected: {
            keyword: '2901',
            supplyArea: '4° Centro de Geoinformação',
            scale: '1:250.000',
            creationPeriod: {
                start: '2022-01-01',
                end: '2023-12-31'
            },
            sortField: 'creationDate',
            sortDirection: 'ASC'
        },
        difficulty: 'hard',
        focus: ['scale', 'dates', 'sorting']
    }
];