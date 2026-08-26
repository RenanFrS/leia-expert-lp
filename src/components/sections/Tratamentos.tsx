import Image from 'next/image'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { CamadaParallax } from '@/components/ui/camada-parallax'
import { cn, enquadramento, midia } from '@/lib/utils'
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

export function Tratamentos({ tratamentos }: { tratamentos: Tratamento[] }) {
  if (!tratamentos.length) return null

  return (
    <section id="tratamentos" className="overflow-x-clip py-24 md:py-32">
      <div className="container">
        {/* O cabecalho e centralizado so nesta secao, porque e dele que a espinha
            nasce. Alinhado a esquerda, o fio central comecaria do nada. */}
        <Revelar className="text-center">
          <p className="text-eyebrow font-mono uppercase text-caramelo">O que tratamos</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-display-lg text-tinta">
            Cada queixa pede um protocolo diferente.
          </h2>
        </Revelar>

        {tratamentos.map((tratamento, indice) => {
          const imagem = midia(tratamento.imagem)
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
                      {imagem?.url && (
                        <CamadaParallax preencher distancia="10%" reverso={daEsquerda}>
                          <Image
                            src={imagem.url}
                            alt={imagem.alt || tratamento.titulo}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 38vw, 24vw"
                            className="object-cover"
                            loading={indice === 0 ? 'eager' : 'lazy'}
                            style={enquadramento(imagem)}
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
