'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

/**
 * O rotulo e frase normal, nao caixa alta em mono. Ele fica logo acima de um
 * campo alto e arredondado, e nesse par a etiqueta pequena em versalete somia:
 * o campo pesava e o nome dele nao.
 *
 * O rotulo nao fixa cor. Ela vem da secao, porque o formulario troca de fundo:
 * sobre porcelana o texto e neutro, sobre cacau precisa ser claro. Com a cor
 * presa aqui os rotulos sumiam dentro da secao de agendamento, marrom sobre
 * marrom.
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-sm font-medium', className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
