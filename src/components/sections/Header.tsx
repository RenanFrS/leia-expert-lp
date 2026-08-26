'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pushEvento } from '@/lib/analytics'
import { Logotipo } from '@/components/Logotipo'
import { cn } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

// O logotipo central ja leva para o topo, entao "Inicio" era link repetido e o
// lugar dele ficou com as secoes. A ordem acompanha a da pagina, senao o
// destaque automatico pula para tras conforme o visitante rola.
const links = [
  { href: '#tratamentos', label: 'Tratamentos' },
  { href: '#resultados', label: 'Resultados' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#duvidas', label: 'Dúvidas' },
]

type Props = {
  nome: string
  logo?: Clinica['logo']
}

export function Header({ nome, logo }: Props) {
  const [compacto, setCompacto] = useState(false)
  const [aberto, setAberto] = useState(false)
  // Nasce vazio: no topo da pagina nenhuma secao da lista esta em tela ainda.
  const [ativo, setAtivo] = useState('')

  useEffect(() => {
    const aoRolar = () => setCompacto(window.scrollY > 24)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // Marca o item da secao que esta cruzando o meio da tela. A margem negativa
  // encolhe a area de observacao para uma faixa central, senao duas secoes
  // disputariam o destaque ao mesmo tempo.
  useEffect(() => {
    const alvos = links
      .map((link) => document.querySelector(link.href))
      .filter((alvo): alvo is Element => Boolean(alvo))

    if (!alvos.length) return

    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.find((entrada) => entrada.isIntersecting)
        if (visivel?.target.id) setAtivo(`#${visivel.target.id}`)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )

    alvos.forEach((alvo) => observador.observe(alvo))
    return () => observador.disconnect()
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        compacto ? 'bg-porcelana/90 py-3 shadow-sm backdrop-blur-md' : 'py-5',
      )}
    >
      <div className="container grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* A barra completa so abre no lg. Com cinco itens ela nao cabe no md:
            a nav empurra o logotipo para fora do centro e ele encosta no CTA.
            Ate o lg vale o menu recolhido, que e o mesmo do celular.
            No proprio lg o respiro fica apertado pelo mesmo motivo: a coluna da
            nav nao pode passar de metade da barra, senao o logotipo sai do
            centro. Do xl em diante sobra largura e ele volta ao normal. */}
        <nav className="hidden items-center gap-3 lg:flex xl:gap-7" aria-label="Navegação principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={ativo === link.href ? 'true' : undefined}
              className={cn(
                'rounded-full px-2 py-1.5 text-sm transition-colors xl:px-3',
                ativo === link.href
                  ? 'bg-areia/70 text-cacau-escuro'
                  : 'text-tinta-suave hover:text-cacau',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Coluna fixa. Sem isso, quando a nav some no display:none, o grid
            reencaixa o logotipo na primeira coluna e ele sai do centro, com o
            botao do menu ocupando o meio da barra. */}
        <a
          href="#topo"
          aria-label={`${nome}, ir para o topo`}
          className="col-start-2 justify-self-center"
        >
          <Logotipo nome={nome} logo={logo} prioridade className="text-center" />
        </a>

        <div className="col-start-3 flex items-center justify-end gap-2">
          <Button asChild size="sm" especular className="hidden lg:inline-flex">
            <a href="#agendar" onClick={() => pushEvento('clique_agendar', { local: 'header' })}>
              Agendar avaliação
            </a>
          </Button>
          <button
            type="button"
            className="rounded-md p-2 text-tinta transition-colors hover:bg-areia lg:hidden"
            onClick={() => setAberto((valor) => !valor)}
            aria-expanded={aberto}
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav
          className="container mt-4 flex flex-col gap-1 border-t border-tinta/10 pt-4 lg:hidden"
          aria-label="Navegação principal"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setAberto(false)}
              className="rounded-md px-2 py-3 text-tinta-suave transition-colors hover:bg-areia"
            >
              {link.label}
            </a>
          ))}
          <Button asChild especular className="mt-2">
            <a
              href="#agendar"
              onClick={() => {
                setAberto(false)
                pushEvento('clique_agendar', { local: 'menu-mobile' })
              }}
            >
              Agendar avaliação
            </a>
          </Button>
        </nav>
      )}
    </header>
  )
}
