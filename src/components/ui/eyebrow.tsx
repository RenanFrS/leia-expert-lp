import { cn } from '@/lib/utils'

/**
 * Pilula de rotulo que abre quase toda secao. O tom escuro e para quando ela
 * cai sobre cacau ou tinta, onde o caramelo cheio nao alcanca contraste.
 */
export function Eyebrow({
  children,
  tom = 'claro',
  className,
}: {
  children: React.ReactNode
  tom?: 'claro' | 'escuro'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-eyebrow font-mono uppercase',
        tom === 'claro'
          ? 'bg-areia/70 text-cacau-escuro'
          : 'bg-porcelana/10 text-porcelana ring-1 ring-inset ring-porcelana/15',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tom === 'claro' ? 'bg-caramelo' : 'bg-caramelo-claro',
        )}
      />
      {children}
    </span>
  )
}
