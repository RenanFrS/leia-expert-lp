/**
 * A marca na tela de login do painel, no lugar da pena do Payload.
 *
 * **O arquivo e um PNG transparente de desenho escuro**, o mesmo 500x500 do
 * favicon e do header do site. Por isso ele vai sobre uma chapa branca, como ja
 * acontece no rodape e no cartao do Sobre: o painel do Payload segue o tema do
 * sistema, e no tema escuro o desenho sumiria no fundo. No tema claro a chapa
 * cai sobre um fundo que ja e claro, entao ela some e sobra so a marca.
 *
 * **A caixa e maior do que parece necessario** porque o desenho ocupa so
 * 323x292 dos 500x500 do arquivo: o resto e margem transparente. Medido, a
 * marca sai com cerca de 129px dentro dos 200px da caixa. Por isso tambem nao
 * ha padding aqui, a propria margem do arquivo ja afasta a arte da chapa.
 *
 * E `<img>` e nao `next/image` de proposito. O painel nao carrega o CSS do site
 * e esta tela abre antes de qualquer sessao, entao o caminho mais curto ate o
 * arquivo e o melhor.
 */
export const LogotipoPainel = () => (
  <img
    src="/logo-leia.png"
    alt="Léia Expert"
    width={200}
    height={200}
    style={{
      width: 200,
      height: 200,
      display: 'block',
      background: '#FFFFFF',
      borderRadius: 28,
      boxSizing: 'border-box',
    }}
  />
)
