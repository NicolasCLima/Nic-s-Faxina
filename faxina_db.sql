
CREATE DATABASE IF NOT EXISTS faxina_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE faxina_db;

CREATE TABLE IF NOT EXISTS usuario (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(150)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  senha      VARCHAR(255)  NOT NULL,
  role       VARCHAR(20)   NOT NULL DEFAULT 'operador',
  criado_em  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS cliente (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(150)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  telefone   VARCHAR(20)   NOT NULL,
  endereco   VARCHAR(255)  NOT NULL,
  criado_em  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS profissional (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(150)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  telefone      VARCHAR(20)   NOT NULL,
  especialidade VARCHAR(30)   NOT NULL DEFAULT 'geral',
  disponivel    TINYINT(1)    NOT NULL DEFAULT 1,
  criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS agendamento (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id       INT          NOT NULL,
  profissional_id  INT          NOT NULL,
  tipo_servico     VARCHAR(20)  NOT NULL,          -- residencial | comercial
  data_hora        DATETIME     NOT NULL,
  duracao          INT          NOT NULL,           -- em minutos
  status           VARCHAR(20)  NOT NULL DEFAULT 'agendado',
  observacoes      TEXT,
  criado_em        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_agendamento_cliente      FOREIGN KEY (cliente_id)      REFERENCES cliente(id),
  CONSTRAINT fk_agendamento_profissional FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);


INSERT INTO usuario (nome, email, senha, role) VALUES
  ('Admin',      'admin@faxina.com', '$2a$10$xyzHASHexemplo1', 'admin'),
  ('Operador 1', 'op1@faxina.com',   '$2a$10$xyzHASHexemplo2', 'operador'),
  ('Operador 2', 'op2@faxina.com',   '$2a$10$xyzHASHexemplo3', 'operador');

INSERT INTO cliente (nome, email, telefone, endereco) VALUES
  ('Maria Silva',     'maria@email.com',   '48 99999-0001', 'Rua das Flores, 123 - Florianópolis'),
  ('João Pereira',    'joao@email.com',    '48 99999-0002', 'Av. Beira Mar, 456 - Florianópolis'),
  ('Empresa ABC Ltda','contato@abc.com',   '48 3333-0001',  'Rua Comercial, 789 - São José');


INSERT INTO profissional (nome, email, telefone, especialidade) VALUES
  ('Ana Oliveira', 'ana@faxina.com',    '48 99888-0001', 'residencial'),
  ('Carlos Santos','carlos@faxina.com', '48 99888-0002', 'comercial'),
  ('Rita Costa',   'rita@faxina.com',   '48 99888-0003', 'geral');


INSERT INTO agendamento (cliente_id, profissional_id, tipo_servico, data_hora, duracao, status, observacoes) VALUES
  (1, 1, 'residencial', '2025-05-10 09:00:00', 120, 'agendado',  'Apartamento 3 quartos'),
  (2, 3, 'residencial', '2025-05-11 14:00:00',  90, 'agendado',  'Casa com piscina'),
  (3, 2, 'comercial',   '2025-05-12 08:00:00', 180, 'agendado',  'Escritório 200m²');
