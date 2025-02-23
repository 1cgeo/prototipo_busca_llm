export const SCALES = [
  '1:1.000', '1:2.000', '1:5.000', '1:10.000',
  '1:25.000', '1:50.000', '1:100.000', '1:250.000'
];

export const PRODUCT_TYPES = [
  'Altura da vegetação',
  'CDGV EDGV Defesa F Ter Não SCN',
  'CTM Venezuela',
  'Carta Ortoimagem Especial',
  'Cartas CENSIPAM',
  'Cartas Temáticas Não SCN',
  'MDS - RAM',
  'MDT - RAM',
  'Modelo Tridimensional MDS',
  'Modelo Tridimensional MDT',
  'Nao SCN Carta Topografica Especial Matricial',
  'Ortoimagem',
  'Ortoimagem Radar Colorida',
  'Ortoimagem SCN',
  'Ortoimagem banda P',
  'Ortoimagem banda P pol HH',
  'Ortoimagem banda P pol HV',
  'Ortoimagem banda X pol HH',
  'SCN Carta Especial Matricial',
  'SCN Carta Ortoimagem',
  'SCN Carta Topografica Matricial',
  'SCN Carta Topografica Vetorial',
  'SCN Carta Topografica Vetorial EDGV 3.0',
  'Tematico CIRC',
  'Tematico CIRP',
  'Tematico CISC',
  'Tematico CISP',
  'Tematico CMIL',
  'Tematico CTBL',
  'Tematico CTP'
];

export const SUPPLY_AREAS = [
  '1° Centro de Geoinformação',
  '2° Centro de Geoinformação',
  '3° Centro de Geoinformação',
  '4° Centro de Geoinformação',
  '5° Centro de Geoinformação'
];

export const PROJECTS = [
  'AMAN',
  'Base Cartográfica Digital da Bahia',
  'Base Cartográfica Digital de Rondônia',
  'Base Cartográfica Digital do Amapá',
  'COTer Não EDGV',
  'Cobertura Aerofotogramétrica do Estado de São Paulo',
  'Conversão do Mapeamento Sistematico do SCN para Vetorial',
  'Copa das Confederações',
  'Copa do Mundo 2014',
  'Mapeamento Sistemático',
  'Mapeamento de Áreas de Interesse da Força',
  'NGA-BECA',
  'Olimpíadas Rio 2016',
  'Produtos Temáticos Diversos',
  'Radiografia da Amazônia'
];

export const WEIGHTS = {
  // Base weights for single parameters
  keyword: 0.3,
  scale: 0.4,
  productType: 0.5,
  state: 0.4,
  city: 0.4,
  supplyArea: 0.15,
  project: 0.1,
  dates: 0.4,
  limit: 0.1,
  sort: 0.2,
  typo: 0.6,
  invalidData: 0.1,
  
  // Parameter combination decay factors
  parameterDecay: 0.70, // Each additional parameter reduces probability
  locationCombination: 0.3, // Probability of having both state and city
  dateWithSort: 0.4, // Probability of having sort with dates
  
  // Group weights
  locationGroup: 0.4, // Weight for location-related parameters
  dateGroup: 0.4, // Weight for date-related parameters
  identifierGroup: 0.3, // Weight for identifier-related parameters
  
  // Special cases
  withoutPrefix: 0.7, // Probability of omitting MI/INOM prefix
  relativeDate: 0.5, // Probability of using relative dates
  invalidCombination: 0.1 // Probability of generating invalid combinations
};

export const PRODUCT_TYPE_WEIGHTS = {
  'SCN Carta Topografica Matricial': 0.3,
  'SCN Carta Ortoimagem': 0.2,
  'Cartas Temáticas Não SCN': 0.15,
  'MDT - RAM': 0.1,
  'MDS - RAM': 0.1,
  'Tematico CIRC': 0.05,
  'Ortoimagem banda P pol HH': 0.05,
  'Cartas CENSIPAM': 0.05
};

export const SCALE_WEIGHTS = {
  '1:25.000': 0.25,
  '1:50.000': 0.25,
  '1:100.000': 0.2,
  '1:250.000': 0.1,
  '1:10.000': 0.1,
  '1:5.000': 0.05,
  '1:2.000': 0.03,
  '1:1.000': 0.02
};

export const SORT_FIELDS = ['publicationDate', 'creationDate'];
export const SORT_DIRECTIONS = ['ASC', 'DESC'];

export const PARAM_COMBINATIONS = {
  common: [
    ['keyword', 'productType'],
    ['state', 'scale'],
    ['productType', 'scale'],
    ['project', 'productType'],
    ['state', 'city']
  ],
  rare: [
    ['keyword', 'state', 'scale', 'productType'],
    ['project', 'state', 'scale', 'productType']
  ],
  invalid: [
    ['keyword', 'city', 'state'],
    ['limit', 'publicationPeriod', 'sortField']
  ]
};

export const LOCATIONS = {
  states: [
    { name: 'Acre', abbr: 'AC' },
    { name: 'Alagoas', abbr: 'AL' },
    { name: 'Amapá', abbr: 'AP' },
    { name: 'Amazonas', abbr: 'AM' },
    { name: 'Bahia', abbr: 'BA' },
    { name: 'Ceará', abbr: 'CE' },
    { name: 'Distrito Federal', abbr: 'DF' },
    { name: 'Espírito Santo', abbr: 'ES' },
    { name: 'Goiás', abbr: 'GO' },
    { name: 'Maranhão', abbr: 'MA' },
    { name: 'Mato Grosso', abbr: 'MT' },
    { name: 'Mato Grosso do Sul', abbr: 'MS' },
    { name: 'Minas Gerais', abbr: 'MG' },
    { name: 'Pará', abbr: 'PA' },
    { name: 'Paraíba', abbr: 'PB' },
    { name: 'Paraná', abbr: 'PR' },
    { name: 'Pernambuco', abbr: 'PE' },
    { name: 'Piauí', abbr: 'PI' },
    { name: 'Rio de Janeiro', abbr: 'RJ' },
    { name: 'Rio Grande do Norte', abbr: 'RN' },
    { name: 'Rio Grande do Sul', abbr: 'RS' },
    { name: 'Rondônia', abbr: 'RO' },
    { name: 'Roraima', abbr: 'RR' },
    { name: 'Santa Catarina', abbr: 'SC' },
    { name: 'São Paulo', abbr: 'SP' },
    { name: 'Sergipe', abbr: 'SE' },
    { name: 'Tocantins', abbr: 'TO' }
  ],
  cities: {
    SP: ['São Paulo', 'Campinas', 'Santos', 'Registro', 'Presidente Prudente'],
    RJ: ['Rio de Janeiro', 'Niterói', 'Angra dos Reis', 'Parati', 'Nova Friburgo'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Montes Claros', 'Diamantina'],
    BA: ['Salvador', 'Feira de Santana', 'Ilhéus', 'Porto Seguro', 'Barreiras'],
    PE: ['Recife', 'Olinda', 'Caruaru', 'Petrolina', 'Garanhuns'],
    CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral', 'Crato'],
    RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria', 'Uruguaiana']
  }
};

export const IDENTIFIERS = {
  mi: [
    '2965-2-NE', '2901', '2965-2', '2966-1', '2966-1-NO',
    '2966-2', '2966-2-SO', '2967-1', '2967-1-SE', '2967-2'
  ],
  inom: [
    'SF-22-Y-D', 'SF-22-Y-D-II', 'SF-22', 'SA-22-X-B',
    'SA-22-X-B-II', 'SB-22-X-C', 'SC-22-X-D', 'SD-22-X-A'
  ]
};

export const QUERY_FORMATS = {
  prefixes: [
    // Pedidos diretos
    'preciso', 'buscar', 'localizar', 'encontrar',
    'procuro', 'necessito', 'quero',
    'preciso encontrar', 'preciso localizar',
    'gostaria de encontrar', 'gostaria de ver',
    'gostaria de localizar', 'gostaria de acessar',
    
    // Comandos
    'mostre', 'exiba', 'liste', 'apresente',
    'mostre-me', 'exiba-me', 'liste-me',
    'me mostre', 'me exiba', 'me liste',
    
    // Pedidos formais
    'solicito', 'requeiro', 'peço',
    'solicito a busca', 'requeiro acesso',
    'peço a gentileza de mostrar',
    'favor mostrar', 'favor exibir',
    
    // Buscas
    'buscar por', 'procurar por', 'pesquisar por',
    'fazer uma busca de', 'realizar busca de',
    'fazer pesquisa de', 'realizar pesquisa de',
    
    // Localizações
    'onde encontro', 'onde localizo', 'onde acho',
    'onde posso encontrar', 'onde posso localizar',
    'como encontro', 'como localizo', 'como acho',
    
    // Disponibilidade
    'verificar disponibilidade de', 'checar existência de',
    'conferir disponibilidade de', 'verificar existência de',
    'há disponível', 'existe disponível',
    
    // Consultas
    'consultar', 'acessar', 'visualizar',
    'fazer consulta de', 'realizar consulta de',
    'fazer acesso a', 'realizar acesso a'
  ],
  
  suffixes: [
    // Urgência
    'urgente', 'com urgência', 'o quanto antes',
    'assim que possível', 'prioritariamente',
    
    // Cordialidade
    'por favor', 'por gentileza', 'se possível',
    'quando puder', 'se não for muito trabalho',
    'desde já agradeço', 'obrigado',
    
    // Finalidade
    'para análise', 'para consulta', 'para estudo',
    'para projeto', 'para trabalho', 'para pesquisa',
    'para planejamento', 'para avaliação',
    'para uso em campo', 'para uso interno',
    
    // Tempo
    'para hoje', 'para amanhã', 'para esta semana',
    'ainda hoje', 'nesta data', 'neste momento',
    
    // Formato
    'em formato digital', 'em alta resolução',
    'na melhor qualidade disponível',
    'na versão mais atual',
    
    // Contexto
    'do acervo', 'do banco de dados',
    'do catálogo', 'da base de dados',
    'do sistema'
  ],
  
  questions: [
    // Existência
    'onde posso encontrar {params}?',
    'onde localizo {params}?',
    'onde está disponível {params}?',
    'existe {params}?',
    'há disponível {params}?',
    'vocês têm {params}?',
    'temos acesso a {params}?',
    
    // Disponibilidade
    'é possível acessar {params}?',
    'consigo localizar {params}?',
    'posso encontrar {params}?',
    'está disponível {params}?',
    'tem como ver {params}?',
    'como faço para acessar {params}?',
    
    // Busca
    'como encontro {params}?',
    'como localizo {params}?',
    'como faço para encontrar {params}?',
    'qual a melhor forma de localizar {params}?',
    'em qual local encontro {params}?',
    
    // Confirmação
    'poderia me mostrar {params}?',
    'seria possível localizar {params}?',
    'consegue me ajudar a encontrar {params}?',
    'teria como me mostrar {params}?',
    
    // Formato
    'em qual formato está disponível {params}?',
    'como posso obter {params}?',
    'qual o procedimento para acessar {params}?'
  ],
  
  statements: [
    // Necessidade
    'preciso de {params}',
    'necessito de {params}',
    'quero consultar {params}',
    'quero ver {params}',
    'quero acessar {params}',
    
    // Busca
    'buscar {params}',
    'localizar {params}',
    'encontrar {params}',
    'procurar {params}',
    'pesquisar {params}',
    
    // Formal
    'solicito acesso a {params}',
    'requeiro acesso a {params}',
    'solicito a disponibilização de {params}',
    'requeiro a disponibilização de {params}',
    
    // Visualização
    'visualizar {params}',
    'exibir {params}',
    'mostrar {params}',
    'apresentar {params}',
    
    // Consulta
    'consultar {params}',
    'fazer consulta de {params}',
    'realizar consulta de {params}',
    'acessar informações sobre {params}',
    'obter informações de {params}',
    
    // Verificação
    'verificar {params}',
    'conferir {params}',
    'checar {params}',
    'examinar {params}',
    
    // Disponibilidade
    'disponibilizar {params}',
    'providenciar acesso a {params}',
    'liberar acesso a {params}',
    'permitir visualização de {params}'
  ]
};

export const VARIATIONS = {
  SCALE: {
    '1:1.000': ['1k', '1.000', '1000', 'escala 1:1.000'],
    '1:2.000': ['2k', '2.000', '2000', 'escala 1:2.000'],
    '1:5.000': ['5k', '5.000', '5000', 'escala 1:5.000'],
    '1:10.000': ['10k', '10.000', '10000', 'escala 1:10.000'],
    '1:25.000': ['25k', '25.000', '25000', 'escala detalhada', 'escala 1:25.000', 'maior escala'],
    '1:50.000': ['50k', '50.000', '50000', 'escala média', 'escala 1:50.000', 'escala intermediária'],
    '1:100.000': ['100k', '100.000', '100000', 'escala 1:100.000'],
    '1:250.000': ['250k', '250.000', '250000', 'pequena escala', 'escala 1:250.000', 'menor escala']
  },
  
  PRODUCT_TYPE: {
    'SCN Carta Topografica Matricial': ['carta topográfica', 'carta topo', 'carta topografica', 'mapa', 'carta'],
    'SCN Carta Ortoimagem': ['carta ortoimagem', 'carta imagem', 'carta orto'],
    'Cartas Temáticas Não SCN': ['carta temática', 'mapa temático', 'temática', 'tematico'],
    'MDS - RAM': ['MDS RAM', 'modelo digital de superfície RAM', 'modelo superfície RAM', 'superfície RAM'],
    'MDT - RAM': ['MDT RAM', 'modelo digital de terreno RAM', 'modelo terreno RAM', 'terreno RAM'],
    'Modelo Tridimensional MDS': ['modelo 3D MDS', 'MDS 3D', 'superfície 3D'],
    'Modelo Tridimensional MDT': ['modelo 3D MDT', 'MDT 3D', 'terreno 3D'],
    'Ortoimagem banda P pol HH': ['ortoimagem P HH', 'banda P HH', 'ortoimagem polarização HH', 'P HH'],
    'Ortoimagem banda P pol HV': ['ortoimagem P HV', 'banda P HV', 'ortoimagem polarização HV', 'P HV'],
    'Ortoimagem banda X pol HH': ['ortoimagem X HH', 'banda X HH', 'ortoimagem polarização X', 'X HH'],
    'Ortoimagem Radar Colorida': ['radar colorido', 'imagem radar cor', 'radar cor'],
    'Cartas CENSIPAM': ['censipam', 'carta censipam', 'mapa censipam'],
    'Tematico CIRC': ['CIRC', 'carta CIRC', 'temático CIRC'],
    'Tematico CIRP': ['CIRP', 'carta CIRP', 'temático CIRP'],
    'Tematico CISC': ['CISC', 'carta CISC', 'temático CISC'],
    'Tematico CISP': ['CISP', 'carta CISP', 'temático CISP'],
    'Tematico CMIL': ['CMIL', 'carta CMIL', 'temático CMIL'],
    'Tematico CTBL': ['CTBL', 'carta CTBL', 'temático CTBL'],
    'Tematico CTP': ['CTP', 'carta CTP', 'temático CTP']
  },

  SUPPLY_AREA: {
    '1° Centro de Geoinformação': ['1cgeo', '1º cgeo', 'primeiro cgeo', 'primeiro centro', '1° cgeo'],
    '2° Centro de Geoinformação': ['2cgeo', '2º cgeo', 'segundo cgeo', 'segundo centro', '2° cgeo'],
    '3° Centro de Geoinformação': ['3cgeo', '3º cgeo', 'terceiro cgeo', 'terceiro centro', '3° cgeo'],
    '4° Centro de Geoinformação': ['4cgeo', '4º cgeo', 'quarto cgeo', 'quarto centro', '4° cgeo'],
    '5° Centro de Geoinformação': ['5cgeo', '5º cgeo', 'quinto cgeo', 'quinto centro', '5° cgeo']
  },

  STATE: {
    'Acre': ['AC', 'estado do Acre', 'território do Acre'],
    'Alagoas': ['AL', 'estado de Alagoas', 'território de Alagoas'],
    'Amapá': ['AP', 'estado do Amapá', 'território do Amapá'],
    'Amazonas': ['AM', 'estado do Amazonas', 'território do Amazonas'],
    'Bahia': ['BA', 'estado da Bahia', 'território da Bahia'],
    'Ceará': ['CE', 'estado do Ceará', 'território do Ceará'],
    'Distrito Federal': ['DF', 'Brasília', 'território do DF'],
    'Espírito Santo': ['ES', 'estado do Espírito Santo', 'território do ES'],
    'Goiás': ['GO', 'estado de Goiás', 'território de Goiás'],
    'Maranhão': ['MA', 'estado do Maranhão', 'território do Maranhão'],
    'Mato Grosso': ['MT', 'estado do Mato Grosso', 'território do MT'],
    'Mato Grosso do Sul': ['MS', 'estado do Mato Grosso do Sul', 'território do MS'],
    'Minas Gerais': ['MG', 'estado de Minas Gerais', 'território de MG'],
    'Pará': ['PA', 'estado do Pará', 'território do Pará'],
    'Paraíba': ['PB', 'estado da Paraíba', 'território da PB'],
    'Paraná': ['PR', 'estado do Paraná', 'território do PR'],
    'Pernambuco': ['PE', 'estado de Pernambuco', 'território de PE'],
    'Piauí': ['PI', 'estado do Piauí', 'território do PI'],
    'Rio de Janeiro': ['RJ', 'estado do Rio de Janeiro', 'território do RJ'],
    'Rio Grande do Norte': ['RN', 'estado do Rio Grande do Norte', 'território do RN'],
    'Rio Grande do Sul': ['RS', 'estado do Rio Grande do Sul', 'território do RS'],
    'Rondônia': ['RO', 'estado de Rondônia', 'território de RO'],
    'Roraima': ['RR', 'estado de Roraima', 'território de RR'],
    'Santa Catarina': ['SC', 'estado de Santa Catarina', 'território de SC'],
    'São Paulo': ['SP', 'estado de São Paulo', 'território de SP'],
    'Sergipe': ['SE', 'estado de Sergipe', 'território de SE'],
    'Tocantins': ['TO', 'estado do Tocantins', 'território do TO']
  },

  PROJECT: {
    'AMAN': ['projeto AMAN', 'área AMAN'],
    'Base Cartográfica Digital da Bahia': ['base Bahia', 'BCDBahia', 'cartografia Bahia'],
    'Base Cartográfica Digital de Rondônia': ['base Rondônia', 'BCDRondônia', 'cartografia Rondônia'],
    'Base Cartográfica Digital do Amapá': ['base Amapá', 'BCDAmapá', 'cartografia Amapá'],
    'COTer Não EDGV': ['COTer', 'projeto COTer'],
    'Cobertura Aerofotogramétrica do Estado de São Paulo': ['cobertura SP', 'aerofotogrametria SP', 'projeto SP'],
    'Copa das Confederações': ['confederações', 'projeto confederações'],
    'Copa do Mundo 2014': ['copa 2014', 'mundial 2014', 'projeto copa'],
    'Mapeamento Sistemático': ['sistemático', 'projeto sistemático'],
    'Mapeamento de Áreas de Interesse da Força': ['áreas de interesse', 'interesse da força', 'projeto força'],
    'NGA-BECA': ['BECA', 'projeto BECA', 'NGA'],
    'Olimpíadas Rio 2016': ['olimpíadas', 'Rio 2016', 'projeto olimpíadas'],
    'Radiografia da Amazônia': ['RAM', 'projeto RAM', 'radiografia']
  },

  DATE_RELATIVE: {
    recent: {
      patterns: ['última semana', 'semana passada', 'últimos 7 dias'],
      period: { weeks: 1 }
    },
    lastMonth: {
      patterns: ['mês passado', 'último mês', 'últimos 30 dias'],
      period: { months: 1 }
    },
    lastQuarter: {
      patterns: ['último trimestre', 'trimestre passado', 'últimos 3 meses'],
      period: { months: 3 }
    },
    thisYear: {
      patterns: ['este ano', 'ano atual', 'em 2024'],
      period: { type: 'thisYear' }
    },
    lastYear: {
      patterns: ['ano passado', 'em 2023', 'último ano'],
      period: { type: 'lastYear' }
    }
  }
};