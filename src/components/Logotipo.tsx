import Image from 'next/image'
import { cn, midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

type Props = {
  nome: string
  /** Upload da global Clinica. Sem imagem, cai no logotipo em texto. */
  logo?: Clinica['logo']
  tamanho?: 'md' | 'lg'
  /** Liga o priority do next/image. So vale para o logo do topo. */
  prioridade?: boolean
  className?: string
}

/**
 * Assinatura da marca. Usada no header, no rodape e na secao de duvidas, sempre
 * com o mesmo desenho, para o logotipo em texto nao divergir entre um e outro.
 */
export function Logotipo({ nome, logo, tamanho = 'md', prioridade = false, className }: Props) {
  const marca = midia(logo)

  if (marca?.url) {
    // As medidas intrinsecas saem do proprio arquivo, nao de um numero fixo. O
    // logotipo desta clinica e quadrado, 500x500, e o par 168x36 que estava aqui
    // descrevia um wordmark deitado: o `next/image` reservava a caixa na
    // proporcao errada. Quem manda no tamanho na tela e a altura da classe, com
    // `w-auto`, entao um logotipo mais largo continua funcionando.
    const largura = marca.width || 500
    const altura = marca.height || 500

    return (
      <Image
        src={marca.url}
        alt={marca.alt || nome}
        width={largura}
        height={altura}
        priority={prioridade}
        className={cn('w-auto object-contain', tamanho === 'lg' ? 'h-20' : 'h-14', className)}
      />
    )
  }

  return (
    <span className={cn('block leading-none', className)}>
      <span
        className={cn(
          'font-display uppercase tracking-[0.2em] text-tinta',
          tamanho === 'lg' ? 'text-3xl' : 'text-xl',
        )}
      >
        {nome}
      </span>
      <span className="mt-1.5 block font-mono text-[0.5625rem] uppercase tracking-[0.32em] text-neutro">
        Tricologia clínica
      </span>
    </span>
  )
}
