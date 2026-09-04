'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { registrarContatoWhatsapp } from '@/lib/analytics'
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
 * Caminho padrao para abrir o WhatsApp. Centraliza a montagem do link e o
 * disparo do evento, sem componente nenhum chamar gtag direto.
 *
 * **Quem grava e o `registrarContatoWhatsapp`, nao este arquivo.** O clique de
 * WhatsApp virou a conversao do site quando o formulario saiu, entao ele dispara
 * Ads, GA4 e Meta e ainda grava a UTM no painel. O botao flutuante nao usa este
 * componente, porque tem casca propria de Lottie, mas chama a mesma funcao: e
 * ela, e nao este botao, a porta unica.
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
        onClick={() => registrarContatoWhatsapp(local)}
      >
        {children}
      </a>
    </Button>
  )
}
