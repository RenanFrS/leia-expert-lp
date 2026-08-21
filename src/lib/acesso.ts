/**
 * Regras de papel usadas no access control das colecoes.
 *
 * O usuario chega sem tipagem gerada enquanto src/payload-types.ts nao existir,
 * por isso o cast local. Troque por `User` assim que o pnpm generate:types rodar.
 */
type UsuarioComPapel = { papel?: string } | null | undefined

export const ehAdmin = (usuario: unknown) =>
  (usuario as UsuarioComPapel)?.papel === 'admin'
