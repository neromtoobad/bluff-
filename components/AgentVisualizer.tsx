"use client"

import { useEffect, useRef } from "react"

type Props = {
  side: "bull" | "bear"
  isSpeaking: boolean
  intensity: number // 0-100, controls particle density
}

const SIZE = 200

const BULL_COLOR = 0xffb800 // amber
const BULL_HORN_COLOR = 0xfff0c0
const BEAR_COLOR = 0xff2da7 // magenta
const BEAR_INNER_EAR_COLOR = 0xff7fc8

export default function AgentVisualizer({ side, isSpeaking, intensity }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  // Mutable ref the animation loop reads from — props are React state,
  // but the loop runs outside React, so we mirror them here.
  const stateRef = useRef({ isSpeaking, intensity })

  useEffect(() => {
    stateRef.current = { isSpeaking, intensity }
  }, [isSpeaking, intensity])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let cancelled = false
    let cleanup: (() => void) | null = null

    ;(async () => {
      const THREE = await import("three")
      if (cancelled || !mountRef.current) return

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
      camera.position.set(0, 0.1, 3)

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      })
      renderer.setSize(SIZE, SIZE)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // Model
      const model =
        side === "bull" ? buildBull(THREE) : buildBear(THREE)
      scene.add(model)

      // Lighting — warm key for bull, cool blue key for bear
      scene.add(new THREE.AmbientLight(0x222222, 1))
      const keyLight = new THREE.PointLight(
        side === "bull" ? 0xffd28a : 0x88aaff,
        4,
        20,
      )
      keyLight.position.set(side === "bull" ? 0 : -1.2, 3, 2)
      scene.add(keyLight)
      const fill = new THREE.DirectionalLight(0xffffff, 0.25)
      fill.position.set(-1, -1, 2)
      scene.add(fill)

      // Particle system — BufferGeometry of Points
      const MAX_PARTICLES = 160
      const positions = new Float32Array(MAX_PARTICLES * 3)
      const velocities = new Float32Array(MAX_PARTICLES * 3)
      const lifetimes = new Float32Array(MAX_PARTICLES)
      for (let i = 0; i < MAX_PARTICLES; i++) {
        respawnParticle(positions, velocities, lifetimes, i)
      }
      const pGeom = new THREE.BufferGeometry()
      pGeom.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      )
      // Hide all particles initially — drawRange is updated in the loop.
      pGeom.setDrawRange(0, 0)
      const pColor = side === "bull" ? BULL_COLOR : BEAR_COLOR
      const pMat = new THREE.PointsMaterial({
        color: pColor,
        size: 0.07,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const points = new THREE.Points(pGeom, pMat)
      scene.add(points)

      const idleDirection = side === "bull" ? 1 : -1
      let frame = 0
      let lungeZ = 0
      let activeCount = 0

      const animate = () => {
        if (cancelled) return
        frame++
        const { isSpeaking, intensity } = stateRef.current

        // Slow idle rotation, opposite direction per side.
        model.rotation.y += 0.0055 * idleDirection
        // Tiny vertical bob so even the idle pose feels alive.
        model.position.y = Math.sin(frame * 0.02) * 0.04

        // Lunge forward on speak — ease into target Z.
        const targetZ = isSpeaking ? 0.55 : 0
        lungeZ += (targetZ - lungeZ) * 0.08
        model.position.z = lungeZ

        // Particle count scales with intensity when speaking.
        const targetActive = isSpeaking
          ? Math.round(
              Math.min(MAX_PARTICLES, 20 + (intensity / 100) * MAX_PARTICLES),
            )
          : 0
        // Smoothly ramp toward the target count.
        if (activeCount < targetActive) {
          activeCount = Math.min(targetActive, activeCount + 4)
        } else if (activeCount > targetActive) {
          activeCount = Math.max(targetActive, activeCount - 6)
        }
        pGeom.setDrawRange(0, activeCount)

        // Drift particles upward; recycle when they leave the box.
        const pos = pGeom.attributes.position.array as Float32Array
        for (let i = 0; i < activeCount; i++) {
          const x = i * 3
          pos[x] += velocities[x]
          pos[x + 1] += velocities[x + 1]
          pos[x + 2] += velocities[x + 2]
          lifetimes[i] -= 1
          if (pos[x + 1] > 1.5 || lifetimes[i] <= 0) {
            respawnParticle(pos, velocities, lifetimes, i)
          }
        }
        pGeom.attributes.position.needsUpdate = true

        renderer.render(scene, camera)
        animFrame = requestAnimationFrame(animate)
      }
      let animFrame = requestAnimationFrame(animate)

      cleanup = () => {
        cancelAnimationFrame(animFrame)
        pGeom.dispose()
        pMat.dispose()
        model.traverse((obj) => {
          const mesh = obj as any
          if (mesh.geometry) mesh.geometry.dispose?.()
          if (mesh.material) {
            const m = mesh.material
            if (Array.isArray(m)) m.forEach((x) => x.dispose?.())
            else m.dispose?.()
          }
        })
        renderer.dispose()
        if (renderer.domElement.parentElement === mount) {
          mount.removeChild(renderer.domElement)
        }
      }
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [side])

  const glow =
    side === "bull"
      ? "0 0 36px rgba(245, 166, 35, 0.35), 0 0 80px rgba(245, 166, 35, 0.18)"
      : "0 0 36px rgba(204, 34, 0, 0.35), 0 0 80px rgba(204, 34, 0, 0.18)"

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        width: SIZE,
        height: SIZE,
        margin: "0 auto",
        borderRadius: "50%",
        boxShadow: glow,
      }}
    />
  )
}

// ----- Geometry builders -----

function respawnParticle(
  positions: Float32Array,
  velocities: Float32Array,
  lifetimes: Float32Array,
  i: number,
) {
  const r = 0.35 + Math.random() * 0.45
  const theta = Math.random() * Math.PI * 2
  const phi = (Math.random() * Math.PI) / 2 + Math.PI / 4 // bias toward equator
  const x = i * 3
  positions[x] = r * Math.sin(phi) * Math.cos(theta)
  positions[x + 1] = -0.25 + Math.random() * 0.4
  positions[x + 2] = r * Math.cos(phi) * Math.sin(theta)
  velocities[x] = (Math.random() - 0.5) * 0.006
  velocities[x + 1] = 0.005 + Math.random() * 0.012
  velocities[x + 2] = (Math.random() - 0.5) * 0.006
  lifetimes[i] = 60 + Math.random() * 80
}

function buildBull(THREE: typeof import("three")) {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({
    color: BULL_COLOR,
    flatShading: true,
    roughness: 0.55,
    metalness: 0.35,
  })

  // Head — low-poly icosahedron, stretched slightly forward
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), mat)
  head.scale.set(1, 0.92, 1.08)
  group.add(head)

  // Snout — box pushed forward
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.5), mat)
  snout.position.set(0, -0.18, 0.6)
  group.add(snout)

  // Horns — cones angled outward and slightly forward
  const hornMat = new THREE.MeshStandardMaterial({
    color: BULL_HORN_COLOR,
    flatShading: true,
    roughness: 0.4,
    metalness: 0.5,
  })
  const hornGeom = new THREE.ConeGeometry(0.09, 0.6, 6)
  const hornL = new THREE.Mesh(hornGeom, hornMat)
  hornL.position.set(-0.42, 0.55, 0)
  hornL.rotation.z = Math.PI / 3
  hornL.rotation.x = -0.2
  group.add(hornL)
  const hornR = new THREE.Mesh(hornGeom, hornMat)
  hornR.position.set(0.42, 0.55, 0)
  hornR.rotation.z = -Math.PI / 3
  hornR.rotation.x = -0.2
  group.add(hornR)

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x101010,
    metalness: 0.6,
    roughness: 0.25,
  })
  const eyeGeom = new THREE.SphereGeometry(0.08, 8, 6)
  const eyeL = new THREE.Mesh(eyeGeom, eyeMat)
  eyeL.position.set(-0.25, 0.14, 0.55)
  group.add(eyeL)
  const eyeR = new THREE.Mesh(eyeGeom, eyeMat)
  eyeR.position.set(0.25, 0.14, 0.55)
  group.add(eyeR)

  // Nose ring — a classic touch
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xeeb050,
    metalness: 0.9,
    roughness: 0.2,
  })
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.022, 6, 16),
    ringMat,
  )
  ring.position.set(0, -0.34, 0.86)
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  return group
}

function buildBear(THREE: typeof import("three")) {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({
    color: BEAR_COLOR,
    flatShading: true,
    roughness: 0.7,
    metalness: 0.15,
  })

  // Head — slightly wider than bull
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 0), mat)
  head.scale.set(1.05, 0.95, 1)
  group.add(head)

  // Snout — rounded blob pushed forward
  const snout = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), mat)
  snout.position.set(0, -0.18, 0.62)
  group.add(snout)

  // Ears — rounded discs / spheres on top, with inner-ear accent
  const earGeom = new THREE.IcosahedronGeometry(0.22, 0)
  const earL = new THREE.Mesh(earGeom, mat)
  earL.position.set(-0.55, 0.58, -0.05)
  earL.scale.set(1, 1, 0.55)
  group.add(earL)
  const earR = new THREE.Mesh(earGeom, mat)
  earR.position.set(0.55, 0.58, -0.05)
  earR.scale.set(1, 1, 0.55)
  group.add(earR)

  const innerMat = new THREE.MeshStandardMaterial({
    color: BEAR_INNER_EAR_COLOR,
    flatShading: true,
    roughness: 0.6,
  })
  const innerGeom = new THREE.IcosahedronGeometry(0.11, 0)
  const innerL = new THREE.Mesh(innerGeom, innerMat)
  innerL.position.set(-0.55, 0.58, 0.06)
  innerL.scale.set(1, 1, 0.4)
  group.add(innerL)
  const innerR = new THREE.Mesh(innerGeom, innerMat)
  innerR.position.set(0.55, 0.58, 0.06)
  innerR.scale.set(1, 1, 0.4)
  group.add(innerR)

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x101010,
    metalness: 0.6,
    roughness: 0.2,
  })
  const eyeGeom = new THREE.SphereGeometry(0.075, 8, 6)
  const eyeL = new THREE.Mesh(eyeGeom, eyeMat)
  eyeL.position.set(-0.22, 0.12, 0.6)
  group.add(eyeL)
  const eyeR = new THREE.Mesh(eyeGeom, eyeMat)
  eyeR.position.set(0.22, 0.12, 0.6)
  group.add(eyeR)

  // Nose — small black sphere on snout tip
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 8, 6),
    eyeMat,
  )
  nose.position.set(0, -0.08, 0.93)
  group.add(nose)

  return group
}
