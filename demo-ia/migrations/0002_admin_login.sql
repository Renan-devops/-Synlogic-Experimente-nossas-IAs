-- Painel comercial Synlogic: limita tentativas de login. Não modifica leads existentes.
CREATE TABLE IF NOT EXISTS synlogic_admin_login_attempts (
  chave TEXT PRIMARY KEY,
  tentativas INTEGER NOT NULL DEFAULT 0,
  inicio_janela INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS synlogic_admin_login_attempts_inicio ON synlogic_admin_login_attempts(inicio_janela);
