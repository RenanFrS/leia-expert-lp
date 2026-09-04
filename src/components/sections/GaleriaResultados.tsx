import { GaleriaParallax } from '@/components/ui/galeria-parallax'
import type { Galeria } from '@/payload-types'

/**
 * Antes e depois em formato estatico, logo abaixo do comparador.
 *
 * Ela existe porque o comparador exige interacao: quem nao arrasta a divisa ve
 * so a foto de antes e vai embora achando que nao ha resultado nenhum. Aqui a
 * comparacao ja chega pronta, no formato de post de rede social, e resolve na
 * rolagem.
 *
 * **Sem titulo e sem ancora, a pedido do cliente.** Ela le como continuacao
 * visual da secao Resultados, que fica logo acima e ja traz o titulo e a
 * explicacao. Um segundo cabecalho ali criaria a impressao de duas secoes
 * falando da mesma coisa.
 *
 * **O `h2` em `sr-only` nao contradiz isso.** Uma faixa so de imagens, sem nome
 * nenhum, some do outline da pagina e chega no leitor de tela como um monte de
 * foto solta depois do carrossel. Ele nomeia a regiao sem aparecer.
 *
 * Some inteira enquanto nao houver foto publicada. E o que permite subir o
 * codigo antes do conteudo: o banco e o mesmo da producao e a home e ISR, entao
 * a secao entra no ar sozinha quando a clinica cadastrar a primeira foto.
 */
export function GaleriaResultados({ fotos }: { fotos: Galeria[] }) {
  if (!fotos.length) return null

  return (
    <section aria-labelledby="galeria-resultados" className="pb-24 md:pb-32">
      <div className="container">
        <h2 id="galeria-resultados" className="sr-only">
          Antes e depois, lado a lado
        </h2>

        <GaleriaParallax itens={fotos} />
      </div>
    </section>
  )
}
