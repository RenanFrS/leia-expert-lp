/**
 * A marca no topo do menu do painel, a versao miuda do LogotipoPainel.
 *
 * Mesma chapa branca e mesmo motivo: o desenho e escuro e transparente, e o
 * painel pode estar no tema escuro. Aqui o raio e menor porque o quadrado tem
 * pouco mais de 20px, e o padding sai pelo mesmo motivo do outro: a margem
 * transparente do arquivo ja segura a arte longe da borda da chapa.
 */
export const IconePainel = () => (
  <img
    src="/logo-leia.png"
    alt="Léia Expert"
    width={30}
    height={30}
    style={{
      width: 30,
      height: 30,
      display: 'block',
      background: '#FFFFFF',
      borderRadius: 8,
      boxSizing: 'border-box',
    }}
  />
)
