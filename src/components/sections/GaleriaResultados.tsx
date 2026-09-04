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
 * **A proporcao vem sempre da foto de `antes`**, para as duas metades ficarem com
 * a mesma altura. Sem isso, um antes em retrato com um depois em paisagem daria
 * um par torto e a comparacao perderia forca, que e a unica coisa que este
 * cartao existe para fazer.
 *
 * Como o enquadramento e por `object-cover`, a foto **precisa** do
 * `enquadramento`: e a regra do ponto de foco do projeto, e sem ela o recorte
 * escolhido no painel e ignorado em silencio.
 */
function MetadeDoPar({
  foto,
  alt,
  proporcao,
  rotulo,
  destaque,
  className,
}: {
  foto: NonNullable<ReturnType<typeof midia>>
  alt: string
  proporcao: string
  rotulo: string
  destaque?: boolean
  className?: string
}) {
  return (
    /*
      **O fio separador vai em `after`, e nao em `border`.** Com `box-sizing:
      border-box`, que e o padrao do Tailwind, uma borda de 1px come 1px da caixa:
      medido, a metade de baixo saia com 570px contra 571px da de cima, e as duas
      precisam bater exatamente, que e a razao de existir a proporcao unica. O
      pseudo elemento desenha por cima, sem ocupar espaco.

      **Ele muda de eixo junto com o cartao**: horizontal no topo da segunda
      metade quando o par esta empilhado, vertical na borda esquerda dela quando
      esta lado a lado.
    */
    <div className={cn('relative lg:w-1/2', className)} style={{ aspectRatio: proporcao }}>
      <Image
        src={foto.url!}
        alt={alt}
        fill
        // Duas colunas em 1376px de container com um vao de 20px dao 678px de
        // cartao, e a metade fica com 339px. No celular a metade ocupa a largura
        // toda do cartao, que e uma das duas colunas da tela.
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

    const largura = antes!.width || 4
    const altura = antes!.height || 5
    const proporcao = `${largura} / ${altura}`

    cartoes.push({
      id: resultado.id,
      // As duas metades tem a mesma altura, entao o cartao inteiro vale o dobro
      // de uma delas. E o unico numero que o empacotamento precisa.
      /*
        **A razao e a do desktop, e ela serve para os dois tamanhos de tela.**

        O cartao muda de forma por breakpoint: empilhado ele vale
        `2 x (altura / largura)`, lado a lado vale `(altura / largura) / 2`. Sao
        quatro vezes de diferenca, o que parece invalidar a conta em metade dos
        casos.

        Nao invalida: **o fator de 4 e o mesmo para todo cartao**, seja qual for a
        foto. Como ele e uniforme, a ordem entre as colunas nao muda, e a coluna
        mais alta no desktop e a mais alta no celular na mesma proporcao. Uma
        conta so equilibra os dois.
      */
      razao: altura / largura / 2,
      conteudo: (
        // As duas fotos ficam coladas, dentro do mesmo cartao arredondado, com um
        // fio separando. Assim o par le como uma peca so, que e o efeito dos
        // posts prontos que a clinica ja publica.
        // Empilhado no celular, lado a lado no `lg`. A proporcao de cada metade
        // nao muda de valor: como `aspectRatio` e relativo a largura, a mesma
        // proporcao serve nos dois casos, e a metade so fica com a metade da
        // altura quando passa a ocupar metade da largura.
        <div className="flex flex-col lg:flex-row">
          <MetadeDoPar
            foto={antes!}
            alt={antes!.alt || `${resultado.titulo}, antes do tratamento`}
            proporcao={proporcao}
            rotulo="Antes"
          />
          <MetadeDoPar
            foto={depois!}
            alt={depois!.alt || `${resultado.titulo}, ${momentoDepois}`}
            proporcao={proporcao}
            rotulo={emTratamento ? 'Em tratamento' : 'Depois'}
            destaque={emTratamento}
            className="after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-porcelana/40 after:content-[''] lg:after:inset-x-auto lg:after:inset-y-0 lg:after:left-0 lg:after:h-auto lg:after:w-px"
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

        <GaleriaParallax itens={cartoes} />
      </div>
    </section>
  )
}
