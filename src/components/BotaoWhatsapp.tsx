'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { pushEvento } from '@/lib/analytics'
import { MENSAGEM_WHATSAPP_PADRAO, whatsappLink } from '@/lib/utils'

type Props = {
  numero: string
  /** Vem do painel. Vazio, cai na mensagem padrao. */
  mensagem?: string | null
  /** Identifica de onde partiu o clique no relatorio da agencia. */
  local: string
  children?: React.ReactNode
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  /**
   * Brilho especular na borda. Opt-in porque cada instancia abre um contexto
   * WebGL, e o navegador derruba os mais antigos passando de uns 16, com teto
   * menor no celular. Nao espalhe pelos botoes.
   */
  especular?: boolean
  className?: string
}

/**
 * Unico caminho para abrir o WhatsApp. Centraliza a montagem do link e garante
 * que todo clique entre no dataLayer, sem componente nenhum chamar gtag direto.
 */
export function BotaoWhatsapp({
  numero,
  mensagem,
  local,
  children = 'Falar no WhatsApp',
  variant,
  size,
  especular,
  className,
}: Props) {
  if (!numero) return null

  return (
    <Button asChild variant={variant} size={size} especular={especular} className={className}>
      <a
        href={whatsappLink(numero, mensagem || MENSAGEM_WHATSAPP_PADRAO)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => pushEvento('clique_whatsapp', { local })}
      >
        {children}
      </a>
    </Button>
  )
}
