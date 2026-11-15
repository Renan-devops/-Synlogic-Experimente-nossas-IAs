# Synlogic — Demonstração de IA v2 (teste)

Protótipo independente em `demo-ia/`, na branch `preview/demo-ia-interativa-v2`. **Não modifica o site de produção nem o gestor do Instagram.**

## Pré-requisitos
- Cloudflare Workers com assets estáticos
- Chave OpenAI API (configurada apenas no servidor, nunca no GitHub)
- Proteção contra abuso (rate limiting, Cloudflare Turnstile e teto de gastos) **antes de expor publicamente**

## Publicar (ambiente isolado)
```bash
cd demo-ia
npm install
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

Para testar localmente: `npx wrangler dev` e configurar o secret de forma segura.

A aplicação contém formulário, chat livre usando o modelo OpenAI e simulação de agenda. **Sem secret e deploy do backend, o chat não responde**. A agenda é virtual, existe apenas na sessão do navegador, e não cria horários reais. O formulário ainda não grava leads em banco. Serviços e preços são dados fictícios. Não divulgar como sistema pronto para produção.

**Importante:** não colocar chave em `.dev.vars` no GitHub. Não fazer merge dessa branch na main sem aprovar a experiência.
