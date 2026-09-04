import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { Revelar } from '@/components/Revelar'
import Image from 'next/image'

import { GaleriaParallax, type CartaoDaGrade } from '@/components/ui/galeria-parallax'
import { midia } from '@/lib/utils'
import type { Galeria } from '@/payload-types'

/**
 * Fechamento da pagina: a clinica, a profissional e o ambiente.
 *
 * Pedido do time de trafego, e a razao e de conversao, nao de estetica: quem
 * chega por anuncio nunca esteve la e nao sabe para onde esta sendo convidado.
 * Mostrar o lugar logo antes do ultimo CTA responde a duvida que trava o
 * agendamento.
 *
 * **Ao contrario da grade do antes e depois, esta tem titulo e chamada.** La a
 * secao continua o assunto da anterior; aqui ela abre um assunto novo e e o
 * ultimo bloco de conteudo antes do rodape, entao precisa se apresentar e
 * fechar com o caminho do WhatsApp.
 *
 * Some inteira enquanto nao houver foto publicada na categoria.
 */
export function AClinica({
  fotos,
  whatsapp,
  mensagemWhatsapp,
}: {
  fotos: Galeria[]
  whatsapp: string
  mensagemWhatsapp?: string | null
}) {
  /*
    A grade nao sabe montar cartao: ela recebe o conteudo pronto e a razao de
    altura. Aqui cada cartao e uma foto sozinha, na propria proporcao.

    **Video e descartado na entrada.** A colecao aponta para a Media, que aceita
    os dois tipos, e o otimizador do Next responde 400, "The requested resource
    isn't a valid image", para um `.mp4`: sem esse filtro uma foto trocada por
    video deixaria um buraco na grade sem erro nenhum na tela.

    **Nao ha `enquadramento` aqui, e isso e proposital.** O ponto de foco existe
    para imagem em `object-cover`, onde a caixa recorta a foto de novo. Aqui ela
    entra inteira, entao um `object-position` seria letra morta.
  */
  const cartoes: CartaoDaGrade[] = []

  for (const item of fotos) {
    const arquivo = midia(item.foto)
    if (!arquivo?.url || !arquivo.mimeType?.startsWith('image/')) continue

    const largura = arquivo.width || 800
    const altura = arquivo.height || 1000

    cartoes.push({
      id: item.id,
      razao: altura / largura,
      conteudo: (
        <Image
          src={arquivo.url}
          alt={arquivo.alt || ''}
          width={largura}
          height={altura}
          sizes="(max-width: 1024px) 50vw, 460px"
          className="h-auto w-full"
        />
      ),
    })
  }

  if (!cartoes.length) return null

  return (
    <section id="a-clinica" className="py-24 md:py-32">
      <div className="container">
        <Revelar>
          {/* Sobre porcelana o acento e o caramelo. O cacau ficaria pesado ao
              lado do titulo em tinta. */}
          <p className="text-eyebrow font-mono uppercase text-caramelo">A clínica</p>
          <h2 className="mt-4 max-w-2xl font-display text-display-lg text-tinta">
            Conheça o lugar do seu tratamento.
          </h2>
          <p className="mt-4 max-w-lg text-tinta-suave">
            Ambiente preparado para exame e atendimento capilar, com hora marcada e sem sala de
            espera cheia. Você é atendido pela Léia do começo ao fim.
          </p>
        </Revelar>

        <GaleriaParallax itens={cartoes} className="mt-14" />

        {/* Ultimo CTA da pagina. O `especular` fica so aqui entre os dois botoes
            novos: cada instancia abre um contexto WebGL e o navegador derruba os
            mais antigos passando de uns 16, entao ele vai no ponto de conversao
            mais forte, e nao espalhado. */}
        <Revelar className="mt-12 flex justify-center">
          <BotaoWhatsapp
            numero={whatsapp}
            mensagem={mensagemWhatsapp}
            local="fechamento"
            size="lg"
            especular
            className="rounded-full"
          >
            Falar com a Léia no WhatsApp
          </BotaoWhatsapp>
        </Revelar>
      </div>
    </section>
  )
}
