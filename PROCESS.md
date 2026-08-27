# TikPix Live - Processo de Configuração

## Visão Geral

App de simulação de live no TikTok onde participantes enviam contribuições via PIX e recebem recompensas. O sistema simula conversas reais entre bots e o operador.

## Arquitetura

- **Frontend**: React + Vite + TypeScript (hash routing)
- **Backend**: Express + SQLite (`server.js`)
- **Build**: `pnpm build` → `dist/` servido estaticamente

## Fluxos de Conversa

### Fluxo Normal (valores 50, 90, 150)
1. Bot envia mensagem inicial ("fiz o de [VALOR] ta no nome de [NOME]")
2. Usuário responde qualquer coisa
3. Bot responde "ok to esperando"
4. Usuário responde de novo
5. Bot agradece

### Fluxo Repetido (valor 300)
1. Bot envia mensagem dizendo que já participou ("mandei novamente [VALOR]")
2. Usuário responde qualquer coisa
3. Bot implora ("quebra essa pra mim eu imploro")
4. FIM

## Sistema de Valores

- **Faixa Baixa**: R$ 50, R$ 90 (pessoas em dificuldade)
- **Faixa Alta**: R$ 150, R$ 300 (pessoas mais confiantes)
- Pool: `[50,50,50,50, 90,90,90, 150,150, 300]`
- Valor 300 = alerta (repetido)

## Mensagens por Gênero

### Fluxo Normal

#### Mensagens Iniciais (15 por gênero)
- **Masculino**: "fiz o de [VALOR] ta no nome de [NOME]", etc.
- **Feminino**: "moço fiz o de [VALOR] ta no nome de [NOME]", etc.
- Seleção sequencial (1→15→1), sem repetição até completar

#### Respostas de Espera (20 por gênero)
- Usadas quando usuário responde pela primeira vez
- Diferenciadas por gênero

#### Agradecimentos (15 por gênero por faixa)
- **Faixa Baixa Feminino**: "obrigada to precisando muito disso", etc.
- **Faixa Baixa Masculino**: "vlw ja tava desesperado aqui", etc.
- **Faixa Alta Feminino**: "caramba eu tava desconfiada mas chegou mesmo", etc.
- **Faixa Alta Masculino**: "caramba eu tava desconfiado mas chegou mesmo", etc.
- Seleção sequencial sem repetição

### Fluxo Repetido (separado)

#### Mensagens Iniciais (5 por gênero)
- **Feminino**: "moço eu ja participei antes mas mandei novamente [VALOR]..."
- **Masculino**: "cara eu ja participei antes mas mandei novamente [VALOR]..."
- Palavras-chave: novamente, de novo, mais uma vez, outra vez

#### Agradecimentos/Imploração (5 por gênero)
- **Feminino**: "poxa que pena quebra essa pra mim eu imploro", etc.
- **Masculino**: "cara quebra essa pra mim eu to desesperado", etc.
- Cada mensagem é única, sem repetição entre gêneros

## Estrutura de Arquivos

### `src/constants.ts`
- `MENSAGENS_INICIAIS`: 30 mensagens (15 masculino + 15 feminino)
- `RESPOSTAS_ESPERA`: 40 respostas (20 masculino + 20 feminino)
- `RESPOSTAS_AGENUARDAR`: 60 agradecimentos (15 × 2 gêneros × 2 faixas)
- `MENSAGENS_REPETIDO_INICIAIS`: 10 mensagens (5 masculino + 5 feminino)
- `RESPOSTAS_REPETIDO_ESPERA`: 10 respostas (5 masculino + 5 feminino) - não utilizada
- `RESPOSTAS_REPETIDO_AGRADECIMENTO`: 10 agradecimentos (5 masculino + 5 feminino)
- `CONFIRMACOES`: respostas de confirmação
- `BRAZILIAN_BANKS`: lista de bancos

### `src/hooks/useNotificationSystem.ts`
- `getNextEntry()`: seleciona valor (50, 90, 150, 300)
- `getNextUser()`: seleciona usuário do pool
- `inferirGenero()`: determina gênero pelo nome
- `generateNotification()`: gera notificação completa
- Contadores sequenciais separados por gênero e fluxo (normal/repetido)

### `src/components/PrivateChat.tsx`
- **Fluxo Normal**: inicial → espera → agradecimento
- **Fluxo Repetido**: inicial → agradecimento (implorando)
- Filtra respostas por gênero e faixa de valor
- Usa `RESPOSTAS_REPETIDO_AGRADECIMENTO` para repetidos

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
- Usuários `repetido: true` para alertas (valor 300)

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
- Fluxo repetido é completamente separado do normal
