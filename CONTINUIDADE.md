# Continuidade

Estado do projeto para retomar em outra maquina ou depois de um intervalo longo. As regras de como
trabalhar aqui ficam no `CLAUDE.md`; este arquivo e so onde as coisas pararam.

Ultima atualizacao: 21 de agosto de 2026.

## Como subir em uma maquina nova

```bash
git clone https://github.com/RenanFrS/leia-expert-lp.git
cd leia-expert-lp
pnpm install
cp .env.example .env    # e preencher, veja abaixo
pnpm dev
```

Com o servidor no ar, nessa ordem:

1. `http://localhost:3000/api/dev/gerar-tipos` para gerar `src/payload-types.ts`
2. `http://localhost:3000/api/dev/seed` para popular o conteudo de exemplo
3. `http://localhost:3000/admin` para criar o usuario administrador, se o banco for novo

O schema do Postgres sobe sozinho pelo push do modo dev na primeira vez que o config carrega.

## O que nao vai no git

| O que | Onde estava | Como recuperar |
| --- | --- | --- |
| `.env` | raiz do projeto | copiar da maquina antiga, veja a lista abaixo |
| `node_modules`, `.next` | raiz | `pnpm install` e `pnpm dev` |
| `media/` | raiz | nao e usado, a midia vive no Cloudinary |
| `public/fotos` e `public/videos` | raiz, 474MB | **copiar da maquina antiga**, veja abaixo |

O `public/fotos` e o `public/videos` guardam o material bruto que o cliente mandou, incluindo video de
consulta. Ficam fora do git de proposito: nenhum codigo referencia esses arquivos, a midia do site vive
no Cloudinary, e o repositorio e publico, o que torna imagem de consulta um problema de privacidade e nao
so de peso. **Esse material so existe na maquina antiga.** Leve junto com o `.env`.

O `.env` guarda as credenciais do **Neon**, do **Cloudinary** e do **SMTP**. Nenhuma delas esta no
repositorio, e o `.env.example` lista os nomes das variaveis sem os valores. Leve o arquivo por um
caminho seguro, nao por chat nem por commit.

**A transcricao das conversas com o Claude tambem nao pode ir para o repositorio.** As credenciais do
Neon e do Cloudinary foram coladas no chat e estao dentro dela. Ela fica em
`~/.claude/projects/-mnt-dados-Workspace-leia-expert/`, junto da pasta `memory/`, que guarda anotacoes de
contrato e de cliente. As duas sao locais da maquina e nao acompanham o clone.

## Onde cada secao esta

Ordem da pagina: Hero, Metricas, Sobre, Tratamentos, Tricoscopia, Resultados, Depoimentos, Duvidas,
Agendamento, Rodape.

| Secao | Estado |
| --- | --- |
| Hero | refeito no formato do `hero214`. Tres recortes em volta de um painel de midia, e cada bloco aceita varias fotos ou videos que se alternam em esmaecimento |
| Metricas | pronta, com numeros de exemplo a confirmar |
| Sobre | nova, no formato do `about14`, em primeira pessoa |
| Tratamentos | pronta, seis tratamentos no seed |
| Tricoscopia | pronta |
| Resultados | **nao aparece na pagina**, porque depende de par antes e depois publicado e nao existe nenhum |
| Depoimentos | pronta, com depoimento inventado que nao pode ir ao ar |
| Duvidas | pronta, oito perguntas |
| Agendamento | refeita no formato do `contact34`, com cartao de contato sobre a foto |
| Rodape | pronto |

## O que ficou pendente

### Depende do cliente

Nada disso se resolve com codigo. Esta tudo marcado como PLACEHOLDER no `src/lib/seed.ts`.

- **Fotos**: as tres do hero, a do Sobre, o retrato da assinatura, a do agendamento, as de tratamento e
  os pares antes e depois. Enquanto nao chegam, cada bloco mostra uma chapa de areia e nada quebra
- **Pares antes e depois**: precisam de autorizacao do paciente. Sem eles a secao Resultados nao existe
  e o link Resultados do menu aponta para ancora que nao existe
- **Numero de WhatsApp** de verdade, hoje `5511000000000`
- **Endereco da unidade**, hoje propositalmente falso
- **Metricas**: atendimentos, anos de atuacao e nota do Google
- **Depoimentos reais**: depoimento inventado nao pode ir ao ar, tanto pelo CDC quanto pelas regras de
  publicidade em saude
- **Nome e credencial da profissional**, que aparecem na assinatura do Sobre. Formacao e registro sao
  afirmacao legal e nao podem ser escritos por nos
- **Credenciais de SMTP**, para o aviso de lead novo sair por email. Sem elas o site funciona e o lead
  grava igual, so nao sai o aviso
- **Texto alternativo da logo**, que esta como "logotipo" no painel e deveria ser o nome da marca

### Decisoes em aberto

- **Recorte decorativo do hero no celular.** No print do `hero214` o painel tem um degrau vazio no topo.
  Ficou de fora, porque ali e so forma e um canto invertido meio certo le como defeito. Falta o Renan
  decidir se entra
- **Acentuacao do painel.** O `CLAUDE.md` manda acentuar rotulo de painel, mas todo o config foi escrito
  sem acento. A global Clinica ja esta acentuada, as colecoes e o nome do grupo `Configuracoes` nao. Sao
  uns quinze textos para varrer de uma vez

### Divida tecnica

- **`pnpm migrate` nao roda**, pelo mesmo motivo que quebra o CLI do Payload. O schema atual saiu do push
  automatico do modo dev contra o Neon. Vale resolver antes de o site ter movimento, senao mudanca de
  schema em producao vira problema
- **O CTA da Tricoscopia nao dispara `clique_agendar`.** O do hero e o do header disparam. Basta trocar
  pelo `components/BotaoAgendar.tsx`
- **A lista de motivos de contato vive em tres lugares**: `src/lib/motivos.ts`, o esquema Zod da rota e o
  select do formulario. Mexer em um pede conferir os tres

### Do plano de estrutura, ainda nao feito

- Carrosseis em Resultados e Depoimentos, com Embla, que **ainda nao esta instalado**
- Secao Diferenciais, em bento
- CTA final antes do rodape
- Global `Home`, para a ordem das secoes sair do painel

## O que foi feito nesta sessao

1. **Animacoes do React Bits.** `AnimatedContent` com gsap nos cards e no formulario, e a camada
   especular em WebGL nos quatro CTAs principais. Os dois respeitam `prefers-reduced-motion`
2. **Secao Sobre**, no formato do `about14`, com aba propria no painel
3. **Formulario refeito** no formato do `contact34`, com foto, cartao de contato flutuante e botao de
   WhatsApp dentro dele
4. **Hero refeito** no formato do `hero214`, com os tres blocos de midia rotativa

Tres defeitos antigos foram corrigidos no caminho:

- O checkbox de autorizacao **nao travava o envio**. Tinha `required`, mas o formulario usa `noValidate`,
  entao a validacao nativa nunca rodava
- Os rotulos do formulario **estavam invisiveis**, marrom sobre marrom, com 1.23 de contraste. Hoje o
  `Label` nao fixa cor e a secao define, dando 4.9
- O estado de sucesso do formulario **apagava a secao inteira**, foto e cartao junto

## Armadilhas que ja custaram tempo

Estao todas explicadas no `CLAUDE.md`, mas estas tres sao as que mais voltam:

1. **Um `pnpm dev` por vez.** Dois processos escrevem no mesmo `.next` e o site passa a carregar sem
   estilo, com 404 em todo `/_next/static`. Se acontecer: pare tudo, apague o `.next`, suba de novo
2. **Nao rode `pnpm build` com o `pnpm dev` no ar**, pelo mesmo motivo
3. **O CLI do Payload nao carrega o config neste projeto.** Tipos e seed saem pelas rotas de
   desenvolvimento, nunca por `pnpm payload ...`

## Contatos do projeto

- Repositorio: `https://github.com/RenanFrS/leia-expert-lp`
- Dominio de producao: `https://leiaexpert.com.br`
- Banco: Neon, regiao `sa-east-1`
- Midia: Cloudinary, conta em modo Dynamic folders
