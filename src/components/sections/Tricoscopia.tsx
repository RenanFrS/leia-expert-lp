import { Revelar } from '@/components/Revelar'
import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { VideoFundo } from '@/components/ui/video-fundo'
import { urlDeEntrega } from '@/lib/cloudinary-url'
import { midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

/*
  A terceira etapa se chamava "Diagnostico e protocolo". Diagnostico e ato
  privativo de medico, e a Leia e tricologista: a etapa continua a mesma, o que
  muda e o que o site afirma sobre ela. Nao volte a usar a palavra aqui.
*/
const etapas = [
  {
    titulo: 'Leitura do couro cabeludo',
    texto: 'A câmera amplia a região até 200 vezes e mostra o que o olho não alcança.',
  },
  {
    titulo: 'Contagem de densidade',
    texto: 'Medimos quantos fios existem por centímetro quadrado e a espessura de cada um.',
  },
  {
    titulo: 'Conclusão e protocolo',
    texto: 'Com o exame em mãos, definimos o tratamento e o tempo esperado de resposta.',
  },
]

export function Tricoscopia({
  video,
  whatsapp,
  mensagemWhatsapp,
}: {
  video?: Clinica['videoTricoscopia']
  whatsapp: string
  mensagemWhatsapp?: string | null
}) {
  const arquivo = midia(video)

  /*
    O video aponta direto para a CDN, como no hero, e pelo mesmo motivo: a URL
    que o Payload grava nao aplica transformacao, nao responde a `Range` e ainda
    passa os bytes pelo servidor do Next.

    A transformacao aqui e mais agressiva do que a do hero, `q_auto:eco,w_1600`,
    porque este video vive atras de um veu de 80%: sao 4,9 MB em vez de 7,4 MB,
    e a perda de qualidade nao chega a aparecer. Medido neste arquivo.
  */
  const fonte =
    arquivo?.filename && arquivo.mimeType?.startsWith('video/')
      ? urlDeEntrega(arquivo.filename, 'f_auto,q_auto:eco,w_1600')
      : null

  return (
    // `relative isolate` sustenta o video: sem contexto de empilhamento proprio a
    // camada em `-z-10` cai atras do fundo de um ancestral e some. O `bg-tinta`
    // continua como reserva enquanto o arquivo carrega, e se nao houver arquivo.
    <section id="tricoscopia" className="relative isolate bg-tinta py-24 text-porcelana md:py-32">
      {/*
        **O veu subiu de `tinta/80` para `tinta/85` porque o arquivo mudou.** O
        video antigo era escuro, com pixel mais claro em `rgb(197,194,202)`. O
        novo e um ambiente clinico claro: o pixel mais claro e **branco puro** e
        entre 40% e 53% de cada quadro passa de 0.75 de luminancia, medido
        amostrando quadro a quadro pela CDN.

        Contra branco puro, sob 85%, o fundo composto e `rgb(77,66,60)` e da
        **9.72** em porcelana, **5.74** no `porcelana/70` do paragrafo de apoio,
        **5.21** no `porcelana/65` das etapas e **5.13** no caramelo-claro do
        eyebrow e dos numeros.

        **Em 80% o caramelo-claro cai para 4.31 e reprova**, e ele e o mais
        apertado dos quatro: e ele que manda no veu, nao o titulo. Trocou o
        arquivo? Refaca a conta contra o pixel mais claro do novo, nao contra a
        media dele.

        O preco disso e que o video aparece pouco, porque um arquivo claro atras
        de uma secao escura pede veu pesado. E o custo de manter a secao escura.
      */}
      {fonte && <VideoFundo src={fonte} veu="bg-tinta/85" />}
      <div className="container grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
        <Revelar>
          <p className="text-eyebrow font-mono uppercase text-caramelo-claro">O exame</p>
          <h2 className="mt-4 font-display text-display-lg">Tricoscopia digital</h2>
          <p className="mt-5 max-w-md text-porcelana/70">
            É o exame que separa suposição de evidência. Ele mostra a condição real do folículo
            antes de qualquer indicação de tratamento.
          </p>
          {/*
            Aqui ficava, ao lado deste botao, um link discreto ate o formulario,
            que existia so para o evento `clique_agendar` continuar tendo um
            emissor. **O formulario foi removido do site**, entao o link nao tem
            mais destino e o evento saiu de `EventoNome`. Nao recoloque um sem
            que exista formulario de novo.
          */}
          <BotaoWhatsapp
            numero={whatsapp}
            mensagem={mensagemWhatsapp}
            local="tricoscopia"
            variant="destaque"
            especular
            className="mt-8"
          >
            Agendar tricoscopia
          </BotaoWhatsapp>
        </Revelar>

        <Revelar atraso={120}>
          <ol className="space-y-px">
            {etapas.map((etapa, indice) => (
              <li key={etapa.titulo} className="border-t border-porcelana/15 py-7 first:border-t-0">
                <div className="flex gap-6">
                  <span className="font-mono text-sm text-caramelo-claro">
                    {String(indice + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-xl">{etapa.titulo}</h3>
                    <p className="mt-2 max-w-md text-sm text-porcelana/65">{etapa.texto}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Revelar>
      </div>
    </section>
  )
}
