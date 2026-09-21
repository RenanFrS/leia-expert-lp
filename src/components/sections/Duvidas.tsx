'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CartaoVidro } from '@/components/ui/cartao-vidro'
import { Revelar } from '@/components/Revelar'
import { pushEvento } from '@/lib/analytics'
import { enquadramento, midia } from '@/lib/utils'

import type { Clinica, Faq } from '@/payload-types'

type Props = {
  perguntas: Faq[]
  foto?: Clinica['fotoAgendamento']
  whatsapp: string
  mensagemWhatsapp?: string | null
}

/**
 * Duvidas frequentes, com um cartao de contato na coluna do titulo.
 *
 * **As duas colunas so abrem no `xl`.** Entre o `md` e o `xl` elas ja
 * existiram, e a coluna do titulo saia com 272px em 768: a foto ficava miuda e
 * sobravam 380px vazios embaixo do titulo, que e o defeito que o cartao veio
 * resolver. Abaixo do `xl` a secao e uma pilha, e o cartao ganha a largura
 * inteira.
 *
 * **O cartao entrou para ocupar o vazio embaixo do titulo**, a pedido do
 * cliente, que mandou uma referencia com foto e cartao de vidro nesse lugar. A
 * foto e a que ficava na secao de contato, que hoje e so texto. O cartao leva
 * um titulo curto nosso e o paragrafo e o botao da secao de contato: e mais um
 * ponto de conversao, no momento em que a pessoa acabou de ler as respostas.
 *
 * **A ordem do DOM e a da pilha: titulo, perguntas, cartao.** No `xl` e a
 * grade que sobe o cartao para a coluna do titulo, na linha 2, enquanto as
 * perguntas ocupam as duas linhas da coluna ao lado. Assim o celular empilha
 * certo sem `order` e o leitor de tela ouve a pergunta "Ficou alguma duvida?"
 * depois das respostas.
 *
 * **O cartao fica parado quando uma pergunta abre.** Ele ja foi `self-end` na
 * linha 2, e como a linha cresce com a resposta aberta, a foto descia junto; o
 * cliente achou isso estranho. Hoje ele e `self-start`, com um recuo de cima
 * que poe o pe dele no fim da lista **fechada**. Quem calcula o recuo e o
 * efeito abaixo, porque a altura da lista vem do painel e o CSS nao a conhece.
 */
export function Duvidas({ perguntas, foto, whatsapp, mensagemWhatsapp }: Props) {
  const grade = useRef<HTMLDivElement>(null)

  /*
    Recuo do cartao no `xl`, gravado na variavel `--recuo-cartao` da grade.

    **A altura de referencia e a da lista com tudo fechado**, somando cada item
    menos a resposta dele. A subtracao vale inclusive no meio da animacao de
    abrir e fechar, em que a resposta tem altura parcial, entao abrir ou fechar
    nunca muda o recuo: so largura, fonte ou conteudo mudam.

    As medidas sao por `offsetTop` e `offsetHeight`, que ignoram `transform`. Os
    tres blocos entram pelo `Revelar`, que desloca cada um enquanto aparece, e o
    `getBoundingClientRect` leria a posicao do meio da animacao.
  */
  useEffect(() => {
    const elemento = grade.current
    if (!elemento) return
    const [titulo, lista, cartao] = Array.from(elemento.children) as HTMLElement[]
    const telaLarga = window.matchMedia('(min-width: 1280px)')

    const medir = () => {
      if (!telaLarga.matches) {
        elemento.style.removeProperty('--recuo-cartao')
        return
      }
      const fechada = Array.from(lista.querySelectorAll<HTMLElement>('[data-pergunta]')).reduce(
        (soma, item) =>
          soma + item.offsetHeight - (item.querySelector<HTMLElement>('[role="region"]')?.offsetHeight ?? 0),
        0,
      )
      const inicioLinha2 =
        titulo.offsetTop + titulo.offsetHeight + parseFloat(getComputedStyle(elemento).rowGap || '0')
      const recuo = lista.offsetTop + fechada - cartao.offsetHeight - inicioLinha2
      elemento.style.setProperty('--recuo-cartao', `${Math.max(0, recuo)}px`)
    }

    const observador = new ResizeObserver(medir)
    observador.observe(elemento)
    observador.observe(titulo)
    observador.observe(cartao)
    telaLarga.addEventListener('change', medir)
    return () => {
      observador.disconnect()
      telaLarga.removeEventListener('change', medir)
    }
  }, [])

  // Depois dos hooks, que nao podem ficar atras de retorno condicional.
  if (!perguntas.length) return null

  const imagem = midia(foto)

  return (
    <section id="duvidas" className="py-10 md:py-14">
      <div ref={grade} className="container grid gap-12 xl:grid-cols-2 xl:grid-rows-[auto_1fr]">
        <Revelar className="xl:col-start-1 xl:row-start-1">
          <p className="text-eyebrow font-mono uppercase text-caramelo">Dúvidas frequentes</p>
          <h2 className="mt-4 font-display text-display-lg text-tinta">Antes de agendar</h2>
        </Revelar>

        <Revelar atraso={100} className="xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <Accordion
            type="single"
            collapsible
            onValueChange={(valor) => valor && pushEvento('abrir_faq', { pergunta: valor })}
          >
            {perguntas.map((item) => (
              <AccordionItem key={item.id} value={String(item.pergunta)} data-pergunta>
                <AccordionTrigger>{item.pergunta}</AccordionTrigger>
                {/*
                  `whitespace-pre-line` faz a quebra de linha que a clinica
                  digitar no painel chegar na tela. O campo `resposta` e um
                  `textarea` renderizado como texto puro, entao sem isso uma
                  resposta em etapas viraria um paragrafo corrido.

                  Nao mexe no que ja existe: conferido, nenhuma das respostas
                  gravadas tem quebra de linha.
                */}
                <AccordionContent className="whitespace-pre-line">{item.resposta}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Revelar>

        <Revelar
          atraso={150}
          className="xl:col-start-1 xl:row-start-2 xl:mt-[var(--recuo-cartao,0px)] xl:self-start"
        >
          {/*
            **Os rostos mandam neste cartao.** Na foto atual as duas cabecas vao
            de 33% a 84% da largura e de 31% a 64% da altura. Tres coisas saem
            dessa medida, e as tres precisam andar juntas:

            - **a caixa tem proporcao fixa, e nunca a altura da coluna.** Esticada
              ate o pe das perguntas ela ficaria quase quadrada e o `object-cover`
              cortaria um dos dois, e cresceria ainda mais quando uma pergunta
              abre. No `xl` e 5:4, a mais alta em que os dois cabem, e mostra 70%
              da largura; do `md` ao `xl` e 16:9, a da propria foto, sem recorte;
              no celular e 4:3, com 75%
            - **o ponto de foco esta em 60% por 48%**, gravado no painel. Em 5:4
              isso mostra de 18% a 88% da largura, com a mesma folga nos dois
              lados. Em 55% o cabelo da Leia ficava a 26px da borda
            - **o vidro fica abaixo de 66% da altura.** Por isso, do `md` para
              cima, ele e uma faixa baixa com texto e botao lado a lado: 103px de
              altura. No celular nao cabe lado a lado, o texto quebra e o vidro
              subiria nos rostos, entao ali ele sai de cima e vem embaixo da foto

            Trocou a foto? Refaca a medida dos rostos antes de mexer em qualquer
            um dos tres.
          */}
          <div className="relative overflow-hidden rounded-lg bg-areia">
            <div className="relative aspect-[4/3] md:aspect-video xl:aspect-[5/4]">
              {imagem?.url && (
                <Image
                  src={imagem.url}
                  alt={imagem.alt || 'Atendimento na clínica'}
                  fill
                  sizes="(max-width: 1280px) 100vw, 50vw"
                  className="object-cover"
                  style={enquadramento(imagem)}
                />
              )}
            </div>

            {/*
              **O vidro aqui e mais escuro que o padrao, e isso e medida.** O tom
              escuro do `CartaoVidro` clareia ate `cacau/75` numa ponta, e sobre
              a foto o paragrafo em `porcelana/85` dava 3.93, abaixo de 4.5. Com
              `cacau-escuro/85` nas duas pontas, contra uma foto branca pura, que
              e o pior caso de qualquer foto que a clinica suba, a conta da 6.07
              no titulo e 4.86 no paragrafo. O ajuste fica so aqui: o mesmo
              cartao serve o hero, onde a conta e outra.

              No celular ele nao fica sobre a foto: perde canto, borda e sombra e
              vira o pe do cartao.
            */}
            <CartaoVidro
              tom="escuro"
              className="rounded-none border-0 from-cacau-escuro/85 to-cacau-escuro/85 p-5 shadow-none md:absolute md:inset-x-4 md:bottom-4 md:rounded-lg md:border md:p-4 md:shadow-[0_18px_50px_-20px_rgba(46,33,26,0.7)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-5">
                <div>
                  <h3 className="font-display text-lg leading-snug">Ficou alguma dúvida?</h3>
                  {/* Mesmo texto da secao de contato, a pedido do cliente. */}
                  <p className="mt-1 text-sm text-porcelana/85">
                    Entre em contato pelo WhatsApp para agendar sua consulta tricológica.
                  </p>
                </div>
                {/* Sem `especular`: cada instancia abre um contexto WebGL, e o
                    brilho fica reservado aos pontos de conversao mais fortes. */}
                <BotaoWhatsapp
                  numero={whatsapp}
                  mensagem={mensagemWhatsapp}
                  local="duvidas"
                  variant="destaque"
                  className="shrink-0 self-start rounded-full md:self-auto"
                >
                  Agendar minha consulta
                </BotaoWhatsapp>
              </div>
            </CartaoVidro>
          </div>
        </Revelar>
      </div>
    </section>
  )
}
