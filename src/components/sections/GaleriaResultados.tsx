import Image from 'next/image'

import { GaleriaParallax, type CartaoDaGrade } from '@/components/ui/galeria-parallax'
import { cn, enquadramento, midia } from '@/lib/utils'
import type { Resultado } from '@/payload-types'

/**
 * Antes e depois em formato estatico, logo abaixo do comparador.
 *
 * **Ela mostra exatamente os mesmos casos do carrossel**, e isso e proposital: o
 * comparador exige arrastar a divisa, e quem nao arrasta ve so a foto de antes e
 * vai embora achando que nao ha resultado nenhum. Aqui as duas fotos ja chegam
 * visiveis, empilhadas, e a leitura acontece na rolagem.
 *
 * Por isso ela **le a colecao `resultados`**, a mesma que alimenta o carrossel, e
 * nao uma colecao propria. Nao ha consulta nova na pagina: o array e o mesmo.
 *
 * **Sem titulo e sem ancora, a pedido do cliente.** Ela le como continuacao
 * visual da secao Resultados, que fica logo acima e ja traz o titulo e a
 * explicacao. Um segundo cabecalho ali criaria a impressao de duas secoes
 * falando da mesma coisa.
 *
 * **O `h2` em `sr-only` nao contradiz isso.** Uma faixa so de imagens, sem nome
 * nenhum, some do outline da pagina e chega no leitor de tela como um monte de
 * foto solta depois do carrossel. Ele nomeia a regiao sem aparecer.
 */

/**
 * Uma foto do par, na proporcao que o cartao inteiro segue.
 *
 * **A proporcao e fixa em 4/5, a mesma do comparador interativo logo acima.**
 * Ela ja veio da foto de `antes` de cada caso, o que dava cartoes de alturas
 * diferentes; o cliente pediu cartao padronizado. Como o comparador enquadra em
 * `aspect-[4/5]`, usar o mesmo valor faz as duas secoes mostrarem o mesmo recorte
 * do mesmo caso, em vez de dois enquadramentos concorrentes.
 *
 * **Padronizar significa recortar, e o ponto de foco passou a mandar muito
 * mais.** Medido nos 10 casos cadastrados: seis sao quase quadrados e mostram
 * ~78% da largura, enquanto os dois mais altos, alopecia areata e risca central
 * feminina, mostram 64% e 70% da altura. Com `object-cover` quem decide o que
 * sobrevive e o `focalPoint` do painel, entao **caso novo com enquadramento
 * ruim se conserta la, e nao aqui**.
 *
 * Sem o `enquadramento` a foto ignora esse ponto de foco em silencio, que e a
 * regra do projeto para toda imagem em `object-cover`.
 */
function MetadeDoPar({
  foto,
  alt,
  rotulo,
  destaque,
  className,
}: {
  foto: NonNullable<ReturnType<typeof midia>>
  alt: string
  rotulo: string
  destaque?: boolean
  className?: string
}) {
  return (
    /*
      **O fio separador vai em `after`, e nao em `border`.** Com `box-sizing:
      border-box`, que e o padrao do Tailwind, uma borda de 1px come 1px da caixa:
      medido, a metade de baixo saia com 570px contra 571px da de cima, e as duas
      precisam bater exatamente. O pseudo elemento desenha por cima, sem ocupar
      espaco.

      Ele e sempre vertical, na borda esquerda da segunda metade, porque o par e
      lado a lado em qualquer tela.
    */
    <div className={cn('relative aspect-[4/5] w-1/2', className)}>
      <Image
        src={foto.url!}
        alt={alt}
        fill
        // Duas colunas em 1376px de container com um vao de 20px dao 678px de
        // cartao, e a metade fica com 339px. No celular a grade e uma coluna so,
        // entao a metade fica com metade da tela, perto dos 50vw.
        sizes="(max-width: 1024px) 50vw, 340px"
        className="object-cover"
        style={enquadramento(foto)}
      />

      {/*
        Mesmo criterio de pilula do comparador, e a parte da cor e conta, nao
        gosto: a de caso em andamento **precisa ser opaca**. Em `bg-porcelana/90`
        com `text-caramelo`, sobre foto escura, ela da 3.70 e reprova. Em
        `bg-caramelo` cheio com `text-porcelana` sao 4.64, acima do piso de 4.5.
        Trocou o token, refaca a conta: a folga ali e de 0.14.
      */}
      <span
        className={cn(
          'absolute left-3 top-3 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm',
          destaque ? 'bg-caramelo text-porcelana' : 'bg-porcelana/90 text-tinta',
        )}
      >
        {rotulo}
      </span>
    </div>
  )
}

export function GaleriaResultados({ resultados }: { resultados: Resultado[] }) {
  const cartoes: CartaoDaGrade[] = []

  for (const resultado of resultados) {
    const antes = midia(resultado.antes)
    const depois = midia(resultado.depois)

    // Video e descartado aqui, na entrada da grade: a Media aceita os dois tipos
    // e o otimizador do Next responde 400 para um `.mp4`, o que deixaria um
    // buraco no cartao sem erro nenhum na tela.
    const valida = (item: typeof antes) =>
      Boolean(item?.url && item.mimeType?.startsWith('image/'))
    if (!valida(antes) || !valida(depois)) continue

    /*
      Caso ainda em andamento: a segunda foto e do meio do tratamento, e nao do
      fim. **A afirmacao aparece em dois lugares aqui**, a pilula e o texto
      alternativo de reserva, e eles mudam juntos. Deixar um para tras faz o
      cartao dizer duas coisas, e dizer "Depois" sobre foto de meio de tratamento
      e afirmar que o caso terminou quando ele nao terminou.
    */
    const emTratamento = Boolean(resultado.emTratamento)
    const momentoDepois = emTratamento ? 'durante o tratamento' : 'depois do tratamento'

    cartoes.push({
      id: resultado.id,
      /*
        **Todo cartao tem a mesma razao**, porque a proporcao de cada metade e
        fixa em 4/5 desde que o cliente pediu cartao padronizado. Com as duas
        metades lado a lado, o cartao fica com metade da altura de uma delas:
        `(5 / 4) / 2`, em qualquer tela.

        Com todas iguais o empacotamento vira alternancia simples entre as duas
        colunas, e nao vale a pena simplifica-lo por isso: **a mesma grade serve o
        `AClinica`**, onde cada cartao e uma foto na propria proporcao e o
        equilibrio volta a fazer trabalho de verdade.
      */
      razao: 5 / 4 / 2,
      conteudo: (
        // As duas fotos ficam coladas, dentro do mesmo cartao arredondado, com um
        // fio separando. Assim o par le como uma peca so, que e o efeito dos
        // posts prontos que a clinica ja publica.
        //
        // **Lado a lado em qualquer tela, a pedido do cliente.** No celular ja foi
        // empilhado, antes em cima e depois embaixo, e ele reportou que ficou
        // estranho: quem ve antes e depois espera uma foto do lado da outra. Para
        // caber, a grade desta secao vira uma coluna so no celular.
        <div className="flex">
          <MetadeDoPar
            foto={antes!}
            alt={antes!.alt || `${resultado.titulo}, antes do tratamento`}
            rotulo="Antes"
          />
          <MetadeDoPar
            foto={depois!}
            alt={depois!.alt || `${resultado.titulo}, ${momentoDepois}`}
            rotulo={emTratamento ? 'Em tratamento' : 'Depois'}
            destaque={emTratamento}
            className="after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-porcelana/40 after:content-['']"
          />
        </div>
      ),
    })
  }

  // Some inteira enquanto nao houver caso publicado. E o que permite subir o
  // codigo antes do conteudo, ja que a home e ISR contra o banco de producao.
  if (!cartoes.length) return null

  return (
    <section aria-labelledby="galeria-resultados" className="pb-24 md:pb-32">
      <div className="container">
        <h2 id="galeria-resultados" className="sr-only">
          Antes e depois de cada caso
        </h2>

        {/* Uma coluna no celular: com duas, o par lado a lado deixaria cada foto
            com ~84px, pequena demais para enxergar a diferenca de densidade. */}
        <GaleriaParallax itens={cartoes} colunasNoCelular={1} />
      </div>
    </section>
  )
}
