'use client'

import { MessageCircle } from 'lucide-react'
import { pushEvento } from '@/lib/analytics'
import { whatsappLink } from '@/lib/utils'

export function WhatsappFlutuante({ numero, mensagem }: { numero: string; mensagem?: string | null }) {
  return (
    <a
      href={whatsappLink(numero, mensagem || undefined)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => pushEvento('clique_whatsapp', { local: 'botao-flutuante' })}
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cacau text-porcelana shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
