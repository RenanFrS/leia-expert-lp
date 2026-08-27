/**
 * Lista canonica dos motivos de contato, usada pela colecao de leads e pelo
 * aviso por email. O formulario e o esquema Zod da rota ainda mantem a propria
 * copia, entao mexer aqui pede conferir os dois.
 */
export const motivos = [
  { valor: 'queda-capilar', rotulo: 'Queda capilar' },
  { valor: 'alopecia', rotulo: 'Alopecia' },
  { valor: 'caspa-dermatite', rotulo: 'Caspa e dermatite' },
  { valor: 'tricoscopia', rotulo: 'Consulta e tricoscopia' },
  { valor: 'outro', rotulo: 'Outro assunto' },
]

/** Mesma lista no formato que o Payload espera em campo select. */
export const opcoesDeMotivo = motivos.map(({ valor, rotulo }) => ({ label: rotulo, value: valor }))

export const rotuloDoMotivo = (valor?: string | null) =>
  motivos.find((motivo) => motivo.valor === valor)?.rotulo || 'Nao informado'
