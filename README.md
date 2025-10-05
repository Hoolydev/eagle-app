# Eagle Vistoria e Inspeção System
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
 You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).
  
This project is connected to the Convex deployment named [`avid-jackal-629`](https://dashboard.convex.dev/d/avid-jackal-629).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## Configuração de Ambiente

Para rodar o projeto, copie o arquivo `.env.example` para `.env.local` e ajuste as variáveis:

- `VITE_CONVEX_URL`: URL do backend Convex
  - Cloud (produção): `https://<seu-deployment>.convex.cloud`
  - Local (desenvolvimento): `http://127.0.0.1:8187`
- `CONVEX_DEPLOYMENT` (opcional): slug do deployment para a CLI do Convex (ex.: `avid-jackal-629`). Não é utilizado pelo frontend.

Observação: arquivos `*.local` estão ignorados pelo Git, então `.env.local` não será commitado.

### Executar em desenvolvimento

- Backend local: `npm run dev` (inicia Vite e `convex dev`)
- Frontend com Cloud: `npm run dev:frontend` e configure `VITE_CONVEX_URL` para o domínio do seu deployment Cloud.

### Vincular/Deploy no Convex Cloud

1. Autenticar: `npx convex login`
2. Configurar projeto/deployment: `npx convex dev --once` (escolha criar ou vincular a um existente)
3. Publicar funções: `npx convex deploy`

Se houver erros de TypeScript ao publicar, corrija-os nos arquivos em `convex/` e tente novamente.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
