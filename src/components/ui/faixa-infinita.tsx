'use client'

import { CircleCheck } from 'lucide-react'
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type Props = {
  termos: string[]
  /** Nome da lista para leitor de tela. */
  rotulo: string
  /** Pixels por segundo. */
  velocidade?: number
}

/** Tempo, em segundos, que a velocidade leva para chegar perto do alvo. */
const AMORTECIMENTO = 0.25

type ListaProps = HTMLAttributes<HTMLUListElement> & {
  termos: string[]
  /** Pilula menor no celular, para a lista parada quebrar em menos linhas. */
  compacta?: boolean
}

/**
 * Uma volta da lista. O `pr-3` e o mesmo espaco do `gap`, e fica dentro da
 * largura medida: e ele que faz a emenda entre uma copia e a proxima ter o mesmo
 * respiro que ha entre duas pilulas.
 */
const Lista = forwardRef<HTMLUListElement, ListaProps>(({ termos, compacta, ...props }, ref) => (
  <ul ref={ref} className="flex shrink-0 items-center gap-3 pr-3" {...props}>
    {termos.map((termo, indice) => (
      <li key={`${indice}-${termo}`}>
        <Pilula termo={termo} compacta={compacta} />
      </li>
    ))}
  </ul>
))
Lista.displayName = 'Lista'

function Pilula({ termo, compacta }: { termo: string; compacta?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-cacau/15 bg-porcelana py-2 pl-2.5 pr-5 text-base text-tinta-suave md:text-lg',
        compacta && 'gap-2 py-1.5 pl-2 pr-4 text-sm md:gap-2.5 md:py-2 md:pl-2.5 md:pr-5',
      )}
    >
      <CircleCheck
        aria-hidden
        strokeWidth={1.75}
        className={cn('h-5 w-5 shrink-0 text-caramelo', compacta && 'h-4 w-4 md:h-5 md:w-5')}
      />
      {termo}
    </span>
  )
}

/**
 * Fileira de termos que corre sem parar, da esquerda para a direita. Inspirada
 * no Logo Loop do React Bits, `reactbits.dev/animations/logo-loop`, e
 * reconstruida com o que o projeto ja tem, sem dependencia nova.
 *
 * - **O movimento e por `requestAnimationFrame`**, escrevendo o `transform`
 *   direto no trilho, sem estado do React por quadro. A posicao e
 *   `deslocamento - L`, com o deslocamento dando a volta em `L`, a largura de
 *   uma copia. Como as copias sao identicas, a volta nao aparece.
 * - **A velocidade persegue o alvo com amortecimento**, como no original: com o
 *   mouse em cima a faixa desacelera ate parar, em vez de travar de uma vez.
 * - **So a primeira copia vem do servidor.** As outras entram depois de montar,
 *   com `aria-hidden`, na quantidade que a largura pede. Assim o HTML que o
 *   Google le e o leitor de tela anuncia traz cada termo uma vez, sem
 *   repeticao de palavra chave, e lista curta no painel nao deixa buraco.
 * - **Nao ha botao de pausa, a pedido do cliente**, que quer a faixa sempre
 *   andando. Ja houve um, e ele saiu. Quem para a faixa e o mouse em cima, e
 *   quem pediu menos movimento no sistema recebe a lista parada.
 * - **As bordas esmaecem por `mask-image`** no trilho, como no original.
 * - **Fora da tela o laco para**, pelo `IntersectionObserver`.
 * - **`prefers-reduced-motion` troca a fileira por pilulas quebrando linha**,
 *   todas visiveis e sem copia. No celular elas encolhem: com o tamanho
 *   normal, as 13 da lista inicial davam 11 linhas e 648px de faixa.
 */
export function FaixaInfinita({ termos, rotulo, velocidade = 45 }: Props) {
  const moldura = useRef<HTMLDivElement>(null)
  const trilho = useRef<HTMLDivElement>(null)
  const primeira = useRef<HTMLUListElement>(null)
  const largura = useRef(0)
  const emCima = useRef(false)
  const [copias, setCopias] = useState(0)
  const [reduzido, setReduzido] = useState(false)

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = () => setReduzido(consulta.matches)
    aoMudar()
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  // Quantas copias cobrem a faixa: a largura dela dividida pela de uma volta,
  // mais uma, que e a que entra pela esquerda enquanto a ultima sai.
  useEffect(() => {
    const caixa = moldura.current
    const lista = primeira.current
    if (reduzido || !caixa || !lista) return
    const medir = () => {
      largura.current = lista.offsetWidth
      if (largura.current) {
        setCopias(Math.max(1, Math.ceil(caixa.offsetWidth / largura.current) + 1))
      }
    }
    const observador = new ResizeObserver(medir)
    observador.observe(caixa)
    observador.observe(lista)
    return () => observador.disconnect()
  }, [reduzido, termos])

  useEffect(() => {
    const caixa = moldura.current
    const faixa = trilho.current
    if (reduzido || !copias || !caixa || !faixa) return

    let quadro = 0
    let anterior = 0
    let deslocamento = 0
    let atual = velocidade
    let rodando = false

    const passo = (agora: number) => {
      // Trava o intervalo em 100ms: ao voltar de outra aba o primeiro quadro
      // chegaria com segundos de atraso e a faixa daria um salto.
      const dt = anterior ? Math.min((agora - anterior) / 1000, 0.1) : 0
      anterior = agora
      const alvo = emCima.current ? 0 : velocidade
      atual += (alvo - atual) * (1 - Math.exp(-dt / AMORTECIMENTO))
      const volta = largura.current
      if (volta && atual * dt > 0.001) {
        deslocamento = (deslocamento + atual * dt) % volta
        faixa.style.transform = `translate3d(${deslocamento - volta}px, 0, 0)`
      }
      quadro = requestAnimationFrame(passo)
    }

    // Posicao inicial ja com a copia de reserva a esquerda, antes do primeiro
    // quadro. Como as copias sao iguais, a troca nao aparece.
    faixa.style.transform = `translate3d(${-largura.current}px, 0, 0)`

    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting && !rodando) {
        rodando = true
        anterior = 0
        quadro = requestAnimationFrame(passo)
      } else if (!entrada.isIntersecting && rodando) {
        rodando = false
        cancelAnimationFrame(quadro)
      }
    })
    observador.observe(caixa)

    return () => {
      observador.disconnect()
      cancelAnimationFrame(quadro)
    }
  }, [reduzido, copias, velocidade])

  if (reduzido) {
    return (
      <div className="container">
        <Lista
          termos={termos}
          compacta
          aria-label={rotulo}
          className="flex flex-wrap justify-center gap-2 md:gap-3"
        />
      </div>
    )
  }

  return (
    <div
      ref={moldura}
      // So o ponteiro de mouse pausa. No toque o `pointerenter` dispara com o
      // dedo e a faixa ficaria parada ate a pessoa tocar em outro lugar.
      onPointerEnter={(evento) => {
        if (evento.pointerType === 'mouse') emCima.current = true
      }}
      onPointerLeave={() => {
        emCima.current = false
      }}
      className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_3rem,black_calc(100%-3rem),transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_7rem,black_calc(100%-7rem),transparent)]"
    >
      <div ref={trilho} className="flex w-max will-change-transform">
        <Lista ref={primeira} termos={termos} aria-label={rotulo} />
        {Array.from({ length: copias }).map((_, indice) => (
          <Lista key={indice} termos={termos} aria-hidden />
        ))}
      </div>
    </div>
  )
}
