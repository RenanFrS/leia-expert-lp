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
              admin: { description: 'Texto miúdo que abre a grade, à esquerda do resumo.' },
            },
            {
              name: 'sobreResumo',
              type: 'textarea',
              label: 'Resumo',
              maxLength: 320,
              admin: { description: 'Parágrafo curto, em cinza. Duas ou três linhas.' },
            },
            {
              name: 'sobre',
              type: 'textarea',
              label: 'Frase principal',
              admin: { description: 'O bloco grande, em destaque. É o que sustenta a seção.' },
            },
            {
              name: 'foto',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto da seção',
              admin: { description: 'Foto larga, atravessa a página inteira. Ideal por volta de 2000 por 900.' },
            },
            {
              name: 'retrato',
              type: 'upload',
              relationTo: 'media',
              label: 'Retrato da assinatura',
              admin: { description: 'Aparece pequeno e redondo, ao lado do nome. Rosto centralizado.' },
            },
            {
              name: 'nomeProfissional',
              type: 'text',
              label: 'Nome na assinatura',
              defaultValue: 'Leia',
            },
            {
              name: 'credencial',
              type: 'text',
              label: 'Credencial',
              admin: { description: 'A linha sob o nome. Exemplo: Tricologista clínica.' },
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
                  'Aparecem em lista na seção Sobre. Uma por linha, curtas. Sem itens, a lista não aparece.',
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
              label: 'Foto do agendamento',
              admin: {
                description:
                  'Ocupa a metade direita da seção de contato, sangrando até a borda da tela. Fica em pé no celular e alta no desktop.',
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
          label: 'Numeros',
          description: 'Aparecem na faixa de prova social da página.',
          fields: [
            {
              name: 'metricas',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Numero', plural: 'Numeros' },
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
