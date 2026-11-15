# Synlogic Insight — painel comercial privado

Criado como seção administrativa independente em **`/painel`** dentro do Worker `synlogic-demo-ia`. Não cria outro banco, não toca no Instagram e não muda o formulário de captação existente. A interface lê a tabela `synlogic_leads` do D1 `synlogic-demo-leads`.

## O que mostra

- KPIs reais: leads únicos, novos em 7 e 30 dias e aguardando contato.
- Evolução diária e ranking por segmento, inspirados no padrão de dashboards Power BI.
- Tabela com nome, empresa, setor (inclusive "Outro"), WhatsApp, data do cadastro, interesses, dificuldades, consentimento e status.
- Busca, filtros, paginação, ficha detalhada, edição do status comercial.
- Abrir conversa usando `https://wa.me/<numero_normalizado>` e exportar CSV.
- Dados nunca são embutidos no HTML; a API exige autenticação.

## Ativação obrigatória no Cloudflare

1. Abra **Cloudflare > D1 > synlogic-demo-leads > Console**.
2. Execute o SQL **completo** do arquivo `demo-ia/migrations/0002_admin_login.sql`. Ele cria uma pequena tabela de proteção contra tentativas repetidas de senha. **Não apaga nem altera nenhum lead.**
3. Abra **Workers & Pages > synlogic-demo-ia > Settings > Variables and Secrets**.
4. Adicione dois **Secrets** (tipo secreto, não variável pública):
   - `ADMIN_PASSWORD`: senha nova e exclusiva do painel, **mínimo 16 caracteres**, diferente de qualquer senha sua já usada.
   - `ADMIN_SESSION_SECRET`: sequência aleatória exclusiva, **mínimo 32 caracteres** (por exemplo, gerada pelo gerenciador de senhas). É usada para assinar sessões.
5. Salve os segredos e confirme a implantação **Ready** da branch `preview/demo-ia-interativa-v2`.
6. Clique em **Visit** no Worker e adicione `/painel` ao endereço (ou acesse `/painel.html`). Entre com a senha `ADMIN_PASSWORD`.

**Não envie valores de senha ou segredo pelo chat e não salve no GitHub.**

Se o painel mostrar "Painel indisponível", confirme os nomes e comprimentos dos segredos, além do binding D1 existente `LEADS_DB`. Se o login mostrar erro de migração, confira a execução do arquivo `0002_admin_login.sql`.

## Proteção de dados e boas práticas

- O painel é **administrativo**. Nunca vincule `/painel` em posts públicos.
- Exige sessão de 8 horas, cookie HttpOnly, Secure e SameSite Strict; os endpoints exigem sessão assinada e usam SQL parametrizado.
- Tentativas de senha são limitadas no D1 a 6 a cada 15 minutos por identificador derivado do IP e um segredo; não persiste IP bruto. Para produção, **adicione Cloudflare Access/MFA e regras WAF de rate limiting** para `/api/admin/*` e `/painel*`.
- Rotação de `ADMIN_SESSION_SECRET` invalida sessões já emitidas.
- A exportação CSV requer login e retorna até 10.000 contatos; defina políticas de retenção e proteção dos arquivos exportados.
- Números com formato validado ainda não equivalem a WhatsApp confirmado; para campanhas comerciais futuras, implemente verificação de titularidade.
- A tela não exibe dados fictícios. Com banco vazio, apresenta indicadores zerados.

## Checklist rápido de validação

- [ ] Banco existente com leads na tabela `synlogic_leads`.
- [ ] Migração de login `0002_admin_login.sql` executada.
- [ ] Secrets `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` configurados.
- [ ] Nova implantação Cloudflare concluída.
- [ ] Acesso ao painel negado antes do login e autorizado após senha correta.
- [ ] Nomes, empresas e telefones coincidem com a consulta SQL do D1.
- [ ] Busca, filtro, alteração de status, link WhatsApp e exportação CSV testados.
- [ ] Regras de MFA/Cloudflare Access e rate limiting adicionadas antes de divulgação ampla.
