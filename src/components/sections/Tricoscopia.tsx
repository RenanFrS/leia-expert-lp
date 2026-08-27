import { Revelar } from '@/components/Revelar'
import { BotaoAgendar } from '@/components/BotaoAgendar'
import { VideoFundo } from '@/components/ui/video-fundo'
import { urlDeEntrega } from '@/lib/cloudinary-url'
import { midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

const etapas = [
  {
    titulo: 'Leitura do couro cabeludo',
    texto: 'A camera amplia a regiao ate 200 vezes e mostra o que o olho nao alcanca.',
  },
  {
    titulo: 'Contagem de densidade',
    texto: 'Medimos quantos fios existem por centimetro quadrado e a espessura de cada um.',
  },
  {
    titulo: 'Diagnostico e protocolo',
    texto: 'Com o exame em maos, definimos o tratamento e o tempo esperado de resposta.',
  },
]

export function Tricoscopia({ video }: { video?: Clinica['videoTricoscopia'] }) {
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
      {/* O veu vai em `tinta/80` por conta feita. O pixel mais claro do arquivo e
          `rgb(197,194,202)`, onde porcelana sem veu daria 1.76 de contraste. Sob
          80% a porcelana da 9.9, o `porcelana/65` do texto das etapas da 5.3 e o
          caramelo-claro do eyebrow da 5.2. Em 70% os dois ultimos caem para 4.35
          e 4.05, abaixo do piso. Trocou o arquivo? Refaca a conta contra o pixel
          mais claro do novo, nao contra a media dele. */}
      {fonte && <VideoFundo src={fonte} veu="bg-tinta/80" />}
      <div className="container grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
        <Revelar>
          <p className="text-eyebrow font-mono uppercase text-caramelo-claro">O exame</p>
          <h2 className="mt-4 font-display text-display-lg">Tricoscopia digital</h2>
          <p className="mt-5 max-w-md text-porcelana/70">
            E o exame que separa suposicao de diagnostico. Ele mostra a condicao real do folculo antes
            de qualquer indicacao de tratamento.
          </p>
          {/* Este e o caminho que sobrou ate o formulario, depois que os CTAs de
              "Agendar consulta tricologica" passaram a abrir o WhatsApp. Era um
              `<a>` solto, sem evento nenhum: agora dispara `clique_agendar`, que
              e o que distingue quem quer o formulario de quem quer conversa. */}
          <BotaoAgendar local="tricoscopia" variant="destaque" especular className="mt-8">
            Agendar tricoscopia
          </BotaoAgendar>
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
