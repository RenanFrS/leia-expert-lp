import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'

type Props = {
  eyebrow?: string
  titulo: React.ReactNode
  apoio?: React.ReactNode
  alinhamento?: 'centro' | 'esquerda'
  tom?: 'claro' | 'escuro'
  /** Define o nivel do heading. A home tem um unico h1, que fica no hero. */
  como?: 'h2' | 'h3'
  className?: string
}

export function TituloSecao({
  eyebrow,
  titulo,
  apoio,
  alinhamento = 'esquerda',
  tom = 'claro',
  como: Heading = 'h2',
  className,
}: Props) {
  const centralizado = alinhamento === 'centro'

  return (
    <div
      className={cn(
        centralizado ? 'mx-auto max-w-2xl text-center' : 'max-w-xl',
        className,
      )}
    >
      {eyebrow && <Eyebrow tom={tom}>{eyebrow}</Eyebrow>}

      <Heading
        className={cn(
          'font-display text-display-lg',
          eyebrow && 'mt-5',
          tom === 'claro' ? 'text-tinta' : 'text-porcelana',
        )}
      >
        {titulo}
      </Heading>

      {apoio && (
        <p className={cn('mt-5 text-lg', tom === 'claro' ? 'text-tinta-suave' : 'text-porcelana/85')}>
          {apoio}
        </p>
      )}
    </div>
  )
}
