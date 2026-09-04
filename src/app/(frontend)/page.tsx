import { getPayload } from 'payload'
import config from '@payload-config'

import { Header } from '@/components/sections/Header'
import { Hero } from '@/components/sections/Hero'
import { Metricas } from '@/components/sections/Metricas'
import { Sobre } from '@/components/sections/Sobre'
import { Tratamentos } from '@/components/sections/Tratamentos'
import { Tricoscopia } from '@/components/sections/Tricoscopia'
import { Resultados } from '@/components/sections/Resultados'
import { GaleriaResultados } from '@/components/sections/GaleriaResultados'
import { Depoimentos } from '@/components/sections/Depoimentos'
import { Duvidas } from '@/components/sections/Duvidas'
import { Agendamento } from '@/components/sections/Agendamento'
import { AClinica } from '@/components/sections/AClinica'
import { Footer } from '@/components/sections/Footer'
import { WhatsappFlutuante } from '@/components/sections/WhatsappFlutuante'

// A pagina e estatica e revalida sozinha, o que mantem o LCP baixo mesmo com
// conteudo vindo do banco.
export const revalidate = 300

export default async function Home() {
  const payload = await getPayload({ config })

  // O `rastreamento` saiu daqui quando o formulario saiu: a home nao consome
  // mais nenhum campo dele. Quem le a global agora e so o layout, que monta o
  // `Analytics`. Manter a consulta seria uma ida ao banco por revalidacao sem
  // ninguem usando o resultado.
  const [clinica, tratamentos, resultados, depoimentos, perguntas, galeria] =
    await Promise.all([
      payload.findGlobal({ slug: 'clinica', depth: 1 }),
      // Limite acima do numero de servicos de proposito: com 10 cadastrados e
      // limite 8, dois sumiriam da pagina sem erro nenhum.
      payload.find({ collection: 'tratamentos', limit: 12, depth: 1, sort: 'ordem' }),
      // Mesmo cuidado do limite dos tratamentos, logo acima: com 9 cadastrados e
      // limite 6, tres sumiriam da pagina sem erro nenhum. Quem escolhe o que
      // aparece e o checkbox `publicado` do painel, nao um numero no codigo.
      payload.find({
        collection: 'resultados',
        limit: 24,
        depth: 1,
        // A ordem e a do painel, e nao a data de cadastro: a secao agrupa os casos
        // femininos a esquerda e os masculinos a direita, e isso precisa sobreviver
        // a um recadastro.
        sort: 'ordem',
        where: { publicado: { equals: true } },
      }),
      payload.find({ collection: 'depoimentos', limit: 6, depth: 1, where: { publicado: { equals: true } } }),
      payload.find({ collection: 'faq', limit: 12, depth: 0, sort: 'ordem' }),
      // Uma consulta so para as duas grades, separada por categoria logo abaixo.
      // Duas chamadas contra a mesma colecao pagariam duas viagens ao banco para
      // devolver o mesmo conjunto pequeno de fotos.
      payload.find({
        collection: 'galeria',
        limit: 48,
        depth: 1,
        sort: 'ordem',
        where: { publicado: { equals: true } },
      }),
    ])

  const whatsapp = clinica?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || ''
  const unidades = clinica?.unidades || []

  // A galeria e so das fotos da clinica desde que a grade de antes e depois
  // passou a ler a colecao `resultados`, a mesma do carrossel.
  const galeriaClinica = galeria.docs

  // Dados estruturados: ajudam o Google a entender que e uma clinica e a montar
  // o resultado rico do FAQ.
  const dadosEstruturados = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        name: clinica?.nome,
        // A chamada e o texto institucional. O campo `sobre` passou a falar em
        // primeira pessoa, o que soaria estranho no resultado de busca.
        description: clinica?.chamada || clinica?.sobre,
        url: process.env.NEXT_PUBLIC_SITE_URL,
        medicalSpecialty: 'Dermatology',
        address: unidades.map((unidade) => ({
          '@type': 'PostalAddress',
          streetAddress: unidade.endereco,
          addressCountry: 'BR',
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: perguntas.docs.map((item) => ({
          '@type': 'Question',
          name: item.pergunta,
          acceptedAnswer: { '@type': 'Answer', text: item.resposta },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
      />

      <Header
        nome={clinica?.nome || 'Léia Expert'}
        logo={clinica?.logo}
        whatsapp={whatsapp}
        mensagemWhatsapp={clinica?.mensagemWhatsapp}
      />

      <main id="conteudo">
        <Hero
          nome={clinica?.nome || 'Léia Expert'}
          chamada={clinica?.chamada}
          // O hero usa os tratamentos duas vezes: no carrossel e nas pilulas.
          // Vai so o que as duas precisam, para nao mandar o documento inteiro
          // de cada tratamento para o cliente.
          tratamentos={tratamentos.docs.map(({ titulo, slug, resumo, imagem }) => ({
            titulo,
            slug,
            resumo,
            imagem,
          }))}
          painel={clinica?.heroPainel}
          intervalo={clinica?.heroIntervalo}
        />
        <Metricas metricas={clinica?.metricas || []} />
        <Tratamentos tratamentos={tratamentos.docs} />
        <Tricoscopia
          video={clinica?.videoTricoscopia}
          whatsapp={whatsapp}
          mensagemWhatsapp={clinica?.mensagemWhatsapp}
        />
        <Resultados resultados={resultados.docs} />
        {/* Recebe o mesmo array do carrossel logo acima: sao os mesmos casos,
            em duas leituras. Nao ha consulta nova por causa disso. */}
        <GaleriaResultados resultados={resultados.docs} />
        <Depoimentos depoimentos={depoimentos.docs} video={clinica?.videoDepoimentos} />
        <Sobre
          rotulo={clinica?.sobreRotulo}
          resumo={clinica?.sobreResumo}
          texto={clinica?.sobre}
          foto={clinica?.foto}
          retrato={clinica?.retrato}
          nomeProfissional={clinica?.nomeProfissional}
          credencial={clinica?.credencial}
          credenciais={clinica?.credenciais}
          whatsapp={whatsapp}
          mensagemWhatsapp={clinica?.mensagemWhatsapp}
        />
        <Duvidas perguntas={perguntas.docs} />
        {/* Os IDs de rastreamento sairam daqui: a conversao passou do envio do
            formulario para o clique de WhatsApp, e quem publica o rotulo do Ads
            agora e o `Analytics.tsx`, pelo window. */}
        <Agendamento
          whatsapp={whatsapp}
          mensagemWhatsapp={clinica?.mensagemWhatsapp}
          email={clinica?.email}
          foto={clinica?.fotoAgendamento}
        />
        <AClinica
          fotos={galeriaClinica}
          whatsapp={whatsapp}
          mensagemWhatsapp={clinica?.mensagemWhatsapp}
        />
      </main>

      <Footer
        nome={clinica?.nome || 'Léia Expert'}
        logo={clinica?.logo}
        whatsapp={whatsapp}
        email={clinica?.email}
        instagram={clinica?.instagram}
        horarios={clinica?.horarios}
        unidades={unidades}
      />

      <WhatsappFlutuante numero={whatsapp} mensagem={clinica?.mensagemWhatsapp} />
    </>
  )
}
