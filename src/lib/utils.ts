import { clsx, type ClassValue } from 'clsx'
import type { CSSProperties } from 'react'
import type { Media } from '@/payload-types'
import { extendTailwindMerge } from 'tailwind-merge'

/*
  **Os tamanhos de fonte proprios do `tailwind.config.ts` precisam estar aqui.**
  Sem isso o `tailwind-merge` le `text-display-lg` e `text-eyebrow` como cor,
  porque aceita qualquer valor depois de `text-` como cor. Ai, na mesma chamada
  com `text-tinta`, ele apagava o tamanho e o titulo saia em corpo de texto; e ao
  lado de `text-sm` ele mantinha os dois, e quem vencia era a ordem da folha.
  Criou tamanho novo no config? Acrescente na lista.
*/
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-xl', 'display-lg', 'display-md', 'eyebrow'] }],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

/**
 * Mensagem que ja chega escrita na conversa. Vale como reserva: o texto oficial
 * fica em `mensagemWhatsapp`, na global Clinica, para a clinica trocar sem deploy.
 */
export const MENSAGEM_WHATSAPP_PADRAO =
  'Olá, venho do Google e quero saber mais sobre o tratamento capilar. Consegue me ajudar a agendar minha consulta?'

export const whatsappLink = (numero: string, mensagem?: string) => {
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''
  return `https://wa.me/${numero.replace(/\D/g, '')}${texto}`
}

/**
 * Rota ate a unidade no Google Maps. Vai pelo nome da clinica mais o endereco,
 * e nao por
 * coordenada, porque o endereco ja esta no painel e a clinica e um lugar
 * registrado no Google. Assim continua funcionando se ela mudar de endereco sem
 * ninguem lembrar de atualizar uma latitude.
 */
export const rotaNoMapa = (nome: string, endereco: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${nome}, ${endereco.replace(/\s*\n\s*/g, ', ')}`,
  )}`

/**
 * O painel aceita tanto o endereco de `src` quanto o codigo inteiro do iframe,
 * porque e isso que o Google entrega no botao de incorporar e ninguem deveria
 * precisar recortar na mao. Aqui reduzimos os dois ao endereco.
 *
 * Devolve `null` no que nao for embed do Google Maps, para nao virar porta de
 * incorporar qualquer coisa de fora no rodape.
 */
export const enderecoDoMapa = (valor?: string | null) => {
  if (!valor) return null
  const bruto = valor.trim()
  const src = bruto.startsWith('<') ? bruto.match(/src=["']([^"']+)["']/)?.[1] : bruto
  if (!src) return null

  try {
    const url = new URL(src)
    const dominioValido = url.protocol === 'https:' && /(^|\.)google\.com$/.test(url.hostname)
    return dominioValido && url.pathname.startsWith('/maps/embed') ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * Deixa o numero do painel legivel na tela. Ele e gravado so com digitos e com
 * o DDI, formato que o wa.me exige, e nesse estado ninguem consegue ler nem
 * copiar de olho. Numero fora do padrao brasileiro volta como veio.
 */
export const formatarWhatsapp = (numero: string) => {
  const digitos = numero.replace(/\D/g, '')
  const local = digitos.startsWith('55') ? digitos.slice(2) : digitos

  if (local.length !== 10 && local.length !== 11) return numero

  const ddd = local.slice(0, 2)
  const resto = local.slice(2)
  const corte = resto.length === 9 ? 5 : 4

  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`
}

/**
 * Relacao de upload volta como id ou como documento, dependendo do depth da
 * consulta. Isto reduz os dois casos ao unico que a interface sabe renderizar.
 */
export const midia = (valor?: (number | null) | Media): Media | null =>
  typeof valor === 'object' && valor !== null ? valor : null

/**
 * Traduz o ponto de foco escolhido no painel em `object-position`.
 *
 * Recortar apara o arquivo num retangulo fixo, mas a mesma foto cai em caixas de
 * proporcoes diferentes no site, e o `object-cover` recorta de novo por cima. O
 * foco e o que sobrevive a isso: ele diz qual ponto da foto precisa continuar
 * visivel, seja no painel largo do hero ou num avatar redondo.
 *
 * O Payload grava `focalX` e `focalY` em porcentagem, a mesma unidade do
 * `object-position`, entao nao ha conversao.
 *
 * Devolver `undefined` no centro e deliberado, e nao e so economia de bytes: o
 * Payload ja grava `50` nos dois campos assim que o arquivo sobe, entao sem esse
 * corte toda foto do site carregaria um `object-position: 50% 50%` inline, que e
 * exatamente o valor inicial do CSS. O estilo so aparece no HTML quando alguem
 * de fato arrastou o foco no painel.
 */
const CENTRO = 50

export const enquadramento = (item?: Media | null): CSSProperties | undefined => {
  if (!item) return undefined

  const x = item.focalX ?? CENTRO
  const y = item.focalY ?? CENTRO
  if (x === CENTRO && y === CENTRO) return undefined

  return { objectPosition: `${x}% ${y}%` }
}
