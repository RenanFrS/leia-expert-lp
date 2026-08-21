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
    return (
      <Image
        src={marca.url}
        alt={marca.alt || nome}
        width={tamanho === 'lg' ? 224 : 168}
        height={tamanho === 'lg' ? 48 : 36}
        priority={prioridade}
        className={cn('w-auto object-contain', tamanho === 'lg' ? 'h-12' : 'h-9', className)}
      />
    )
  }

  return (
    <span className={cn('block leading-none', className)}>
      <span
        className={cn(
          'font-display uppercase tracking-[0.2em] text-tinta',
          tamanho === 'lg' ? 'text-2xl' : 'text-lg',
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
