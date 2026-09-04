import Image from 'next/image'

import { GradeParallax } from '@/components/ui/grade-parallax'
import { cn, midia } from '@/lib/utils'
import type { Galeria } from '@/payload-types'

/**
 * Grade de fotos em colunas que correm em velocidades diferentes, na forma do
 * **skiper30 do skiper-ui**, o Oliver parallax, escolhido pelo cliente.
 *
 * Livre para uso pessoal e comercial, com **atribuicao ao Skiper UI** pedida
 * pela licenca da versao gratuita. Autor: @gurvinder-singh02, https://gxuri.me.
 *
 * **Nao entra dependencia nova.** O framer-motion ja estava no projeto e o Lenis
 * global do `SmoothScroll.tsx` continua sendo o unico: aqui ninguem instancia
 * outro, senao os dois brigam pela rolagem.
 *
 * **Este arquivo e server component.** Quem move as colunas e o
 * `grade-parallax.tsx`, que e cliente e recebe as colunas **ja renderizadas
 * aqui**, como `children`. Assim as fotos continuam saindo do servidor e para o
 * navegador vai so o wrapper que anima.
 *
 * Quatro decisoes que sustentam a grade:
 *
 * - **Sao tres colunas no `lg`, e duas no celular.** Tres nao divide por dois,
 *   entao a solucao do layout do telefone e o `display: contents`, explicado no
 *   bloco da grade mais abaixo.
 * - **A distribuicao equilibra a altura, e nao e rodizio.** Cada foto vai para a
 *   coluna mais curta no momento, medindo pela propria proporcao. Como o custo e
 *   `altura / largura` e todas as colunas tem a mesma largura, a conta sai sem
 *   saber largura em pixel nenhuma. Rodizio puro parece equivalente e nao e:
 *   medido com fotos de razao misturada, ele deixava o pe das colunas variando
 *   quase 300px.
 *
 *   **A varredura preserva a ordem do painel**, o que custa um pouco de
 *   equilibrio: ordenar da mais alta para a mais baixa fecharia quase todo o
 *   degrau, mas jogaria fora o campo `ordem`, que e o unico controle da clinica.
 * - **Nao ha `enquadramento` aqui, e isso e proposital.** O ponto de foco existe
 *   para imagem que usa `object-cover`, onde a caixa recorta a foto de novo. Na
 *   grade a foto entra inteira, na propria proporcao, entao nao ha recorte para
 *   o foco resolver e um `object-position` ali seria letra morta.
 * - **Video e descartado na entrada.** A colecao aponta para a Media, que aceita
 *   os dois, e o otimizador do Next responde 400, "The requested resource isn't
 *   a valid image", para um `.mp4`. Sem esse filtro uma foto trocada por video
 *   deixaria um buraco na grade sem erro nenhum na tela.
 */

/**
 * Em quantas colunas a distribuicao divide as fotos.
 *
 * **Precisa casar com o `CURSOS` do `grade-parallax.tsx`**, que e quem move cada
 * coluna. A constante e declarada duas vezes de proposito: aquele arquivo e
 * `'use client'`, e importar um valor dele para ca faria ele atravessar a
 * fronteira RSC como referencia de cliente em vez de numero, o que ja quebrou a
 * distribuicao em silencio. Mexeu numa lista, confira a outra.
 */
const COLUNAS = 3

export function GaleriaParallax({ itens, className }: { itens: Galeria[]; className?: string }) {
  // So imagem. O motivo esta no bloco do topo.
  const fotos = itens
    .map((item) => ({ id: item.id, arquivo: midia(item.foto) }))
    .filter((item) => item.arquivo?.url && item.arquivo.mimeType?.startsWith('image/'))

  if (!fotos.length) return null

  // Empacota na coluna mais curta, mantendo a ordem do painel na varredura.
  const alturas = Array.from({ length: COLUNAS }, () => 0)
  const colunas: (typeof fotos)[] = Array.from({ length: COLUNAS }, () => [])

  for (const foto of fotos) {
    const menor = alturas.indexOf(Math.min(...alturas))
    colunas[menor].push(foto)
    alturas[menor] += (foto.arquivo!.height || 1000) / (foto.arquivo!.width || 800)
  }

  return (
    // `clip` e nao `hidden` de proposito, para nao criar container de rolagem
    // novo. Mesmo criterio do hero e da secao de tratamentos.
    <div className={cn('overflow-clip', className)}>
      <GradeParallax
        colunas={colunas.map((coluna) =>
          coluna.map(({ id, arquivo }) => (
            <figure
              key={id}
              /*
                O espacamento vem de `mb` na propria figure, e nao de `gap` na
                coluna: sob `display: contents` no celular a coluna nao forma
                caixa, entao `gap` nao existiria ali. O `break-inside-avoid`
                impede a foto de ser cortada ao meio entre as duas colunas de
                CSS.
              */
              className="mb-3 break-inside-avoid overflow-hidden rounded-lg bg-areia md:mb-4 lg:mb-5"
            >
              <Image
                src={arquivo!.url!}
                alt={arquivo!.alt || ''}
                // As medidas saem do proprio arquivo, entao cada foto guarda a
                // proporcao que tem. E dai que vem o desencontro de altura que
                // faz a grade parecer montada a mao.
                width={arquivo!.width || 800}
                height={arquivo!.height || 1000}
                // Com tres colunas em 1376px de container e dois vaos de 20px,
                // cada coluna fica com 445px.
                sizes="(max-width: 1024px) 50vw, 460px"
                className="h-auto w-full"
              />
            </figure>
          )),
        )}
      />
    </div>
  )
}
