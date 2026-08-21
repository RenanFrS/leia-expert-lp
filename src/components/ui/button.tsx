import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { CamadaEspecular } from '@/components/ui/camada-especular'
import { cn } from '@/lib/utils'

/**
 * O brilho do hover e um pseudo elemento, nao um span, porque com `asChild` o
 * Slot exige um unico filho e qualquer elemento extra quebraria o componente.
 * O `isolate` com `before:-z-10` coloca o brilho acima do fundo e abaixo do
 * texto, senao ele lavaria o rotulo ao passar.
 */
const buttonVariants = cva(
  [
    'group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden',
    'whitespace-nowrap rounded-md text-sm font-medium',
    'transition-[transform,box-shadow,background-color,border-color,color] duration-300',
    'ease-suave',
    'hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(46,33,26,0.55)]',
    'active:translate-y-0 active:shadow-none',
    "before:pointer-events-none before:absolute before:inset-y-0 before:-left-full before:-z-10 before:w-full before:skew-x-12 before:bg-gradient-to-r before:from-transparent before:to-transparent before:transition-transform before:duration-700 before:ease-out before:content-['']",
    'hover:before:translate-x-[200%]',
    '[&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo focus-visible:ring-offset-2 focus-visible:ring-offset-porcelana',
    'disabled:pointer-events-none disabled:opacity-50',
    // Quem pediu menos movimento fica so com a troca de cor.
    'motion-reduce:transition-colors motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none',
    'motion-reduce:before:hidden motion-reduce:hover:[&_svg]:translate-x-0',
  ],
  {
    variants: {
      variant: {
        default: 'bg-cacau text-porcelana before:via-porcelana/25 hover:bg-cacau-escuro',
        outline:
          'border border-tinta/20 text-tinta before:via-cacau/10 hover:border-cacau hover:text-cacau',
        // Usado sobre as secoes escuras. O caramelo cheio nao separa do cacau,
        // entao a chamada inverte e vira clara.
        destaque: 'bg-porcelana text-cacau-escuro before:via-cacau/10 hover:bg-areia',
        ghost: 'text-tinta before:via-cacau/10 hover:bg-areia',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Liga o brilho especular na borda, que segue o cursor.
   *
   * E opt-in porque cada botao com ele abre um contexto WebGL, e o navegador
   * derruba os mais antigos passando de uns 16. Use so nos CTAs principais,
   * nunca em botao secundario nem no banner de consentimento.
   */
  especular?: boolean
}

/** Tom do especular por variante, seguindo a tabela de contraste do CLAUDE.md. */
const CORES_ESPECULAR = {
  default: { lineColor: '#E0B48C', baseColor: '#5C4133' },
  outline: { lineColor: '#966B54', baseColor: '#DDCCC2' },
  destaque: { lineColor: '#966B54', baseColor: '#DDCCC2' },
  ghost: { lineColor: '#966B54', baseColor: '#DDCCC2' },
} as const

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, especular = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const classe = cn(buttonVariants({ variant, size, className }))

    if (!especular) {
      return (
        <Comp className={classe} ref={ref} {...props}>
          {children}
        </Comp>
      )
    }

    const cores = CORES_ESPECULAR[variant ?? 'default']
    const camada = <CamadaEspecular lineColor={cores.lineColor} baseColor={cores.baseColor} />

    // Com asChild o Slot aceita um unico filho, entao a camada nao pode entrar
    // ao lado dele. Clonamos o filho e injetamos a camada dentro, junto do
    // conteudo que ele ja trazia. Quem chama nao precisa saber disso.
    if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
      return (
        <Slot className={classe} ref={ref} {...props}>
          {React.cloneElement(
            children,
            undefined,
            <React.Fragment key="camada">{camada}</React.Fragment>,
            <React.Fragment key="conteudo">{children.props.children}</React.Fragment>,
          )}
        </Slot>
      )
    }

    return (
      <Comp className={classe} ref={ref} {...props}>
        {camada}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
