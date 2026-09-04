import Image from 'next/image'
import { CornerDownRight } from 'lucide-react'

import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { Revelar } from '@/components/Revelar'
import { enquadramento, formatarWhatsapp, midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

type Props = {
  whatsapp: string
  mensagemWhatsapp?: string | null
  email?: string | null
  foto?: Clinica['fotoAgendamento']
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
 * A forma segue o bloco que o cliente escolheu: coluna de texto a esquerda e a
 * foto sangrando ate a borda da janela a direita, empilhando com a foto por
 * ultimo no celular.
 *
 * **Esta e a segunda secao do site sem `container`**, junto com o hero, e por um
 * motivo concreto: a foto precisa encostar na borda da janela. Nenhum truque de
 * margem negativa resolve isso de dentro de uma coluna de grade, porque
 * porcentagem em margem resolve contra a celula e nao contra o container. O
 * recuo da coluna de texto e calculado a mao, e a conta esta la embaixo.
 *
 * Ela e server component: sem formulario nao sobrou estado nenhum.
 */
export function Agendamento({ whatsapp, mensagemWhatsapp, email, foto }: Props) {
  const imagem = midia(foto)

  return (
    // O `overflow-x-clip` segura a foto, que passa da coluna ate a borda da
    // janela. `clip` e nao `hidden` de proposito, para nao criar container de
    // rolagem novo, o mesmo criterio do hero e dos tratamentos.
    <section id="agendar" className="overflow-x-clip">
      <div className="grid lg:grid-cols-2 lg:items-stretch">
        {/*
          **O recuo reproduz a calha do `container`, e a conta nao e chute.** O
          container do projeto e `max-width: 1440px` com `padding: 2rem` a partir
          do `2xl`, e `1.25rem` abaixo disso, o que da 1376px de conteudo util.
          Entao a calha esquerda e `(100vw - 1376px) / 2`, com piso de 1.25rem
          para as larguras em que a pagina ainda nao chegou ao maximo.

          Confere em 1920 (272px), em 1440 (32px) e em 1280 (20px). Mexeu no
          `container.padding` ou no `screens` do tailwind.config? Refaca aqui,
          senao o titulo desta secao sai desalinhado do resto da pagina.
        */}
        <div className="px-5 py-24 md:py-28 lg:py-32 lg:pl-[max(1.25rem,calc((100vw-1376px)/2))] lg:pr-14 lg:flex lg:flex-col lg:justify-center">
          <Revelar>
            {/* Nao esta no bloco de referencia, mas abre todas as outras secoes
                do site. Sem ele esta seria a unica sem eyebrow. */}
            <p className="text-eyebrow font-mono uppercase text-caramelo">Contato</p>

            <h2 className="mt-4 max-w-xl font-display text-display-lg text-tinta">
              Vamos conversar
              <br />
              sobre o seu cabelo.
            </h2>

            <p className="mt-6 max-w-md text-tinta-suave">
              Me chame no WhatsApp e combinamos o melhor dia para a sua consulta tricológica. A
              equipe responde em horário comercial.
            </p>

            {/* O CTA principal. A seta segue a forma do bloco escolhido, no
                lugar da casca cheia de botao, para o telefone logo abaixo poder
                ser o elemento pesado da coluna. */}
            <BotaoWhatsapp
              numero={whatsapp}
              mensagem={mensagemWhatsapp}
              local="card-agendamento"
              variant="ghost"
              className="mt-8 h-auto gap-2 p-0 text-sm font-medium text-tinta hover:translate-y-0 hover:bg-transparent hover:text-cacau hover:shadow-none"
            >
              <CornerDownRight aria-hidden className="h-4 w-4" />
              Falar no WhatsApp
            </BotaoWhatsapp>
          </Revelar>

          <Revelar atraso={120} className="mt-16 lg:mt-24">
            {/*
              **O numero grande e link de WhatsApp, e isso mudou de regra.** Ele
              era texto puro para nao existir um segundo caminho de conversa fora
              do componente que grava o evento. Passando por dentro do
              `BotaoWhatsapp`, com `local` proprio, o motivo daquela regra nao se
              aplica: o clique entra no relatorio como qualquer outro.
            */}
            <BotaoWhatsapp
              numero={whatsapp}
              mensagem={mensagemWhatsapp}
              local="contato-numero"
              variant="ghost"
              className="block h-auto justify-start whitespace-normal p-0 text-left font-normal text-tinta hover:translate-y-0 hover:bg-transparent hover:text-cacau hover:shadow-none"
            >
              {/*
                **O tamanho vai num `span` interno, e nao na `className` do
                botao.** O `Button` nasce com `text-sm` na base, e o
                `tailwind-merge` nao reconhece `text-display-md` como do mesmo
                grupo de `font-size`, porque e chave custom do
                `tailwind.config.ts`: as duas classes sobrevivem e o `text-sm`
                vence pela ordem da folha. Medido, o numero saia miudo ao lado do
                e mail. Num descendente nao ha empate.
              */}
              <span className="font-display text-display-md leading-tight">
                {formatarWhatsapp(whatsapp)}
              </span>
            </BotaoWhatsapp>

            {email && (
              <a
                href={`mailto:${email}`}
                className="mt-1 block break-words font-display text-display-md leading-tight text-tinta transition-colors hover:text-cacau"
              >
                {email}
              </a>
            )}
          </Revelar>
        </div>

        {/* A foto sangra ate a borda da janela no `lg`, e fica por ultimo na
            pilha do celular, que e a ordem do proprio DOM. Usa `object-cover`,
            entao leva o ponto de foco pelo `enquadramento`. */}
        <figure className="relative min-h-[26rem] bg-areia sm:min-h-[32rem] lg:min-h-[44rem]">
          {imagem?.url && (
            <Image
              src={imagem.url}
              alt={imagem.alt || 'Atendimento na clínica'}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              style={enquadramento(imagem)}
            />
          )}
        </figure>
      </div>
    </section>
  )
}
