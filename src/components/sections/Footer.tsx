import { Instagram, Mail, MapPin, Navigation } from 'lucide-react'
import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { Logotipo } from '@/components/Logotipo'
import { Button } from '@/components/ui/button'
import { enderecoDoMapa, formatarWhatsapp, rotaNoMapa } from '@/lib/utils'

import type { Clinica } from '@/payload-types'

type Unidade = NonNullable<Clinica['unidades']>[number]

/**
 * Os links de contato do rodape sao `Button` com `variant="ghost"`, e nao `<a>`
 * solto, para os tres se comportarem igual no hover: a cor vai para cacau, o
 * icone desliza um pouco e o brilho do botao varre por cima.
 *
 * As classes daqui **tiram a casca de botao**: altura automatica, sem
 * preenchimento, peso normal e sem o salto nem a sombra que o Button faz no
 * hover. O que fica e so a parte que interessa num link de rodape.
 *
 * Sao literais de proposito. O Tailwind so gera o CSS da classe que encontra
 * escrita no fonte, entao montar isso por concatenacao faria a regra sumir.
 */
const LINK_DE_CONTATO =
  'h-auto justify-start gap-2 p-0 text-sm font-normal text-tinta-suave hover:translate-y-0 hover:bg-transparent hover:text-cacau hover:shadow-none'

/**
 * O WhatsApp e marca, entao nao esta no lucide. Fica local aqui pelo mesmo
 * criterio do `LogoGoogle` em Depoimentos: se aparecer um segundo uso, ele sobe
 * para `components/ui`.
 */
function LogoWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24z" />
    </svg>
  )
}

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
  // O mapa sai da primeira unidade que tiver um embed valido.
  const mapa = unidades.map((unidade) => enderecoDoMapa(unidade.mapaEmbed)).find(Boolean)

  return (
    <footer className="border-t border-tinta/10 bg-porcelana py-16">
      <div className="container grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Logotipo nome={nome} logo={logo} tamanho="lg" />
          {horarios && <p className="mt-4 text-sm text-neutro">{horarios}</p>}

          <div className="mt-6 flex flex-col gap-3 text-sm">
            {/* Passa pelo BotaoWhatsapp, e nao por um `<a>` com o wa.me montado
                na mao: e o unico caminho que grava `clique_whatsapp`. Antes este
                link abria conversa sem aparecer em relatorio nenhum. As classes
                tiram a casca de botao, para ele ler como os vizinhos. */}
            <BotaoWhatsapp
              numero={whatsapp}
              local="footer"
              variant="ghost"
              className={LINK_DE_CONTATO}
            >
              <LogoWhatsapp className="h-4 w-4" />
              {formatarWhatsapp(whatsapp)}
            </BotaoWhatsapp>
            {email && (
              <Button asChild variant="ghost" className={LINK_DE_CONTATO}>
                <a href={`mailto:${email}`}>
                  <Mail className="h-4 w-4" />
                  {email}
                </a>
              </Button>
            )}
            {instagram && (
              <Button asChild variant="ghost" className={LINK_DE_CONTATO}>
                <a href={`https://instagram.com/${instagram}`} rel="noopener noreferrer" target="_blank">
                  <Instagram className="h-4 w-4" />@{instagram}
                </a>
              </Button>
            )}
          </div>
        </div>

        {unidades.length > 0 && (
          /* Duas colunas fixas: os enderecos de um lado, o mapa do outro. Antes a
             grade repetia por unidade, entao com uma unica unidade sobrava metade
             da largura vazia, que e o espaco onde o mapa entra agora. */
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-8">
              {unidades.map((unidade) => (
                <div key={unidade.nome}>
                  <h2 className="font-display text-lg text-tinta">{unidade.nome}</h2>
                  <address className="mt-3 whitespace-pre-line text-sm not-italic text-tinta-suave">
                    {unidade.endereco}
                  </address>
                  {unidade.telefone && <p className="mt-2 text-sm text-neutro">{unidade.telefone}</p>}

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={rotaNoMapa(nome, unidade.endereco)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="h-4 w-4" />
                        Definir rota
                      </a>
                    </Button>

                    {unidade.mapaUrl && (
                      <a
                        href={unidade.mapaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-cacau hover:underline"
                      >
                        <MapPin className="h-4 w-4" /> Ver no mapa
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {mapa && (
              /*
                `loading="lazy"` nao e detalhe: o mapa e um iframe de terceiro e
                fica no pe da pagina, entao a maioria das visitas nunca chega a
                carrega-lo. Sem isso, todo mundo pagaria o custo dele.
              */
              <iframe
                src={mapa}
                title={`Mapa da unidade ${unidades[0]?.nome}`}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-64 w-full rounded-lg border-0 sm:h-full sm:min-h-[16rem]"
              />
            )}
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
