import { ArrowUpRight, Star } from 'lucide-react'

import { BotaoAgendar } from '@/components/BotaoAgendar'
import { Revelar } from '@/components/Revelar'
import { CarrosselTratamentos, type ItemCarrossel } from '@/components/ui/carrossel-tratamentos'
import { MidiaRotativa } from '@/components/ui/midia-rotativa'
import { urlDeEntrega } from '@/lib/cloudinary-url'
import { cn, midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

type Props = {
  nome: string
  chamada?: string | null
  tratamentos: ItemCarrossel[]
  painel?: Clinica['heroPainel']
  intervalo?: number | null
}

/**
 * Reconstrucao do `hero12` do React Bits, que e bloco pago e nao tem codigo
 * publico. O que existe aqui foi remontado com os primitivos do projeto a
 * partir da referencia visual, nao e codigo copiado. Mesma situacao do
 * `about14` e do `contact34`.
 *
 * A silhueta e um painel de midia unico com o titulo recortado no canto
 * superior esquerdo. **Nao ha mascara nem `clip-path`**: o canto invertido e o
 * proprio arredondamento do bloco porcelana visto pelo lado de fora.
 *
 * O titulo fica **fora** da imagem, que e o que define este bloco. Dentro dela
 * ficam a chamada com as estrelas, o CTA e o carrossel de tratamentos.
 *
 * Duas coisas sustentam a montagem e nao podem mudar sem quebrar o desenho:
 *
 * 1. **O titulo vem primeiro no DOM.** No `lg` ele sai do fluxo e vira o
 *    recorte, mas continua sendo o primeiro elemento lido. Se ele descer para
 *    depois do painel, o leitor de tela anuncia a chamada e o carrossel antes
 *    do `h1` da pagina.
 * 2. **O painel e o unico filho em fluxo no `lg`.** E por isso que a altura da
 *    caixa e a dele, e por isso que o CTA e o carrossel, absolutos, se alinham
 *    ao painel sem precisar estar dentro dele. Assim cada um e montado uma vez
 *    so, em vez de uma copia para telefone e outra para desktop.
 */
/**
 * Filete que arredonda o canto da midia onde ela emerge de tras do titulo.
 *
 * Sao tres pontos assim na silhueta, e em todos a midia forma um canto superior
 * esquerdo. Sem o filete esse canto sai reto, em bico, porque `border-radius`
 * nao alcanca: o vertice nasce do encontro de duas caixas diferentes e nao e
 * canto de elemento nenhum.
 *
 * O quadrado tem o tamanho do raio e o gradiente deixa transparente o disco
 * centrado no canto inferior direito dele, pintando o resto de porcelana. E
 * exatamente o negativo de um canto arredondado, entao o arco encosta tangente
 * nas duas bordas vizinhas e nao aparece emenda.
 *
 * **O raio acompanha o `rounded-br` das linhas do titulo.** Mudou la, muda aqui.
 *
 * Cor crua no gradiente inline pelo mesmo motivo da textura do hero: `theme()`
 * nao resolve dentro de `style`. E o porcelana.
 */
function FileteCanto({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('absolute hidden h-7 w-7 lg:block', className)}
      style={{ background: 'radial-gradient(circle at 100% 100%, transparent 27.5px, #FFFFFF 28px)' }}
    />
  )
}

export function Hero({ nome, chamada, tratamentos, painel, intervalo }: Props) {
  const texto =
    chamada ||
    `Na ${nome}, cada protocolo começa por um exame de tricoscopia. O tratamento certo depende do diagnóstico certo.`

  /*
    O video do painel aponta direto para a CDN do Cloudinary, com `f_auto,q_auto`.
    Sem isso ele sairia pela URL que o Payload grava, `/api/media/file/...`, e ali
    tres coisas dao errado de uma vez: o arquivo vem sem transformacao nenhuma, o
    `staticHandler` nao responde a `Range`, entao nao ha reproducao progressiva, e
    os bytes ainda passam pelo servidor do Next em vez da CDN. Medido neste
    arquivo: 26,6 MB pela rota do Payload contra 5,1 MB pela CDN.

    Vale so para video. Imagem continua saindo pela rota do Payload, porque quem
    otimiza ela e o `next/image`, e mexer nisso mudaria a midia do site inteiro.

    Este componente e server component, entao a leitura de `CLOUDINARY_CLOUD_NAME`
    fica no servidor e a chave nao vai para o navegador.
  */
  const painelResolvido = painel?.map((item) => {
    const arquivo = midia(item.arquivo)
    if (!arquivo?.filename || !arquivo.mimeType?.startsWith('video/')) return item

    const url = urlDeEntrega(arquivo.filename)
    return url ? { ...item, arquivo: { ...arquivo, url } } : item
  })

  return (
    // `overflow-x-clip` por causa da entrada lateral do titulo: ele nasce 48px a
    // esquerda, o que passa da borda da tela, e sem o recorte isso vira barra de
    // rolagem horizontal enquanto a animacao nao termina.
    // O `pt` acompanha a altura do header fixo, que passou a 96px quando o
    // logotipo cresceu para 56px. Com o `pt-28` de antes sobravam 16px entre a
    // barra e o titulo, e a frase encostava nela.
    <section id="topo" className="overflow-x-clip pt-32 pb-16 md:pt-36 md:pb-20">
      <div className="container">
        <div className="relative isolate flex flex-col gap-6 lg:block lg:gap-0">
          {/*
            O recorte do titulo. Primeiro no DOM, absoluto so no lg.

            Sao **dois blocos empilhados**, um por linha do titulo, e nao um
            bloco so. Cada um encolhe ate a largura do proprio texto e leva o
            canto inferior direito arredondado, entao a borda entre eles vira
            uma escada: a linha de cima e larga, a de baixo e curta, e a midia
            aparece no degrau. Com um bloco unico o recorte seria um retangulo
            e a forma da referencia se perde.

            A primeira linha precisa continuar mais larga que a segunda. Se o
            titulo mudar, confira isso, senao os dois degraus ficam do mesmo
            tamanho e a escada some.
          */}
          <div className="lg:absolute lg:left-0 lg:top-0 lg:z-10 lg:max-w-full">
            {/* Entra pela esquerda, nao de baixo. Subindo, o bloco branco do
                recorte passava por cima da midia; deslizando, ele acompanha a
                leitura da frase e descobre o degrau da escada. */}
            <Revelar direcao="esquerda">
              {/*
                As duas linhas vivem dentro do mesmo `h1`. Cada `span` e que
                vira um degrau, entao nao mova nenhuma para fora do heading: o
                titulo da pagina passaria a ser so metade da frase.

                Nao ha eyebrow aqui de proposito. Ele seria um terceiro bloco,
                estreito, entre o topo e a linha larga, e a silhueta viraria um
                zigue-zague em vez da escada. O eyebrow segue nas outras secoes.
              */}
              <h1 className="font-display text-display-xl text-tinta">
                {/* O `pb` nao e respiro: o `display-xl` tem entrelinha 0.98, mais
                    apertada que o descendente da fonte, e sem ele a cedilha de
                    "começa" vaza para fora do bloco, em cima da midia. */}
                <span className="relative block lg:w-fit lg:rounded-br-[28px] lg:bg-porcelana lg:pb-4 lg:pr-10 lg:pt-1">
                  Cabelo saudável começa
                  {/* Onde a midia comeca, no alto, logo a esquerda do CTA. */}
                  <FileteCanto className="left-full top-0" />
                </span>
                <span className="relative block lg:w-fit lg:rounded-br-[28px] lg:bg-porcelana lg:pb-8 lg:pr-10">
                  na raiz.
                  {/* O degrau, entre a linha larga e a curta. */}
                  <FileteCanto className="left-full top-0" />
                  {/* Onde a midia comeca abaixo do titulo, na borda esquerda. */}
                  <FileteCanto className="left-0 top-full" />
                </span>
              </h1>
            </Revelar>
          </div>

          {/* O painel e o LCP da pagina. */}
          <div className="relative h-[440px] overflow-hidden rounded-[28px] bg-areia sm:h-[520px] lg:h-[640px]">
            <MidiaRotativa
              itens={painelResolvido}
              intervalo={intervalo}
              prioridade
              sizes="(max-width: 1200px) 100vw, 1200px"
            />

            {/*
              Veu de baixo para cima. Sobre foto qualquer, texto solto nao tem
              contraste garantido, e e ele que mantem a chamada em porcelana
              legivel seja qual for a imagem que a clinica subir.
            */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-tinta/85 via-tinta/45 to-transparent"
            />

            {/* Chamada e estrelas, dentro da imagem. */}
            <div className="absolute inset-x-6 bottom-6 lg:inset-x-10 lg:bottom-10 lg:max-w-md">
              <Revelar>
                <p className="text-base text-porcelana sm:text-lg">{texto}</p>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex" aria-hidden>
                    {Array.from({ length: 5 }).map((_, indice) => (
                      <Star key={indice} className="h-4 w-4 fill-caramelo-claro text-caramelo-claro" />
                    ))}
                  </div>
                  <span className="text-sm text-porcelana/85">
                    Avaliações reais de pacientes no Google
                  </span>
                </div>
              </Revelar>
            </div>
          </div>

          {/* CTA: em fluxo no telefone, sobre a imagem no lg. */}
          <div className="lg:absolute lg:right-4 lg:top-4 lg:z-10">
            <BotaoAgendar local="hero" especular className="w-full lg:w-auto">
              Agendar avaliação
              <ArrowUpRight className="h-4 w-4" />
            </BotaoAgendar>
          </div>

          {/* Carrossel: em fluxo no telefone, sobre a imagem no lg. */}
          <div className="lg:absolute lg:bottom-10 lg:right-10 lg:z-10 lg:w-[320px]">
            <CarrosselTratamentos itens={tratamentos} intervalo={intervalo} />
          </div>
        </div>

      </div>
    </section>
  )
}
