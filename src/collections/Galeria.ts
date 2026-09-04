import type { CollectionConfig } from 'payload'

/**
 * Fotos da clinica, do ambiente e da profissional, que alimentam a grade
 * parallax da secao de fechamento.
 *
 * **Uma foto por registro, na proporcao que ela tiver.** E o que faz a grade do
 * skiper30 respirar: ela distribui as fotos em colunas e a variacao de altura e
 * justamente o desenho.
 *
 * **Ela ja teve um campo `categoria`**, que separava foto de clinica de post
 * pronto de antes e depois. O campo saiu quando a grade de antes e depois passou
 * a ler a colecao `resultados`, a mesma do carrossel, montando o par a partir
 * dos campos `antes` e `depois` de cada caso. Com um destino so, a categoria
 * virava pergunta sem resposta no painel. Os 14 registros que existiam na
 * categoria antiga foram apagados; os arquivos seguem na Media.
 *
 * Nao ha campo de legenda de proposito. O texto alternativo sai do `alt` da
 * Media, que ja e obrigatorio la, e repetir aqui criaria duas descricoes da
 * mesma imagem podendo divergir.
 */
export const Galeria: CollectionConfig = {
  slug: 'galeria',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'ordem', 'publicado'],
    group: 'Conteudo',
  },
  labels: { singular: 'Foto da clínica', plural: 'Fotos da clínica' },
  access: { read: () => true },
  defaultSort: 'ordem',
  fields: [
    {
      name: 'titulo',
      type: 'text',
      required: true,
      admin: {
        description:
          'Só organiza a lista aqui do painel. Não aparece no site. Exemplo: Recepção, vista da entrada.',
      },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Uma imagem só, na proporção que ela tiver. Aparece na seção A clínica.',
      },
    },
    /*
      Ordem na grade. Os valores vao de dez em dez pelo mesmo motivo da colecao
      Resultados: encaixar uma foto entre duas existentes e escolher um numero no
      meio, sem renumerar a lista toda.
    */
    { name: 'ordem', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'publicado', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
