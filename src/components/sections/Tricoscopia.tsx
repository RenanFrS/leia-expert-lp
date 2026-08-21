import { Revelar } from '@/components/Revelar'
import { Button } from '@/components/ui/button'

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

export function Tricoscopia() {
  return (
    <section id="tricoscopia" className="bg-tinta py-24 text-porcelana md:py-32">
      <div className="container grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
        <Revelar>
          <p className="text-eyebrow font-mono uppercase text-caramelo-claro">O exame</p>
          <h2 className="mt-4 font-display text-display-lg">Tricoscopia digital</h2>
          <p className="mt-5 max-w-md text-porcelana/70">
            E o exame que separa suposicao de diagnostico. Ele mostra a condicao real do folculo antes
            de qualquer indicacao de tratamento.
          </p>
          <Button asChild variant="destaque" especular className="mt-8">
            <a href="#agendar">Agendar tricoscopia</a>
          </Button>
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
