# TikPix Live - Processo de Configuração

## Visão Geral

App de simulação de live no TikTok onde participantes enviam contribuições via PIX e recebem recompensas. O sistema simula conversas reais entre bots e o operador.

## Arquitetura

- **Frontend**: React + Vite + TypeScript (hash routing)
- **Backend**: Express + SQLite (`server.js`)
- **Build**: `pnpm build` → `dist/` servido estaticamente

## Fluxo de Conversa (Simplificado)

1. Bot envia mensagem inicial ("fiz o de [VALOR] ta no nome de [NOME]")
2. Usuário responde qualquer coisa
3. Bot agradece (resposta final)

## Sistema de Valores

- **Faixa Baixa**: R$ 50, R$ 90 (pessoas em dificuldade)
- **Faixa Alta**: R$ 150, R$ 300 (pessoas mais confiantes)
- Pool: `[50,50,50,50, 90,90,90, 150,150, 300]`
- Valor 300 = alerta (repetido)

## Mensagens por Gênero

### Mensagens Iniciais (15 por gênero)
- **Masculino**: "fiz o de [VALOR] ta no nome de [NOME]", etc.
- **Feminino**: "moço fiz o de [VALOR] ta no nome de [NOME]", etc.
- Seleção sequencial (1→15→1), sem repetição até completar

### Respostas de Espera (20 por gênero)
- Usadas quando usuário responde pela primeira vez
- Diferenciadas por gênero

### Agradecimentos (15 por gênero por faixa)
- **Faixa Baixa Feminino**: "obrigada to precisando muito disso", etc.
- **Faixa Baixa Masculino**: "vlw ja tava desesperado aqui", etc.
- **Faixa Alta Feminino**: "caramba eu tava desconfiada mas chegou mesmo", etc.
- **Faixa Alta Masculino**: "caramba eu tava desconfiado mas chegou mesmo", etc.
- Seleção sequencial sem repetição

## Estrutura de Arquivos

### `src/constants.ts`
- `MENSAGENS_INICIAIS`: 30 mensagens (15 masculino + 15 feminino)
- `RESPOSTAS_ESPERA`: 40 respostas (20 masculino + 20 feminino)
- `RESPOSTAS_AGENUARDAR`: 60 agradecimentos (15 × 2 gêneros × 2 faixas)
- `CONFIRMACOES`: respostas de confirmação
- `BRAZILIAN_BANKS`: lista de bancos

### `src/hooks/useNotificationSystem.ts`
- `getNextEntry()`: seleciona valor (50, 90, 150, 300)
- `getNextUser()`: seleciona usuário do pool
- `inferirGenero()`: determina gênero pelo nome
- `generateNotification()`: gera notificação completa
- Contadores sequenciais por gênero para mensagens

### `src/components/PrivateChat.tsx`
- Fluxo: inicial → espera → agradecimento
- Filtra respostas por gênero e faixa de valor

### `src/components/Dashboard.tsx`
- Exibe `R$ [VALOR]` na contribuição

### `src/components/NubankSheet.tsx`
- Fluxo de pagamento Nubank
- Edição de valor

### `src/components/NubankReceipt.tsx`
- Comprovante de transferência

### `src/pages/NubankPage.tsx`
- Página acessada pelo celular
- Polling de notificações pendentes

### `src/tiktok-users.json`
- Pool de usuários com `initialMessage` e `justificativa`
- Usuários `repetido: true` para alertas

### `server.js`
- Express + SQLite
- Rotas: `/api/pending`, `/api/notify`, `/api/process/:dbId`, `/api/status`

## Como Usar

1. Execute `npm run dev:server` (backend na porta 3001)
2. Execute `npm run dev` (frontend na porta 3000)
3. No PC: abra `http://localhost:3000`
4. No celular: abra `http://localhost:3000/#/nubank`
5. Duplo clique no cabeçalho para gerar novos cards

## Comportamento

- Notificações não aparecem automaticamente
- Duplo clique no cabeçalho gera novo card
- Timer aleatório de 5-10 segundos entre cards
- Cards são sequenciais sem repetição
