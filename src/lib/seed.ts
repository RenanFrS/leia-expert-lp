import type { Payload } from 'payload'

import { MENSAGEM_WHATSAPP_PADRAO } from '@/lib/utils'

/**
 * Conteudo inicial da Leia Expert, para ver as secoes montadas antes de existir
 * conteudo real. Roda pela rota /api/dev/seed, com o pnpm dev no ar.
 *
 * Vive aqui e nao em scripts/ porque o config do Payload so carrega dentro do
 * Next: fora dele o `payload/dist/bin/loadEnv.js` quebra na interop com o
 * @next/env. Mesmo motivo da rota que gera os tipos.
 *
 * Pode rodar quantas vezes precisar. O que ja existe e atualizado, nao duplicado.
 *
 * NAO PUBLIQUE SEM REVISAR. Quatro blocos aqui sao invencao para preencher tela e
 * precisam de confirmacao do cliente antes de o site ir ao ar:
 *
 *   1. `metricas`  numeros de atendimento, anos de atuacao e nota do Google
 *   2. `unidades`  endereco e telefone, propositalmente obvios de falsos
 *   3. `depoimentos`  depoimento de paciente inventado nao pode ir ao ar, tanto
 *      pelo CDC quanto pelas regras de publicidade em saude
 *   4. `nomeProfissional` e `credencial`  formacao e registro sao afirmacao
 *      legal e precisam vir da propria profissional, nao daqui
 *
 * Nenhuma foto e criada aqui. Imagem de tratamento, retrato e os pares antes e
 * depois entram pelo painel.
 */

/**
 * A clinica atende homens e mulheres, e os padroes de queda sao diferentes entre
 * os dois. Por isso a lista cobre os dois lados de forma explicita, em vez de
 * falar so em "queda capilar". Os titulos tambem viram as pilulas do hero, entao
 * precisam ser curtos.
 */
const tratamentos = [
  {
    titulo: 'Queda capilar',
    slug: 'queda-capilar',
    resumo:
      'Perda acima do ciclo normal, em homens e mulheres. A causa pode ser hormonal, nutricional, inflamatória ou emocional, e cada uma pede uma conduta diferente.',
    descricao:
      'Todo mundo perde fio todo dia. O que muda é o quanto, por quanto tempo e se o fio que nasce no lugar volta com a mesma espessura. A avaliação separa a queda passageira, que se resolve sozinha, daquela que já está reduzindo a densidade e precisa de protocolo.',
    indicacoes: [
      { texto: 'Fios a mais no travesseiro, no banho ou na escova' },
      { texto: 'Queda que persiste por mais de três meses' },
      { texto: 'Couro cabeludo aparecendo onde antes não aparecia' },
    ],
    ordem: 1,
  },
  {
    titulo: 'Calvície masculina',
    slug: 'calvicie-masculina',
    resumo:
      'Alopecia androgenética masculina, com recuo das entradas e abertura da coroa. Quanto mais cedo começa o acompanhamento, mais fio dá para preservar.',
    descricao:
      'Segue um padrão previsível: as entradas se aprofundam, a coroa abre e as duas áreas se encontram. Como o processo é progressivo, o objetivo do tratamento é frear a miniaturização e recuperar o que ainda tem folículo vivo. Fio que já foi embora há anos não volta, e isso é dito na avaliação.',
    indicacoes: [
      { texto: 'Entradas mais fundas e linha frontal recuando' },
      { texto: 'Coroa abrindo na parte de trás da cabeça' },
      { texto: 'Histórico de calvície na família' },
    ],
    ordem: 2,
  },
  {
    titulo: 'Rarefação feminina',
    slug: 'rarefacao-feminina',
    resumo:
      'Alopecia androgenética feminina, que alarga a risca e tira volume sem abrir falhas circulares. Costuma aparecer após parto, menopausa ou mudança hormonal.',
    descricao:
      'Na mulher a perda raramente forma área lisa. Ela se espalha pelo topo, alarga a risca e afina o rabo de cavalo, o que faz muita paciente demorar a procurar ajuda. A tricoscopia mostra a diferença de espessura entre fios vizinhos, que é o sinal mais confiável nesse caso.',
    indicacoes: [
      { texto: 'Risca do cabelo cada vez mais larga' },
      { texto: 'Rabo de cavalo visivelmente mais fino' },
      { texto: 'Perda de volume após gestação ou menopausa' },
    ],
    ordem: 3,
  },
  {
    titulo: 'Afinamento dos fios',
    slug: 'afinamento-dos-fios',
    resumo:
      'O fio continua nascendo, mas cada vez mais fino e mais curto, até deixar de cobrir. É o sinal mais precoce, e o melhor momento para intervir é justamente esse.',
    descricao:
      'A miniaturização vem antes da falha visível. O folículo encurta o ciclo de crescimento e devolve um fio mais fino a cada volta, até virar penugem. Quem chega nessa fase costuma ter o melhor prognóstico, porque o folículo ainda está ativo.',
    indicacoes: [
      { texto: 'Fios finos convivendo com fios grossos na mesma área' },
      { texto: 'Cabelo que não passa de um certo comprimento' },
      { texto: 'Couro cabeludo aparecendo sob luz forte' },
    ],
    ordem: 4,
  },
  {
    titulo: 'Caspa e dermatite',
    slug: 'caspa-dermatite',
    resumo:
      'Descamação, coceira e vermelhidão que inflamam o folículo e atrapalham o crescimento. Controlar a inflamação vem antes de tratar a queda.',
    descricao:
      'Couro cabeludo inflamado não sustenta fio saudável. Antes de qualquer protocolo de crescimento é preciso controlar a descamação e a oleosidade, senão o tratamento trabalha contra um terreno hostil e o resultado não se mantém.',
    indicacoes: [
      { texto: 'Descamação branca ou amarelada que sempre volta' },
      { texto: 'Coceira e ardência no couro cabeludo' },
      { texto: 'Piora em períodos de estresse ou de calor' },
    ],
    ordem: 5,
  },
  {
    titulo: 'Recuo da linha frontal',
    slug: 'recuo-linha-frontal',
    resumo:
      'A linha do cabelo caminha para trás e expõe a testa. Em mulheres pode indicar alopecia frontal fibrosante, que exige diagnóstico rápido.',
    descricao:
      'No homem o recuo costuma fazer parte do padrão androgenético. Na mulher, quando vem acompanhado de perda de sobrancelha e de pele mais clara e lisa na área, pode ser alopecia frontal fibrosante, que é cicatricial e não espera. Por isso o exame vem antes da indicação.',
    indicacoes: [
      { texto: 'Testa parecendo maior do que nas fotos antigas' },
      { texto: 'Perda de sobrancelha junto com o recuo' },
      { texto: 'Pele mais clara e lisa na área que recuou' },
    ],
    ordem: 6,
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
 * ATENCAO: depoimento inventado. Serve so para ver o componente montado e
 * precisa ser trocado por depoimento real, com autorizacao, antes de publicar.
 * Mistura nomes de homem e de mulher de proposito, porque a clinica atende os dois.
 */
const depoimentos = [
  {
    nome: 'Ana Paula M.',
    texto:
      'Eu já tinha tentado de tudo por conta própria. Foi a primeira vez que alguém me explicou o que estava acontecendo antes de oferecer qualquer pacote.',
    nota: 5,
  },
  {
    nome: 'Rodrigo S.',
    texto:
      'O exame mudou minha cabeça. Dá para acompanhar mês a mês a diferença de densidade com imagem e número, não no achismo de olhar no espelho.',
    nota: 5,
  },
  {
    nome: 'Camila T.',
    texto:
      'Minha risca só abria e ninguém levava a sério. Aqui mediram, mostraram na tela e montaram um protocolo que fez sentido para o meu caso.',
    nota: 5,
  },
  {
    nome: 'Marcelo A.',
    texto:
      'Cheguei achando que já era tarde. Fui honestamente informado do que dava e do que não dava para recuperar, e mesmo assim valeu muito a pena.',
    nota: 5,
  },
  {
    nome: 'Juliana R.',
    texto:
      'Tinha muita coceira e descamação. Melhorou depois que comecei o protocolo e parei os produtos que estavam piorando tudo sem eu saber.',
    nota: 5,
  },
  {
    nome: 'Thiago B.',
    texto:
      'Atendimento técnico e sem venda forçada. Saio de cada sessão sabendo exatamente qual é o próximo passo e o que esperar dele.',
    nota: 4,
  },
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

  for (const data of depoimentos) {
    const id = await idExistente('depoimentos', { nome: { equals: data.nome } })
    if (id) await payload.update({ collection: 'depoimentos', id, data })
    else await payload.create({ collection: 'depoimentos', data })
  }
  registro.push(`${depoimentos.length} depoimentos gravados`)

  await payload.updateGlobal({
    slug: 'clinica',
    data: {
      nome: 'Leia Expert',
      chamada:
        'Tricologia clínica para homens e mulheres. Todo protocolo começa por uma tricoscopia, porque o tratamento certo depende do diagnóstico certo.',
      sobreRotulo: 'Minha história',
      sobreResumo:
        'Atendo homens e mulheres, e os dois chegam quase sempre com a mesma frase: já tentei de tudo. Na maioria das vezes tentaram bastante, só que sem nunca ter sabido o que estavam tratando.',
      // O bloco e curto de proposito. Ele ocupa metade da grade em corpo grande,
      // e texto longo ali desequilibra a secao inteira.
      sobre:
        'Eu não indico protocolo antes de ver o couro cabeludo na tela. É o exame que evita o erro mais comum em tratamento capilar: resolver um problema individual com uma solução genérica.',
      // PLACEHOLDER: nome e credencial precisam vir da propria profissional.
      nomeProfissional: 'Leia',
      credencial: 'Tricologista clínica',
      whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '5511000000000',
      mensagemWhatsapp: MENSAGEM_WHATSAPP_PADRAO,
      horarios: 'Segunda a sexta, das 9h às 19h. Sábado, das 9h às 13h.',
      // PLACEHOLDER: confirmar os numeros reais com o cliente antes de publicar.
      metricas: [
        { valor: '1.200+', rotulo: 'Avaliações capilares realizadas' },
        { valor: '800+', rotulo: 'Pacientes em acompanhamento' },
        { valor: '5+', rotulo: 'Anos de atuação' },
        { valor: '4.9', rotulo: 'Nota média no Google' },
      ],
      // PLACEHOLDER de proposito obvio: endereco errado manda paciente para o
      // lugar errado, entao aqui e melhor parecer falso do que parecer pronto.
      unidades: [
        {
          nome: 'Unidade a confirmar',
          endereco: 'Rua Exemplo, 000, Sala 00\nBairro, Cidade, UF',
          telefone: '(00) 00000-0000',
        },
      ],
    },
  })
  registro.push('global Clinica atualizada')

  await payload.updateGlobal({
    slug: 'seo',
    data: {
      titulo: 'Tratamento capilar para homens e mulheres | Leia Expert',
      descricao:
        'Tricologia clínica com tricoscopia digital para queda, calvície, rarefação feminina e dermatite. Avaliação individual para homens e mulheres.',
      palavrasChave: [
        { termo: 'tricologia clínica' },
        { termo: 'tratamento capilar' },
        { termo: 'queda capilar' },
        { termo: 'calvície masculina' },
        { termo: 'rarefação feminina' },
        { termo: 'tricoscopia digital' },
      ],
    },
  })
  registro.push('global SEO atualizada')

  return registro
}
