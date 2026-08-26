import { Instagram, Mail, MapPin } from 'lucide-react'
import { Logotipo } from '@/components/Logotipo'
import { whatsappLink } from '@/lib/utils'

import type { Clinica } from '@/payload-types'

type Unidade = NonNullable<Clinica['unidades']>[number]

type Props = {
  nome: string
  logo?: Clinica['logo']
  whatsapp: string
  email?: string | null
  instagram?: string | null
  horarios?: string | null
  unidades: Unidade[]
}

export function Footer({ nome, logo, whatsapp, email, instagram, horarios, unidades }: Props) {
  return (
    <footer className="border-t border-tinta/10 bg-porcelana py-16">
      <div className="container grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Logotipo nome={nome} logo={logo} tamanho="lg" />
          {horarios && <p className="mt-4 text-sm text-neutro">{horarios}</p>}

          <div className="mt-6 flex flex-col gap-3 text-sm">
            <a href={whatsappLink(whatsapp)} className="text-tinta-suave transition-colors hover:text-cacau">
              WhatsApp
            </a>
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-tinta-suave transition-colors hover:text-cacau"
              >
                <Mail className="h-4 w-4" /> {email}
              </a>
            )}
            {instagram && (
              <a
                href={`https://instagram.com/${instagram}`}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-2 text-tinta-suave transition-colors hover:text-cacau"
              >
                <Instagram className="h-4 w-4" /> @{instagram}
              </a>
            )}
          </div>
        </div>

        {unidades.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2">
            {unidades.map((unidade) => (
              <div key={unidade.nome}>
                <h2 className="font-display text-lg text-tinta">{unidade.nome}</h2>
                <address className="mt-3 whitespace-pre-line text-sm not-italic text-tinta-suave">
                  {unidade.endereco}
                </address>
                {unidade.telefone && <p className="mt-2 text-sm text-neutro">{unidade.telefone}</p>}
                {unidade.mapaUrl && (
                  <a
                    href={unidade.mapaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-cacau hover:underline"
                  >
                    <MapPin className="h-4 w-4" /> Ver no mapa
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="container mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-tinta/10 pt-6 text-xs text-neutro">
        <p>
          {new Date().getFullYear()} {nome}. Todos os direitos reservados.
        </p>
        <p>
          Site por{' '}
          <a href="https://www.instagram.com/renanrocha.01/" target="_blank" rel="noopener noreferrer" className="hover:text-cacau">
            Renan Rocha
          </a>
        </p>
      </div>
    </footer>
  )
}
