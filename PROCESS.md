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

## Delays e Timing

### Respostas do Bot
- **Normal**: Bot responde em 12-16 segundos
- **Repetido**: Bot responde em 5-8 segundos

### Indicador de Digitando (Typing Indicator)
1. Usuário manda mensagem → "Visto" aparece
2. Pausa de 2-4 segundos (bot "lendo")
3. Bolinhas de typing aparecem (efeito onda/cobra com fade)
4. 1 segundo com bolinhas → timer da mensagem começa
5. 12-16s (normal) ou 5-8s (repetido) → mensagem aparece

### Animação das Bolinhas
- Efeito onda/cobra: 1ª sobe, 150ms depois 2ª sobe, 150ms depois 3ª sobe
- Pausa de 0.6s entre ciclos
- Fade de opacidade: 1ª 100%, 2ª 75%, 3ª 55%
- Cor: cinza (bg-zinc-400)

### Geração de Cards
- Timer de 3-8 segundos entre cards
- Cards só são gerados quando fluxo é completado e usuário volta pra tela inicial

## Bolinhas nos Cards (MessageInbox)

- **Vermelha**: some ao clicar no card (usa `notif.read`)
- **Verde (online)**: some após 2 minutos em tempo real (atualiza a cada 10s)

## Header do Chat (PrivateChat)

- "Ativo agora": enquanto bolinha verde estiver acesa (até 2 min)
- "Ativo há X min": após 2 minutos, atualiza a cada 30 segundos
- Horário: aparece somente na primeira mensagem

## Fluxo Nubank

1. Splash screen (logo Nu, 2.5s)
2. Tela de seleção (transferir para, valor editável)
3. Tela "Você vai enviar" → botão Enviar
4. **Loading no botão**: círculo branco gira dentro do botão por 2s
5. Tela da senha (4 dígitos)
6. Volta pro review → botão gira de novo por 2s
7. **Processing**: "Transferindo..." → barra de progresso → "Gerando comprovante..." → "Pronto!"
8. **Tela de sucesso**:
   - Símbolo.jpeg (156px, mt-[40px])
   - "Sua transferência foi concluída" (22px)
   - Valor em R$ (32px)
   - "Para [Nome]" (15px)
   - "Instituição" (branco) / nome do banco (cinza, caixa alta)
   - "Quando" (branco) / "Agora" (cinza)
   - X de fechar no canto superior esquerdo
   - Botão "Abrir comprovante" roxo com ícone FileText

## Comprovante (NubankReceipt)

- Fundo branco
- Header com X (fechar) e Share2
- Logo Nu
- "Comprovante de transferência" + data/hora
- Seções: Valor, Tipo, Destino (nome, CPF, instituição, agência, conta), Origem
- Footer cinza com CNPJ, ID da transação, Ouvidoria

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
- Typing indicator: 3 bolinhas com efeito onda/fade
- Header: "Ativo agora" ou "Ativo há X min"

### `src/components/Dashboard.tsx`
- Exibe `R$ [VALOR]` na contribuição

### `src/components/NubankSheet.tsx`
- Fluxo de pagamento Nubank
- Loading no botão Enviar (círculo girando)
- Tela de sucesso com símbolo, valor, detalhes
- Botão "Abrir comprovante" com ícone FileText

### `src/components/NubankReceipt.tsx`
- Comprovante branco com detalhes completos

### `src/components/MessageInbox.tsx`
- Bolinha vermelha: some ao clicar (usa `notif.read`)
- Bolinha verde: some após 2 minutos (atualiza a cada 10s)

### `src/pages/NubankPage.tsx`
- Página acessada pelo celular
- Polling de notificações pendentes

### `src/tiktok-users.json`
- Pool de usuários com `initialMessage` e `justificativa`
- Usuários `repetido: true` para alertas (valor 300)