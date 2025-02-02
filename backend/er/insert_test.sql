-- Limpeza de dados existentes
TRUNCATE TABLE datasets, estados, municipios, areas_suprimento CASCADE;

-- Inserção de estados
INSERT INTO estados (nome, sigla, geometry) VALUES
-- Sul (1° CGEO)
('Rio Grande do Sul', 'RS', ST_GeomFromText('MULTIPOLYGON(((-51.0 -27.0, -50.0 -27.0, -50.0 -26.0, -51.0 -26.0, -51.0 -27.0)))', 4326)),
('Santa Catarina', 'SC', ST_GeomFromText('MULTIPOLYGON(((-51.0 -28.0, -50.0 -28.0, -50.0 -27.0, -51.0 -27.0, -51.0 -28.0)))', 4326)),
('Paraná', 'PR', ST_GeomFromText('MULTIPOLYGON(((-51.0 -26.0, -50.0 -26.0, -50.0 -25.0, -51.0 -25.0, -51.0 -26.0)))', 4326)),

-- Centro-Oeste (2° CGEO)
('Mato Grosso', 'MT', ST_GeomFromText('MULTIPOLYGON(((-56.0 -15.0, -55.0 -15.0, -55.0 -14.0, -56.0 -14.0, -56.0 -15.0)))', 4326)),
('Mato Grosso do Sul', 'MS', ST_GeomFromText('MULTIPOLYGON(((-54.0 -21.0, -53.0 -21.0, -53.0 -20.0, -54.0 -20.0, -54.0 -21.0)))', 4326)),
('Goiás', 'GO', ST_GeomFromText('MULTIPOLYGON(((-50.0 -17.0, -49.0 -17.0, -49.0 -16.0, -50.0 -16.0, -50.0 -17.0)))', 4326)),
('Distrito Federal', 'DF', ST_GeomFromText('MULTIPOLYGON(((-48.0 -16.0, -47.5 -16.0, -47.5 -15.5, -48.0 -15.5, -48.0 -16.0)))', 4326)),

-- Nordeste (3° CGEO)
('Bahia', 'BA', ST_GeomFromText('MULTIPOLYGON(((-41.0 -13.0, -40.0 -13.0, -40.0 -12.0, -41.0 -12.0, -41.0 -13.0)))', 4326)),
('Sergipe', 'SE', ST_GeomFromText('MULTIPOLYGON(((-37.5 -11.0, -36.5 -11.0, -36.5 -10.0, -37.5 -10.0, -37.5 -11.0)))', 4326)),
('Pernambuco', 'PE', ST_GeomFromText('MULTIPOLYGON(((-39.0 -9.0, -38.0 -9.0, -38.0 -8.0, -39.0 -8.0, -39.0 -9.0)))', 4326)),
('Ceará', 'CE', ST_GeomFromText('MULTIPOLYGON(((-40.0 -5.0, -39.0 -5.0, -39.0 -4.0, -40.0 -4.0, -40.0 -5.0)))', 4326)),

-- Sudeste (4° CGEO)
('São Paulo', 'SP', ST_GeomFromText('MULTIPOLYGON(((-47.0 -23.0, -46.0 -23.0, -46.0 -22.0, -47.0 -22.0, -47.0 -23.0)))', 4326)),
('Rio de Janeiro', 'RJ', ST_GeomFromText('MULTIPOLYGON(((-43.0 -23.0, -42.0 -23.0, -42.0 -22.0, -43.0 -22.0, -43.0 -23.0)))', 4326)),
('Minas Gerais', 'MG', ST_GeomFromText('MULTIPOLYGON(((-44.0 -20.0, -43.0 -20.0, -43.0 -19.0, -44.0 -19.0, -44.0 -20.0)))', 4326)),
('Espírito Santo', 'ES', ST_GeomFromText('MULTIPOLYGON(((-41.0 -20.0, -40.0 -20.0, -40.0 -19.0, -41.0 -19.0, -41.0 -20.0)))', 4326)),

-- Norte (5° CGEO)
('Amazonas', 'AM', ST_GeomFromText('MULTIPOLYGON(((-65.0 -5.0, -64.0 -5.0, -64.0 -4.0, -65.0 -4.0, -65.0 -5.0)))', 4326)),
('Pará', 'PA', ST_GeomFromText('MULTIPOLYGON(((-52.0 -5.0, -51.0 -5.0, -51.0 -4.0, -52.0 -4.0, -52.0 -5.0)))', 4326)),
('Rondônia', 'RO', ST_GeomFromText('MULTIPOLYGON(((-63.0 -11.0, -62.0 -11.0, -62.0 -10.0, -63.0 -10.0, -63.0 -11.0)))', 4326)),
('Amapá', 'AP', ST_GeomFromText('MULTIPOLYGON(((-52.0 1.0, -51.0 1.0, -51.0 2.0, -52.0 2.0, -52.0 1.0)))', 4326));

-- Inserção de municípios
INSERT INTO municipios (nome, estado_id, geometry) VALUES
-- Sul (RS)
('Porto Alegre', (SELECT id FROM estados WHERE sigla = 'RS'), 
 ST_GeomFromText('MULTIPOLYGON(((-51.2 -30.1, -51.1 -30.1, -51.1 -30.0, -51.2 -30.0, -51.2 -30.1)))', 4326)),
('Caxias do Sul', (SELECT id FROM estados WHERE sigla = 'RS'),
 ST_GeomFromText('MULTIPOLYGON(((-51.3 -29.2, -51.2 -29.2, -51.2 -29.1, -51.3 -29.1, -51.3 -29.2)))', 4326)),

-- Sudeste (RJ)
('Rio de Janeiro', (SELECT id FROM estados WHERE sigla = 'RJ'),
 ST_GeomFromText('MULTIPOLYGON(((-43.3 -22.9, -43.2 -22.9, -43.2 -22.8, -43.3 -22.8, -43.3 -22.9)))', 4326)),
('Petrópolis', (SELECT id FROM estados WHERE sigla = 'RJ'),
 ST_GeomFromText('MULTIPOLYGON(((-43.2 -22.5, -43.1 -22.5, -43.1 -22.4, -43.2 -22.4, -43.2 -22.5)))', 4326)),

-- Nordeste (BA)
('Salvador', (SELECT id FROM estados WHERE sigla = 'BA'),
 ST_GeomFromText('MULTIPOLYGON(((-38.5 -13.0, -38.4 -13.0, -38.4 -12.9, -38.5 -12.9, -38.5 -13.0)))', 4326)),
('Feira de Santana', (SELECT id FROM estados WHERE sigla = 'BA'),
 ST_GeomFromText('MULTIPOLYGON(((-38.9 -12.3, -38.8 -12.3, -38.8 -12.2, -38.9 -12.2, -38.9 -12.3)))', 4326)),

-- Norte (AM)
('Manaus', (SELECT id FROM estados WHERE sigla = 'AM'),
 ST_GeomFromText('MULTIPOLYGON(((-60.0 -3.1, -59.9 -3.1, -59.9 -3.0, -60.0 -3.0, -60.0 -3.1)))', 4326)),
('Parintins', (SELECT id FROM estados WHERE sigla = 'AM'),
 ST_GeomFromText('MULTIPOLYGON(((-56.8 -2.7, -56.7 -2.7, -56.7 -2.6, -56.8 -2.6, -56.8 -2.7)))', 4326)),

-- Centro-Oeste (MT)
('Cuiabá', (SELECT id FROM estados WHERE sigla = 'MT'),
 ST_GeomFromText('MULTIPOLYGON(((-56.1 -15.6, -56.0 -15.6, -56.0 -15.5, -56.1 -15.5, -56.1 -15.6)))', 4326)),
('Várzea Grande', (SELECT id FROM estados WHERE sigla = 'MT'),
 ST_GeomFromText('MULTIPOLYGON(((-56.2 -15.7, -56.1 -15.7, -56.1 -15.6, -56.2 -15.6, -56.2 -15.7)))', 4326));

-- Inserção de áreas de suprimento
INSERT INTO areas_suprimento (nome, sigla, geometry) VALUES
('1° Centro de Geoinformação', '1° CGEO',
 ST_GeomFromText('MULTIPOLYGON(((-57.0 -34.0, -48.0 -34.0, -48.0 -22.0, -57.0 -22.0, -57.0 -34.0)))', 4326)),

('2° Centro de Geoinformação', '2° CGEO',
 ST_GeomFromText('MULTIPOLYGON(((-61.0 -24.0, -50.0 -24.0, -50.0 -7.0, -61.0 -7.0, -61.0 -24.0)))', 4326)),

('3° Centro de Geoinformação', '3° CGEO',
 ST_GeomFromText('MULTIPOLYGON(((-47.0 -18.0, -34.0 -18.0, -34.0 -1.0, -47.0 -1.0, -47.0 -18.0)))', 4326)),

('4° Centro de Geoinformação', '4° CGEO',
 ST_GeomFromText('MULTIPOLYGON(((-53.0 -25.0, -39.0 -25.0, -39.0 -14.0, -53.0 -14.0, -53.0 -25.0)))', 4326)),

('5° Centro de Geoinformação', '5° CGEO',
 ST_GeomFromText('MULTIPOLYGON(((-74.0 5.0, -50.0 5.0, -50.0 -8.0, -74.0 -8.0, -74.0 5.0)))', 4326));

-- Inserção de datasets de teste
INSERT INTO datasets (
    nome,
    descricao,
    escala,
    tipo_produto,
    projeto,
    data_publicacao,
    data_criacao,
    geometry
) VALUES
-- Cartas Topográficas Rio de Janeiro
(
    'Petrópolis',
    'Carta topográfica da região de Petrópolis e arredores, incluindo áreas de preservação ambiental e principais vias de acesso.',
    '1:25.000',
    'Carta Topográfica',
    'Mapeamento Sistemático',
    '2023-12-15',
    '2023-10-01',
    ST_GeomFromText('POLYGON((-43.2 -22.5, -43.1 -22.5, -43.1 -22.4, -43.2 -22.4, -43.2 -22.5))', 4326)
),
(
    'Teresópolis',
    'Carta topográfica detalhada da região de Teresópolis, abrangendo o Parque Nacional da Serra dos Órgãos.',
    '1:25.000',
    'Carta Topográfica',
    'Mapeamento Sistemático',
    '2023-12-15',
    '2023-10-05',
    ST_GeomFromText('POLYGON((-43.0 -22.4, -42.9 -22.4, -42.9 -22.3, -43.0 -22.3, -43.0 -22.4))', 4326)
),

-- Cartas Ortoimagem São Paulo
(
    'São Paulo - Zona Leste',
    'Ortoimagem da região leste de São Paulo, incluindo importantes áreas industriais e residenciais.',
    '1:25.000',
    'Carta Ortoimagem',
    'Copa do Mundo 2014',
    '2014-05-20',
    '2014-03-15',
    ST_GeomFromText('POLYGON((-46.6 -23.6, -46.5 -23.6, -46.5 -23.5, -46.6 -23.5, -46.6 -23.6))', 4326)
),
(
    'São Paulo - Centro',
    'Ortoimagem da região central de São Paulo, cobrindo principais pontos turísticos e estádios.',
    '1:25.000',
    'Carta Ortoimagem',
    'Copa do Mundo 2014',
    '2014-05-20',
    '2014-03-20',
    ST_GeomFromText('POLYGON((-46.7 -23.6, -46.6 -23.6, -46.6 -23.5, -46.7 -23.5, -46.7 -23.6))', 4326)
),

-- Cartas Temáticas Bahia
(
    'Salvador - Região Metropolitana',
    'Carta temática da região metropolitana de Salvador focando em aspectos socioeconômicos.',
    '1:50.000',
    'Carta Temática',
    'Bahia',
    '2023-08-10',
    '2023-06-01',
    ST_GeomFromText('POLYGON((-38.5 -13.0, -38.4 -13.0, -38.4 -12.9, -38.5 -12.9, -38.5 -13.0))', 4326)
),
(
    'Salvador - Orla',
    'Carta temática da orla de Salvador destacando pontos turísticos e áreas de preservação.',
    '1:50.000',
    'Carta Temática',
    'Bahia',
    '2023-08-10',
    '2023-06-05',
    ST_GeomFromText('POLYGON((-38.6 -13.0, -38.5 -13.0, -38.5 -12.9, -38.6 -12.9, -38.6 -13.0))', 4326)
),

-- Cartas Projeto BECA
(
    'Amazônia Central - Setor 1',
    'Mapeamento detalhado da região central da Amazônia para o projeto BECA.',
    '1:100.000',
    'Carta Topográfica',
    'BECA',
    '2024-01-15',
    '2023-11-20',
    ST_GeomFromText('POLYGON((-61.0 -3.0, -60.9 -3.0, -60.9 -2.9, -61.0 -2.9, -61.0 -3.0))', 4326)
),
(
    'Amazônia Central - Setor 2',
    'Continuação do mapeamento da região central da Amazônia, focando em áreas de preservação.',
    '1:100.000',
    'Carta Topográfica',
    'BECA',
    '2024-01-15',
    '2023-11-25',
    ST_GeomFromText('POLYGON((-61.1 -3.0, -61.0 -3.0, -61.0 -2.9, -61.1 -2.9, -61.1 -3.0))', 4326)
),

-- Cartas Rio Grande do Sul
(
    'Porto Alegre - Zona Sul',
    'Carta topográfica detalhada da zona sul de Porto Alegre.',
    '1:25.000',
    'Carta Topográfica',
    'Rio Grande do Sul',
    '2023-06-20',
    '2023-04-15',
    ST_GeomFromText('POLYGON((-51.2 -30.1, -51.1 -30.1, -51.1 -30.0, -51.2 -30.0, -51.2 -30.1))', 4326)
),
(
    'Porto Alegre - Centro',
    'Carta topográfica da região central de Porto Alegre.',
    '1:25.000',
    'Carta Topográfica',
    'Rio Grande do Sul',
    '2023-06-20',
    '2023-04-20',
    ST_GeomFromText('POLYGON((-51.3 -30.1, -51.2 -30.1, -51.2 -30.0, -51.3 -30.0, -51.3 -30.1))', 4326)
),

-- Cartas Olimpíadas
(
    'Rio de Janeiro - Barra da Tijuca',
    'Carta ortoimagem da região da Barra da Tijuca, focando instalações olímpicas.',
    '1:25.000',
    'Carta Ortoimagem',
    'Olimpíadas',
    '2016-06-15',
    '2016-04-10',
    ST_GeomFromText('POLYGON((-43.4 -23.0, -43.3 -23.0, -43.3 -22.9, -43.4 -22.9, -43.4 -23.0))', 4326)
),
(
    'Rio de Janeiro - Deodoro',
    'Carta ortoimagem do complexo de Deodoro e arredores.',
    '1:25.000',
    'Carta Ortoimagem',
    'Olimpíadas',
    '2016-06-15',
    '2016-04-15',
    ST_GeomFromText('POLYGON((-43.5 -23.0, -43.4 -23.0, -43.4 -22.9, -43.5 -22.9, -43.5 -23.0))', 4326)
),

-- Cartas Rondônia
(
    'Porto Velho - Área Urbana',
    'Mapeamento da área urbana de Porto Velho e entorno.',
    '1:50.000',
    'Carta Topográfica',
    'Rondônia',
    '2024-01-10',
    '2023-11-05',
    ST_GeomFromText('POLYGON((-63.9 -8.8, -63.8 -8.8, -63.8 -8.7, -63.9 -8.7, -63.9 -8.8))', 4326)
),
(
    'Porto Velho - Zona Rural',
    'Mapeamento da zona rural de Porto Velho, incluindo áreas de interesse ambiental.',
    '1:50.000',
    'Carta Topográfica',
    'Rondônia',
    '2024-01-10',
    '2023-11-10',
    ST_GeomFromText('POLYGON((-64.0 -8.8, -63.9 -8.8, -63.9 -8.7, -64.0 -8.7, -64.0 -8.8))', 4326)
),

-- Cartas Copa das Confederações
(
    'Fortaleza - Arena Castelão',
    'Carta ortoimagem da região do Castelão e entorno.',
    '1:25.000',
    'Carta Ortoimagem',
    'Copa das Confederações 2013',
    '2013-05-20',
    '2013-03-15',
    ST_GeomFromText('POLYGON((-38.6 -3.8, -38.5 -3.8, -38.5 -3.7, -38.6 -3.7, -38.6 -3.8))', 4326)
),
(
    'Recife - Arena Pernambuco',
    'Carta ortoimagem da região da Arena Pernambuco e vias de acesso.',
    '1:25.000',
    'Carta Ortoimagem',
    'Copa das Confederações 2013',
    '2013-05-20',
    '2013-03-20',
    ST_GeomFromText('POLYGON((-35.1 -8.1, -35.0 -8.1, -35.0 -8.0, -35.1 -8.0, -35.1 -8.1))', 4326)
),

-- Cartas Amapá
(
    'Macapá - Área Central',
    'Mapeamento detalhado da área central de Macapá.',
    '1:25.000',
    'Carta Topográfica',
    'Amapá',
    '2023-11-15',
    '2023-09-10',
    ST_GeomFromText('POLYGON((-51.1 0.1, -51.0 0.1, -51.0 0.2, -51.1 0.2, -51.1 0.1))', 4326)
),
(
    'Macapá - Zona Norte',
    'Mapeamento da zona norte de Macapá e áreas de expansão urbana.',
    '1:25.000',
    'Carta Topográfica',
    'Amapá',
    '2023-11-15',
    '2023-09-15',
    ST_GeomFromText('POLYGON((-51.2 0.1, -51.1 0.1, -51.1 0.2, -51.2 0.2, -51.2 0.1))', 4326)
);

-- Criação de índices adicionais para otimização de busca
CREATE INDEX idx_datasets_data_pub_proj ON datasets(data_publicacao, projeto);
CREATE INDEX idx_datasets_escala_tipo ON datasets(escala, tipo_produto);