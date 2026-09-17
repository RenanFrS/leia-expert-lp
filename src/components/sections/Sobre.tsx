import Image from 'next/image'

import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { CarrosselFotos, type FotoDoCarrossel } from '@/components/ui/carrossel-fotos'
import { CartaoVidro } from '@/components/ui/cartao-vidro'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ListaVerificada } from '@/components/ui/lista-verificada'
import { cn, enquadramento, midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

type Props = {
  rotulo?: string | null
  resumo?: string | null
  texto?: string | null
  foto?: Clinica['foto']
  fotos?: Clinica['fotos']
  /** A mesma logo do header, que assina o cartao de vidro. */
  logo?: Clinica['logo']
  nomeProfissional?: string | null
  credencial?: string | null
  credenciais?: Clinica['credenciais']
  whatsapp: string
  mensagemWhatsapp?: string | null
}

/**
 * Apresentacao da profissional, em primeira pessoa. O conteudo inteiro vem da
 * aba **Sobre** da global Clinica, e o campo `sobre` e so desta secao: a
 * descricao do `MedicalClinic` nos dados estruturados sai da global Seo, e o
 * `sobre` so entra la como ultima reserva, justamente por falar em primeira
 * pessoa.
 *
 * **A disposicao segue uma referencia mandada pelo cliente**, espelhada: texto a
 * esquerda, com pilula, titulo, paragrafos, lista com selo e botao, e a foto em
 * cartao a direita, com um vidro no pe levando nome e credencial. Na referencia a
 * foto ficava a esquerda, e o cliente pediu a inversao. Antes disso era uma faixa
 * larga de foto entre o titulo e o texto, com um cartao de assinatura sobre
 * areia.
 *
 * - **O texto vem primeiro no DOM**, que e a ordem do desktop: o leitor de tela
 *   chega ao titulo antes das fotos e o Tab passa pelo botao antes dos
 *   pontinhos. No celular a foto sobe para cima do texto por `order`, como ja
 *   era.
 * - **A foto tem altura minima pela proporcao e estica ate a altura do texto.**
 *   E 4:5 no celular, quadrada no `lg` e 5:4 no `xl`, onde a coluna e larga o
 *   bastante para uma caixa mais baixa sem espremer o rosto contra os pontinhos.
 *   A figura tem `aspect-ratio` e `height: 100%` ao mesmo tempo: na hora de medir
 *   a linha da grade a porcentagem nao resolve e vale a proporcao, e depois a
 *   altura acompanha a linha. Texto longo nao deixa vazio ao lado da foto, e
 *   texto curto fica centralizado.
 * - **O ponto de foco das fotos fica no alto da cabeca, e nao no centro do
 *   rosto.** O `enquadramento` usa o foco como `object-position`, e com o foco
 *   na altura do topo do cabelo esse topo nunca sai da caixa, com folga de 10% da
 *   altura dela. No centro do rosto, a foto do blazer perdia o alto do cabelo na
 *   caixa 5:4.
 * - **O cartao com o nome vai no `rodape` do carrossel**, que poe os pontinhos
 *   logo acima dele. Ele nao troca com a foto.
 * - **A logo no cartao e a mesma do header**, pelo campo `logo`, num circulo
 *   branco. O arquivo e um PNG transparente de desenho escuro, e direto sobre o
 *   vidro ele sumiria. Ela leva `alt` vazio: o nome da clinica ja esta no header,
 *   e ali a logo so assina o cartao.
 * - **Todo o texto sai em corpo**, e "Sobre mim" e o unico texto grande, como na
 *   referencia. O primeiro paragrafo ja saiu em serifa de destaque; ao lado de um
 *   titulo grande, dois blocos em serifa brigavam.
 * - **As `credenciais` viram a lista com selo**, na coluna do texto. Sem itens,
 *   ela nao aparece.
 */
export function Sobre({
  rotulo,
  resumo,
  texto,
  foto,
  fotos,
  logo,
  nomeProfissional,
  credencial,
  credenciais,
  whatsapp,
  mensagemWhatsapp,
}: Props) {
  // Sem texto a secao viraria uma foto solta, entao ela simplesmente nao aparece
  // ate o painel estar preenchido.
  if (!texto && !resumo) return null

  /*
    Fotos do carrossel. O campo `fotos` manda; o `foto` antigo, hoje escondido
    no painel, so entra quando a lista esta vazia, para a secao nunca ficar sem
    imagem durante a troca de um campo pelo outro.

    So imagem: a Media aceita video, e o `next/image` responde 400 para `.mp4`.
  */
  const reservaAlt = `${nomeProfissional || 'A profissional'} atendendo na clínica`
  const origem = (fotos || []).map(midia).filter((item) => item !== null)
  const lista = origem.length ? origem : [midia(foto)].filter((item) => item !== null)
  const fotosDoCarrossel: FotoDoCarrossel[] = lista
    .filter((item) => item.url && item.mimeType?.startsWith('image/'))
    .map((item) => ({
      id: item.id,
      url: item.url!,
      alt: item.alt || reservaAlt,
      estilo: enquadramento(item),
    }))
  const marca = midia(logo)
  const formacao = (credenciais || []).map((item) => item.texto)

  // Paragrafos do texto de apresentacao, separados por linha em branco no painel.
  const paragrafos = (texto || '')
    .split(/\n\s*\n/)
    .map((trecho) => trecho.trim())
    .filter(Boolean)

  /*
    **O vidro e mais escuro que o padrao do `CartaoVidro`**, com
    `cacau-escuro/85` nas duas pontas, a mesma correcao do cartao das duvidas. As
    fotos da Leia tem fundo branco, e com o tom padrao a credencial em
    `porcelana/85` cairia abaixo de 4.5.
  */
  const cartao = nomeProfissional ? (
    <CartaoVidro className="from-cacau-escuro/85 to-cacau-escuro/85 p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-xl leading-snug md:text-2xl">{nomeProfissional}</p>
          {credencial && <p className="mt-1 text-sm text-porcelana/85">{credencial}</p>}
        </div>
        {marca?.url && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-porcelana p-1 md:h-14 md:w-14">
            <Image
              src={marca.url}
              alt=""
              width={56}
              height={56}
              sizes="56px"
              className="h-full w-full object-contain"
            />
          </span>
        )}
      </div>
    </CartaoVidro>
  ) : undefined

  return (
    <section id="sobre" className="py-24 md:py-32">
      <div className="container grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Revelar className="lg:self-center">
          {rotulo && <Eyebrow>{rotulo}</Eyebrow>}

          <h2 className={cn('font-display text-display-lg text-tinta', rotulo && 'mt-5')}>
            Sobre mim
          </h2>

          {resumo && <p className="mt-5 text-lg text-tinta">{resumo}</p>}

          {/*
            Os paragrafos saem separados por linha em branco no painel. O
            `whitespace-pre-line` preserva a quebra simples dentro de um
            paragrafo, o mesmo recurso das respostas do FAQ.
          */}
          {paragrafos.length > 0 && (
            <div className="mt-5 space-y-4">
              {paragrafos.map((paragrafo, indice) => (
                <p key={indice} className="whitespace-pre-line leading-relaxed text-tinta-suave">
                  {paragrafo}
                </p>
              ))}
            </div>
          )}

          {formacao.length > 0 && <ListaVerificada itens={formacao} className="mt-8" />}

          <BotaoWhatsapp
            numero={whatsapp}
            mensagem={mensagemWhatsapp}
            local="sobre"
            className="mt-8 rounded-full"
          >
            Falar comigo no WhatsApp
          </BotaoWhatsapp>
        </Revelar>

        {/* Abaixo do `lg` a foto sobe para cima do texto pelo `order`. */}
        <AnimatedContent distance={40} scale={0.98} className="max-lg:order-first lg:h-full">
          {/* O `relative` e do carrossel, que e absoluto aqui dentro, e o
              `overflow-hidden` recorta as fotos no canto arredondado. */}
          <figure className="relative aspect-[4/5] overflow-hidden rounded-lg bg-areia lg:aspect-square lg:h-full xl:aspect-[5/4]">
            <CarrosselFotos
              fotos={fotosDoCarrossel}
              sizes="(max-width: 1024px) 100vw, 50vw"
              rotulo={`Fotos de ${nomeProfissional || 'a profissional'}`}
              rodape={cartao}
            />
          </figure>
        </AnimatedContent>
      </div>
    </section>
  )
}
