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
  keyword: 0.5, // Aumentado para mais identificadores
  scale: 0.5, // Aumentado para mais exemplos com escala
  productType: 0.6, // Aumentado para mais tipos de produto
  state: 0.5, // Aumentado para mais estados
  city: 0.5, // Aumentado para mais cidades
  supplyArea: 0.4, // Aumentado para mais Supply Areas
  project: 0.4, // Aumentado para mais projetos
  dates: 0.4,
  limit: 0.3, // Aumentado para mais exemplos com limite
  sort: 0.3, // Aumentado para mais exemplos com ordenação
  typo: 0.4, // Reduzido para menos typos - ajuda a evitar rejeições
  invalidData: 0.1,

  // Parameter combination decay factors - REMOVIDO
  // parameterDecay: 0.70, // Each additional parameter reduces probability

  locationCombination: 0.5, // Aumentado para mais combinações cidade/estado
  dateWithSort: 0.5, // Aumentado para mais exemplos com data e ordenação

  // Group weights
  locationGroup: 0.5, // Aumentado para mais exemplos com localização
  dateGroup: 0.5, // Aumentado para mais exemplos com datas
  keywordGroup: 0.5, // Aumentado para mais exemplos com identificadores
  primaryGroup: 0.8, // Aumentado para garantir pelo menos um parâmetro primário

  // Special cases
  withoutPrefix: 0.7, // Probability of omitting MI/INOM prefix
  relativeDate: 0.5, // Probability of using relative dates

  // REMOVIDO: invalidCombination

  // New weights for improved variety
  expandExample: 0.7, // Probability of expanding a successful example
  complexStructure: 0.5, // Aumentado para mais estruturas complexas
  multiSentence: 0.4, // Aumentado para mais multi-sentenças
  contextualInfo: 0.4, // Aumentado para mais contexto
  formalityShift: 0.3, // Probability of shifting formality
  semanticNoise: 0.5, // Aumentado para mais ruído semântico

  // Nova distribuição de número de parâmetros
  paramCount: {
    1: 0.05, // 5% de chance para 1 parâmetro
    2: 0.15, // 15% de chance para 2 parâmetros
    3: 0.30, // 30% de chance para 3 parâmetros
    4: 0.25, // 25% de chance para 4 parâmetros
    5: 0.15, // 15% de chance para 5 parâmetros
    6: 0.05, // 5% de chance para 6 parâmetros
    7: 0.03, // 3% de chance para 7 parâmetros
    8: 0.02  // 2% de chance para 8+ parâmetros
  }
};

export const PRODUCT_TYPE_WEIGHTS = {
  // CORREÇÃO: Incluir todos os tipos de produtos com pesos distribuídos
  'SCN Carta Topografica Matricial': 0.10,
  'SCN Carta Ortoimagem': 0.10,
  'Cartas Temáticas Não SCN': 0.07,
  'MDT - RAM': 0.07,
  'MDS - RAM': 0.07,
  'Tematico CIRC': 0.05,
  'Ortoimagem banda P pol HH': 0.05,
  'Cartas CENSIPAM': 0.05,
  'Altura da vegetação': 0.02,
  'CDGV EDGV Defesa F Ter Não SCN': 0.02,
  'CTM Venezuela': 0.02,
  'Carta Ortoimagem Especial': 0.03,
  'Modelo Tridimensional MDS': 0.03,
  'Modelo Tridimensional MDT': 0.03,
  'Nao SCN Carta Topografica Especial Matricial': 0.03,
  'Ortoimagem': 0.03,
  'Ortoimagem Radar Colorida': 0.03,
  'Ortoimagem SCN': 0.03,
  'Ortoimagem banda P': 0.03,
  'Ortoimagem banda P pol HV': 0.03,
  'Ortoimagem banda X pol HH': 0.03,
  'SCN Carta Especial Matricial': 0.03,
  'SCN Carta Topografica Vetorial': 0.03,
  'SCN Carta Topografica Vetorial EDGV 3.0': 0.02,
  'Tematico CIRP': 0.02,
  'Tematico CISC': 0.02,
  'Tematico CISP': 0.02,
  'Tematico CMIL': 0.02,
  'Tematico CTBL': 0.02,
  'Tematico CTP': 0.02
};

export const SCALE_WEIGHTS = {
  '1:25.000': 0.20,
  '1:50.000': 0.20,
  '1:100.000': 0.15,
  '1:250.000': 0.15,
  '1:10.000': 0.10,
  '1:5.000': 0.07,
  '1:2.000': 0.07,
  '1:1.000': 0.06
};

export const SORT_FIELDS = ['publicationDate', 'creationDate'];
export const SORT_DIRECTIONS = ['ASC', 'DESC'];

// REMOVIDO: PARAM_COMBINATIONS - permitir qualquer combinação

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
    SP: ['São Paulo', 'Campinas', 'Santos', 'Registro', 'Presidente Prudente', 'Ribeirão Preto', 'São José dos Campos', 'Sorocaba', 'Bauru', 'Marília'],
    RJ: ['Rio de Janeiro', 'Niterói', 'Angra dos Reis', 'Parati', 'Nova Friburgo', 'Petrópolis', 'Campos dos Goytacazes', 'Volta Redonda', 'Macaé', 'Cabo Frio'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Montes Claros', 'Diamantina', 'Poços de Caldas', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Ouro Preto'],
    BA: ['Salvador', 'Feira de Santana', 'Ilhéus', 'Porto Seguro', 'Barreiras', 'Vitória da Conquista', 'Juazeiro', 'Camaçari', 'Itabuna', 'Lauro de Freitas'],
    PE: ['Recife', 'Olinda', 'Caruaru', 'Petrolina', 'Garanhuns', 'Jaboatão dos Guararapes', 'Paulista', 'Cabo de Santo Agostinho', 'Vitória de Santo Antão', 'Serra Talhada'],
    CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral', 'Crato', 'Maracanaú', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá'],
    RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria', 'Uruguaiana', 'Passo Fundo', 'Rio Grande', 'Bagé', 'Bento Gonçalves', 'Santa Cruz do Sul'],
    PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'Guarapuava', 'Paranaguá', 'Foz do Iguaçu', 'Umuarama', 'Apucarana'],
    SC: ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó', 'Criciúma', 'Itajaí', 'Lages', 'São José', 'Jaraguá do Sul', 'Balneário Camboriú'],
    AM: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Tabatinga', 'Humaitá', 'Maués', 'Eirunepé'],
    PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Parauapebas', 'Itaituba', 'Altamira', 'Barcarena', 'Tucuruí'],
    GO: ['Goiânia', 'Anápolis', 'Aparecida de Goiânia', 'Rio Verde', 'Catalão', 'Luziânia', 'Formosa', 'Itumbiara', 'Jataí', 'Valparaíso de Goiás'],
    MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Primavera do Leste', 'Barra do Garças', 'Alta Floresta', 'Pontes e Lacerda'],
    MS: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Aquidauana', 'Nova Andradina', 'Paranaíba', 'Maracaju'],
    RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste', 'Buritis'],
    TO: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins', 'Guaraí', 'Dianópolis', 'Miracema do Tocantins', 'Formoso do Araguaia'],
    AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasileia', 'Epitaciolândia', 'Plácido de Castro', 'Mâncio Lima', 'Senador Guiomard'],
    RR: ['Boa Vista', 'Caracaraí', 'Rorainópolis', 'Alto Alegre', 'Mucajaí', 'Pacaraima', 'Cantá', 'Bonfim', 'São João da Baliza', 'Normandia'],
    AP: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Porto Grande', 'Tartarugalzinho', 'Vitória do Jari', 'Amapá', 'Calçoene'],
    AL: ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo', 'União dos Palmares', 'São Miguel dos Campos', 'Delmiro Gouveia', 'Coruripe', 'Marechal Deodoro'],
    PI: ['Teresina', 'Parnaíba', 'Picos', 'Floriano', 'Campo Maior', 'Piripiri', 'Barras', 'Pedro II', 'Oeiras', 'São Raimundo Nonato'],
    MA: ['São Luís', 'Imperatriz', 'Timon', 'Caxias', 'Codó', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês', 'Barra do Corda'],
    PB: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Cabedelo', 'Guarabira', 'Sapé'],
    RN: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Currais Novos', 'Caicó', 'Assu', 'Nova Cruz'],
    SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto', 'Propriá', 'Nossa Senhora da Glória', 'Simão Dias'],
    ES: ['Vitória', 'Serra', 'Vila Velha', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz'],
    DF: ['Brasília', 'Ceilândia', 'Taguatinga', 'Planaltina', 'Gama', 'Sobradinho', 'Recanto das Emas', 'Guará', 'Brazlândia', 'São Sebastião']
  }
};

export const KEYWORDS = {
  mi: [
    '2965-2-NE', '2901', '2965-2', '2966-1', '2966-1-NO',
    '2966-2', '2966-2-SO', '2967-1', '2967-1-SE', '2967-2',
    '2984-3', '3013-1', '3014-2', '3033-4', '3052-1',
    '2899-1-SO', '2899-2-SE', '2900-1-NO', '2900-2-NE', '2900-3-SO',
    '2917-3-NO', '2917-4-NE', '2918-1-SE', '2918-2-SO', '2918-3-NE',
    '2934-1-SE', '2934-2-SO', '2934-3-NE', '2934-4-NO', '2935-1-SE',
    '2552-2', '2552-4', '2553-1', '2553-3', '2569-2',
    '2585-1', '2585-3', '2586-2', '2586-4', '2602-1',
    '3000-1-NO', '3000-2-NE', '3016-3-SO', '3016-4-SE', '3017-1-NO',
    '3033-1-SE', '3033-2-SO', '3033-3-NE', '3033-4-NO', '3034-1-SE'
  ],
  inom: [
    'SF-22-Y-D', 'SF-22-Y-D-II', 'SF-22', 'SA-22-X-B',
    'SA-22-X-B-II', 'SB-22-X-C', 'SC-22-X-D', 'SD-22-X-A',
    'NA-20-X-A', 'NA-21-V-A', 'NB-20-Z-D', 'NB-21-Y-C',
    'NC-20-Z-C', 'NC-21-Y-D', 'ND-20-X-B', 'ND-21-V-B',
    'SA-19-X-A', 'SA-19-Y-A', 'SA-20-V-A', 'SA-20-X-A',
    'SB-19-X-B', 'SB-19-Y-B', 'SB-20-V-B', 'SB-20-X-B',
    'SC-19-X-C', 'SC-19-Y-C', 'SC-20-V-C', 'SC-20-X-C',
    'SD-19-X-D', 'SD-19-Y-D', 'SD-20-V-D', 'SD-20-X-D',
    'SE-19-X-A', 'SE-19-Y-A', 'SE-20-V-A', 'SE-20-X-A',
    'SF-19-X-B', 'SF-19-Y-B', 'SF-20-V-B', 'SF-20-X-B',
    'SG-19-X-C', 'SG-19-Y-C', 'SG-20-V-C', 'SG-20-X-C',
    'SH-19-X-D', 'SH-19-Y-D', 'SH-20-V-D', 'SH-20-X-D',
    'SI-19-X-A', 'SI-19-Y-A', 'SI-20-V-A', 'SI-20-X-A'
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
    'fazer acesso a', 'realizar acesso a',

    // Novos prefixos - coloquiais
    'tô procurando', 'tô precisando de', 'me ajuda a achar',
    'será que tem', 'queria ver', 'teria como ver',
    'dá uma olhada se tem', 'vê se acha', 'consegue me mostrar',
    'bate o olho se tem', 'dá um help com', 'será que existe',
    'tem como me ajudar a encontrar', 'será possível verificar',
    'tem jeito de achar', 'ajuda aí com', 'dá um help pra localizar',

    // Novos prefixos - técnicos
    'realizar pesquisa geoespacial de', 'executar query para',
    'filtrar base de dados por', 'indexar dados referentes a',
    'mapear ocorrência de', 'compilar informações sobre',
    'catalogar produtos relacionados a', 'extrair dados de',
    'levantar informações sobre', 'processar consulta de',
    'conduzir análise espacial de', 'identificar ocorrências de',

    // Novos prefixos - contextuais
    'para o projeto atual preciso', 'para atividade em campo necessito',
    'meu supervisor solicitou', 'equipe técnica requisitou',
    'departamento precisa urgentemente', 'missão de campo requer',
    'para levantamento geográfico preciso', 'estou em operação e preciso',
    'análise preliminar demanda', 'para entrega hoje preciso',
    'projeto em andamento requer', 'coordenação solicitou',
    'para relatório final preciso', 'mapeamento preliminar exige',
    'fase de campo demanda', 'diagnóstico requer'
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
    'do sistema',

    // Novos sufixos - urgência
    'pra ontem', 'extremamente urgente', 'situação crítica',
    'prioridade máxima', 'prazos apertados', 'urgência operacional',
    'atendimento imediato', 'sem tempo a perder', 'emergencial',
    'aguardando há dias', 'solicitação pendente', 'ultrapassou prazo',

    // Novos sufixos - contexto técnico
    'para georreferenciamento', 'para sobreposição de camadas',
    'para análise topográfica', 'para comparativo histórico',
    'para registro de metadados', 'para processamento em SIG',
    'para vetorização', 'para validação de campo',
    'para processamento de imagens', 'para restituição fotogramétrica',
    'para análise hidrográfica', 'para estudos de relevo',

    // Novos sufixos - contexto operacional
    'equipe em campo aguardando', 'operação em andamento',
    'para briefing da missão', 'para vistoria técnica',
    'para orientação da equipe', 'para treinamento',
    'para apresentação ao cliente', 'para reunião estratégica',
    'pra sobrevoo de amanhã', 'para atividade prática',
    'pra missão de reconhecimento', 'para validação do cliente',

    // Novos sufixos - administrativos
    'conforme solicitação anterior', 'segundo protocolo',
    'em conformidade com contrato', 'como discutido na reunião',
    'de acordo com o cronograma', 'como previsto no plano',
    'segundo normas técnicas', 'conforme diretrizes',
    'atendendo requisitos do projeto', 'em referência ao pedido',
    'seguindo especificações técnicas', 'como combinado anteriormente'
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
    'qual o procedimento para acessar {params}?',

    // Novas perguntas - técnicas
    'quais as especificações técnicas de {params}?',
    'qual a projeção cartográfica utilizada em {params}?',
    'qual o datum de referência para {params}?',
    'qual a precisão planimétrica de {params}?',
    'quais os metadados disponíveis para {params}?',
    'qual o sistema de coordenadas de {params}?',
    'qual a resolução espacial de {params}?',
    'qual o formato de arquivo disponível para {params}?',
    'qual a data do último levantamento de {params}?',

    // Novas perguntas - coloquiais
    'será que vocês têm {params}?',
    'tem alguma chance de achar {params}?',
    'dá pra encontrar {params} no sistema?',
    'como que eu faço pra ver {params}?',
    'tem jeito de conseguir {params}?',
    'onde que estaria {params}?',
    'vocês podem me dizer se existe {params}?',
    'tem como descobrir se há {params}?',
    'será que já mapearam {params}?',

    // Novas perguntas - contextuais
    'para o projeto X, onde encontro {params}?',
    'estando em campo, como acesso {params}?',
    'considerando a urgência, onde localizo {params}?',
    'para apresentação de amanhã, como obtenho {params}?',
    'seguindo o cronograma, onde está {params}?',
    'para a próxima fase, como consigo {params}?',
    'para atender o cliente, onde acho {params}?',
    'em caso de emergência, como acesso {params}?',
    'para finalizar o relatório, onde tem {params}?',

    // Novas perguntas - disponibilidade/restrição
    'há restrições de acesso para {params}?',
    'qual o nível de classificação de {params}?',
    'é necessária autorização especial para {params}?',
    'quais os requisitos para obter {params}?',
    'existe cobrança para acesso a {params}?',
    'quais as limitações de uso de {params}?',
    'é permitido compartilhar {params}?',
    'qual o protocolo para solicitar {params}?',
    'existe versão pública de {params}?'
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
    'permitir visualização de {params}',

    // Novas afirmações - coloquiais
    'tô precisando de {params}',
    'tô atrás de {params}',
    'ando procurando {params}',
    'tô na correria precisando de {params}',
    'tava querendo dar uma olhada em {params}',
    'to tentando achar {params}',
    'a galera tá pedindo {params}',
    'pessoal do campo pediu {params}',
    'to com dificuldade pra encontrar {params}',

    // Novas afirmações - técnicas
    'realizar levantamento cartográfico de {params}',
    'executar análise espacial de {params}',
    'mapear características físicas em {params}',
    'processar dados geoespaciais de {params}',
    'compilar metadados referentes a {params}',
    'catalogar produtos cartográficos de {params}',
    'verificar consistência topológica de {params}',
    'extrair feições vetoriais de {params}',
    'conduzir processamento digital de {params}',

    // Novas afirmações - contextuais
    'para atividade em campo necessito de {params}',
    'para apresentação ao cliente preciso de {params}',
    'fase atual do projeto requer {params}',
    'próxima etapa depende de {params}',
    'levantamento preliminar indica necessidade de {params}',
    'missão de reconhecimento exige {params}',
    'operação em andamento demanda {params}',
    'análise preliminar sugere uso de {params}',
    'planejamento estratégico requer acesso a {params}',

    // Novas afirmações - administrativas
    'conforme protocolo interno, solicito {params}',
    'em atendimento à solicitação superior, requisito {params}',
    'seguindo diretrizes técnicas, necessito de {params}',
    'em conformidade com o cronograma, preciso de {params}',
    'atendendo requisitos do contrato, solicito {params}',
    'segundo especificações do cliente, requeiro {params}',
    'para cumprimento de metas, necessito acessar {params}',
    'por determinação da coordenação, solicito {params}',
    'em caráter oficial, requeiro acesso a {params}'
  ],

  // Multi-sentence templates
  multiSentence: [
    'Estou trabalhando em um projeto importante. Preciso de {params}.',
    'Somos uma equipe em campo. Necessitamos urgentemente de {params}.',
    'A coordenação solicitou um relatório detalhado. Para isso, precisamos de {params}.',
    'Estamos com dificuldades na área de operação. Seria possível acessar {params}?',
    'Olá, bom dia. Estou precisando localizar {params}.',
    'Prezados, conforme conversado anteriormente. Solicito acesso a {params}.',
    'Boa tarde. Estamos com uma situação crítica em campo e precisamos de {params}.',
    'Sou da equipe técnica do projeto X. Estamos buscando {params}.',
    'Olá. Acabei de receber uma solicitação urgente. Onde posso encontrar {params}?',
    'Por favor, é uma situação de emergência. Como faço para acessar {params}?',
    'Bom dia. O comandante solicitou para a missão de amanhã {params}.',
    'Estamos finalizando o relatório preliminar. Ainda falta incluir {params}.',
    'Olá, estou tentando completar uma análise. Você saberia me dizer onde encontro {params}?',
    'Boa tarde. Tivemos problemas com os dados coletados. Precisamos substituir por {params}.',
    'A diretoria solicitou uma apresentação para amanhã. Preciso com urgência de {params}.',
    'Estou com a equipe aguardando em campo. Não conseguimos localizar {params}. Podem ajudar?',
    'Prezados, seguindo o cronograma do projeto. Na fase atual necessitamos de {params}.',
    'Olá, já procurei em todas as pastas disponíveis. Não encontro {params}. Onde devo procurar?',
    'Bom dia. Para continuar o mapeamento da área X, preciso consultar {params}.',
    'Estamos com problemas técnicos no campo. Para resolver, precisamos acessar {params}.'
  ],

  // Templates com contexto detalhado
  contextualFormats: [
    'Para o mapeamento da região norte de {localRef}, precisamos de {params}.',
    'Estamos realizando um estudo comparativo e necessitamos de {params}.',
    'Durante operação de mapeamento em {localRef}, a equipe identificou a necessidade de {params}.',
    'Após avaliação preliminar da área de {localRef}, constatou-se a necessidade de {params}.',
    'O levantamento do perímetro urbano de {localRef} requer {params}.',
    'Para atualização da base cartográfica de {localRef}, buscamos {params}.',
    'Em preparação para o período de cheias em {localRef}, precisamos consultar {params}.',
    'A nova fase do projeto de monitoramento ambiental necessita de {params}.',
    'Durante reconhecimento da área de {localRef}, identificamos lacunas que podem ser preenchidas com {params}.',
    'Para o planejamento da expansão urbana de {localRef}, é fundamental o acesso a {params}.',
    'A avaliação de riscos geológicos em {localRef} depende de {params}.',
    'O monitoramento da cobertura vegetal na região de {localRef} requer {params}.',
    'Para atender à demanda do cliente X sobre a área de {localRef}, precisamos de {params}.',
    'A preparação do relatório técnico sobre {localRef} exige consulta a {params}.',
    'Em resposta às mudanças climáticas observadas em {localRef}, necessitamos analisar {params}.'
  ],

  // Templates com lista
  listFormats: [
    'Preciso do seguinte material: 1. {params}',
    'Por favor, localize os seguintes itens para o projeto: 1) {params}',
    'Solicito acesso aos produtos cartográficos listados: - {params}',
    'Necessito dos seguintes dados para análise: item 1: {params}',
    'Equipe de campo solicitou: • {params}',
    'Para a apresentação de amanhã, precisamos de: 1- {params}',
    'De acordo com o plano de trabalho, necessitamos: 1. {params}',
    'Itens pendentes para finalização: - {params}',
    'Requisitos técnicos do projeto: #1 {params}',
    'Lista de materiais necessários: Item 1 - {params}'
  ],

  // Conectores para parâmetros
  connectors: [
    ' e também ', ' além disso, ', ' adicionalmente, ',
    ' junto com ', ' complementando com ', ' acompanhado de ',
    ' combinado com ', ' em conjunto com ', ' somado a ',
    ' acrescentando ', ' incluindo também ', ' sem esquecer de ',
    ' juntamente com ', ' associado a ', ' vinculado a ',
    ' relacionado com ', ' em paralelo a ', ' em adição a '
  ]
};

export const VARIATIONS = {
  SCALE: {
    '1:1.000': ['1k', '1.000', '1000', 'escala 1:1.000', 'um para mil', '1 para 1000', '1/1000', '1:1000', 'escala 1k', 'escala urbana detalhada', 'escala muito detalhada', '1:1000m', 'escala cadastral', 'maior escala disponível', 'escala máxima'],
    '1:2.000': ['2k', '2.000', '2000', 'escala 1:2.000', 'um para dois mil', '1/2000', '1:2000', 'escala 2k', 'escala muito detalhada', 'escala urbana', '1:2000m', 'escala para áreas urbanas', 'escala de detalhe urbano', 'escala para cadastro urbano'],
    '1:5.000': ['5k', '5.000', '5000', 'escala 1:5.000', 'um para cinco mil', '1/5000', '1:5000', 'escala 5k', 'escala detalhada', 'escala urbana-regional', '1:5000m', 'escala para áreas urbanizadas', 'escala para planejamento urbano', 'escala de detalhe'],
    '1:10.000': ['10k', '10.000', '10000', 'escala 1:10.000', 'um para dez mil', '1/10000', '1:10000', 'escala 10k', 'escala semidetalhada', 'escala municipal', '1:10000m', 'escala para municípios', 'escala para planejamento municipal', 'escala municipal detalhada'],
    '1:25.000': ['25k', '25.000', '25000', 'escala detalhada', 'escala 1:25.000', 'maior escala', 'um para vinte e cinco mil', '1/25000', '1:25000', 'escala 25k', 'escala para planejamento', '1:25000m', 'escala para gestão territorial', 'escala regional detalhada', 'escala operacional'],
    '1:50.000': ['50k', '50.000', '50000', 'escala média', 'escala 1:50.000', 'escala intermediária', 'um para cinquenta mil', '1/50000', '1:50000', 'escala 50k', 'escala regional', '1:50000m', 'escala para análise regional', 'escala tática', 'carta topográfica padrão'],
    '1:100.000': ['100k', '100.000', '100000', 'escala 1:100.000', 'um para cem mil', '1/100000', '1:100000', 'escala 100k', 'escala regional ampla', 'escala para grandes áreas', '1:100000m', 'escala para planejamento regional', 'escala para avaliação territorial', 'escala semi-estratégica'],
    '1:250.000': ['250k', '250.000', '250000', 'pequena escala', 'escala 1:250.000', 'menor escala', 'um para duzentos e cinquenta mil', '1/250000', '1:250000', 'escala 250k', 'escala para grandes regiões', '1:250000m', 'escala para planejamento estadual', 'escala estratégica', 'escala para visão geral']
  },

  PRODUCT_TYPE: {
    'SCN Carta Topografica Matricial': ['carta topográfica', 'carta topo', 'carta topografica', 'mapa', 'carta', 'produto matricial SCN', 'raster topográfico', 'arquivo matricial topográfico', 'mapa topográfico matricial', 'folha topográfica', 'carta topográfica em raster', 'mapa topográfico em raster', 'topográfico do SCN', 'carta oficial topográfica', 'mapa topo SCN'],
    'SCN Carta Ortoimagem': ['carta ortoimagem', 'carta imagem', 'carta orto', 'ortofoto carta', 'mapa de imagem', 'imagem cartográfica', 'carta com imagem orbital', 'foto carta', 'mapa ortorretificado', 'mapa com imagem', 'carta SCN com imagem', 'produto ortoimagem', 'carta imagem SCN', 'ortofoto mapeada', 'imagem georreferenciada SCN'],
    'Cartas Temáticas Não SCN': ['carta temática', 'mapa temático', 'temática', 'tematico', 'mapa especializado', 'carta para análise temática', 'produto temático', 'mapa para análise temática', 'carta especializada', 'mapa não-sistemático temático', 'produto temático especial', 'cartografia temática', 'material cartográfico temático', 'mapa para análise específica', 'carta para estudos específicos'],
    'MDS - RAM': ['MDS RAM', 'modelo digital de superfície RAM', 'modelo superfície RAM', 'superfície RAM', 'modelo da superfície RAM', 'MDS do projeto RAM', 'modelo digital RAM superfície', 'superfície digital RAM', 'modelo elevação superfície RAM', 'MDS da Amazônia', 'modelo de superfície Amazônia', 'superfície 3D RAM', 'elevação de superfície RAM', 'superfície digital Amazônia', 'modelo topo superfície RAM'],
    'MDT - RAM': ['MDT RAM', 'modelo digital de terreno RAM', 'modelo terreno RAM', 'terreno RAM', 'modelo do terreno RAM', 'MDT do projeto RAM', 'modelo digital RAM terreno', 'terreno digital RAM', 'modelo elevação terreno RAM', 'MDT da Amazônia', 'modelo de terreno Amazônia', 'terreno 3D RAM', 'elevação de terreno RAM', 'terreno digital Amazônia', 'modelo topo terreno RAM'],
    'Modelo Tridimensional MDS': ['modelo 3D MDS', 'MDS 3D', 'superfície 3D', 'modelo tridimensional de superfície', 'modelo 3D de superfície', 'representação 3D do MDS', 'superfície em três dimensões', 'MDS com elevação', 'representação tridimensional de superfície', 'MDS volumétrico', 'modelo de elevação 3D', 'representação espacial de superfície', 'modelo dimensional MDS', 'visualização 3D de superfície', 'modelo espacial MDS'],
    'Modelo Tridimensional MDT': ['modelo 3D MDT', 'MDT 3D', 'terreno 3D', 'modelo tridimensional de terreno', 'modelo 3D de terreno', 'representação 3D do MDT', 'terreno em três dimensões', 'MDT com elevação', 'representação tridimensional de terreno', 'MDT volumétrico', 'modelo de terreno 3D', 'representação espacial de terreno', 'modelo dimensional MDT', 'visualização 3D de terreno', 'modelo espacial MDT'],
    'Ortoimagem banda P pol HH': ['ortoimagem P HH', 'banda P HH', 'ortoimagem polarização HH', 'P HH', 'imagem P polarização HH', 'ortofoto banda P HH', 'imagem radar banda P', 'ortoimagem radar polarização HH', 'produto banda P polarização HH', 'imagem P HH ortorretificada', 'ortofoto radar banda P', 'imagem orbital banda P HH', 'radar P HH ortorretificado', 'imagem P pol horizontal', 'ortoimagem P com polarização horizontal'],
    'Ortoimagem banda P pol HV': ['ortoimagem P HV', 'banda P HV', 'ortoimagem polarização HV', 'P HV', 'imagem P polarização HV', 'ortofoto banda P HV', 'imagem radar banda P', 'ortoimagem radar polarização HV', 'produto banda P polarização HV', 'imagem P HV ortorretificada', 'ortofoto radar banda P', 'imagem orbital banda P HV', 'radar P HV ortorretificado', 'imagem P pol horizontal-vertical', 'ortoimagem P com polarização cruzada'],
    'Ortoimagem banda X pol HH': ['ortoimagem X HH', 'banda X HH', 'ortoimagem polarização X', 'X HH', 'imagem X polarização HH', 'ortofoto banda X HH', 'imagem radar banda X', 'ortoimagem radar polarização X', 'produto banda X polarização HH', 'imagem X HH ortorretificada', 'ortofoto radar banda X', 'imagem orbital banda X HH', 'radar X HH ortorretificado', 'imagem X pol horizontal', 'ortoimagem X com polarização horizontal'],
    'Ortoimagem Radar Colorida': ['radar colorido', 'imagem radar cor', 'radar cor', 'imagem colorida de radar', 'ortofoto radar colorida', 'imagem de radar em cores', 'radar imagem colorizada', 'produto radar colorido', 'ortoimagem radar em cores', 'radar processado colorido', 'imagem SAR colorida', 'radar com falsa cor', 'ortoimagem radar com paleta de cores', 'imagem SAR processada em cores', 'radar multiespectral'],
    'Cartas CENSIPAM': ['censipam', 'carta censipam', 'mapa censipam', 'produto CENSIPAM', 'cartografia CENSIPAM', 'carta do sistema CENSIPAM', 'mapeamento CENSIPAM', 'folha CENSIPAM', 'material cartográfico CENSIPAM', 'carta do centro CENSIPAM', 'produto cartográfico CENSIPAM', 'documento cartográfico CENSIPAM', 'mapa do sistema CENSIPAM', 'base cartográfica CENSIPAM', 'folha do centro CENSIPAM'],
    'Tematico CIRC': ['CIRC', 'carta CIRC', 'temático CIRC', 'mapa CIRC', 'produto CIRC', 'carta temática CIRC', 'mapeamento CIRC', 'folha CIRC', 'material CIRC', 'documento CIRC', 'cartografia CIRC', 'mapa temático CIRC', 'folha temática CIRC', 'carta especial CIRC', 'base cartográfica CIRC'],
    'Tematico CIRP': ['CIRP', 'carta CIRP', 'temático CIRP', 'mapa CIRP', 'produto CIRP', 'carta temática CIRP', 'mapeamento CIRP', 'folha CIRP', 'material CIRP', 'documento CIRP', 'cartografia CIRP', 'mapa temático CIRP', 'folha temática CIRP', 'carta especial CIRP', 'base cartográfica CIRP'],
    'Tematico CISC': ['CISC', 'carta CISC', 'temático CISC', 'mapa CISC', 'produto CISC', 'carta temática CISC', 'mapeamento CISC', 'folha CISC', 'material CISC', 'documento CISC', 'cartografia CISC', 'mapa temático CISC', 'folha temática CISC', 'carta especial CISC', 'base cartográfica CISC'],
    'Tematico CISP': ['CISP', 'carta CISP', 'temático CISP', 'mapa CISP', 'produto CISP', 'carta temática CISP', 'mapeamento CISP', 'folha CISP', 'material CISP', 'documento CISP', 'cartografia CISP', 'mapa temático CISP', 'folha temática CISP', 'carta especial CISP', 'base cartográfica CISP'],
    'Tematico CMIL': ['CMIL', 'carta CMIL', 'temático CMIL', 'mapa CMIL', 'produto CMIL', 'carta temática CMIL', 'mapeamento CMIL', 'folha CMIL', 'material CMIL', 'documento CMIL', 'cartografia CMIL', 'mapa temático CMIL', 'folha temática CMIL', 'carta especial CMIL', 'base cartográfica CMIL'],
    'Tematico CTBL': ['CTBL', 'carta CTBL', 'temático CTBL', 'mapa CTBL', 'produto CTBL', 'carta temática CTBL', 'mapeamento CTBL', 'folha CTBL', 'material CTBL', 'documento CTBL', 'cartografia CTBL', 'mapa temático CTBL', 'folha temática CTBL', 'carta especial CTBL', 'base cartográfica CTBL'],
    'Tematico CTP': ['CTP', 'carta CTP', 'temático CTP', 'mapa CTP', 'produto CTP', 'carta temática CTP', 'mapeamento CTP', 'folha CTP', 'material CTP', 'documento CTP', 'cartografia CTP', 'mapa temático CTP', 'folha temática CTP', 'carta especial CTP', 'base cartográfica CTP']
  },

  SUPPLY_AREA: {
    '1° Centro de Geoinformação': ['1cgeo', '1º cgeo', 'primeiro cgeo', 'primeiro centro', '1° cgeo', '1o cgeo', '1° CG', '1CG', 'CGEO1', '1CGEO', 'CGeo 1', 'centro geo 1', 'primeiro centro de geoinformação', 'primeiro centro geo', '1º centro de geo', 'cgeo número 1', 'cgeo 1', 'geo 1', 'centro 1', 'centro de geo 1'],
    '2° Centro de Geoinformação': ['2cgeo', '2º cgeo', 'segundo cgeo', 'segundo centro', '2° cgeo', '2o cgeo', '2° CG', '2CG', 'CGEO2', '2CGEO', 'CGeo 2', 'centro geo 2', 'segundo centro de geoinformação', 'segundo centro geo', '2º centro de geo', 'cgeo número 2', 'cgeo 2', 'geo 2', 'centro 2', 'centro de geo 2'],
    '3° Centro de Geoinformação': ['3cgeo', '3º cgeo', 'terceiro cgeo', 'terceiro centro', '3° cgeo', '3o cgeo', '3° CG', '3CG', 'CGEO3', '3CGEO', 'CGeo 3', 'centro geo 3', 'terceiro centro de geoinformação', 'terceiro centro geo', '3º centro de geo', 'cgeo número 3', 'cgeo 3', 'geo 3', 'centro 3', 'centro de geo 3'],
    '4° Centro de Geoinformação': ['4cgeo', '4º cgeo', 'quarto cgeo', 'quarto centro', '4° cgeo', '4o cgeo', '4° CG', '4CG', 'CGEO4', '4CGEO', 'CGeo 4', 'centro geo 4', 'quarto centro de geoinformação', 'quarto centro geo', '4º centro de geo', 'cgeo número 4', 'cgeo 4', 'geo 4', 'centro 4', 'centro de geo 4'],
    '5° Centro de Geoinformação': ['5cgeo', '5º cgeo', 'quinto cgeo', 'quinto centro', '5° cgeo', '5o cgeo', '5° CG', '5CG', 'CGEO5', '5CGEO', 'CGeo 5', 'centro geo 5', 'quinto centro de geoinformação', 'quinto centro geo', '5º centro de geo', 'cgeo número 5', 'cgeo 5', 'geo 5', 'centro 5', 'centro de geo 5']
  },

  STATE: {
    'Acre': ['AC', 'estado do Acre', 'território do Acre', 'Acre/AC', 'AC - Acre', 'estado AC', 'territorio acre', 'AC (Acre)', 'Acre (AC)', 'unidade federativa do Acre', 'UF Acre', 'UF do Acre', 'UF AC', 'area do Acre', 'região do Acre'],
    'Alagoas': ['AL', 'estado de Alagoas', 'território de Alagoas', 'Alagoas/AL', 'AL - Alagoas', 'estado AL', 'territorio alagoas', 'AL (Alagoas)', 'Alagoas (AL)', 'unidade federativa de Alagoas', 'UF Alagoas', 'UF de Alagoas', 'UF AL', 'area de Alagoas', 'região de Alagoas'],
    'Amapá': ['AP', 'estado do Amapá', 'território do Amapá', 'Amapá/AP', 'AP - Amapá', 'estado AP', 'territorio amapa', 'AP (Amapá)', 'Amapá (AP)', 'unidade federativa do Amapá', 'UF Amapá', 'UF do Amapá', 'UF AP', 'area do Amapá', 'região do Amapá'],
    'Amazonas': ['AM', 'estado do Amazonas', 'território do Amazonas', 'Amazonas/AM', 'AM - Amazonas', 'estado AM', 'territorio amazonas', 'AM (Amazonas)', 'Amazonas (AM)', 'unidade federativa do Amazonas', 'UF Amazonas', 'UF do Amazonas', 'UF AM', 'area do Amazonas', 'região do Amazonas'],
    'Bahia': ['BA', 'estado da Bahia', 'território da Bahia', 'Bahia/BA', 'BA - Bahia', 'estado BA', 'territorio bahia', 'BA (Bahia)', 'Bahia (BA)', 'unidade federativa da Bahia', 'UF Bahia', 'UF da Bahia', 'UF BA', 'area da Bahia', 'região da Bahia'],
    'Ceará': ['CE', 'estado do Ceará', 'território do Ceará', 'Ceará/CE', 'CE - Ceará', 'estado CE', 'territorio ceara', 'CE (Ceará)', 'Ceará (CE)', 'unidade federativa do Ceará', 'UF Ceará', 'UF do Ceará', 'UF CE', 'area do Ceará', 'região do Ceará'],
    'Distrito Federal': ['DF', 'Brasília', 'território do DF', 'Distrito Federal/DF', 'DF - Distrito Federal', 'Brasilia/DF', 'territorio federal', 'DF (Distrito Federal)', 'Distrito Federal (DF)', 'unidade federativa do DF', 'UF DF', 'UF Distrito Federal', 'area do DF', 'região do DF', 'capital federal'],
    'Espírito Santo': ['ES', 'estado do Espírito Santo', 'território do ES', 'Espírito Santo/ES', 'ES - Espírito Santo', 'estado ES', 'territorio espirito santo', 'ES (Espírito Santo)', 'Espírito Santo (ES)', 'unidade federativa do ES', 'UF ES', 'UF Espírito Santo', 'UF do ES', 'area do ES', 'região do ES'],
    'Goiás': ['GO', 'estado de Goiás', 'território de Goiás', 'Goiás/GO', 'GO - Goiás', 'estado GO', 'territorio goias', 'GO (Goiás)', 'Goiás (GO)', 'unidade federativa de Goiás', 'UF Goiás', 'UF de Goiás', 'UF GO', 'area de Goiás', 'região de Goiás'],
    'Maranhão': ['MA', 'estado do Maranhão', 'território do Maranhão', 'Maranhão/MA', 'MA - Maranhão', 'estado MA', 'territorio maranhao', 'MA (Maranhão)', 'Maranhão (MA)', 'unidade federativa do Maranhão', 'UF Maranhão', 'UF do Maranhão', 'UF MA', 'area do Maranhão', 'região do Maranhão'],
    'Mato Grosso': ['MT', 'estado do Mato Grosso', 'território do MT', 'Mato Grosso/MT', 'MT - Mato Grosso', 'estado MT', 'territorio mato grosso', 'MT (Mato Grosso)', 'Mato Grosso (MT)', 'unidade federativa do MT', 'UF MT', 'UF Mato Grosso', 'UF do MT', 'area do MT', 'região do MT'],
    'Mato Grosso do Sul': ['MS', 'estado do Mato Grosso do Sul', 'território do MS', 'Mato Grosso do Sul/MS', 'MS - Mato Grosso do Sul', 'estado MS', 'territorio mato grosso do sul', 'MS (Mato Grosso do Sul)', 'Mato Grosso do Sul (MS)', 'unidade federativa do MS', 'UF MS', 'UF Mato Grosso do Sul', 'UF do MS', 'area do MS', 'região do MS'],
    'Minas Gerais': ['MG', 'estado de Minas Gerais', 'território de MG', 'Minas Gerais/MG', 'MG - Minas Gerais', 'estado MG', 'territorio minas gerais', 'MG (Minas Gerais)', 'Minas Gerais (MG)', 'unidade federativa de MG', 'UF MG', 'UF Minas Gerais', 'UF de MG', 'area de MG', 'região de MG'],
    'Pará': ['PA', 'estado do Pará', 'território do Pará', 'Pará/PA', 'PA - Pará', 'estado PA', 'territorio para', 'PA (Pará)', 'Pará (PA)', 'unidade federativa do Pará', 'UF Pará', 'UF do Pará', 'UF PA', 'area do Pará', 'região do Pará'],
    'Paraíba': ['PB', 'estado da Paraíba', 'território da PB', 'Paraíba/PB', 'PB - Paraíba', 'estado PB', 'territorio paraiba', 'PB (Paraíba)', 'Paraíba (PB)', 'unidade federativa da PB', 'UF PB', 'UF Paraíba', 'UF da PB', 'area da PB', 'região da PB'],
    'Paraná': ['PR', 'estado do Paraná', 'território do PR', 'Paraná/PR', 'PR - Paraná', 'estado PR', 'territorio parana', 'PR (Paraná)', 'Paraná (PR)', 'unidade federativa do PR', 'UF PR', 'UF Paraná', 'UF do PR', 'area do PR', 'região do PR'],
    'Pernambuco': ['PE', 'estado de Pernambuco', 'território de PE', 'Pernambuco/PE', 'PE - Pernambuco', 'estado PE', 'territorio pernambuco', 'PE (Pernambuco)', 'Pernambuco (PE)', 'unidade federativa de PE', 'UF PE', 'UF Pernambuco', 'UF de PE', 'area de PE', 'região de PE'],
    'Piauí': ['PI', 'estado do Piauí', 'território do PI', 'Piauí/PI', 'PI - Piauí', 'estado PI', 'territorio piaui', 'PI (Piauí)', 'Piauí (PI)', 'unidade federativa do PI', 'UF PI', 'UF Piauí', 'UF do PI', 'area do PI', 'região do PI'],
    'Rio de Janeiro': ['RJ', 'estado do Rio de Janeiro', 'território do RJ', 'Rio de Janeiro/RJ', 'RJ - Rio de Janeiro', 'estado RJ', 'territorio rio de janeiro', 'RJ (Rio de Janeiro)', 'Rio de Janeiro (RJ)', 'unidade federativa do RJ', 'UF RJ', 'UF Rio de Janeiro', 'UF do RJ', 'area do RJ', 'região do RJ'],
    'Rio Grande do Norte': ['RN', 'estado do Rio Grande do Norte', 'território do RN', 'Rio Grande do Norte/RN', 'RN - Rio Grande do Norte', 'estado RN', 'territorio rio grande do norte', 'RN (Rio Grande do Norte)', 'Rio Grande do Norte (RN)', 'unidade federativa do RN', 'UF RN', 'UF Rio Grande do Norte', 'UF do RN', 'area do RN', 'região do RN'],
    'Rio Grande do Sul': ['RS', 'estado do Rio Grande do Sul', 'território do RS', 'Rio Grande do Sul/RS', 'RS - Rio Grande do Sul', 'estado RS', 'territorio rio grande do sul', 'RS (Rio Grande do Sul)', 'Rio Grande do Sul (RS)', 'unidade federativa do RS', 'UF RS', 'UF Rio Grande do Sul', 'UF do RS', 'area do RS', 'região do RS'],
    'Rondônia': ['RO', 'estado de Rondônia', 'território de RO', 'Rondônia/RO', 'RO - Rondônia', 'estado RO', 'territorio rondonia', 'RO (Rondônia)', 'Rondônia (RO)', 'unidade federativa de RO', 'UF RO', 'UF Rondônia', 'UF de RO', 'area de RO', 'região de RO'],
    'Roraima': ['RR', 'estado de Roraima', 'território de RR', 'Roraima/RR', 'RR - Roraima', 'estado RR', 'territorio roraima', 'RR (Roraima)', 'Roraima (RR)', 'unidade federativa de RR', 'UF RR', 'UF Roraima', 'UF de RR', 'area de RR', 'região de RR'],
    'Santa Catarina': ['SC', 'estado de Santa Catarina', 'território de SC', 'Santa Catarina/SC', 'SC - Santa Catarina', 'estado SC', 'territorio santa catarina', 'SC (Santa Catarina)', 'Santa Catarina (SC)', 'unidade federativa de SC', 'UF SC', 'UF Santa Catarina', 'UF de SC', 'area de SC', 'região de SC'],
    'São Paulo': ['SP', 'estado de São Paulo', 'território de SP', 'São Paulo/SP', 'SP - São Paulo', 'estado SP', 'territorio sao paulo', 'SP (São Paulo)', 'São Paulo (SP)', 'unidade federativa de SP', 'UF SP', 'UF São Paulo', 'UF de SP', 'area de SP', 'região de SP'],
    'Sergipe': ['SE', 'estado de Sergipe', 'território de SE', 'Sergipe/SE', 'SE - Sergipe', 'estado SE', 'territorio sergipe', 'SE (Sergipe)', 'Sergipe (SE)', 'unidade federativa de SE', 'UF SE', 'UF Sergipe', 'UF de SE', 'area de SE', 'região de SE'],
    'Tocantins': ['TO', 'estado do Tocantins', 'território do TO', 'Tocantins/TO', 'TO - Tocantins', 'estado TO', 'territorio tocantins', 'TO (Tocantins)', 'Tocantins (TO)', 'unidade federativa do TO', 'UF TO', 'UF Tocantins', 'UF do TO', 'area do TO', 'região do TO']
  },

  PROJECT: {
    'AMAN': ['projeto AMAN', 'área AMAN', 'AMAN digital', 'levantamento AMAN', 'mapeamento AMAN', 'cartografia AMAN', 'Academia Militar', 'geoespacial AMAN', 'dados AMAN', 'cartográfico AMAN', 'cobertura AMAN', 'projeto Academia Militar', 'área da Academia', 'complexo AMAN', 'território AMAN'],
    'Base Cartográfica Digital da Bahia': ['base Bahia', 'BCDBahia', 'cartografia Bahia', 'base digital Bahia', 'mapeamento digital Bahia', 'BD Bahia', 'BCD da Bahia', 'cartografia digital BA', 'base cartográfica BA', 'mapeamento BA', 'base digital BA', 'projeto Bahia digital', 'digitalização Bahia', 'cartografia sistemática Bahia', 'mapeamento sistemático BA'],
    'Base Cartográfica Digital de Rondônia': ['base Rondônia', 'BCDRondônia', 'cartografia Rondônia', 'base digital Rondônia', 'mapeamento digital Rondônia', 'BD Rondônia', 'BCD de Rondônia', 'cartografia digital RO', 'base cartográfica RO', 'mapeamento RO', 'base digital RO', 'projeto Rondônia digital', 'digitalização Rondônia', 'cartografia sistemática Rondônia', 'mapeamento sistemático RO'],
    'Base Cartográfica Digital do Amapá': ['base Amapá', 'BCDAmapá', 'cartografia Amapá', 'base digital Amapá', 'mapeamento digital Amapá', 'BD Amapá', 'BCD do Amapá', 'cartografia digital AP', 'base cartográfica AP', 'mapeamento AP', 'base digital AP', 'projeto Amapá digital', 'digitalização Amapá', 'cartografia sistemática Amapá', 'mapeamento sistemático AP'],
    'COTer Não EDGV': ['COTer', 'projeto COTer', 'COTer standard', 'material COTer', 'dados COTer', 'produto COTer', 'padrão COTer', 'comando terrestre', 'Comando de Operações Terrestres', 'material não EDGV', 'COTer não padronizado', 'COTer especial', 'COTer operacional', 'COTer estratégico', 'formato COTer'],
    'Cobertura Aerofotogramétrica do Estado de São Paulo': ['cobertura SP', 'aerofotogrametria SP', 'projeto SP', 'fotos aéreas SP', 'mapeamento aéreo SP', 'fotografias São Paulo', 'levantamento aéreo SP', 'aerolevantamento São Paulo', 'ortofoto São Paulo', 'imagens aéreas SP', 'cobertura fotogramétrica SP', 'fotografias aéreas São Paulo', 'projeto aerofoto SP', 'mosaico São Paulo', 'aerofoto SP'],
    'Copa das Confederações': ['confederações', 'projeto confederações', 'copa confederações', 'dados confederações', 'copa das confederações', 'projeto copa confederações', 'mapeamento confederações', 'cartografia confederações', 'bases confederações', 'projeto evento confederações', 'dados evento confederações', 'mapeamento evento FIFA', 'cartografia confederações FIFA', 'base copa confederações', 'levantamento confederações'],
    'Copa do Mundo 2014': ['copa 2014', 'mundial 2014', 'projeto copa', 'copa do mundo', 'mapeamento copa 2014', 'cartografia mundial 2014', 'base copa 2014', 'projeto mundial', 'dados copa 2014', 'evento 2014', 'FIFA 2014', 'levantamento copa 2014', 'mapeamento FIFA 2014', 'base cartográfica copa', 'projeto sedes copa'],
    'Mapeamento Sistemático': ['sistemático', 'projeto sistemático', 'mapeamento nacional', 'cartografia sistemática', 'levantamento sistemático', 'base sistemática', 'sistema cartográfico', 'mapeamento oficial', 'sistemático nacional', 'projeto cartográfico sistemático', 'levantamento oficial', 'mapeamento padrão', 'base oficial', 'sistematização cartográfica', 'cartografia oficial'],
    'Mapeamento de Áreas de Interesse da Força': ['áreas de interesse', 'interesse da força', 'projeto força', 'áreas sensíveis', 'áreas estratégicas', 'mapeamento estratégico', 'áreas prioritárias', 'mapeamento militar', 'áreas de segurança', 'interesse estratégico', 'áreas operacionais', 'levantamento força terrestre', 'áreas táticas', 'projeto força armada', 'interesse nacional'],
    'NGA-BECA': ['BECA', 'projeto BECA', 'NGA', 'NGA/BECA', 'parceria NGA', 'cooperação BECA', 'projeto internacional', 'BECA-NGA', 'National Geospatial Agency', 'acordo BECA', 'cooperação internacional', 'parceria geoespacial', 'projeto cooperação', 'acordo cartográfico', 'mapeamento conjunto'],
    'Olimpíadas Rio 2016': ['olimpíadas', 'Rio 2016', 'projeto olimpíadas', 'jogos olímpicos', 'olimpíadas rio', 'jogos 2016', 'projeto Rio 2016', 'mapeamento olimpíadas', 'base olimpíadas', 'cartografia olímpica', 'Rio olimpíadas', 'levantamento Rio 2016', 'jogos olímpicos Rio', 'projeto olímpico', 'cartografia Rio 2016'],
    'Radiografia da Amazônia': ['RAM', 'projeto RAM', 'radiografia', 'Amazônia RAM', 'projeto Amazônia', 'levantamento Amazônia', 'radiografia Amazônia', 'mapeamento Amazônia', 'radar Amazônia', 'cartografia Amazônia', 'sensoriamento Amazônia', 'cobertura radar Amazônia', 'projeto SAR Amazônia', 'levantamento radar Amazônia', 'mapeamento sistemático Amazônia']
  },

  DATE_RELATIVE: {
    recent: {
      patterns: ['última semana', 'semana passada', 'últimos 7 dias', 'semana anterior', 'há uma semana', '7 dias atrás', 'na semana passada', 'nos últimos sete dias', 'desde a semana passada', 'não mais que uma semana', 'recentemente, há 7 dias', 'há cerca de uma semana', 'período da última semana', 'dentro dos últimos 7 dias', 'nos 7 dias anteriores'],
      period: { weeks: 1 }
    },
    lastMonth: {
      patterns: ['mês passado', 'último mês', 'últimos 30 dias', 'há um mês', '30 dias atrás', 'no mês anterior', 'nos últimos trinta dias', 'desde o mês passado', 'período do último mês', 'há cerca de um mês', 'no decorrer do último mês', 'ao longo do mês passado', 'dentro do período mensal anterior', 'no intervalo do último mês', 'durante os últimos 30 dias'],
      period: { months: 1 }
    },
    lastQuarter: {
      patterns: ['último trimestre', 'trimestre passado', 'últimos 3 meses', 'há três meses', 'no trimestre anterior', 'últimos 90 dias', 'nos últimos três meses', 'desde o trimestre passado', 'período do último trimestre', 'no decorrer do último trimestre', 'ao longo dos últimos 3 meses', 'dentro do período trimestral anterior', 'no intervalo do último trimestre', 'durante os últimos três meses', 'nos 90 dias anteriores'],
      period: { months: 3 }
    },
    thisYear: {
      patterns: ['este ano', 'ano atual', 'em 2024', 'durante 2024', 'ano corrente', 'dentro do ano atual', 'no decorrer de 2024', 'ao longo deste ano', 'no presente ano', 'ano em curso', 'durante o ano atual', 'dentro do presente ano', 'no período atual do ano', 'em 2024 até agora', 'no ano vigente'],
      period: { type: 'thisYear' }
    },
    lastYear: {
      patterns: ['ano passado', 'em 2023', 'último ano', 'ano anterior', 'durante 2023', 'no ano passado', 'ao longo de 2023', 'no decorrer do ano passado', 'durante o ano anterior', 'período do ano passado', 'no ciclo anual anterior', 'último ciclo anual', 'ano fiscal anterior', 'no exercício anterior', 'em 2023 completo'],
      period: { type: 'lastYear' }
    },
    lastSemester: {
      patterns: ['último semestre', 'semestre passado', 'últimos 6 meses', 'há seis meses', 'no semestre anterior', 'últimos 180 dias', 'nos últimos seis meses', 'desde o semestre passado', 'período do último semestre', 'no decorrer do último semestre', 'ao longo dos últimos 6 meses', 'dentro do período semestral anterior', 'no intervalo do último semestre', 'durante os últimos seis meses', 'nos 180 dias anteriores'],
      period: { months: 6 }
    },
    lastBimester: {
      patterns: ['último bimestre', 'bimestre passado', 'últimos 2 meses', 'há dois meses', 'no bimestre anterior', 'últimos 60 dias', 'nos últimos dois meses', 'desde o bimestre passado', 'período do último bimestre', 'no decorrer do último bimestre', 'ao longo dos últimos 2 meses', 'dentro do período bimestral anterior', 'no intervalo do último bimestre', 'durante os últimos dois meses', 'nos 60 dias anteriores'],
      period: { months: 2 }
    }
  }
};

// Local reference places for contextual queries
export const LOCAL_REFERENCES = [
  'região amazônica', 'Amazônia legal', 'região nordeste', 'litoral brasileiro',
  'serra do mar', 'pantanal', 'cerrado central', 'mata atlântica',
  'região metropolitana', 'áreas urbanas', 'zona rural', 'regiões de fronteira',
  'bacia do Paraná', 'bacia do São Francisco', 'região costeira', 'áreas de conservação',
  'áreas de proteção ambiental', 'parques nacionais', 'reservas indígenas', 'áreas de risco',
  'zona de interesse', 'área operacional', 'perímetro de segurança', 'corredor ecológico',
  'região semiárida', 'planície costeira', 'planalto central', 'depressão central',
  'região serrana', 'cadeia montanhosa', 'bacia hidrográfica', 'região de várzea'
];

// Formal job titles for contextual queries
export const FORMAL_ROLES = [
  'analista GIS', 'especialista em georreferenciamento', 'técnico em geoprocessamento',
  'cartógrafo', 'engenheiro cartógrafo', 'fotogrametrista', 'analista de sensoriamento remoto',
  'especialista em imagens de satélite', 'técnico em topografia', 'analista ambiental',
  'coordenador de projetos cartográficos', 'gerente de geoprocessamento', 'consultor técnico',
  'analista de geodados', 'especialista em SIG', 'técnico em sistemas cartográficos',
  'pesquisador em geociências', 'analista de geoinformação', 'especialista em mapeamento',
  'engenheiro geógrafo', 'técnico em levantamento de campo'
];

// Project contexts for query generation
export const PROJECT_CONTEXTS = [
  'levantamento ambiental', 'monitoramento de desmatamento', 'gestão territorial',
  'planejamento urbano', 'análise de riscos naturais', 'gestão de recursos hídricos',
  'operações de segurança', 'infraestrutura crítica', 'proteção de fronteiras',
  'monitoramento de queimadas', 'identificação de áreas degradadas', 'gestão de áreas protegidas',
  'atualização de dados cartográficos', 'monitoramento de encostas', 'prevenção de desastres',
  'mapeamento de áreas urbanas', 'cadastro territorial', 'regularização fundiária',
  'inventário florestal', 'mapeamento de infraestrutura', 'análise de uso do solo',
  'estudo de mudanças climáticas', 'avaliação de impactos ambientais', 'conservação da biodiversidade'
];