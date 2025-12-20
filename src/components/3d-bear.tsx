'use client'

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Sparkles } from "@react-three/drei"
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

// Componente de Neve Caindo
function Snow({ count = 50 }) {
  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
      pos.push({
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 10 - 5,
        z: (Math.random() - 0.5) * 8,
        speed: Math.random() * 0.02 + 0.01
      })
    }
    return pos
  }, [count])

  const snowRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!snowRef.current) return
    snowRef.current.children.forEach((mesh, i) => {
      const data = positions[i]
      mesh.position.y -= data.speed
      if (mesh.position.y < -4) {
        mesh.position.y = 4
      }
    })
    snowRef.current.rotation.y += 0.001
  })

  return (
    <group ref={snowRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshBasicMaterial color="white" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Bear({ isLowPower }: { isLowPower: boolean }) {
  const bearRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const SEGMENTS = isLowPower ? 16 : 32

  useFrame((state) => {
    if (!bearRef.current) return
    const t = state.clock.elapsedTime
    bearRef.current.rotation.y = Math.sin(t * 0.3) * 0.2
    bearRef.current.position.y = Math.sin(t * 1) * 0.1 - 0.2

    const targetScale = hovered ? 1.1 : 1
    bearRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })

  const furMaterial = {
    color: hovered ? "#A855F7" : "#8B5CF6",
    emissive: hovered ? "#5B21B6" : "#4C1D95",
    emissiveIntensity: 0.2
  }

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={bearRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >

        {/* === CORPO DO URSO === */}
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.9, SEGMENTS, SEGMENTS]} />
          <meshLambertMaterial {...furMaterial} />
        </mesh>

        {/* === CABEÇA === */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.65, SEGMENTS, SEGMENTS]} />
          <meshLambertMaterial {...furMaterial} />
        </mesh>

        {/* === ACESSÓRIOS DE NATAL === */}

        {/* Cachecol Vermelho */}
        <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.15, 8, 20]} />
          <meshStandardMaterial color="#DC2626" roughness={1} />
        </mesh>

        {/* Ponta do Cachecol */}
        <mesh position={[0.4, 0.2, 0.4]} rotation={[0.2, 0, -0.2]}>
          <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
          <meshStandardMaterial color="#DC2626" roughness={1} />
        </mesh>

        {/* --- CHAPÉU DE NATAL --- */}
        <group position={[0, 0, 0]}>
          {/* Base Branca do Chapéu */}
          <mesh position={[0, 1.45, 0]}>
            <cylinderGeometry args={[0.48, 0.52, 0.15, SEGMENTS]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>

          {/* Cone Vermelho (Inclinado para trás para ficar fofo) */}
          <mesh position={[0, 1.95, -0.1]} rotation={[-0.2, 0, 0]}>
            <coneGeometry args={[0.42, 1.0, SEGMENTS]} />
            <meshLambertMaterial color="#EF4444" />
          </mesh>

          {/* Pompom Branco na ponta */}
          <mesh position={[0, 2.4, -0.2]}>
            <sphereGeometry args={[0.12, SEGMENTS, SEGMENTS]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* ----------------------------------------- */}

        {/* === ROSTO === */}
        <mesh position={[-0.35, 1.35, 0.15]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshLambertMaterial color="#7C3AED" />
        </mesh>
        <mesh position={[0.35, 1.35, 0.15]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshLambertMaterial color="#7C3AED" />
        </mesh>

        <mesh position={[0, 0.65, 0.45]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshLambertMaterial color="#C084FC" />
        </mesh>

        {/* Nariz */}
        <mesh position={[0, 0.75, 0.68]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial
            color="#EF4444"
            emissive="#DC2626"
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>

        {/* Olhos */}
        <mesh position={[-0.18, 0.95, 0.55]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshLambertMaterial color="#1F2937" />
        </mesh>
        <mesh position={[0.18, 0.95, 0.55]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshLambertMaterial color="#1F2937" />
        </mesh>

        {/* === PATAS === */}
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

      </group>
    </Float>
  )
}

export default function ChristmasBear3D() {
  const isLowPower = useLowPowerMode()

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows={false}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <ambientLight intensity={0.6} color="#dbeafe" />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#fbbf24" />
        <pointLight position={[-5, -2, -5]} intensity={0.8} color="#3b82f6" />

        <Snow count={isLowPower ? 30 : 80} />
        <Sparkles
          count={20}
          scale={4}
          size={3}
          speed={0.4}
          opacity={0.5}
          color="#fbbf24"
        />

        <Bear isLowPower={isLowPower} />
      </Canvas>
    </div>
  )
}
