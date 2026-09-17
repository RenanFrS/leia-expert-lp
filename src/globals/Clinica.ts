import type { GlobalConfig } from 'payload'

export const Clinica: GlobalConfig = {
  slug: 'clinica',
  label: 'Dados da clínica',
  admin: { group: 'Configuracoes' },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade',
          fields: [
            { name: 'nome', type: 'text', required: true, defaultValue: 'Léia Expert' },
            { name: 'chamada', type: 'text', label: 'Frase de apoio' },
            { name: 'logo', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Hero',
          description:
            'A mídia do topo da página. Aceita foto e vídeo. Com mais de um arquivo, eles se alternam em esmaecimento.',
          fields: [
            {
              name: 'heroIntervalo',
              type: 'number',
              label: 'Tempo de cada mídia, em segundos',
              defaultValue: 5,
              min: 2,
              max: 30,
              admin: {
                description: 'Só tem efeito em bloco com dois arquivos ou mais.',
                step: 1,
              },
            },
            {
              name: 'heroPainel',
              type: 'array',
              label: 'Painel principal',
              labels: { singular: 'Arquivo', plural: 'Arquivos' },
              admin: { description: 'O primeiro arquivo é o que carrega primeiro, e é ele que aparece no topo.' },
              fields: [
                {
                  name: 'arquivo',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Foto ou vídeo',
                },
              ],
            },
          ],
        },
        {
          label: 'Vídeos de fundo',
          description:
            'Vídeos que entram atrás de uma seção. Sempre com um véu por cima, calculado para o texto continuar legível. Sem arquivo, a seção fica com o fundo chapado.',
          fields: [
            {
              name: 'videoTricoscopia',
              type: 'upload',
              relationTo: 'media',
              label: 'Seção do exame',
              admin: { description: 'Fundo da Tricoscopia digital. Só vídeo.' },
            },
            {
              name: 'videoDepoimentos',
              type: 'upload',
              relationTo: 'media',
              label: 'Seção dos depoimentos',
              admin: { description: 'Fundo do bloco "Quem já tratou". Só vídeo.' },
            },
          ],
        },
        {
          label: 'Sobre',
          description:
            'Alimenta a seção Sobre da página. O texto fala em primeira pessoa, como se a profissional estivesse se apresentando.',
          fields: [
            {
              name: 'sobreRotulo',
              type: 'text',
              label: 'Rótulo da coluna',
              defaultValue: 'Minha história',
              admin: { description: 'Pílula que abre a seção, acima do título.' },
            },
            {
              name: 'sobreResumo',
              type: 'textarea',
              label: 'Resumo',
              maxLength: 320,
              admin: { description: 'Parágrafo curto logo abaixo do título, em letra um pouco maior. Duas ou três linhas.' },
            },
            {
              name: 'sobre',
              type: 'textarea',
              label: 'Texto de apresentação',
              admin: {
                description:
                  'Separe os parágrafos com uma linha em branco. Todos saem em texto corrido, abaixo do resumo.',
              },
            },
            {
              name: 'fotos',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Fotos da seção',
              admin: {
                description:
                  'Viram um carrossel ao lado do texto, na ordem desta lista. Use fotos em pé, com o rosto no terço de cima, e marque o ponto de foco no alto da cabeça: assim o cabelo nunca é cortado. O cartão com o nome cobre a parte de baixo.',
              },
            },
            /*
              **Campo antigo, escondido e nao apagado.** Era a foto unica da
              secao, antes de ela virar carrossel. Apagar o campo faria o push do
              modo dev derrubar uma coluna com dado no banco de producao, e esse
              push pede confirmacao interativa quando ha perda de dado, o que num
              dev em segundo plano trava. Escondido, ele segue como reserva: o site
              so le este campo quando `fotos` esta vazio.
            */
            {
              name: 'foto',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto da seção (antiga)',
              admin: { hidden: true },
            },
            /*
              **Outro campo antigo, escondido pelo mesmo motivo do `foto`.** Era
              o avatar redondo ao lado do nome. No layout novo o cartao do nome
              leva a logo da clinica, e a foto que estava aqui entrou no
              carrossel, pelo campo `fotos`. O site nao le mais este campo.
            */
            {
              name: 'retrato',
              type: 'upload',
              relationTo: 'media',
              label: 'Retrato da assinatura (antigo)',
              admin: { hidden: true },
            },
            {
              name: 'nomeProfissional',
              type: 'text',
              label: 'Nome no cartão da foto',
              defaultValue: 'Leia',
            },
            {
              name: 'credencial',
              type: 'text',
              label: 'Credencial',
              admin: { description: 'A linha sob o nome, no cartão da foto. Exemplo: Tricologista clínica.' },
            },
            /*
              Formacao e especializacao, uma por linha. Existe porque a
              `credencial` e uma linha so, e o time de trafego pediu para
              valorizar a apresentacao da profissional: e a lista de formacao que
              sustenta autoridade numa pagina de clinica.
            */
            {
              name: 'credenciais',
              type: 'array',
              label: 'Formação e especializações',
              labels: { singular: 'Item', plural: 'Itens' },
              fields: [{ name: 'texto', type: 'text', required: true }],
              admin: {
                description:
                  'Aparecem em lista com selo, abaixo do texto de apresentação. Uma por linha, curtas. Sem itens, a lista não aparece.',
              },
            },
          ],
        },
        {
          label: 'Contato',
          fields: [
            {
              name: 'whatsapp',
              type: 'text',
              required: true,
              admin: { description: 'Somente números, com DDI e DDD. Exemplo: 5511999999999' },
            },
            { name: 'mensagemWhatsapp', type: 'text', defaultValue: 'Ola! Quero agendar uma avaliacao.' },
            { name: 'email', type: 'email' },
            {
              name: 'emailAvisoLead',
              type: 'email',
              label: 'E mail que recebe aviso de lead',
              admin: {
                description:
                  'Para onde vai o aviso de cada cadastro do formulário. Vazio, usa o e mail acima.',
              },
            },
            { name: 'instagram', type: 'text', admin: { description: 'Apenas o usuário, sem arroba.' } },
            {
              name: 'fotoAgendamento',
              type: 'upload',
              relationTo: 'media',
              // O nome do campo ficou o de quando a foto era da secao de
              // contato. Trocar o nome mudaria a coluna no banco, e so o lugar
              // no site mudou.
              label: 'Foto das dúvidas frequentes',
              admin: {
                description:
                  'Fica nas dúvidas frequentes, com um cartão de contato sobre a parte de baixo. Use foto deitada, com os rostos nos dois terços de cima, e marque o ponto de foco entre eles.',
              },
            },
            {
              name: 'unidades',
              type: 'array',
              labels: { singular: 'Unidade', plural: 'Unidades' },
              fields: [
                { name: 'nome', type: 'text', required: true },
                { name: 'endereco', type: 'textarea', required: true },
                { name: 'telefone', type: 'text' },
                { name: 'mapaUrl', type: 'text', label: 'Link do Google Maps' },
                {
                  name: 'mapaEmbed',
                  type: 'textarea',
                  label: 'Mapa incorporado',
                  admin: {
                    description:
                      'No Google Maps, use Compartilhar e depois Incorporar um mapa. Cole aqui o endereço que aparece em src, ou o código inteiro do iframe.',
                  },
                },
              ],
            },
            {
              name: 'horarios',
              type: 'text',
              label: 'Horário de atendimento',
              defaultValue: 'Segunda a sexta, das 9h as 19h',
            },
          ],
        },
        {
          // Aba sem `name`: trocar o rotulo nao muda onde o dado mora.
          label: 'Faixa de problemas',
          description:
            'A faixa em movimento logo abaixo do topo da página, com os problemas que a clínica trata.',
          fields: [
            {
              name: 'faixaProblemas',
              type: 'array',
              label: 'Problemas da faixa',
              labels: { singular: 'Problema', plural: 'Problemas' },
              admin: {
                description:
                  'Termos curtos, de uma a três palavras, do jeito que as pessoas procuram no Google. Eles aparecem uma vez no texto da página e contam para o SEO. Só coloque o que a clínica trata. Sem itens, a faixa não aparece.',
              },
              fields: [{ name: 'termo', type: 'text', required: true }],
            },
            /*
              **Campo antigo, escondido e nao apagado**, pelo mesmo motivo do
              `foto` e do `retrato` na aba Sobre: apagar faria o push do modo dev
              derrubar uma tabela com dado no banco de producao. Eram os numeros
              da faixa de prova social, que deu lugar a faixa de problemas. O site
              nao le mais este campo.
            */
            {
              name: 'metricas',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Numero', plural: 'Numeros' },
              admin: { hidden: true },
              fields: [
                { name: 'valor', type: 'text', required: true, admin: { description: 'Exemplo: 1.200+' } },
                { name: 'rotulo', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
