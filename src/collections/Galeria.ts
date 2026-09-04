import type { CollectionConfig } from 'payload'

/**
 * Fotos soltas que alimentam as duas grades parallax do site.
 *
 * **Uma foto por registro, na proporcao que ela tiver.** E o que faz a grade do
 * skiper30 respirar: ela distribui as fotos em colunas e a variacao de altura e
 * justamente o desenho. Um par antes e depois em campos separados forcaria um
 * cartao de proporcao fixa e mataria isso.
 *
 * No antes e depois estatico, o arquivo que entra aqui e o **post ja montado**,
 * com as duas fotos lado a lado, do jeito que sai da rede social. O site nao
 * monta a comparacao: quem faz isso e o comparador interativo da secao
 * Resultados, que continua existindo e vem de outra colecao.
 *
 * **A `categoria` e o que deixa uma colecao so servir as duas secoes.** Sem ela
 * seriam duas colecoes quase identicas, e a clinica teria dois lugares parecidos
 * para subir foto.
 *
 * Nao ha campo de legenda de proposito. O texto alternativo sai do `alt` da
 * Media, que ja e obrigatorio la, e repetir aqui criaria duas descricoes da
 * mesma imagem podendo divergir.
 */
export const Galeria: CollectionConfig = {
  slug: 'galeria',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'ordem', 'publicado'],
    group: 'Conteudo',
  },
  labels: { singular: 'Foto da galeria', plural: 'Galeria' },
  access: { read: () => true },
  defaultSort: 'ordem',
  fields: [
    {
      name: 'titulo',
      type: 'text',
      required: true,
      admin: {
        description:
          'Só organiza a lista aqui do painel. Não aparece no site. Exemplo: Caso 12, seis meses.',
      },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'Uma imagem só. No antes e depois, suba o post já montado com as duas fotos lado a lado.',
      },
    },
    {
      name: 'categoria',
      type: 'select',
      required: true,
      defaultValue: 'resultados',
      label: 'Onde aparece',
      options: [
        { label: 'Antes e depois, abaixo do comparador', value: 'resultados' },
        { label: 'A clínica, no fim da página', value: 'clinica' },
      ],
      admin: { position: 'sidebar' },
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
