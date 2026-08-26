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
 * Os dez servicos prestados pela clinica, transcritos do site da propria Leia.
 * O `resumo` e o texto dela, literal. O `titulo` perde o prefixo "Tratamento
 * para", que e redundante dentro da secao de tratamentos e nao caberia na
 * pilula do hero, e ganha o acento que faltava em "Estimulo".
 *
 * A ordem leva diagnostico antes de tratamento e deixa os servicos de beleza no
 * fim, que e a jornada que o texto dela descreve.
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
      'A queda tem mais de uma causa possível, e cada uma pede uma conduta diferente. A avaliação vem antes do protocolo.',
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
  {
    titulo: 'Estímulo de crescimento',
    slug: 'estimulo-de-crescimento',
    resumo:
      'Tratamentos que fortalecem os fios, equilibram o couro cabeludo e estimulam o crescimento saudável.',
    descricao:
      'Depois de tratar a causa, o passo seguinte é dar condição para o fio nascer e se manter.',
    indicacoes: [
      { texto: 'Fortalecimento dos fios existentes' },
      { texto: 'Equilíbrio do couro cabeludo' },
      { texto: 'Estímulo ao crescimento saudável' },
    ],
    ordem: 5,
  },
  {
    titulo: 'Microagulhamento capilar',
    slug: 'microagulhamento-capilar',
    resumo:
      'Promove a circulação sanguínea e a produção de colágeno, o que ajuda a combater a queda de cabelo e a estimular o crescimento de novos fios.',
    descricao:
      'Trabalha a pele do couro cabeludo, que é o terreno onde o folículo está.',
    indicacoes: [
      { texto: 'Aumento da circulação no couro cabeludo' },
      { texto: 'Estímulo à produção de colágeno' },
      { texto: 'Apoio no combate à queda' },
    ],
    ordem: 6,
  },
  {
    titulo: 'Ionização capilar',
    slug: 'ionizacao-capilar',
    resumo:
      'Além de favorecer a penetração de substâncias nutritivas, também estimula o couro cabeludo promovendo o aumento do metabolismo e melhora da atividade celular.',
    descricao:
      'Faz o ativo chegar onde precisa, em vez de ficar na superfície.',
    indicacoes: [
      { texto: 'Melhor penetração dos ativos nutritivos' },
      { texto: 'Aumento do metabolismo do couro cabeludo' },
      { texto: 'Melhora da atividade celular' },
    ],
    ordem: 7,
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
    ordem: 8,
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
    ordem: 9,
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
    ordem: 10,
  },
]

const perguntas = [
  {
    pergunta: 'A avaliação capilar é gratuita mesmo?',
    resposta:
      'É. A avaliação inicial com tricoscopia não é cobrada e não obriga a fechar tratamento. Ela existe para responder duas perguntas: o que está acontecendo no seu couro cabeludo e se há indicação de protocolo para o seu caso.',
    ordem: 1,
  },
  {
    pergunta: 'A clínica atende homens e mulheres?',
    resposta:
      'Sim, os dois. Os padrões de perda são diferentes: no homem costuma recuar a linha frontal e abrir a coroa, na mulher costuma alargar a risca e tirar volume sem formar falha. Por isso a avaliação e o protocolo são montados caso a caso, não por sexo.',
    ordem: 2,
  },
  {
    pergunta: 'Preciso levar exames ou encaminhamento médico?',
    resposta:
      'Não para a primeira avaliação. Se durante o exame aparecer algum sinal que sugira causa sistêmica, como alteração da tireoide ou anemia, orientamos quais exames buscar e o acompanhamento segue junto com o seu médico.',
    ordem: 3,
  },
  {
    pergunta: 'A tricoscopia dói ou precisa raspar o cabelo?',
    resposta:
      'Nenhum dos dois. É uma câmera que amplia o couro cabeludo em até duzentas vezes, encostada na pele. Não corta, não fura e não precisa de preparo. O ideal é vir com o cabelo seco e sem produto de fixação.',
    ordem: 4,
  },
  {
    pergunta: 'Em quanto tempo aparecem os primeiros resultados?',
    resposta:
      'O fio tem ciclo próprio e não acelera por vontade. Na maioria dos casos a diferença começa a aparecer entre o terceiro e o sexto mês. Antes disso o que se acompanha é a resposta do couro cabeludo, que a tricoscopia já mostra bem antes do espelho.',
    ordem: 5,
  },
  {
    pergunta: 'Com que frequência preciso ir à clínica?',
    resposta:
      'Depende do protocolo indicado. A frequência é definida na avaliação, junto com a intensidade das sessões, e é combinada com a sua rotina. Nada é fechado antes de você saber quantas sessões são e em que intervalo.',
    ordem: 6,
  },
  {
    pergunta: 'E se não houver indicação de tratamento para mim?',
    resposta:
      'A gente diz isso na hora. Existe queda passageira que se resolve sozinha e existe perda antiga que já não responde. Nos dois casos indicar protocolo seria vender expectativa, e não é assim que trabalhamos.',
    ordem: 7,
  },
  {
    pergunta: 'Quanto custa o tratamento?',
    resposta:
      'O valor depende do protocolo, da quantidade de sessões e da frequência, que só ficam claros depois da avaliação. Por isso não trabalhamos com tabela fechada por telefone: seria chutar antes de saber o que você tem.',
    ordem: 8,
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
        'Tricologia clínica para homens e mulheres. Todo protocolo começa por uma tricoscopia, porque o tratamento certo depende do diagnóstico certo.',
      sobreRotulo: 'Minha história',
      // Texto da propria Leia, transcrito do site dela. A abertura fica no
      // resumo e o corpo no `sobre`, que e curto de proposito: ele ocupa metade
      // da grade em corpo grande, e texto longo ali desequilibra a secao.
      sobreResumo:
        'Prazer, me chamo Léia! Sou especialista em Saúde Capilar, formada em estética e cosmética, pós-graduada em tricologia funcional.',
      sobre:
        'Ofereço consultas especializadas, com avaliação detalhada do couro cabeludo e dos fios, além de exames biofísicos e programas personalizados de cuidados capilares. Cada tratamento é planejado de forma exclusiva, unindo ciência, tecnologia e acolhimento, para que você tenha resultados reais e duradouros.',
      nomeProfissional: 'Léia Varjão de Jesus',
      credencial: 'Especialista em Saúde Capilar, pós-graduada em Tricologia Funcional',
      whatsapp: '5511991834175',
      mensagemWhatsapp: MENSAGEM_WHATSAPP_PADRAO,
      email: 'leia.expert@gmail.com',
      instagram: 'leiaexpertoficial',
      horarios: 'Atendimento exclusivamente com agendamento prévio.',
      // As quatro do print do Google e do midia kit. Ficaram de fora os dados
      // demograficos do midia kit, do tipo 75% mulheres e 22% Rio de Janeiro:
      // descrevem quem segue o Instagram, nao quem se trata, e a clinica e em
      // Sao Paulo.
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
