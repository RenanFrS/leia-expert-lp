import { cn } from '@/lib/utils'

/**
 * Cartao translucido que fica por cima de foto, usado no Sobre, na Tricoscopia,
 * nas Duvidas e no Agendamento.
 *
 * O fundo tem opacidade alta de proposito: sobre foto clara um vidro fraco
 * derruba o contraste do texto, e aqui sempre corre texto por cima. Vale para os
 * dois tons.
 */
export function CartaoVidro({
  children,
  tom = 'escuro',
  className,
}: {
  children: React.ReactNode
  /** O claro e para cartao de dado sobre foto, quando a secao ja e escura. */
  tom?: 'claro' | 'escuro'
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg p-6 shadow-[0_18px_50px_-20px_rgba(46,33,26,0.7)] backdrop-blur-md',
        tom === 'escuro'
          ? 'border border-porcelana/25 bg-gradient-to-br from-cacau-escuro/85 to-cacau/75 text-porcelana'
          : 'border border-tinta/10 bg-porcelana/95 text-tinta',
        className,
      )}
    >
      {children}
    </div>
  )
}
