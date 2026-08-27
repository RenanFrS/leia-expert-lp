'use client'

import { useState } from 'react'
import ReactCrop, { type Crop } from 'react-image-crop'
import { useConfig, useDocumentInfo } from '@payloadcms/ui'

import 'react-image-crop/dist/ReactCrop.css'

/**
 * Ferramenta de recorte da Media.
 *
 * O recorte nativo do Payload foi desligado na colecao, e o motivo esta la: ele
 * sobrescreve o original, entao a foto recortada ficava presa no cache de borda
 * do Cloudinary por minutos e um segundo recorte estourava com dimensoes velhas.
 *
 * Este aqui **nao encosta no original**. Ele manda a area escolhida para o
 * endpoint `/api/media/:id/recortar`, que gera um arquivo novo na biblioteca.
 * Como o arquivo novo tem endereco proprio, ele aparece na hora, e da para
 * recortar quantas vezes quiser sem recarregar a pagina.
 *
 * A area vai em **porcentagem**, nunca em pixel. E o que desacopla o recorte das
 * dimensoes que o navegador acha que o arquivo tem, que era a origem do
 * `extract_area: bad extract area`.
 */

/** Os formatos que as caixas do site realmente usam. */
const PROPORCOES = [
  { rotulo: 'Livre', valor: undefined },
  { rotulo: '16:9', valor: 16 / 9 },
  { rotulo: '4:3', valor: 4 / 3 },
  { rotulo: '1:1', valor: 1 },
  { rotulo: '3:4', valor: 3 / 4 },
  { rotulo: '9:16', valor: 9 / 16 },
]

const INICIAL: Crop = { unit: '%', x: 10, y: 10, width: 80, height: 80 }

type Gerada = { id: number | string; filename: string; largura?: number; altura?: number }

export function RecorteImagem() {
  const { id, savedDocumentData } = useDocumentInfo()
  const { config } = useConfig()

  const [crop, setCrop] = useState<Crop>(INICIAL)
  const [proporcao, setProporcao] = useState<number | undefined>(undefined)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [gerada, setGerada] = useState<Gerada | null>(null)

  const doc = savedDocumentData as Record<string, unknown> | undefined
  const url = typeof doc?.url === 'string' ? doc.url : null
  const mimeType = typeof doc?.mimeType === 'string' ? doc.mimeType : ''

  // Sem documento salvo nao ha o que recortar, e video nao entra.
  if (!id || !url || !mimeType.startsWith('image/')) return null

  const recortar = async () => {
    setEnviando(true)
    setErro(null)
    setGerada(null)

    try {
      const resposta = await fetch(`${config.routes.api}/media/${id}/recortar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: crop.x,
          y: crop.y,
          largura: crop.width,
          altura: crop.height,
        }),
      })

      const dados = await resposta.json()
      if (!resposta.ok) throw new Error(dados?.erro || 'Não foi possível recortar.')

      setGerada({ id: dados.id, filename: dados.filename, largura: dados.largura, altura: dados.altura })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível recortar.')
    } finally {
      setEnviando(false)
    }
  }

  const areaValida = (crop.width || 0) > 0 && (crop.height || 0) > 0

  return (
    <div className="field-type" style={{ marginBlockStart: '1.5rem' }}>
      <h4 style={{ marginBlockEnd: '.25rem' }}>Recortar imagem</h4>
      <p style={{ marginBlockStart: 0, marginBlockEnd: '.75rem', opacity: 0.7, fontSize: '.85rem' }}>
        Arraste sobre a foto para escolher a área. O recorte vira uma imagem nova na biblioteca e o
        original continua intacto.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBlockEnd: '.75rem' }}>
        {PROPORCOES.map((item) => (
          <button
            key={item.rotulo}
            type="button"
            onClick={() => setProporcao(item.valor)}
            aria-pressed={proporcao === item.valor}
            className={`btn btn--size-small ${
              proporcao === item.valor ? 'btn--style-primary' : 'btn--style-secondary'
            }`}
            style={{ margin: 0 }}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      <ReactCrop crop={crop} onChange={(_, emPorcento) => setCrop(emPorcento)} aspect={proporcao}>
        {/* `next/image` nao entra aqui: o painel do Payload nao passa pelo
            otimizador e o ReactCrop precisa medir o proprio elemento. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" style={{ maxWidth: '100%', display: 'block' }} />
      </ReactCrop>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBlockStart: '.75rem' }}>
        <button
          type="button"
          onClick={recortar}
          disabled={enviando || !areaValida}
          className="btn btn--style-primary btn--size-small"
          style={{ margin: 0 }}
        >
          {enviando ? 'Gerando...' : 'Gerar recorte'}
        </button>

        {areaValida && (
          <span style={{ opacity: 0.7, fontSize: '.85rem' }}>
            {Math.round(crop.width)}% x {Math.round(crop.height)}% da imagem
          </span>
        )}
      </div>

      {erro && (
        <p role="alert" style={{ color: 'var(--theme-error-500)', marginBlockStart: '.75rem' }}>
          {erro}
        </p>
      )}

      {gerada && (
        <p style={{ marginBlockStart: '.75rem' }}>
          Recorte criado:{' '}
          <a href={`${config.routes.admin}/collections/media/${gerada.id}`}>{gerada.filename}</a>
          {gerada.largura ? ` (${gerada.largura} x ${gerada.altura})` : ''}
        </p>
      )}
    </div>
  )
}
