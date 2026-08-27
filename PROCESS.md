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
3. Bot agradece
4. FIM

### Fluxo Repetido (valor 300)
1. Bot envia mensagem dizendo que já participou e enviou novamente ("mandei novamente [VALOR]")
2. Usuário responde qualquer coisa
3. Bot implora ("quebra essa pra mim eu imploro")
4. FIM

## Sistema de Valores

- **Faixa Baixa**: R$ 50, R$ 90 (pessoas em dificuldade)
- **Faixa Alta**: R$ 150, R$ 300 (pessoas mais confiantes)
- Pool: `[50,50,50,50, 90,90,90, 150,150, 300]`
- Valor 300 = alerta (repetido)

## Mensagens

### Fluxo Normal

#### Mensagens Iniciais (15 por gênero)
- **Masculino**: "fiz o de [VALOR] ta no nome de [NOME]", etc.
- **Feminino**: "moço fiz o de [VALOR] ta no nome de [NOME]", etc.
- Seleção sequencial (1→15→1), sem repetição até completar

#### Agradecimentos (15 por gênero por faixa)
- **Faixa Baixa Feminino**: "obrigada to precisando muito disso", etc.
- **Faixa Baixa Masculino**: "vlw ja tava desesperado aqui", etc.
- **Faixa Alta Feminino**: "caramba eu tava desconfiada mas chegou mesmo", etc.
- **Faixa Alta Masculino**: "caramba eu tava desconfiado mas chegou mesmo", etc.
- Seleção sequencial sem repetição

### Fluxo Repetido (separado)

#### Mensagens Iniciais (5 por gênero)
- Palavras-chave: novamente, de novo, mais uma vez, outra vez
- Seleção sequencial sem repetição

#### Agradecimentos/Imploração (5 por gênero)
- Cada mensagem é única, sem repetição entre gêneros

## Delays

- **Normal**: Bot responde em 12-16 segundos
- **Repetido**: Bot responde em 5-8 segundos
- **Geração de novos cards**: 3-8 segundos após voltar pra tela inicial com fluxo completado

## Comportamento de Cards

- Novos cards só são gerados quando o fluxo é completado (bot agradece/implora) e o usuário volta pra tela inicial
- Clicar no card e voltar sem interagir não gera novo card
- Ver conversas antigas não gera novo cards
- Timer de 3-8 segundos entre cards

## Bolinhas nos Cards

- **Vermelha**: some ao clicar no card (usando `notif.read`)
- **Verde (online)**: some após 2 minutos em tempo real
- **Header do chat**: "Ativo agora" até 2 minutos, depois "Ativo há X min"
- **Header "Mensagens"**: bolinha verde sempre visível

## Estrutura de Arquivos

### `src/constants.ts`
- `MENSAGENS_INICIAIS`: 30 mensagens (15 masculino + 15 feminino)
- `RESPOSTAS_AGENUARDAR`: 60 agradecimentos (15 × 2 gêneros × 2 faixas)
- `MENSAGENS_REPETIDO_INICIAIS`: 10 mensagens (5 masculino + 5 feminino)
- `RESPOSTAS_REPETIDO_AGRADECIMENTO`: 10 agradecimentos (5 masculino + 5 feminino)
- `BRAZILIAN_BANKS`: lista de bancos

### `src/hooks/useNotificationSystem.ts`
- `getNextEntry()`: seleciona valor (50, 90, 150, 300)
- `getNextUser()`: seleciona usuário do pool
- `inferirGenero()`: determina gênero pelo nome
- `generateNotification()`: gera notificação completa
- Contadores sequenciais separados por gênero e fluxo (normal/repetido)

### `src/components/PrivateChat.tsx`
- **Fluxo Normal**: inicial → agradecimento
- **Fluxo Repetido**: inicial → agradecimento (implorando)
- Delay: normal 12-16s, repetido 5-8s
- Header: "Ativo agora" ou "Ativo há X min" baseado no timestamp

### `src/components/Dashboard.tsx`
- Exibe `R$ [VALOR]` na contribuição

### `src/components/NubankSheet.tsx`
- Fluxo de pagamento Nubank
- Tela de sucesso: "Sua transferência foi concluída", valor, Para [Nome], Instituição, Quando
- Botão "Abrir comprovante" roxo com ícone FileText
- Loading: círculo girando dentro do botão Enviar (2s) → PIN → girando de novo (2s) → Processando... → sucesso

### `src/components/NubankReceipt.tsx`
- Comprovante de transferência branco com detalhes completos
- Logo Nu, dados de origem/destino, ID da transação

### `src/pages/NubankPage.tsx`
- Página acessada pelo celular
- Polling de notificações pendentes

### `src/components/MessageInbox.tsx`
- Bolinha vermelha: some ao clicar (usa `notif.read`)
- Bolinha verde: some após 2 minutos (atualiza a cada 10s)

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
