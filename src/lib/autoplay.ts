/**
 * Toca um video mudo e, se o navegador recusar, tenta de novo no primeiro gesto
 * da pessoa. Devolve a funcao que desfaz tudo, para usar como limpeza de efeito.
 *
 * **Existe por causa do iPhone em Modo de Pouca Energia.** Nesse modo o iOS
 * bloqueia qualquer reproducao automatica, mesmo de video mudo com
 * `playsinline`: o atributo `autoplay` e ignorado e o `play()` e recusado com
 * `NotAllowedError`, em silencio. Nao ha como furar isso, mas o bloqueio cai no
 * primeiro gesto: um `play()` chamado de dentro de toque, clique ou tecla passa.
 * Por isso a reserva escuta esses eventos no documento inteiro, uma vez so, e o
 * video comeca no primeiro toque em qualquer lugar da pagina.
 *
 * Tres detalhes que nao sao opcionais:
 *
 * - **Os eventos sao os que contam como gesto para o navegador**: `touchend`,
 *   `click`, `pointerup` e `keydown`. `touchstart` e `scroll` nao liberam
 *   reproducao, e rolar a pagina nao destrava nada.
 * - **O `play()` e chamado dentro do proprio ouvinte**, sem `await` antes. Fora
 *   do instante do gesto a liberacao ja expirou.
 * - **Ao voltar para a aba, ele tenta de novo.** O Safari pausa video de aba em
 *   segundo plano e nem sempre retoma, e na volta do cache de navegacao
 *   (`pageshow`) o video pode reaparecer parado.
 *
 * O `muted` e reafirmado pela propriedade antes de cada tentativa: o iOS so
 * libera sem gesto video que esta mudo naquele instante.
 */
export function tocarComReserva(video: HTMLVideoElement): () => void {
  const gestos = ['touchend', 'click', 'pointerup', 'keydown'] as const
  let ativo = true
  let ouvindo = false

  const pararDeOuvir = () => {
    if (!ouvindo) return
    ouvindo = false
    gestos.forEach((gesto) => document.removeEventListener(gesto, aoGesto, true))
  }

  const ouvirGestos = () => {
    if (ouvindo || !ativo) return
    ouvindo = true
    gestos.forEach((gesto) =>
      document.addEventListener(gesto, aoGesto, { capture: true, passive: true }),
    )
  }

  const tentar = () => {
    if (!ativo) return
    video.muted = true
    // `play()` devolve promessa desde o Safari 10; a checagem cobre o que e
    // mais antigo que isso e nao quebra nada.
    const promessa = video.play()
    if (promessa) promessa.then(pararDeOuvir, ouvirGestos)
  }

  function aoGesto() {
    pararDeOuvir()
    tentar()
  }

  const aoVoltar = () => {
    if (document.visibilityState === 'visible' && video.paused) tentar()
  }

  document.addEventListener('visibilitychange', aoVoltar)
  window.addEventListener('pageshow', aoVoltar)
  tentar()

  return () => {
    ativo = false
    pararDeOuvir()
    document.removeEventListener('visibilitychange', aoVoltar)
    window.removeEventListener('pageshow', aoVoltar)
  }
}
