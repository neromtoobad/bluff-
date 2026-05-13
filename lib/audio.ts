// Web Audio synthesis. All sounds are generated on-the-fly — no files,
// no external libraries. Off by default. Browser autoplay policies
// require a user gesture to resume the AudioContext, so enableAudio()
// must be called from a click / tap.

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let enabled = false

type Stoppable = { stop: () => void; setLevel?: (n: number) => void }

let crowdNode: Stoppable | null = null
let thinkingNode: Stoppable | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (ctx) return ctx
  const AC =
    window.AudioContext ?? (window as any).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  masterGain = ctx.createGain()
  masterGain.gain.value = 0
  masterGain.connect(ctx.destination)
  return ctx
}

export function isAudioEnabled(): boolean {
  return enabled
}

export function enableAudio(): void {
  const c = getCtx()
  if (!c || !masterGain) return
  if (c.state === "suspended") c.resume().catch(() => {})
  enabled = true
  masterGain.gain.cancelScheduledValues(c.currentTime)
  masterGain.gain.linearRampToValueAtTime(1, c.currentTime + 0.1)
}

export function disableAudio(): void {
  enabled = false
  if (!masterGain || !ctx) return
  masterGain.gain.cancelScheduledValues(ctx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12)
  crowdNode?.stop()
  crowdNode = null
  thinkingNode?.stop()
  thinkingNode = null
}

// ----------------------------- 1. roundBell -----------------------------
// Metallic ding via inharmonic partials at 880Hz.
export function roundBell(): void {
  if (!enabled) return
  const c = getCtx()
  if (!c || !masterGain) return
  const t0 = c.currentTime
  const fundamental = 880

  const partials = [1, 2.76, 5.4]
  const weights = [1, 0.55, 0.25]
  partials.forEach((mult, i) => {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = "sine"
    osc.frequency.value = fundamental * mult
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(0.35 * weights[i], t0 + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3)
    osc.connect(g).connect(masterGain!)
    osc.start(t0)
    osc.stop(t0 + 0.35)
  })
}

// ----------------------------- 2. betConfirm ----------------------------
// Ascending two-tone chime (C5 → G5).
export function betConfirm(): void {
  if (!enabled) return
  const c = getCtx()
  if (!c || !masterGain) return
  const t0 = c.currentTime
  const tones = [523.25, 783.99] // C5, G5
  tones.forEach((f, i) => {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = "triangle"
    osc.frequency.value = f
    const start = t0 + i * 0.09
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(0.3, start + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0008, start + 0.28)
    osc.connect(g).connect(masterGain!)
    osc.start(start)
    osc.stop(start + 0.3)
  })
}

// --------------------------- 3. agentThinking ---------------------------
// Subtle low hum, loops until stopped.
export function startAgentThinking(): void {
  if (!enabled) return
  const c = getCtx()
  if (!c || !masterGain) return
  if (thinkingNode) return

  const osc1 = c.createOscillator()
  const osc2 = c.createOscillator()
  osc1.type = "sawtooth"
  osc2.type = "sawtooth"
  osc1.frequency.value = 70
  osc2.frequency.value = 73 // slight detune for movement

  const lp = c.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 240
  lp.Q.value = 0.7

  const g = c.createGain()
  g.gain.value = 0

  osc1.connect(lp)
  osc2.connect(lp)
  lp.connect(g).connect(masterGain)

  g.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.18)
  osc1.start()
  osc2.start()

  thinkingNode = {
    stop() {
      if (!c) return
      g.gain.cancelScheduledValues(c.currentTime)
      g.gain.linearRampToValueAtTime(0, c.currentTime + 0.15)
      osc1.stop(c.currentTime + 0.2)
      osc2.stop(c.currentTime + 0.2)
    },
  }
}

export function stopAgentThinking(): void {
  thinkingNode?.stop()
  thinkingNode = null
}

// ----------------------------- 4. roundEnd ------------------------------
// Low thud with a short feedback-delay tail for cheap reverb.
export function roundEnd(): void {
  if (!enabled) return
  const c = getCtx()
  if (!c || !masterGain) return
  const t0 = c.currentTime

  const osc = c.createOscillator()
  osc.type = "sine"
  osc.frequency.setValueAtTime(110, t0)
  osc.frequency.exponentialRampToValueAtTime(38, t0 + 0.45)

  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(0.55, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + 1.1)

  const delay = c.createDelay(2)
  delay.delayTime.value = 0.16
  const fb = c.createGain()
  fb.gain.value = 0.45
  delay.connect(fb).connect(delay)
  const wet = c.createGain()
  wet.gain.value = 0.45

  osc.connect(g)
  g.connect(masterGain) // dry
  g.connect(delay)
  delay.connect(wet).connect(masterGain) // wet tail
  osc.start(t0)
  osc.stop(t0 + 1.2)
}

// ---------------------------- 5. winnerReveal ---------------------------
// Three-note ascending fanfare (C5 → E5 → G5).
export function winnerReveal(): void {
  if (!enabled) return
  const c = getCtx()
  if (!c || !masterGain) return
  const t0 = c.currentTime
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((f, i) => {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = "square"
    osc.frequency.value = f
    const start = t0 + i * 0.2
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(0.22, start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0008, start + 0.5)
    osc.connect(g).connect(masterGain!)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}

// ---------------------------- 6. crowdAmbience --------------------------
// Layered band-passed white noise. Loops; loudness adjustable.
export function startCrowdAmbience(level: number = 0.06): void {
  if (!enabled) return
  const c = getCtx()
  if (!c || !masterGain) return
  if (crowdNode) {
    crowdNode.setLevel?.(level)
    return
  }
  // 2s loop buffer of white noise
  const bufferSize = c.sampleRate * 2
  const buf = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const noise = c.createBufferSource()
  noise.buffer = buf
  noise.loop = true

  const bp = c.createBiquadFilter()
  bp.type = "bandpass"
  bp.frequency.value = 520
  bp.Q.value = 0.6

  const lp = c.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 1100

  // Slow tremolo via an LFO on a gain — gives the murmur its rolling feel.
  const lfo = c.createOscillator()
  lfo.frequency.value = 0.35
  const lfoGain = c.createGain()
  lfoGain.gain.value = 0.012
  lfo.connect(lfoGain)

  const main = c.createGain()
  main.gain.value = 0
  lfoGain.connect(main.gain)

  noise.connect(bp).connect(lp).connect(main).connect(masterGain)
  noise.start()
  lfo.start()
  main.gain.linearRampToValueAtTime(level, c.currentTime + 0.6)

  crowdNode = {
    stop() {
      if (!c) return
      main.gain.cancelScheduledValues(c.currentTime)
      main.gain.linearRampToValueAtTime(0, c.currentTime + 0.5)
      noise.stop(c.currentTime + 0.6)
      lfo.stop(c.currentTime + 0.6)
    },
    setLevel(n: number) {
      if (!c) return
      main.gain.cancelScheduledValues(c.currentTime)
      main.gain.linearRampToValueAtTime(n, c.currentTime + 0.4)
    },
  }
}

export function setCrowdLevel(level: number): void {
  crowdNode?.setLevel?.(level)
}

export function stopCrowdAmbience(): void {
  crowdNode?.stop()
  crowdNode = null
}
