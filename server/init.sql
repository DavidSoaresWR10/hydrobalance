-- ══════════════════════════════════════════════════════════════
-- HydroBalance Pro — Schema PostgreSQL (UUID)
-- Execute: psql -U postgres -d hydrobalance -f init.sql
-- ══════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS balanco CASCADE;
DROP TABLE IF EXISTS operacoes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          VARCHAR(200) NOT NULL,
  email         VARCHAR(200) UNIQUE NOT NULL,
  senha_hash    VARCHAR(255) NOT NULL,
  empresa       VARCHAR(200),
  cargo         VARCHAR(100),
  ativo         BOOLEAN DEFAULT TRUE,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email, senha_hash, empresa, cargo)
VALUES ('Admin Dev', 'admin@hydrobalance.dev', 'placeholder_hash', 'HydroBalance', 'Administrador');

CREATE TABLE operacoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome            VARCHAR(200),
  empresa         VARCHAR(200),
  ano             INTEGER,
  uf              VARCHAR(5),
  bacia           VARCHAR(200),
  tipo_minerio    VARCHAR(100),
  clima           VARCHAR(50),
  estresse_hidrico VARCHAR(50),
  metodo_lavra    VARCHAR(50),
  corpo_captacao  VARCHAR(200),
  corpo_lancamento VARCHAR(200),
  cbh             VARCHAR(200),
  responsavel     VARCHAR(200),
  criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_operacoes_usuario ON operacoes(usuario_id);

CREATE TABLE balanco (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operacao_id   UUID UNIQUE NOT NULL REFERENCES operacoes(id) ON DELETE CASCADE,
  c_sup_a       NUMERIC(12,3) DEFAULT 0,
  c_sup_b       NUMERIC(12,3) DEFAULT 0,
  c_sub_a       NUMERIC(12,3) DEFAULT 0,
  c_sub_b       NUMERIC(12,3) DEFAULT 0,
  c_mar_a       NUMERIC(12,3) DEFAULT 0,
  c_mar_b       NUMERIC(12,3) DEFAULT 0,
  c_ter_a       NUMERIC(12,3) DEFAULT 0,
  c_ter_b       NUMERIC(12,3) DEFAULT 0,
  c_rom         NUMERIC(12,3) DEFAULT 0,
  oag_dew_a     NUMERIC(12,3) DEFAULT 0,
  oag_dew_b     NUMERIC(12,3) DEFAULT 0,
  oag_div_a     NUMERIC(12,3) DEFAULT 0,
  oag_div_b     NUMERIC(12,3) DEFAULT 0,
  prec_a        NUMERIC(12,3) DEFAULT 0,
  prec_b        NUMERIC(12,3) DEFAULT 0,
  prec_fonte    VARCHAR(200),
  prec_mm       NUMERIC(10,1) DEFAULT 0,
  d_sup_a       NUMERIC(12,3) DEFAULT 0,
  d_sup_b       NUMERIC(12,3) DEFAULT 0,
  d_sub_a       NUMERIC(12,3) DEFAULT 0,
  d_sub_b       NUMERIC(12,3) DEFAULT 0,
  d_ter_a       NUMERIC(12,3) DEFAULT 0,
  d_ter_b       NUMERIC(12,3) DEFAULT 0,
  d_sup_nome    VARCHAR(200),
  ds            NUMERIC(12,3) DEFAULT 0,
  rec           NUMERIC(12,3) DEFAULT 0,
  con_ev        NUMERIC(12,3) DEFAULT 0,
  con_prod      NUMERIC(12,3) DEFAULT 0,
  con_rej       NUMERIC(12,3) DEFAULT 0,
  tec1          NUMERIC(12,3) DEFAULT 0,
  tec2          NUMERIC(12,3) DEFAULT 0,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_balanco_operacao ON balanco(operacao_id);