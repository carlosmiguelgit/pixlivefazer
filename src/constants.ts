export const BRAZILIAN_BANKS = [
  'NUBANK', 'BANCO DO BRASIL S.A.', 'BANCO BRADESCO S.A.', 'ITAÚ UNIBANCO S.A.', 'CAIXA ECONÔMICA FEDERAL',
  'BANCO SANTANDER (BRASIL) S.A.', 'BANCO INTER S.A.', 'BANCO C6 S.A.', 'MERCADO PAGO LTDA', 'PICPAY SERVIÇOS S.A.'
];

export const MENSAGENS_INICIAIS: { texto: string; genero: 'female' | 'male' }[] = [
  // Masculino - padrão equalizado para todos os valores
  { texto: "fiz o de [VALOR] ta no nome de [NOME]", genero: 'male' },
  { texto: "mandei [VALOR] agora ta no nome de [NOME]", genero: 'male' },
  { texto: "pronto fiz [VALOR] no nome de [NOME]", genero: 'male' },
  { texto: "ja mandei [VALOR] ta no nome do [NOME]", genero: 'male' },
  { texto: "fiz o de [VALOR] confere no nome de [NOME]", genero: 'male' },
  { texto: "ta feito [VALOR] no nome de [NOME]", genero: 'male' },
  { texto: "mandei [VALOR] pode ver no nome de [NOME]", genero: 'male' },
  { texto: "opa fiz [VALOR] ta no nome de [NOME]", genero: 'male' },
  { texto: "ja ta la [VALOR] no nome de [NOME]", genero: 'male' },
  { texto: "transferi [VALOR] ta no nome de [NOME]", genero: 'male' },
  { texto: "mandei [VALOR] no pix confere la", genero: 'male' },
  { texto: "feito [VALOR] no nome de [NOME]", genero: 'male' },
  { texto: "ja ta la o [VALOR] no nome de [NOME]", genero: 'male' },
  { texto: "enviei [VALOR] no nome de [NOME]", genero: 'male' },
  { texto: "fiz o pix de [VALOR] ta no nome de [NOME]", genero: 'male' },
  // Feminino - padrão equalizado para todos os valores
  { texto: "moço fiz o de [VALOR] ta no nome de [NOME]", genero: 'female' },
  { texto: "oi mandei [VALOR] no nome de [NOME] pode olhar", genero: 'female' },
  { texto: "fiz o pix de [VALOR] ta no nome de [NOME] 🙏", genero: 'female' },
  { texto: "acabei de mandar [VALOR] no nome de [NOME]", genero: 'female' },
  { texto: "enviei [VALOR] agora no nome de [NOME]", genero: 'female' },
  { texto: "moço mandei [VALOR] no nome de [NOME]", genero: 'female' },
  { texto: "ta feito [VALOR] no nome de [NOME] 😊", genero: 'female' },
  { texto: "ja foi [VALOR] no nome de [NOME]", genero: 'female' },
  { texto: "prontinho fiz [VALOR] no nome de [NOME]", genero: 'female' },
  { texto: "mandei [VALOR] rapidinho ta no nome de [NOME]", genero: 'female' },
  { texto: "moço ja ta la [VALOR] no nome de [NOME]", genero: 'female' },
  { texto: "mandei [VALOR] no pix pode conferir", genero: 'female' },
  { texto: "feito [VALOR] no nome de [NOME] 😊", genero: 'female' },
  { texto: "enviei [VALOR] ta no nome de [NOME]", genero: 'female' },
  { texto: "fiz o [VALOR] e ta no nome de [NOME]", genero: 'female' },
];

export const RESPOSTAS_AGENUARDAR: { texto: string; faixa: 'baixa' | 'alta'; genero: 'female' | 'male' }[] = [
  // Faixa baixa (50/90) Feminino
  { texto: "obrigada to precisando muito disso", faixa: 'baixa', genero: 'female' },
  { texto: "meu deus obrigada ia ficar sem nada", faixa: 'baixa', genero: 'female' },
  { texto: "obrigada de verdade salvou minha vida", faixa: 'baixa', genero: 'female' },
  { texto: "tava precisando tanto obrigada", faixa: 'baixa', genero: 'female' },
  { texto: "to chorando de tanta gratidao", faixa: 'baixa', genero: 'female' },
  { texto: "obrigadao Deus te pague", faixa: 'baixa', genero: 'female' },
  { texto: "salvou minha semana obrigada", faixa: 'baixa', genero: 'female' },
  { texto: "voce nao imagina o quanto obrigada", faixa: 'baixa', genero: 'female' },
  { texto: "meu deus do ceu obrigada", faixa: 'baixa', genero: 'female' },
  { texto: "to sem palavras de tanta gratidao", faixa: 'baixa', genero: 'female' },
  { texto: "nunca imaginei que isso funcionava", faixa: 'baixa', genero: 'female' },
  { texto: "to tremendo aqui obrigada", faixa: 'baixa', genero: 'female' },
  { texto: "isso e uma bencao na minha vida", faixa: 'baixa', genero: 'female' },
  { texto: "obrigada por acreditar em mim", faixa: 'baixa', genero: 'female' },
  { texto: "vai ajudar muito minha familia", faixa: 'baixa', genero: 'female' },
  // Faixa baixa (50/90) Masculino
  { texto: "vlw ja tava desesperado aqui", faixa: 'baixa', genero: 'male' },
  { texto: "caramba obrigado demais", faixa: 'baixa', genero: 'male' },
  { texto: "n acredito que chegou mesmo", faixa: 'baixa', genero: 'male' },
  { texto: "era oq eu precisava vlw", faixa: 'baixa', genero: 'male' },
  { texto: "tava sem esperança nenhuma", faixa: 'baixa', genero: 'male' },
  { texto: "voce e um anjo mesmo", faixa: 'baixa', genero: 'male' },
  { texto: "obrigado de coracao", faixa: 'baixa', genero: 'male' },
  { texto: "chegou certinho vlw", faixa: 'baixa', genero: 'male' },
  { texto: "isso e vida pra mim", faixa: 'baixa', genero: 'male' },
  { texto: "meu irmao muito obrigado", faixa: 'baixa', genero: 'male' },
  { texto: "chegou na hora certa", faixa: 'baixa', genero: 'male' },
  { texto: "salvou meu dia", faixa: 'baixa', genero: 'male' },
  { texto: "obrigado pela confiança", faixa: 'baixa', genero: 'male' },
  { texto: "isso vai pagar minhas contas", faixa: 'baixa', genero: 'male' },
  { texto: "obrigado msm tava fudido", faixa: 'baixa', genero: 'male' },
  // Faixa alta (150/300) Feminino
  { texto: "caramba eu tava desconfiada mas chegou mesmo", faixa: 'alta', genero: 'female' },
  { texto: "n acreditei quando vi na tela obrigada de verdade", faixa: 'alta', genero: 'female' },
  { texto: "ja tinha caido em golpe antes achei que era mais um", faixa: 'alta', genero: 'female' },
  { texto: "meu deus funcionou mesmo to chocada", faixa: 'alta', genero: 'female' },
  { texto: "pensei que era furada mas chegou certinho", faixa: 'alta', genero: 'female' },
  { texto: "to tremendo aqui achei que ia perder mais dinheiro", faixa: 'alta', genero: 'female' },
  { texto: "ja tinha desistido de acreditar nesse tipo de coisa", faixa: 'alta', genero: 'female' },
  { texto: "chegou mesmo to chocada", faixa: 'alta', genero: 'female' },
  { texto: "obrigada de coracao ja tinha levado golpe antes", faixa: 'alta', genero: 'female' },
  { texto: "não esperava nada e chegou", faixa: 'alta', genero: 'female' },
  { texto: "pensei que era mais um golpe mas funcionou", faixa: 'alta', genero: 'female' },
  { texto: "to sem acreditar chegou mesmo", faixa: 'alta', genero: 'female' },
  { texto: "obrigada demais ja tinha perdido a esperança", faixa: 'alta', genero: 'female' },
  { texto: "chegou certinho obrigada", faixa: 'alta', genero: 'female' },
  { texto: "isso e um milagre obrigada", faixa: 'alta', genero: 'female' },
  // Faixa alta (150/300) Masculino
  { texto: "caramba eu tava desconfiado mas chegou mesmo", faixa: 'alta', genero: 'male' },
  { texto: "n acreditei quando vi na tela obrigado de verdade", faixa: 'alta', genero: 'male' },
  { texto: "ja levei golpe antes achei que era mais um", faixa: 'alta', genero: 'male' },
  { texto: "meu deus funcionou mesmo to chocado", faixa: 'alta', genero: 'male' },
  { texto: "achava que era enganação mas chegou certinho", faixa: 'alta', genero: 'male' },
  { texto: "to tremendo achei que ia perder mais dinheiro", faixa: 'alta', genero: 'male' },
  { texto: "ja tinha largado de mão mas chegou", faixa: 'alta', genero: 'male' },
  { texto: "caramba chegou mesmo to chocado", faixa: 'alta', genero: 'male' },
  { texto: "obrigado de coracao ja tinha levado golpe antes", faixa: 'alta', genero: 'male' },
  { texto: "não esperava mais nada e chegou", faixa: 'alta', genero: 'male' },
  { texto: "achei que era cilada mas funcionou", faixa: 'alta', genero: 'male' },
  { texto: "to incrédulo chegou mesmo", faixa: 'alta', genero: 'male' },
  { texto: "obrigado demais ja tinha perdido as esperanças", faixa: 'alta', genero: 'male' },
  { texto: "chegou certinho obrigado", faixa: 'alta', genero: 'male' },
  { texto: "isso e um milagre obrigado", faixa: 'alta', genero: 'male' },
];

// ============ REPETIDO - FLUXO SEPARADO ============

// Mensagens iniciais do repetido (5 por gênero) - avisando que já participou e enviou novamente
export const MENSAGENS_REPETIDO_INICIAIS: { texto: string; genero: 'female' | 'male' }[] = [
  // Feminino
  { texto: "moço eu ja participei antes mas mandei novamente [VALOR] no nome de [NOME]", genero: 'female' },
  { texto: "sei que não era pra participar de novo mas fiz o pix de [VALOR] no nome de [NOME] mais uma vez", genero: 'female' },
  { texto: "oi eu ja fui contemplada antes mas mandei [VALOR] de novo no nome de [NOME]", genero: 'female' },
  { texto: "moço desculpa mas fiz o pix de [VALOR] no nome de [NOME] outra vez", genero: 'female' },
  { texto: "eu sei que ja participei mas mandei [VALOR] novamente no nome de [NOME]", genero: 'female' },
  // Masculino
  { texto: "cara eu ja participei antes mas mandei novamente [VALOR] no nome de [NOME]", genero: 'male' },
  { texto: "sei que não era pra participar de novo mas fiz o de [VALOR] no nome de [NOME] mais uma vez", genero: 'male' },
  { texto: "eu ja fui contemplado antes mas mandei [VALOR] de novo no nome de [NOME]", genero: 'male' },
  { texto: "cara desculpa mas fiz o pix de [VALOR] no nome de [NOME] outra vez", genero: 'male' },
  { texto: "eu sei que ja participei mas mandei [VALOR] novamente no nome de [NOME]", genero: 'male' },
];

// Agradecimentos do repetido (5 por gênero) - implorando, cada um diferente
export const RESPOSTAS_REPETIDO_AGRADECIMENTO: { texto: string; genero: 'female' | 'male' }[] = [
  // Feminino
  { texto: "poxa que pena quebra essa pra mim eu imploro", genero: 'female' },
  { texto: "moço to passando por um momento muito difícil se puder me ajudar", genero: 'female' },
  { texto: "por favor eu sei que ja participei mas preciso muito dessa ajuda", genero: 'female' },
  { texto: "to desesperada aqui se puder fazer uma exceção eu agradeço", genero: 'female' },
  { texto: "moço eu imploro to sem opção nenhuma", genero: 'female' },
  // Masculino
  { texto: "cara quebra essa pra mim eu to desesperado", genero: 'male' },
  { texto: "por favor to passando por um momento muito difícil se puder me ajudar", genero: 'male' },
  { texto: "eu sei que ja participei mas preciso muito dessa ajuda", genero: 'male' },
  { texto: "to sem saída aqui se puder fazer uma exceção eu fico grato", genero: 'male' },
  { texto: "cara eu to sem opção me ajuda por favor", genero: 'male' },
];
