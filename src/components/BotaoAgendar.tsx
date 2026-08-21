'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { pushEvento } from '@/lib/analytics'

type Props = {
  /** Identifica de onde partiu o clique no relatorio da agencia. */
  local: string
  children: React.ReactNode
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  especular?: boolean
  className?: string
}

/**
 * CTA que rola ate o formulario. Existe para o evento sair de secao que e
 * server component, sem precisar mandar a secao inteira para o cliente.
 *
 * O evento e `clique_agendar`, nunca `clique_whatsapp`: sao caminhos diferentes
 * e a agencia otimiza campanha em cima dessa diferenca.
 */
export function BotaoAgendar({ local, children, variant, size, especular, className }: Props) {
  return (
    <Button asChild variant={variant} size={size} especular={especular} className={className}>
      <a href="#agendar" onClick={() => pushEvento('clique_agendar', { local })}>
        {children}
      </a>
    </Button>
  )
}
