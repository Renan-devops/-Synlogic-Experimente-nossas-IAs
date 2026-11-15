-- Synlogic Demo: banco exclusivo para leads consentidos. Não usar DB do Instagram.
CREATE TABLE IF NOT EXISTS synlogic_leads (
 id TEXT PRIMARY KEY,
 nome TEXT NOT NULL,
 empresa TEXT NOT NULL,
 segmento TEXT NOT NULL,
 segmento_outro TEXT,
 whatsapp TEXT NOT NULL,
 whatsapp_normalizado TEXT NOT NULL,
 interesses_json TEXT NOT NULL,
 desafio_descrito TEXT,
 consentimento INTEGER NOT NULL DEFAULT 0 CHECK(consentimento = 1),
 consentido_em TEXT NOT NULL,
 criado_em TEXT NOT NULL,
 atualizado_em TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'novo' CHECK(status IN ('novo','contatado','qualificado','encerrado'))
);
CREATE UNIQUE INDEX IF NOT EXISTS synlogic_leads_telefone ON synlogic_leads(whatsapp_normalizado);
CREATE INDEX IF NOT EXISTS synlogic_leads_criado_em ON synlogic_leads(criado_em DESC);
CREATE INDEX IF NOT EXISTS synlogic_leads_status ON synlogic_leads(status);