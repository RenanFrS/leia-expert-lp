import type { Payload } from 'payload'

import { rotuloDoMotivo } from '@/lib/motivos'

/**
 * Aviso de lead novo por email, disparado depois que o lead ja esta gravado.
 * Falha de envio por isso nunca vira erro para quem preencheu o formulario, o
 * pior caso e a clinica descobrir o lead abrindo o painel.
 */

type LeadRecebido = {
  nome?: string | null
  email?: string | null
  whatsapp?: string | null
  motivo?: string | null
  mensagem?: string | null
  origem?: Record<string, string | null | undefined> | null
}

const escapar = (texto: string) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const linha = (rotulo: string, valor?: string | null) =>
  valor ? `<p style="margin:0 0 10px"><strong>${rotulo}:</strong> ${escapar(valor)}</p>` : ''

export const avisarLeadNovo = async (payload: Payload, lead: LeadRecebido) => {
  try {
    const clinica = await payload.findGlobal({ slug: 'clinica', depth: 0 })
    // O campo dedicado manda, e o email publico da clinica serve de reserva.
    const destino = clinica?.emailAvisoLead || clinica?.email
    if (!destino) return

    const origem = lead.origem || {}
    const campanha = [origem.utm_source, origem.utm_medium, origem.utm_campaign]
      .filter(Boolean)
      .join(' / ')

    const numero = (lead.whatsapp || '').replace(/\D/g, '')
    const atalho = numero
      ? `<p style="margin:24px 0 0"><a href="https://wa.me/${numero}" style="background:#775642;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Responder no WhatsApp</a></p>`
      : ''

    await payload.sendEmail({
      to: destino,
      subject: `Lead novo: ${lead.nome || 'sem nome'} (${rotuloDoMotivo(lead.motivo)})`,
      html: `
        <div style="font-family:system-ui,sans-serif;color:#2E211A;max-width:520px">
          <h1 style="font-size:18px;margin:0 0 20px">Chegou um lead pelo site</h1>
          ${linha('Nome', lead.nome)}
          ${linha('WhatsApp', lead.whatsapp)}
          ${linha('E mail', lead.email)}
          ${linha('Motivo', rotuloDoMotivo(lead.motivo))}
          ${linha('Mensagem', lead.mensagem)}
          ${linha('Campanha', campanha)}
          ${linha('Pagina', origem.pagina)}
          ${atalho}
          <p style="margin:24px 0 0;font-size:13px;color:#78685E">
            O cadastro completo esta no painel, em Atendimento e Leads.
          </p>
        </div>
      `,
    })
  } catch (falha) {
    payload.logger.error({ err: falha }, 'Falha ao avisar sobre lead novo')
  }
}
