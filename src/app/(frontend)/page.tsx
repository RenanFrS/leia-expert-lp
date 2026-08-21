import { getPayload } from 'payload'
import config from '@payload-config'

import { Header } from '@/components/sections/Header'
import { Hero } from '@/components/sections/Hero'
import { Metricas } from '@/components/sections/Metricas'
import { Sobre } from '@/components/sections/Sobre'
import { Tratamentos } from '@/components/sections/Tratamentos'
import { Tricoscopia } from '@/components/sections/Tricoscopia'
import { Resultados } from '@/components/sections/Resultados'
import { Depoimentos } from '@/components/sections/Depoimentos'
import { Duvidas } from '@/components/sections/Duvidas'
import { Agendamento } from '@/components/sections/Agendamento'
import { Footer } from '@/components/sections/Footer'
import { WhatsappFlutuante } from '@/components/sections/WhatsappFlutuante'

// A pagina e estatica e revalida sozinha, o que mantem o LCP baixo mesmo com
// conteudo vindo do banco.
export const revalidate = 300

export default async function Home() {
  const payload = await getPayload({ config })

  const [clinica, rastreamento, tratamentos, resultados, depoimentos, perguntas] = await Promise.all([
    payload.findGlobal({ slug: 'clinica', depth: 1 }),
    payload.findGlobal({ slug: 'rastreamento', depth: 0 }),
    payload.find({ collection: 'tratamentos', limit: 8, depth: 1, sort: 'ordem' }),
    payload.find({ collection: 'resultados', limit: 6, depth: 1, where: { publicado: { equals: true } } }),
    payload.find({ collection: 'depoimentos', limit: 6, depth: 0, where: { publicado: { equals: true } } }),
    payload.find({ collection: 'faq', limit: 12, depth: 0, sort: 'ordem' }),
  ])

  const whatsapp = clinica?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || ''
  const unidades = clinica?.unidades || []

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

      <Header nome={clinica?.nome || 'Leia Expert'} logo={clinica?.logo} />

      <main id="conteudo">
        <Hero
          nome={clinica?.nome || 'Leia Expert'}
          chamada={clinica?.chamada}
          motivos={tratamentos.docs.map(({ titulo, slug }) => ({ titulo, slug }))}
          painel={clinica?.heroPainel}
          blocoEsquerda={clinica?.heroBlocoEsquerda}
          blocoDireita={clinica?.heroBlocoDireita}
          intervalo={clinica?.heroIntervalo}
        />
        <Metricas metricas={clinica?.metricas || []} />
        <Sobre
          rotulo={clinica?.sobreRotulo}
          resumo={clinica?.sobreResumo}
          texto={clinica?.sobre}
          foto={clinica?.foto}
          retrato={clinica?.retrato}
          nomeProfissional={clinica?.nomeProfissional}
          credencial={clinica?.credencial}
        />
        <Tratamentos tratamentos={tratamentos.docs} />
        <Tricoscopia />
        <Resultados resultados={resultados.docs} />
        <Depoimentos depoimentos={depoimentos.docs} />
        <Duvidas perguntas={perguntas.docs} />
        <Agendamento
          googleAdsId={rastreamento?.googleAdsId}
          googleAdsLabel={rastreamento?.googleAdsLabelLead}
          whatsapp={whatsapp}
          mensagemWhatsapp={clinica?.mensagemWhatsapp}
          email={clinica?.email}
          unidade={unidades[0]}
          foto={clinica?.fotoAgendamento}
        />
      </main>

      <Footer
        nome={clinica?.nome || 'Leia Expert'}
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
