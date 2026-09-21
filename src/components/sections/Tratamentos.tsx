import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { CamadaParallax } from '@/components/ui/camada-parallax'
import { FaixaInfinita } from '@/components/ui/faixa-infinita'
import { MidiaRotativa } from '@/components/ui/midia-rotativa'
import { urlDeEntrega } from '@/lib/cloudinary-url'
import { cn, midia } from '@/lib/utils'
import type { Tratamento } from '@/payload-types'

/**
 * Os tratamentos descem em zig-zag ao longo de uma espinha central: um fio de 1px
 * que sai do titulo e costura a secao inteira, com o numero de cada tratamento
 * marcado nele. O cartao alterna de lado e entra deslizando do proprio lado para
 * o centro, o primeiro pela direita, o de baixo pela esquerda.
 *
 * A espinha nao e enfeite. Ela e a leitura de densidade capilar que ja aparece na
 * textura do hero, e e o que da funcao ao contador: o numero deixa de valer como
 * ordem de importancia e passa a valer como posicao num percurso.
 *
 * Tres coisas aqui nao podem mudar sem quebrar alguma outra:
 *
 * 1. **O `overflow-x-clip` da secao.** O cartao nasce 120px fora do lugar, e sem
 *    o recorte esse deslocamento vira barra de rolagem horizontal na pagina
 *    inteira enquanto a animacao nao termina. E `clip` e nao `hidden` de
 *    proposito, para nao criar um container de rolagem novo.
 * 2. **O conector e `aria-hidden`.** O numero e informacao visual e o titulo do
 *    tratamento ja identifica o cartao. Anunciado, ele viraria um numero solto
 *    antes de cada artigo.
 * 3. **O zig-zag so liga no `lg`.** No `md` o cartao em 64% deixaria a coluna de
 *    texto mais estreita do que qualquer outra do site, entao ali ele volta a
 *    largura cheia e so a espinha continua, reta.
 */

type Props = {
  tratamentos: Tratamento[]
  /** Termos da faixa em movimento, do campo `faixaProblemas` da global Clinica. */
  problemas?: string[]
}

export function Tratamentos({ tratamentos, problemas = [] }: Props) {
  if (!tratamentos.length) return null

  const termos = problemas.map((termo) => termo.trim()).filter(Boolean)

  return (
    <section id="tratamentos" className="overflow-x-clip py-10 md:py-14">
      {/*
        O cabecalho e centralizado so nesta secao, porque e dele que a espinha
        nasce. Alinhado a esquerda, o fio central comecaria do nada.

        **A faixa de problemas fica entre o rotulo e o titulo, a pedido do
        cliente.** Ela ja foi uma secao propria, numa faixa areia logo abaixo do
        hero. Aqui ela nao tem fundo: uma faixa areia no meio do cabecalho
        separaria o rotulo do titulo dele. Por isso o cabecalho fica fora do
        `container`, e so o rotulo e o titulo voltam para dentro: a faixa corre de
        borda a borda da janela, como antes, com as pontas esmaecendo.
      */}
      <Revelar className="text-center">
        <p className="container text-eyebrow font-mono uppercase text-caramelo">O que tratamos</p>
        {termos.length > 0 && (
          <div className="mt-6 md:mt-8">
            <FaixaInfinita termos={termos} rotulo="Problemas capilares que tratamos" />
          </div>
        )}
        <div className="container">
          <h2
            className={cn(
              'mx-auto max-w-2xl font-display text-display-lg text-tinta',
              termos.length ? 'mt-6 md:mt-8' : 'mt-4',
            )}
          >
            Cada queixa pede um protocolo diferente.
          </h2>
        </div>
      </Revelar>

      <div className="container">
        {tratamentos.map((tratamento, indice) => {
          const arquivo = midia(tratamento.imagem)

          /*
            O campo aceita foto **ou** video, e por muito tempo o cartao
            renderizava `<Image>` sem olhar o tipo: video ali simplesmente nao
            aparecia. Quem resolve os dois casos e o `MidiaRotativa`, o mesmo do
            painel do hero, com um item so. Ele ja sabe escolher entre `<Image>`
            e `<video>`, poe o poster, respeita `prefers-reduced-motion` e cai
            na chapa de areia quando nao ha arquivo.

            Video aponta direto para a CDN, como no hero e na tricoscopia. A
            rota do Payload entrega o original: medido neste `.mov`, **17,6 MB
            contra 933 KB** pela CDN, e ela ainda nao responde a `Range`.

            **A transformacao fixa `f_mp4`, e nao `f_auto`.** Testado contra a
            conta real, o `f_auto` devolve o `.mov` ainda como
            `video/quicktime`. O Chrome toca assim mesmo, porque reconhece o
            H.264 por dentro, mas depender disso e apostar no sniffing do
            navegador. O peso e o mesmo nos dois, 933 KB, entao `f_mp4` sai de
            graca e declara o tipo certo. O `w_800` e a largura do cartao com
            folga para tela de 2x.
          */
          const fonte =
            arquivo?.filename && arquivo.mimeType?.startsWith('video/')
              ? urlDeEntrega(arquivo.filename, 'f_mp4,q_auto,w_800')
              : null
          // O par entra pela esquerda e fica docado a esquerda. A foto acompanha,
          // sempre na borda de fora, o que mantem o texto rente a espinha.
          const daEsquerda = indice % 2 === 1

          return (
            <div key={tratamento.id}>
              {/* O trecho de espinha que antecede o cartao. O primeiro nasce
                  esmaecido, como se o fio saisse do proprio titulo. */}
              <div aria-hidden className="flex flex-col items-center">
                <span
                  className={cn(
                    'h-10 w-px',
                    indice === 0 ? 'bg-gradient-to-b from-transparent to-tinta/15' : 'bg-tinta/15',
                  )}
                />
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-tinta/15 font-mono text-sm text-caramelo">
                  {String(indice + 1).padStart(2, '0')}
                </span>
                <span className="h-10 w-px bg-tinta/15" />
              </div>

              {/* O deslocamento vai no embrulho do AnimatedContent, que tambem e
                  quem doca o cartao no seu lado. `scale` fica em 1 porque o zoom
                  padrao embaralha a leitura de um movimento puramente lateral. */}
              <AnimatedContent
                direction="horizontal"
                reverse={daEsquerda}
                distance={120}
                scale={1}
                className={cn('lg:w-[64%]', daEsquerda ? 'lg:mr-auto' : 'lg:ml-auto')}
              >
                <article
                  id={tratamento.slug}
                  // O header e fixo e o carrossel do hero aponta para esta ancora.
                  className="scroll-mt-28 rounded-lg border border-tinta/10 bg-porcelana p-6 shadow-[0_18px_50px_-24px_rgba(46,33,26,0.45)] md:p-8"
                >
                  {/* Flex e nao grid porque as colunas sao de larguras diferentes:
                      com grid, o `order` da foto trocaria a posicao mas nao a
                      trilha, e a coluna estreita cairia no texto. */}
                  <div
                    className={cn(
                      'flex flex-col gap-8 md:flex-row md:items-stretch md:gap-10',
                      daEsquerda && 'md:flex-row-reverse',
                    )}
                  >
                    <div className="md:flex-1">
                      <h3 className="font-display text-display-md text-tinta">{tratamento.titulo}</h3>
                      <p className="mt-4 text-tinta-suave">{tratamento.resumo}</p>

                      {tratamento.indicacoes && tratamento.indicacoes.length > 0 && (
                        <ul className="mt-6 space-y-2">
                          {tratamento.indicacoes.map((indicacao) => (
                            <li key={indicacao.texto} className="flex gap-3 text-sm text-tinta-suave">
                              <span aria-hidden className="mt-2 h-px w-5 shrink-0 bg-caramelo" />
                              {indicacao.texto}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* O `min-h` e quem sustenta a foto quando o resumo e curto:
                        sem altura fixa no cartao, a linha do flex encolheria ate
                        o texto. */}
                    <figure className="relative aspect-[4/3] overflow-hidden rounded-lg bg-areia md:aspect-auto md:w-[38%] md:min-h-[17rem] md:shrink-0 lg:w-[36%]">
                      {arquivo?.url && (
                        <CamadaParallax preencher distancia="10%" reverso={daEsquerda}>
                          <MidiaRotativa
                            itens={[{ arquivo: fonte ? { ...arquivo, url: fonte } : arquivo }]}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 38vw, 24vw"
                            // A secao vive bem abaixo da dobra: sem isso o
                            // navegador baixaria e tocaria os videos dos quatro
                            // cartoes antes de alguem rolar ate eles.
                            soQuandoVisivel
                          />
                        </CamadaParallax>
                      )}
                    </figure>
                  </div>
                </article>
              </AnimatedContent>
            </div>
          )
        })}

        {/* A espinha termina esmaecendo, em vez de parar em bico no ultimo cartao. */}
        <span
          aria-hidden
          className="mx-auto block h-16 w-px bg-gradient-to-b from-tinta/15 to-transparent"
        />
      </div>
    </section>
  )
}
