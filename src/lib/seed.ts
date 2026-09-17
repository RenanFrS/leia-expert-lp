import type { Payload } from 'payload'

import { MENSAGEM_WHATSAPP_PADRAO } from '@/lib/utils'

/**
 * Conteudo inicial da Léia Expert, para ver as secoes montadas antes de existir
 * conteudo real. Roda pela rota /api/dev/seed, com o pnpm dev no ar.
 *
 * Vive aqui e nao em scripts/ porque o config do Payload so carrega dentro do
 * Next: fora dele o `payload/dist/bin/loadEnv.js` quebra na interop com o
 * @next/env. Mesmo motivo da rota que gera os tipos.
 *
 * Pode rodar quantas vezes precisar. O que ja existe e atualizado, nao duplicado.
 *
 * O conteudo aqui e real. Servicos, texto do sobre mim, contato e endereco vem
 * do site da propria Leia, `https://www.leiaexpert.com.br/`. As metricas vem do
 * midia kit 2026 e do perfil da clinica no Google. Os `depoimentos` sao seis
 * avaliacoes reais e publicas do Google, transcritas com a acentuacao e a
 * pontuacao de cada autora, incluindo os emojis originais.
 *
 * NAO PUBLIQUE SEM REVISAR. Sobrou um bloco pendente: as `indicacoes` dos nove
 * servicos que nao sao "Queda capilar" foram escritas aqui, a partir da
 * descricao dela. Sao afirmacoes sobre saude e precisam do aval da profissional.
 *
 * Nenhuma foto e criada aqui. Imagem de tratamento, retrato e os pares antes e
 * depois entram pelo painel.
 */

/**
 * Os servicos prestados pela clinica, transcritos do site da propria Leia. O
 * `resumo` e o texto dela, literal, com uma excecao marcada no proprio item:
 * "Alopecia e calvicie", que entrou no lugar de "Microagulhamento capilar" e tem
 * texto escrito aqui. O `titulo` perde o prefixo "Tratamento para", que e
 * redundante dentro da secao de tratamentos e nao caberia na pilula do hero, e
 * ganha o acento que faltava em "Estimulo".
 *
 * A ordem dos cinco que estao no ar segue a queixa, do geral para o localizado:
 * queda, afinamento, calvicie, couro cabeludo e falha. Os que sobraram no array
 * e nao existem mais no banco mantem a ordem antiga, de diagnostico antes de
 * tratamento e beleza no fim.
 *
 * O campo `descricao` nao e renderizado em lugar nenhum do site hoje. Fica com
 * uma frase so, sem inventar conteudo clinico.
 *
 * PENDENTE DE REVISAO DA PROFISSIONAL: as `indicacoes` de Queda capilar saem
 * literais do site, mas as dos outros nove foram escritas aqui a partir da
 * descricao dela. Sao afirmacoes sobre saude e precisam do aval dela antes de o
 * site ir ao ar.
 */
const tratamentos = [
  {
    titulo: 'Queda capilar',
    slug: 'queda-capilar',
    resumo:
      'Eflúvio telógeno, eflúvio anágeno, alopecias, alopecia areata, alopecia traumática, alopecia metabólica e alopecia androgenética.',
    descricao:
      'A queda tem mais de uma causa possível, e cada uma pede uma conduta diferente. A consulta vem antes do protocolo.',
    // Unicas indicacoes literais do site: e a lista de condicoes que ela mesma
    // publica sob este servico.
    indicacoes: [
      { texto: 'Eflúvio telógeno e eflúvio anágeno' },
      { texto: 'Alopecia areata, traumática e metabólica' },
      { texto: 'Alopecia androgenética' },
    ],
    ordem: 1,
  },
  {
    titulo: 'Dermatoscopia e tricoscopia',
    slug: 'dermatoscopia-tricoscopia',
    resumo:
      'Analisamos o couro cabeludo e os fios para identificar oleosidade, queda, obstruções e presença de fungos.',
    descricao:
      'O exame de imagem que abre o atendimento e orienta qual protocolo faz sentido para cada caso.',
    indicacoes: [
      { texto: 'Leitura do couro cabeludo e dos fios em aumento' },
      { texto: 'Identificação de oleosidade, obstrução e fungos' },
      { texto: 'Base para escolher o protocolo certo' },
    ],
    ordem: 2,
  },
  {
    titulo: 'Exame biofísico',
    slug: 'exame-biofisico',
    resumo:
      'Identificamos as causas do desconforto capilar por meio de uma análise do seu organismo.',
    descricao:
      'Olha para além do couro cabeludo, porque parte das causas do desconforto capilar vem de dentro.',
    indicacoes: [
      { texto: 'Investigação das causas internas do desconforto' },
      { texto: 'Análise do organismo, não apenas do fio' },
      { texto: 'Complementa a leitura da tricoscopia' },
    ],
    ordem: 3,
  },
  {
    titulo: 'Oxigenação celular e fungicida',
    slug: 'oxigenacao-celular-fungicida',
    resumo:
      'Trata coceira, vermelhidão, descamação, caspa associada a oleosidade excessiva e proliferação de fungos.',
    descricao:
      'Controlar a inflamação e o fungo vem antes de tratar a queda, porque couro cabeludo inflamado não sustenta fio novo.',
    indicacoes: [
      { texto: 'Coceira, vermelhidão e descamação' },
      { texto: 'Caspa associada a oleosidade excessiva' },
      { texto: 'Proliferação de fungos no couro cabeludo' },
    ],
    ordem: 4,
  },
  // Entrou no lugar de "Estimulo de crescimento", que era o nome do protocolo e
  // nao da queixa. Mantem o video `estimulo-de-crescimento.mp4` no banco.
  //
  // Nao se chama "afinamento e falhas", que era a sugestao original, porque
  // "falhas" ja titula o item de ordem 8 e os dois cartoes ficariam disputando a
  // mesma palavra na mesma secao. Aqui a queixa e o fio que afina no corpo todo,
  // la e a falha localizada.
  {
    titulo: 'Afinamento e perda de volume',
    slug: 'afinamento-perda-de-volume',
    resumo:
      'O rabo de cavalo que já foi grosso e hoje fecha em duas voltas. O fio nasce mais fino a cada ciclo e o comprimento estaciona, sem nunca ter havido aquela queda dramática que faria procurar ajuda antes.',
    descricao:
      'Afinamento progressivo, sem queda visível. É o que mais passa despercebido, porque não há tufo no ralo.',
    indicacoes: [
      { texto: 'Rabo de cavalo mais fino do que já foi' },
      { texto: 'Couro cabeludo aparecendo sob a luz' },
      { texto: 'Comprimento que não avança' },
    ],
    ordem: 5,
  },
  /*
    Entrou no lugar de "Microagulhamento capilar", a pedido do cliente. O titulo
    antigo era o nome do procedimento, e ninguem procura procedimento no Google:
    procura a queixa. Este e o unico item cujo `resumo` nao sai literal do site
    dela, porque o texto foi escrito para responder a busca.

    O `imagem` fica de fora, aqui e nos outros: midia entra pelo painel. No banco
    este tratamento aponta para `calvo.mp4`.
  */
  {
    titulo: 'Alopecia e calvície',
    slug: 'alopecia-calvicie',
    resumo:
      'A calvície, que antes parecia inevitável, hoje pode ser acompanhada e tratada com estratégia. O ponto não é esperar a falha aumentar, mas avaliar o estágio atual e agir com intensidade proporcional ao caso.',
    descricao:
      'É a queixa que mais chega tarde, porque a pessoa espera a falha aumentar antes de procurar ajuda.',
    indicacoes: [
      { texto: 'Entradas recuando e coroa abrindo' },
      { texto: 'Risca que alarga ao longo dos meses' },
      { texto: 'Histórico de calvície na família' },
    ],
    ordem: 6,
  },
  // Entrou no lugar de "Ionizacao capilar". Mesmo motivo do item anterior: o
  // titulo antigo era o nome do aparelho, e quem sente coceira e descamacao
  // procura por coceira e descamacao. No banco aponta para `couro-cabeludo.mp4`.
  {
    titulo: 'Caspa, coceira e descamação',
    slug: 'caspa-coceira-descamacao',
    resumo:
      'Coceira que não passa, casquinha branca no ombro, couro cabeludo vermelho ou oleoso demais. Antes de tratar a queda é o couro que precisa voltar ao normal, porque fio novo não se sustenta em terreno inflamado.',
    descricao: 'Controlar inflamação, oleosidade e fungo vem antes de tratar a queda.',
    indicacoes: [
      { texto: 'Coceira, ardência e vermelhidão' },
      { texto: 'Caspa e descamação com oleosidade' },
      { texto: 'Fungos e obstrução no couro cabeludo' },
    ],
    ordem: 7,
  },
  // Quinta entrada, criada do zero. Fecha a lista com a falha localizada, que e
  // queixa distinta da queda difusa do item 01. No banco aponta para
  // `calvo-nuca.mp4`.
  {
    titulo: 'Falhas e alopecia areata',
    slug: 'falhas-alopecia-areata',
    resumo:
      'Falha redonda que aparece de um mês para o outro, numa região do couro cabeludo que até então estava normal. Assusta pela velocidade, e é por isso mesmo que pede leitura no tricoscópio antes de qualquer palpite.',
    descricao: 'A leitura no tricoscópio separa o que é areata do que é tração, cicatriz ou fungo.',
    indicacoes: [
      { texto: 'Falhas arredondadas de contorno nítido' },
      { texto: 'Perda rápida, em questão de semanas' },
      // A clinica so atende cabelo da cabeca. Esta linha descrevia falha em
      // barba e sobrancelha, que ela nao trata.
      { texto: 'Falha lisa, sem dor, coceira ou descamação' },
    ],
    ordem: 8,
  },
  {
    titulo: 'Massagem capilar',
    slug: 'massagem-capilar',
    resumo:
      'Estimula a circulação sanguínea, saúde do couro cabeludo, aumenta a absorção de produtos capilares.',
    descricao:
      'Entra como apoio ao protocolo, somando circulação e absorção ao que já está em curso.',
    indicacoes: [
      { texto: 'Estímulo à circulação sanguínea' },
      { texto: 'Saúde do couro cabeludo' },
      { texto: 'Maior absorção dos produtos capilares' },
    ],
    ordem: 9,
  },
  {
    titulo: 'Embelezamento capilar',
    slug: 'embelezamento-capilar',
    resumo:
      'Hidratação, nutrição e reparação dos fios, proporcionando brilho, maciez e vitalidade.',
    descricao:
      'Cuida da aparência do fio que já existe, em paralelo ao tratamento do couro cabeludo.',
    indicacoes: [
      { texto: 'Hidratação e nutrição dos fios' },
      { texto: 'Reparação de fios ressecados' },
      { texto: 'Brilho, maciez e vitalidade' },
    ],
    ordem: 10,
  },
  {
    titulo: 'Corte terapêutico',
    slug: 'corte-terapeutico',
    resumo:
      'Remoção das pontas duplas, secas e quebradiças, sem alterar o comprimento, corte ou volume dos cabelos.',
    descricao:
      'Tira o que já está comprometido sem mexer no comprimento, o que costuma ser a maior preocupação de quem está em tratamento.',
    indicacoes: [
      { texto: 'Remoção de pontas duplas e quebradiças' },
      { texto: 'Preserva comprimento, corte e volume' },
      { texto: 'Complemento ao tratamento em andamento' },
    ],
    ordem: 11,
  },
]

const perguntas = [
  {
    pergunta: 'A consulta e o exame tricológico são gratuitos?',
    resposta:
      'Não. A consulta é um atendimento clínico: inclui a tricoscopia, a leitura do couro cabeludo e dos fios e termina com uma conduta na mão. Você sai sabendo o que está acontecendo com o seu cabelo mesmo que decida não seguir com tratamento nenhum. É justamente por ser cobrada que ela pode terminar em "não há indicação para o seu caso", em vez de virar vitrine de protocolo.',
    ordem: 1,
  },
  {
    pergunta: 'O que é avaliado na consulta?',
    // Resposta em etapas, uma por linha. Quem preserva a quebra na tela e o
    // `whitespace-pre-line` do `AccordionContent`, em `Duvidas.tsx`.
    resposta:
      'Investigação da causa\nAvaliação do couro cabeludo e dos fios\nExames de tricoscopia e dermatoscopia\nDefinição de tratamento\nAcompanhamento e evolução',
    ordem: 2,
  },
  {
    pergunta: 'A clínica atende homens e mulheres?',
    resposta:
      'Sim, os dois. Os padrões de perda são diferentes: no homem costuma recuar a linha frontal e abrir a coroa, na mulher costuma alargar a risca e tirar volume sem formar falha. Por isso a avaliação e o protocolo são montados caso a caso, não por sexo.',
    ordem: 3,
  },
  {
    pergunta: 'Preciso levar exames ou encaminhamento médico?',
    resposta:
      'Não para a primeira consulta. Se durante o exame aparecer algum sinal que sugira causa sistêmica, como alteração da tireoide ou anemia, orientamos quais exames buscar e o acompanhamento segue junto com o seu médico.',
    ordem: 4,
  },
  {
    pergunta: 'A tricoscopia dói ou precisa raspar o cabelo?',
    resposta:
      'Nenhum dos dois. É uma câmera que amplia o couro cabeludo em até duzentas vezes, encostada na pele. Não corta, não fura e não precisa de preparo. O ideal é vir com o cabelo seco e sem produto de fixação.',
    ordem: 5,
  },
  {
    pergunta: 'Em quanto tempo aparecem os primeiros resultados?',
    resposta:
      'O fio tem ciclo próprio e não acelera por vontade. Na maioria dos casos a diferença começa a aparecer entre o terceiro e o sexto mês. Antes disso o que se acompanha é a resposta do couro cabeludo, que a tricoscopia já mostra bem antes do espelho.',
    ordem: 6,
  },
  {
    pergunta: 'Com que frequência preciso realizar as sessões?',
    resposta:
      'Depende do protocolo indicado. A frequência é definida na consulta, junto com a intensidade das sessões, e é combinada com a sua rotina. Nada é fechado antes de você saber quantas sessões são e em que intervalo.',
    ordem: 7,
  },
  {
    pergunta: 'E se não houver indicação de tratamento para mim?',
    resposta:
      'A gente diz isso na hora. Existe queda passageira que se resolve sozinha e existe perda antiga que já não responde. Nos dois casos indicar protocolo seria vender expectativa, e não é assim que trabalhamos.',
    ordem: 8,
  },
  {
    pergunta: 'Quanto custa o tratamento?',
    resposta:
      'O valor depende do protocolo, da quantidade de sessões e da frequência, que só ficam claros depois da consulta e exame tricológico. Por isso não trabalhamos com tabela fechada por telefone: seria chutar antes de saber o que você tem.',
    ordem: 9,
  },
]

/**
 * Avaliacoes reais do perfil da clinica no Google Business Profile, transcritas
 * em 21/08/2026. O tempo relativo (tempoTexto) e o texto exato como aparecem no
 * Google hoje: o Google so mostra tempo relativo, entao nao ha data real para
 * gravar. Nenhuma foto de perfil ou anexada esta disponivel como arquivo ainda;
 * os campos `foto` e `fotos` ficam vazios ate a clinica exportar os arquivos do
 * Google Business Profile e subir pelo painel.
 */
const depoimentos = [
  {
    nome: 'Sara Suzan',
    texto:
      'Amei o cuidado e tratamento! Sempre muito atenciosas, dando uma atenção exclusiva para o meu cabelo. Cheguei com o cabelo destruído (ressecado, elástico, fino) e já na segunda sessão ele já estava com uma aparência de estar mais cheio, na última sessão deu para ver nitidamente a melhora dele em todos os aspectos. Somente a agradecer a Leia e equipe🎉🎉 Recomendo! Fotos de como ele chegou e com as 4 sessões de tratamento',
    nota: 5,
    avaliacoes: 2,
    guiaLocal: false,
    tempoTexto: '6 meses atrás',
  },
  {
    nome: 'Ingrid Damasceno',
    texto:
      'Minha experiência com a leia foi ótima, uma profissional honesta que realmente vai identificar a raiz do seu problema e não como alguns que fiz orçamento que querem apenas roubar seu dinheiro, super indico!',
    nota: 5,
    avaliacoes: 2,
    guiaLocal: false,
    tempoTexto: '2 meses atrás',
  },
  {
    nome: 'Raquel R. dos Santos',
    texto:
      'Tá sendo maravilhoso,meu tratamento fora o cuidado que ela tem sempre mandando mensagem pra saber se está tendo alguma dificuldade super indico 🤝',
    nota: 5,
    avaliacoes: 5,
    guiaLocal: false,
    tempoTexto: '3 meses atrás',
  },
  {
    nome: 'Isabel Silva',
    texto:
      'Excelente profissional! Atendimento impecável, super humana. O tratamento foi incrível, foram 3 meses com resultados incríveis. Me transformou em uma outra mulher. A Léia é uma profissional incrível em tudo. Se tivesse a opção de mais estrelas com certeza daria ❤️',
    nota: 5,
    avaliacoes: 13,
    guiaLocal: true,
    tempoTexto: 'um ano atrás',
  },
  {
    nome: 'Franciene Ramos',
    texto:
      'Atendimento impecável. Muito profissional, tratamento proposto foi perfeito pra mim e diminuiu muito minha queda. Cada caso é um caso, mas a Léia explica muito bem e deixa claro todos os passos no tratamento. Indico de olhos fechados ❤️',
    nota: 5,
    avaliacoes: 6,
    guiaLocal: false,
    tempoTexto: 'um ano atrás',
  },
  {
    nome: 'Ane K. Marketing',
    texto:
      'Terapeuta capilar maravilhosa. Recuperou meus cabelinhos… me livrei de um "buraco" na cabeça. Recuperei a saude do meu couro cabeludo e dos fios. Explica tudo muito bem. E usa tecnologia de ponta. Nota mil',
    nota: 5,
    avaliacoes: 4,
    guiaLocal: true,
    tempoTexto: 'um ano atrás',
  },
]

/**
 * Os cinco tratamentos que a lista real da clinica substituiu. O seed casa por
 * `slug`, entao sem apagar aqui eles ficariam no banco e continuariam saindo na
 * secao, misturados com os servicos de verdade.
 *
 * O `queda-capilar` nao entra: ele e reaproveitado pelo servico equivalente do
 * site dela, entao o documento e atualizado em vez de recriado.
 */
const slugsTratamentosAntigos = [
  'calvicie-masculina',
  'rarefacao-feminina',
  'afinamento-dos-fios',
  'caspa-dermatite',
  'recuo-linha-frontal',
  // Virou "Alopecia e calvicie". No banco o documento foi atualizado no lugar,
  // preservando o id, entao esta linha so vale para instalacao que ainda tenha o
  // slug antigo. Onde a troca ja passou, ela e um no-op.
  'microagulhamento-capilar',
  // Virou "Caspa, coceira e descamacao", tambem atualizada no lugar.
  'ionizacao-capilar',
  // Virou "Afinamento e perda de volume", tambem atualizada no lugar.
  'estimulo-de-crescimento',
]

/**
 * Os seis depoimentos inventados usados como placeholder antes das avaliacoes
 * reais do Google. Uma vez apagados aqui, a busca por nome nao acha mais nada e
 * este bloco vira um no-op nas proximas execucoes do seed.
 */
const nomesPlaceholderAntigos = [
  'Ana Paula M.',
  'Rodrigo S.',
  'Camila T.',
  'Marcelo A.',
  'Juliana R.',
  'Thiago B.',
]

/**
 * Perguntas que sairam de linha. O seed casa FAQ por `pergunta`, entao mudar o
 * texto de uma cria um item novo e deixa o velho no banco: o site passaria a
 * mostrar as duas, uma contradizendo a outra. Mesmo papel do
 * `slugsTratamentosAntigos`.
 *
 * A primeira daqui dizia que a avaliacao era gratuita, e a clinica passou a
 * cobrar pela consulta.
 */
const perguntasAntigas = ['A avaliação capilar é gratuita mesmo?']

export const popularConteudo = async (payload: Payload) => {
  const registro: string[] = []

  /** Devolve o id do documento existente, para o seed atualizar em vez de duplicar. */
  const idExistente = async (
    collection: 'tratamentos' | 'faq' | 'depoimentos',
    where: Record<string, { equals: string }>,
  ) => {
    const { docs } = await payload.find({ collection, where, limit: 1, depth: 0 })
    return docs[0]?.id
  }

  for (const slug of slugsTratamentosAntigos) {
    const id = await idExistente('tratamentos', { slug: { equals: slug } })
    if (id) await payload.delete({ collection: 'tratamentos', id })
  }

  for (const data of tratamentos) {
    const id = await idExistente('tratamentos', { slug: { equals: data.slug } })
    if (id) await payload.update({ collection: 'tratamentos', id, data })
    else await payload.create({ collection: 'tratamentos', data })
  }
  registro.push(`${tratamentos.length} tratamentos gravados`)

  for (const pergunta of perguntasAntigas) {
    const id = await idExistente('faq', { pergunta: { equals: pergunta } })
    if (id) await payload.delete({ collection: 'faq', id })
  }

  for (const data of perguntas) {
    const id = await idExistente('faq', { pergunta: { equals: data.pergunta } })
    if (id) await payload.update({ collection: 'faq', id, data })
    else await payload.create({ collection: 'faq', data })
  }
  registro.push(`${perguntas.length} perguntas gravadas`)

  for (const nome of nomesPlaceholderAntigos) {
    const id = await idExistente('depoimentos', { nome: { equals: nome } })
    if (id) await payload.delete({ collection: 'depoimentos', id })
  }

  for (const data of depoimentos) {
    const id = await idExistente('depoimentos', { nome: { equals: data.nome } })
    if (id) await payload.update({ collection: 'depoimentos', id, data })
    else await payload.create({ collection: 'depoimentos', data })
  }
  registro.push(`${depoimentos.length} depoimentos gravados`)

  await payload.updateGlobal({
    slug: 'clinica',
    data: {
      nome: 'Léia Expert',
      chamada:
        // Abre pelo problema, em pergunta, a pedido do cliente: quem chega pelo
        // anuncio busca a queixa. A versao anterior abria em "Queda de cabelo,
        // calvicie e alopecia tem causa", que nomeava as condicoes em tom
        // clinico e escorregava para o metodo, e antes dela em "Tricologia
        // clinica", que so conversa com quem ja conhece o termo.
        //
        // Duas travas continuam valendo. Dizia "depende do diagnostico certo":
        // diagnostico e ato privativo de medico e a Leia e tricologista, entao a
        // frase afirmava o que a clinica nao pode oferecer. Nao reintroduza a
        // palavra aqui, nem promessa de gratuidade, porque a consulta e cobrada.
        'Seu cabelo está caindo, afinando ou abrindo falhas? Descobrimos por que isso acontece e tratamos a causa, não só o sintoma.',
      sobreRotulo: 'Minha história',
      // Textos da propria Leia. A abertura fica no resumo e a apresentacao no
      // `sobre`, que ja foi curto e hoje tem quatro paragrafos, enviados pelo
      // cliente. Os paragrafos sao separados por linha em branco: o primeiro sai
      // em destaque e os demais em texto corrido, pela regra do `Sobre.tsx`.
      sobreResumo:
        'Prazer, me chamo Léia! Sou especialista em Saúde Capilar, formada em estética e cosmética, pós-graduada em tricologia funcional.',
      sobre: [
        'Minha atuação é dedicada à investigação e ao cuidado do couro cabeludo e dos fios, especialmente em casos de queda capilar, afinamento, perda de volume, alterações no crescimento e outras queixas relacionadas à saúde capilar.',
        'Acredito que cada pessoa tem uma história e que, antes de pensar em qualquer conduta, é importante compreender o que está acontecendo.',
        'Por isso, meu trabalho começa com uma investigação cuidadosa, considerando o histórico de cada paciente e as condições do couro cabeludo e dos fios. A partir dessa análise, é possível orientar uma conduta individualizada, de acordo com as necessidades de cada caso.',
        'Meu propósito é oferecer um atendimento próximo, cuidadoso e responsável, ajudando cada pessoa a compreender melhor sua saúde capilar e os caminhos possíveis para cuidar dela.',
      ].join('\n\n'),
      nomeProfissional: 'Léia Varjão',
      // O hifen no meio vai de proposito, exatamente como o cliente escreveu. E
      // excecao a regra de texto do projeto, restrita a este valor.
      credencial: 'Tricologista - Especialista em Saúde Capilar',
      whatsapp: '5511991834175',
      mensagemWhatsapp: MENSAGEM_WHATSAPP_PADRAO,
      email: 'leia.expert@gmail.com',
      instagram: 'leiaexpertoficial',
      horarios: 'Atendimento exclusivamente com agendamento prévio.',
      // As quatro do print do Google e do midia kit. Ficaram de fora os dados
      // demograficos do midia kit, do tipo 75% mulheres e 22% Rio de Janeiro:
      // descrevem quem segue o Instagram, nao quem se trata, e a clinica e em
      // Sao Paulo.
      // A faixa em movimento abaixo do hero. So problemas que os tratamentos
      // cadastrados cobrem, sem promessa nenhuma.
      faixaProblemas: [
        'Queda capilar',
        'Calvície',
        'Alopecia androgenética',
        'Alopecia areata',
        'Eflúvio telógeno',
        'Fios mais finos',
        'Perda de volume',
        'Falhas no cabelo',
        'Entradas aparentes',
        'Caspa',
        'Coceira no couro cabeludo',
        'Descamação',
        'Couro cabeludo oleoso',
      ].map((termo) => ({ termo })),
      metricas: [
        { valor: '5,0', rotulo: 'Nota no Google' },
        { valor: '143', rotulo: 'Avaliações no Google' },
        { valor: '7.260', rotulo: 'Seguidores nas redes' },
        { valor: '+194 mil', rotulo: 'Visualizações nas redes' },
      ],
      unidades: [
        {
          nome: 'Artur Alvim',
          endereco: 'R. Maria Eugênia Célso, 35\nArtur Alvim, São Paulo, SP\n03568-050',
          telefone: '(11) 99183-4175',
        },
      ],
    },
  })
  registro.push('global Clinica atualizada')

  await payload.updateGlobal({
    slug: 'seo',
    data: {
      titulo: 'Tratamento capilar em São Paulo | Léia Expert',
      descricao:
        'Tricologia clínica na Zona Leste de São Paulo. Tricoscopia, exame biofísico e protocolo individual para queda capilar, alopecias e saúde do couro cabeludo.',
      palavrasChave: [
        { termo: 'tricologia clínica' },
        { termo: 'tratamento capilar São Paulo' },
        { termo: 'queda capilar' },
        { termo: 'alopecia androgenética' },
        { termo: 'tricoscopia' },
        { termo: 'exame biofísico capilar' },
        { termo: 'microagulhamento capilar' },
        { termo: 'tricologista Artur Alvim' },
      ],
    },
  })
  registro.push('global SEO atualizada')

  return registro
}
