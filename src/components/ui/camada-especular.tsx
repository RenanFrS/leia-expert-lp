'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl'

/**
 * Brilho especular na borda, extraido do SpecularButton do React Bits. Vem so a
 * camada WebGL: o botao, os tamanhos, o raio e a sombra do original ficaram de
 * fora porque sobrescreveriam o `buttonVariants` e a paleta do projeto.
 *
 * Cada instancia abre um contexto WebGL, e o navegador derruba os mais antigos
 * passando de uns 16, com teto menor no celular. Por isso isto e opt-in, ligado
 * so nos CTAs principais pela prop `especular` do Button. Nao saia espalhando
 * pelos botoes secundarios.
 */

// Sem folga em volta: o botao tem overflow-hidden por causa do brilho em CSS,
// entao qualquer sobra do canvas seria recortada de qualquer jeito. Com zero, o
// canvas casa exatamente com o botao e a linha fica colada na borda.
const PAD = 0

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = sdRoundedRect(p, uHalfSize, uRadius);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`

/**
 * O original registra um listener de pointermove por botao. Aqui existe um so,
 * no modulo, com os interessados inscritos, para nao multiplicar handler de
 * mouse em cada CTA da pagina.
 */
type Assinante = (evento: PointerEvent) => void
const assinantes = new Set<Assinante>()
let ouvindo = false

const inscrever = (assinante: Assinante) => {
  assinantes.add(assinante)

  if (!ouvindo) {
    window.addEventListener('pointermove', aoMover, { passive: true })
    ouvindo = true
  }

  return () => {
    assinantes.delete(assinante)
    if (assinantes.size === 0 && ouvindo) {
      window.removeEventListener('pointermove', aoMover)
      ouvindo = false
    }
  }
}

function aoMover(evento: PointerEvent) {
  assinantes.forEach((assinante) => assinante(evento))
}

type Props = {
  /** Precisa acompanhar o rounded do botao, senao a linha descola da borda. */
  radius?: number
  lineColor?: string
  baseColor?: string
  intensity?: number
  shineSize?: number
  shineFade?: number
  thickness?: number
  proximity?: number
}

export function CamadaEspecular({
  radius = 8,
  lineColor = '#E0B48C',
  baseColor = '#5C4133',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  proximity = 250,
}: Props) {
  const fxRef = useRef<HTMLSpanElement>(null)
  const propsRef = useRef({ radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, proximity })

  propsRef.current = { radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, proximity }

  useEffect(() => {
    const fx = fxRef.current
    // O alvo e o botao, que e o pai posicionado desta camada.
    const alvo = fx?.parentElement
    if (!fx || !alvo) return

    // Sem WebGL nenhum para quem pediu menos movimento.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dpr = window.devicePixelRatio || 1
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const geometry = new Triangle(gl)
    if (geometry.attributes.uv) delete geometry.attributes.uv

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 0 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: dpr },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    fx.appendChild(gl.canvas)

    const tamanho = { w: 1, h: 1 }
    const redimensionar = () => {
      const caixa = alvo.getBoundingClientRect()
      tamanho.w = caixa.width
      tamanho.h = caixa.height
      renderer.setSize(caixa.width + PAD * 2, caixa.height + PAD * 2)
      program.uniforms.uCenter.value = [(PAD + caixa.width / 2) * dpr, (PAD + caixa.height / 2) * dpr]
      program.uniforms.uHalfSize.value = [(caixa.width / 2) * dpr, (caixa.height / 2) * dpr]
    }
    const ro = new ResizeObserver(redimensionar)
    ro.observe(alvo)
    redimensionar()

    let anguloPonteiro: number | null = null
    let proximidade = 0

    const desinscrever = inscrever((evento) => {
      const caixa = alvo.getBoundingClientRect()
      const cx = caixa.left + caixa.width / 2
      const cy = caixa.top + caixa.height / 2
      const dx = Math.max(caixa.left - evento.clientX, 0, evento.clientX - caixa.right)
      const dy = Math.max(caixa.top - evento.clientY, 0, evento.clientY - caixa.bottom)
      const distancia = Math.hypot(dx, dy)

      if (distancia === 0) {
        const nx = (evento.clientX - cx) / (caixa.width / 2)
        const ny = (cy - evento.clientY) / (caixa.height / 2)
        anguloPonteiro = Math.atan2(2 / caixa.height, -2 / caixa.width) + nx * 0.3 + ny * 0.15
      } else {
        anguloPonteiro = Math.atan2(cy - evento.clientY, evento.clientX - cx)
      }

      const t = Math.max(0, 1 - distancia / Math.max(propsRef.current.proximity, 1))
      proximidade = t * t * (3 - 2 * t)
    })

    let angulo = 2.4
    let brilho = 0
    let anterior = performance.now()
    let raf = 0

    const corLinha = new Color()
    const corBase = new Color()

    const atualizar = (agora: number) => {
      raf = requestAnimationFrame(atualizar)
      const dt = Math.min((agora - anterior) / 1000, 0.05)
      anterior = agora
      const p = propsRef.current

      if (anguloPonteiro != null) {
        const diff = ((anguloPonteiro - angulo + Math.PI * 3) % (Math.PI * 2)) - Math.PI
        angulo += diff * (1 - Math.exp(-dt * 7))
      }

      brilho += (proximidade - brilho) * (1 - Math.exp(-dt * 8))

      corLinha.set(p.lineColor)
      corBase.set(p.baseColor)
      program.uniforms.uAngle.value = angulo
      program.uniforms.uRadius.value = Math.min(p.radius, Math.min(tamanho.w, tamanho.h) / 2) * dpr
      program.uniforms.uLineColor.value = [corLinha.r, corLinha.g, corLinha.b]
      program.uniforms.uBaseColor.value = [corBase.r, corBase.g, corBase.b]
      program.uniforms.uIntensity.value = p.intensity * brilho
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180
      program.uniforms.uThickness.value = p.thickness * dpr
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(atualizar)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      desinscrever()
      if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas)
      // Devolve o contexto ao navegador, que so mantem um punhado deles vivos.
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return (
    <span
      ref={fxRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
    />
  )
}
