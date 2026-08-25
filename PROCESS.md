# TikPix Live - Processo de Configuração

## Visão Geral

App de simulação de live no TikTok onde cartões de recompensa são processados via página de pagamento Nubank (acessível de outro celular). Usuários recompensados aparecem na aba Depoimentos.

## Arquitetura

- **Frontend**: React + Vite + TypeScript (hash routing)
- **Backend**: Express + SQLite (`server.js`)
- **Túnel**: ngrok (acesso do celular via 4G/WiFi)
- **Build**: `pnpm build` → `dist/` servido estaticamente

## Fluxo de Notificações

1. Ao carregar a página, a primeira notificação é gerada automaticamente
2. A notificação é POSTada para `/api/notify` (banco SQLite)
3. A main app (PC) mostra o card no Dashboard
4. O celular acessa `/nubank` via ngrok, que redireciona para `/#/nubank`
5. A página Nubank (celular) polla `/api/pending` a cada 3s
6. Quando aparece "NOVA TRANSFERÊNCIA", o usuário clica e faz o fluxo de pagamento
7. Após concluir, a notificação é marcada como processada via `/api/process-by-id/:id`
8. A main app detecta via `/api/status` e mostra animação:
   - **Card normal**: "RECOMPENSA DE X ENVIADA COM SUCESSO!" (verde)
   - **Alerta (repetido)**: "Inscrição cancelada" (amarelo)
9. Após a animação, o próximo card é gerado em 10-15s

## Estrutura de Arquivos

### `src/App.tsx`
- Hash routing (`#/nubank` → `<NubankPage />`)
- Polling `/api/status` a cada 3s para detectar processamento externo
- `handleLiberarRecompensa()`: processa card e agenda próximo em 10-15s
- `handleRessarcir()`: remove card sem recompensa
- Estados: `externalProcessedId` (card normal) e `externalCanceledId` (alerta)

### `src/pages/NubankPage.tsx`
- Polla `/api/pending` a cada 3s
- Mostra "NOVA TRANSFERÊNCIA" com nome completo + chave PIX
- Mostra "FECHAR" para alerta
- Chama `/api/process-by-id/:id` ao clicar

### `src/components/NubankSheet.tsx`
- Fluxo completo Nubank: splash → método → parcelas → revisão → PIN → processando → sucesso
- Restaurado do commit `f97b91e`

### `src/components/NubankReceipt.tsx`
- Tela final de comprovante

### `src/components/Dashboard.tsx`
- Aceita `externalProcessedId` e `externalCanceledId` como props
- Animações: "Recompensa Enviada!" (verde) e "Inscrição cancelada" (amarelo)
- Timer de 2s chama `onLiberarRecompensa` ou `onRessarcir`

### `server.js`
- Express + SQLite (better-sqlite3)
- Rotas:
  - `GET /api/pending` - notificação pendente
  - `POST /api/notify` - criar notificação
  - `POST /api/process/:dbId` - processar por ID do banco
  - `POST /api/process-by-id/:notifId` - processar por ID da notificação
  - `GET /api/status` - verificar se há pendente
  - `GET /nubank` → redireciona `/#/nubank`
- `app.use(express.static('dist'))` + fallback `app.get('*')` serve index.html

### `tikpixlive.bat`
- Build → inicia servidor → inicia ngrok → abre páginas no PC
- Copia URL do ngrok para área de transferência
- Pressione ENTER para parar tudo

### `get-ngrok-url.ps1`
- Polla API local do ngrok (`127.0.0.1:4040`) até 20s
- Retorna URL completa com `/nubank`

## Como Usar

1. Execute `tikpixlive.bat`
2. No PC: abra `http://localhost:3001` (main app)
3. No celular: abra a URL copiada (ex: `https://xxxx.ngrok-free.dev/nubank`)
4. Quando um card aparecer no PC, processe no celular via Nubank
5. A animação aparece no PC e o próximo card é gerado

## ngrok

- Authtoken salvo em `C:\Users\Administrador\AppData\Local\ngrok\ngrok.yml`
- URL muda a cada restart (plano free)
- Console em `http://127.0.0.1:4040`

## Observações

- Hash routing é reativo via evento `hashchange` (sem stale `window.location.hash`)
- PC na rede WiFi: `http://192.168.1.11:3001` (mesma rede)
- Banco SQLite: `nubank.db` (ignorado no git)
