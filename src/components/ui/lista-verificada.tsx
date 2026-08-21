import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Lista de itens com selo de conferido. Aparece no Sobre, na Tricoscopia e nos
 * cartoes do bento, sempre com o mesmo desenho.
 */
export function ListaVerificada({
  itens,
  colunas = 1,
  tom = 'claro',
  className,
}: {
  itens: string[]
  colunas?: 1 | 2
  tom?: 'claro' | 'escuro'
  className?: string
}) {
  if (!itens.length) return null

  return (
    <ul
      className={cn(
        'grid gap-x-8 gap-y-4',
        colunas === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {itens.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
              tom === 'claro'
                ? 'bg-areia text-cacau-escuro'
                : 'bg-porcelana/12 text-caramelo-claro ring-1 ring-inset ring-porcelana/20',
            )}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
          <span className={cn('text-sm', tom === 'claro' ? 'text-tinta-suave' : 'text-porcelana/85')}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}
