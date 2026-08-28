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
        <Tricoscopia video={clinica?.videoTricoscopia} />
        <Resultados resultados={resultados.docs} />
        <Depoimentos depoimentos={depoimentos.docs} video={clinica?.videoDepoimentos} />
        <Sobre
          rotulo={clinica?.sobreRotulo}
          resumo={clinica?.sobreResumo}
          texto={clinica?.sobre}
          foto={clinica?.foto}
          retrato={clinica?.retrato}
          nomeProfissional={clinica?.nomeProfissional}
          credencial={clinica?.credencial}
        />
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
