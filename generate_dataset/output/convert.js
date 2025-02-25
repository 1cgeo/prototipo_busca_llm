import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtém o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lê o arquivo de origem
const rawData = readFileSync(join(__dirname, 'dataset_2025-02-25T00-41-04-467Z.json'), 'utf8');
const data = JSON.parse(rawData);

// Converte para o formato correto para fine-tuning
const convertedData = data.map(item => ({
  conversations: [
    {
        role: "assistant",
        content: `You must respond in valid JSON matching exactly this schema. All properties must be present and match their type and description requirements:

{
  "type": "object",
  "description": "Extract search parameters accurately, prioritizing explicit mentions over inferred values",
  "properties": {
    "reasoning": {
      "type": "string",
      "description": "Explain how each parameter was extracted, mentioning which text evidence led to each decision. Always explain presence or absence of keyword, state, and sort choices"
    },
    "keyword": {
      "anyOf": [
        { "type": "string" },
        { "type": "null" }
      ],
      "description": "Extract map identifiers in order: MI codes (like 2965-2-NE), INOM codes (like SF-22), or chart names. For chart names, look for complete proper names following \"carta\", \"folha\", \"mapa\" - for example \"carta Vale do Guaporé\" means keyword should be \"Vale do Guaporé\". Chart names often include geographical features or proper nouns"
    },
    "scale": {
      "anyOf": [
        { 
          "type": "string",
          "enum": ["1:1.000", "1:2.000", "1:5.000", "1:10.000", "1:25.000", "1:50.000", "1:100.000", "1:250.000"]
        },
        { "type": "null" }
      ],
      "description": "Match scales exactly (1:1.000 to 1:250.000). For relative terms: \"maior/detalhada\" use 1:1.000, \"média\" use 1:50.000, \"menor/pequena\" use 1:250.000. When comparing scales, more detailed (smaller denominator) always takes precedence"
    },
    "productType": {
      "anyOf": [
        {
          "type": "string",
          "enum": ["MDS", "MDT", "CIRC", "banda P HH", "banda X", "Cartas Temáticas Não SCN"]
        },
        { "type": "null" }
      ],
      "description": "Extract product type with priority: 1) Exact matches of technical terms (MDS, MDT, CIRC). 2) Specific product variations (banda P HH, banda X). 3) General categories. MDS/MDT without RAM suffix implies modelo tridimensional. Temático without type implies Cartas Temáticas Não SCN"
    },
    "state": {
      "anyOf": [
        { "type": "string" },
        { "type": "null" }
      ],
      "description": "Extract state names even when part of prepositions: \"do para\" → \"Pará\", \"de rondonia\" → \"Rondônia\". Always normalize with proper capitals and accents"
    },
    "city": {
      "anyOf": [
        { "type": "string" },
        { "type": "null" }
      ],
      "description": "Extract city names even when part of prepositions: \"em cuiaba\" → \"Cuiabá\". Always normalize with proper capitals and accents"
    },
    "supplyArea": {
      "anyOf": [
        {
          "type": "string",
          "enum": ["1° Centro de Geoinformação", "2° Centro de Geoinformação", "3° Centro de Geoinformação", "4° Centro de Geoinformação", "5° Centro de Geoinformação"]
        },
        { "type": "null" }
      ],
      "description": "Convert cgeo variations to standard format. Must include numeric reference: primeiro/1º/1o → \"1° Centro de Geoinformação\""
    },
    "project": {
      "anyOf": [
        {
          "type": "string",
          "enum": ["NGA-BECA", "Mapeamento de Áreas de Interesse da Força"]
        },
        { "type": "null" }
      ],
      "description": "Match project names exactly. Technical abbreviations (BECA → NGA-BECA) take precedence over partial matches"
    },
    "publicationPeriod": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "start": {
              "type": "string",
              "description": "Data inicial em formato ISO YYYY-MM-DD"
            },
            "end": {
              "type": "string",
              "description": "Data final em formato ISO YYYY-MM-DD"
            }
          },
          "required": ["start", "end"]
        },
        { "type": "null" }
      ],
      "description": "Extract date ranges including relative ones: \"semana passada\" → 7-13 days ago, \"depois de 2020\" → from 2020-01-01 to current date, \"esse ano\" → full current year. Always extract \"semana passada\" even without explicit publication mention"
    },
    "creationPeriod": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "start": {
              "type": "string",
              "description": "Data inicial em formato ISO YYYY-MM-DD"
            },
            "end": {
              "type": "string",
              "description": "Data final em formato ISO YYYY-MM-DD"
            }
          },
          "required": ["start", "end"]
        },
        { "type": "null" }
      ],
      "description": "Use only with explicit creation terms: \"criado\", \"feito\", \"elaborado\", \"produzido\". Calculate dates same as publication period"
    },
    "sortField": {
      "anyOf": [
        {
          "type": "string",
          "enum": ["publicationDate", "creationDate"],
          "default": "publicationDate"
        },
        { "type": "null" }
      ],
      "description": "Use creationDate when text mentions: \"atualização\", \"primeiro mapeamento\", \"mais antigas\" with creation context, \"feito\", \"elaborado\". For ambiguous terms like \"mais antigas\" without context, default to publicationDate"
    },
    "sortDirection": {
      "anyOf": [
        {
          "type": "string",
          "enum": ["ASC", "DESC"],
          "default": "DESC"
        },
        { "type": "null" }
      ],
      "description": "Use ASC for \"mais antigas\", \"primeiro\", \"antigas\". Use DESC for \"recentes\", \"últimas\", \"atuais\""
    },
    "limit": {
      "anyOf": [
        {
          "type": "number",
          "minimum": 1,
          "maximum": 100
        },
        { "type": "null" }
      ],
      "description": "Extract numbers between 1-100 when they refer to quantity of results"
    }
  },
  "required": ["reasoning"]
}

Your response must:
1. Be a single JSON object
2. Include all properties defined in the schema
3. Match all type constraints
4. Follow all description guidelines
5. Use null for optional values that cannot be extracted from the input
6. Include detailed reasoning explaining how each parameter was extracted

Respond with valid JSON only. Do not include any other text or explanation outside the JSON object.`
    },
    {
      role: "user",
      content: item.query
    },
    {
      role: "assistant",
      content: JSON.stringify(item.answer, null, 2)
    }
  ]
}));

// Salva o novo arquivo
writeFileSync(join(__dirname, 'dataset.json'), JSON.stringify(convertedData, null, 2));

console.log('Arquivo dataset.json criado com sucesso!');