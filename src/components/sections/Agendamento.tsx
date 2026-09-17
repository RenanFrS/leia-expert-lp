import { CornerDownRight } from 'lucide-react'

import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { Revelar } from '@/components/Revelar'
import { formatarWhatsapp } from '@/lib/utils'

type Props = {
  whatsapp: string
  mensagemWhatsapp?: string | null
  email?: string | null
}

/**
 * Fechamento por WhatsApp. **Aqui havia um formulario, e ele foi removido a
 * pedido do cliente**, que pediu foco total na conversa.
 *
 * Vale saber o que saiu junto, porque nada disso e obvio olhando o arquivo:
 *
 * - a rota `POST /api/leads`, os primitivos `Input`, `Textarea`, `Label` e
 *   `Checkbox`, que so esta secao usava, e o `BotaoAgendar`
 * - os eventos `inicio_formulario`, `envio_formulario`, `erro_formulario` e
 *   `clique_agendar`, que ficaram sem emissor
 * - **a conversao do Google Ads**, que disparava no envio. Ela passou para o
 *   clique de WhatsApp, dentro do `registrarContatoWhatsapp`
 * - **a gravacao de UTM por lead**, que virou a colecao `contatos`, gravada no
 *   mesmo clique
 *
 * A colecao `Leads` continua de pe, com os cadastros que ja entraram. Ela parou
 * de crescer.
 *
 * **Hoje e uma secao so de texto, centralizada.** Ja teve a foto sangrando ate a
 * borda da janela a direita, e por isso ficava fora do `container`, com o recuo
 * da coluna de texto calculado a mao. A foto foi para o cartao da secao de
 * duvidas frequentes, a pedido do cliente, e com ela sairam o recuo e o
 * `overflow-x-clip`: a secao voltou ao `container` como as outras.
 *
 * Ela e server component: sem formulario nao sobrou estado nenhum.
 */
export function Agendamento({ whatsapp, mensagemWhatsapp, email }: Props) {
  return (
    <section id="agendar" className="py-24 md:py-32">
      <div className="container text-center">
        <Revelar className="mx-auto max-w-2xl">
          {/* Nao esta no bloco de referencia, mas abre todas as outras secoes
              do site. Sem ele esta seria a unica sem eyebrow. */}
          <p className="text-eyebrow font-mono uppercase text-caramelo">Contato</p>

          {/* O titulo dizia "Vamos conversar sobre o seu cabelo", e o cliente
              pediu a troca porque soava como bate papo, e nao como o comeco de
              um atendimento. Nao ha quebra de linha fixa: ele quebra sozinho na
              largura da coluna. O `text-balance` equilibra as linhas: sem ele,
              centralizado em 1440, "cabelo." ficava sozinho na terceira. */}
          <h2 className="mt-4 text-balance font-display text-display-lg text-tinta">
            Vamos entender o que está acontecendo com o seu cabelo.
          </h2>

          <p className="mx-auto mt-6 max-w-md text-tinta-suave">
            Entre em contato pelo WhatsApp para agendar sua consulta tricológica.
          </p>

          {/* O CTA principal. A seta segue a forma do bloco escolhido, no lugar
              da casca cheia de botao, para o telefone logo abaixo poder ser o
              elemento pesado da secao. O `Button` e `inline-flex`, entao quem
              centraliza e o `flex` em volta. */}
          <div className="mt-8 flex justify-center">
            <BotaoWhatsapp
              numero={whatsapp}
              mensagem={mensagemWhatsapp}
              local="card-agendamento"
              variant="ghost"
              className="h-auto gap-2 p-0 text-sm font-medium text-tinta hover:translate-y-0 hover:bg-transparent hover:text-cacau hover:shadow-none"
            >
              <CornerDownRight aria-hidden className="h-4 w-4" />
              {/* Dizia "Falar no WhatsApp". O rotulo novo diz o que a pessoa
                  consegue fazer, e nao o canal; o destino continua sendo o
                  WhatsApp, e o evento continua `clique_whatsapp`. */}
              Agendar minha consulta
            </BotaoWhatsapp>
          </div>
        </Revelar>

        <Revelar atraso={120} className="mt-14 md:mt-16">
          {/*
            **O numero grande e link de WhatsApp, e isso mudou de regra.** Ele
            era texto puro para nao existir um segundo caminho de conversa fora
            do componente que grava o evento. Passando por dentro do
            `BotaoWhatsapp`, com `local` proprio, o motivo daquela regra nao se
            aplica: o clique entra no relatorio como qualquer outro.
          */}
          <div className="flex justify-center">
            <BotaoWhatsapp
              numero={whatsapp}
              mensagem={mensagemWhatsapp}
              local="contato-numero"
              variant="ghost"
              className="h-auto whitespace-normal p-0 text-center font-normal text-tinta hover:translate-y-0 hover:bg-transparent hover:text-cacau hover:shadow-none"
            >
              {/*
                **O tamanho vai num `span` interno, e nao na `className` do
                botao.** O `Button` nasce com `text-sm` na base, e quando o
                numero entrou o `cn` ainda nao conhecia os tamanhos proprios do
                `tailwind.config.ts`: as duas classes sobreviviam e o `text-sm`
                vencia pela ordem da folha, com o numero miudo ao lado do e mail.
                Hoje o `cn` conhece, e a classe no botao tambem funcionaria; o
                `span` ficou porque ja estava medido e nao depende disso.
              */}
              <span className="font-display text-display-md leading-tight">
                {formatarWhatsapp(whatsapp)}
              </span>
            </BotaoWhatsapp>
          </div>

          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-1 inline-block break-words font-display text-display-md leading-tight text-tinta transition-colors hover:text-cacau"
            >
              {email}
            </a>
          )}
        </Revelar>
      </div>
    </section>
  )
}
