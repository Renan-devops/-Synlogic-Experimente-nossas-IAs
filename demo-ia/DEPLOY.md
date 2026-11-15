# Publicar a demonstração IA Synlogic — ambiente de teste

**Branch:** `preview/demo-ia-interativa-v2`  
**Diretório raiz:** `demo-ia`  
**Worker novo:** `synlogic-demo-ia`

Este procedimento cria um Worker totalmente separado. Não altere o projeto `instagram-gestor-ia` nem o site público existente da Synlogic.

## Cloudflare Workers & Pages

1. Abra Cloudflare > Workers & Pages > Create application > Worker.
2. Se houver a opção de importar repositório Git, conecte o GitHub `Renan-devops` e escolha `-Synlogic-Experimente-nossas-IAs`.
3. Selecione a branch `preview/demo-ia-interativa-v2`.
4. Configure **Root directory** como `demo-ia`.
5. Confirme que o Worker criado se chama `synlogic-demo-ia`, não o Worker do Instagram.
6. Deploy command: `npx wrangler deploy`; install command: `npm install`; build command pode ficar vazio. A configuração do Worker está em `demo-ia/wrangler.toml`.
7. No Worker NOVO, adicione **Secret** `OPENAI_API_KEY` com uma chave válida de um projeto com créditos, sem inseri-la em arquivos do GitHub.
8. Proteja a URL temporária contra acesso público irrestrito antes de permitir chamadas pagas à OpenAI (ex.: Cloudflare Access; limite de requisições e orçamento da API).
9. Publique e teste: formulário, campo "Outro segmento", texto livre, consulta de serviços, agendamento virtual, histórico e finalização da conversa.

## Limitações da demonstração

- Os leads ainda **não** são gravados em banco.
- Os agendamentos são somente virtuais e ficam na sessão do navegador.
- Os valores e serviços são exemplos fictícios.
- A página requer a API OpenAI conectada; sem segredo o chat exibe erro.
- O endpoint `/api/chat` usa uma API paga. Não o exponha publicamente sem proteção e orçamento controlado.

## Teste

No Worker, abra a URL `https://synlogic-demo-ia.<sua-conta>.workers.dev` informada pelo painel do Cloudflare. **Não substitua o domínio por um endereço presumido**; use somente a URL realmente exibida após o deploy.

Quando aprovado, podemos configurar persistência dos leads, uma demo adequada ao segmento jurídico e um link no Story 07/07.

## Registro de implantação

- 2026-11-15: nova compilação solicitada após corrigir a branch de produção e o diretório raiz no Worker `synlogic-demo-ia`. A publicação depende do resultado no Cloudflare.
