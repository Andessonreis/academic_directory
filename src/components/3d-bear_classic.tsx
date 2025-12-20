'use client'

import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import { useRef, useState, useMemo, useEffect } from "react"
import * as THREE from "three"

function useLowPowerMode() {
  const [isLowPower, setIsLowPower] = useState(false)
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    // @ts-ignore
    const threads = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
    setIsLowPower(isMobile || threads < 4)
  }, [])
  return isLowPower
}

function Bear({ isLowPower }: { isLowPower: boolean }) {
  const bearRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const SEGMENTS = isLowPower ? 12 : 24

  const particlePositions = useMemo(
    () =>
      Array.from({ length: isLowPower ? 6 : 12 }, (_, i) => ({
        x: Math.cos((i / 10) * Math.PI * 2) * 2.5,
        y: Math.sin((i / 10) * Math.PI * 2) * 1.2,
        z: Math.sin((i / 10) * Math.PI * 2) * 2.5,
        scale: 0.04,
      })),
    [isLowPower],
  )

  useFrame((state) => {
    if (!bearRef.current) return
    const t = state.clock.elapsedTime
    bearRef.current.rotation.y = t * 0.2
    bearRef.current.position.y = Math.sin(t * 0.5) * 0.2
    const targetScale = hovered ? 1.1 : 1
    bearRef.current.scale.setScalar(targetScale)
  })

  const materialProps = {
    color: hovered ? "#A855F7" : "#8B5CF6",
    emissive: hovered ? "#5B21B6" : "#4C1D95",
    emissiveIntensity: 0.2
  }

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={bearRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        {/* CORPO */}
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.9, SEGMENTS, SEGMENTS]} />
          <meshLambertMaterial {...materialProps} />
        </mesh>

        {/* CABEÇA */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.65, SEGMENTS, SEGMENTS]} />
          <meshLambertMaterial {...materialProps} />
        </mesh>

        {/* ORELHAS */}
        <mesh position={[-0.35, 1.35, 0.15]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshLambertMaterial color="#7C3AED" />
        </mesh>
        <mesh position={[0.35, 1.35, 0.15]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshLambertMaterial color="#7C3AED" />
        </mesh>

        {/* OLHOS E FOCINHO */}
        <mesh position={[0, 0.65, 0.45]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshLambertMaterial color="#C084FC" />
        </mesh>
        <mesh position={[-0.18, 0.95, 0.55]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshLambertMaterial color="#F472B6" />
        </mesh>
        <mesh position={[0.18, 0.95, 0.55]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshLambertMaterial color="#F472B6" />
        </mesh>

        {/* PATAS */}
        <mesh position={[-0.75, 0.1, 0]}>
          <sphereGeometry args={[0.38, 12, 12]} />
          <meshLambertMaterial color="#7C3AED" />
        </mesh>
        <mesh position={[0.75, 0.1, 0]}>
          <sphereGeometry args={[0.38, 12, 12]} />
          <meshLambertMaterial color="#7C3AED" />
        </mesh>
        <mesh position={[-0.35, -1.0, 0]}>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshLambertMaterial color="#7C3AED" />
        </mesh>
        <mesh position={[0.35, -1.0, 0]}>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshLambertMaterial color="#7C3AED" />
        </mesh>

        {/* PARTÍCULAS */}
        {particlePositions.map((pos, i) => (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color="#F472B6" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

export default function Bear3D() {
  const isLowPower = useLowPowerMode()

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows={false}
        dpr={[1, 1]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#A855F7" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#EC4899" />

        <Bear isLowPower={isLowPower} />
      </Canvas>
    </div>
  )
}
