# Captura de leads — ativação no Cloudflare

O código de cadastro e a migração estão no GitHub. **Somente o código NÃO armazena contatos.** Antes do armazenamento real, conecte um D1 exclusivo e execute a migração. NÃO utilize o D1 `instagram-gestor`.

1. Cloudflare Dashboard > Workers & Pages > D1 SQL database > **Create Database**.
2. Nome da base: `synlogic-demo-leads`. Copie o `database_id` (UUID, não é uma chave secreta).
3. No banco criado, abra **Console** e execute o SQL do arquivo `migrations/0001_leads.sql` (cole o conteúdo integral); confirme a criação da tabela `synlogic_leads`.
4. No GitHub, edite **somente** o arquivo `demo-ia/wrangler.toml` na branch `preview/demo-ia-interativa-v2` e acrescente:
   ```toml
   [[d1_databases]]
   binding = "LEADS_DB"
   database_name = "synlogic-demo-leads"
   database_id = "COLE_AQUI_O_DATABASE_ID"
   ```
   Substitua o ID pelo ID real, sem aspas adicionais, e salve. O Cloudflare realizará novo build. Alternativamente informe apenas o UUID da base na conversa para que o arquivo seja atualizado pelo GitHub conectado.
5. Verifique que a implantação `synlogic-demo-ia` está **Ready** na branch correta.
6. Teste com um telefone de teste sob seu controle. No console do D1, execute:
   `SELECT nome,empresa,segmento,whatsapp,consentido_em FROM synlogic_leads ORDER BY criado_em DESC LIMIT 10;`
7. No formulário, quando salvar com sucesso, aparecerá `Dados registrados com segurança para contato comercial`. Se o D1 estiver ausente, o formulário informa claramente que não salvou e permite prosseguir à demo.

## Dados e privacidade
- Campos: nome, empresa, segmento e subtipo, WhatsApp, interesses, dificuldade opcional, consentimento e carimbo de data.
- Não armazena conversas, dados do calendário nem IP no D1.
- Telefone normalizado é chave única: recadastros atualizam o lead em vez de duplicar.
- A base não possui endpoint público de listagem; leitura somente no painel Cloudflare.
- Incluir política de privacidade, canal de exclusão e política de retenção antes de usar o formulário para leads reais. Para teste, apagar contatos inseridos após validar.
- **Antes de campanha pública**, ativar proteção antiabuso (Cloudflare WAF Rate Limiting e Turnstile ou controle equivalente) no endpoint `/api/leads` e no `/api/chat`.
- Não usar uma tabela existente do gestor de Instagram.

### SQL para excluir dados de teste
```sql
DELETE FROM synlogic_leads WHERE whatsapp_normalizado = '55DDDNUMERO';
```

D1 binding no `wrangler.toml` é necessário para que o próximo deploy via Git inclua o banco. Criar apenas o binding manual na interface não é garantia de que a configuração persistirá em novos deploys gerenciados pelo Wrangler.
