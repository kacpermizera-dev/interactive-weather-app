import { Cloud, Float, OrbitControls, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  MathUtils,
  type BufferAttribute,
  type Group,
  type Mesh,
  type PointLight,
  type Points,
} from 'three'
import { getWmoCodeInfo, type WmoCodeInfo } from '../../utils/wmoCode'

type WeatherMood = WmoCodeInfo['mood']

interface SceneCloud {
  position: [number, number, number]
  speed: number
  opacity: number
  scale?: [number, number, number]
  color?: string
}

interface SceneConfig {
  background: string
  ambientIntensity: number
  directionalIntensity: number
  directionalColor: string
  accentColor: string
  floorColor: string
  clouds: SceneCloud[]
  cloudDrift: number
  particleType: 'none' | 'rain' | 'snow' | 'mist'
  particleCount: number
  particleSpeed: number
  particleSize: number
  sparklesCount: number
  sparklesSize: number
  sparklesColor: string
  storm: boolean
}

function getSceneConfig(weatherCode: number | null): SceneConfig {
  const mood = getWmoCodeInfo(weatherCode).mood

  if (mood === 'clear') {
    return {
      background: '#e7e7e7',
      ambientIntensity: 0.82,
      directionalIntensity: 1.52,
      directionalColor: '#ffffff',
      accentColor: '#252525',
      floorColor: '#ffffff',
      clouds: [
        {
          position: [3.3, 1.8, -2],
          speed: 0.08,
          opacity: 0.16,
          scale: [0.9, 0.55, 0.8],
          color: '#ffffff',
        },
      ],
      cloudDrift: 0.28,
      particleType: 'none',
      particleCount: 0,
      particleSpeed: 0,
      particleSize: 0,
      sparklesCount: 90,
      sparklesSize: 2.1,
      sparklesColor: '#ffffff',
      storm: false,
    }
  }

  if (mood === 'mist') {
    return {
      background: '#c5c5c5',
      ambientIntensity: 0.58,
      directionalIntensity: 0.95,
      directionalColor: '#fafafa',
      accentColor: '#1d1d1d',
      floorColor: '#f0f0f0',
      clouds: [
        {
          position: [-4, 0.6, -2],
          speed: 0.07,
          opacity: 0.67,
          scale: [1.35, 0.85, 1.05],
          color: '#f5f5f5',
        },
        {
          position: [-1, -0.25, -4],
          speed: 0.06,
          opacity: 0.7,
          scale: [1.5, 0.92, 1.1],
          color: '#f0f0f0',
        },
        {
          position: [2.3, 0.2, -3],
          speed: 0.05,
          opacity: 0.68,
          scale: [1.65, 0.95, 1.15],
          color: '#f3f3f3',
        },
      ],
      cloudDrift: 0.18,
      particleType: 'mist',
      particleCount: 240,
      particleSpeed: 0.85,
      particleSize: 0.065,
      sparklesCount: 25,
      sparklesSize: 1.4,
      sparklesColor: '#f9f9f9',
      storm: false,
    }
  }

  if (mood === 'rain') {
    return {
      background: '#565656',
      ambientIntensity: 0.46,
      directionalIntensity: 0.72,
      directionalColor: '#dedede',
      accentColor: '#f0f0f0',
      floorColor: '#2d2d2d',
      clouds: [
        {
          position: [-4.6, 1.45, -2],
          speed: 0.11,
          opacity: 0.82,
          scale: [1.45, 0.85, 1.15],
          color: '#cbcbcb',
        },
        {
          position: [-2, 0.3, -4],
          speed: 0.1,
          opacity: 0.78,
          scale: [1.35, 0.8, 1.05],
          color: '#c7c7c7',
        },
        {
          position: [0.7, 1.15, -3],
          speed: 0.12,
          opacity: 0.84,
          scale: [1.52, 0.92, 1.12],
          color: '#cdcdcd',
        },
        {
          position: [2.6, 0.25, -2],
          speed: 0.11,
          opacity: 0.76,
          scale: [1.35, 0.82, 1],
          color: '#c4c4c4',
        },
      ],
      cloudDrift: 0.14,
      particleType: 'rain',
      particleCount: 430,
      particleSpeed: 8.8,
      particleSize: 0.042,
      sparklesCount: 14,
      sparklesSize: 1.3,
      sparklesColor: '#f2f2f2',
      storm: false,
    }
  }

  if (mood === 'snow') {
    return {
      background: '#d4d4d4',
      ambientIntensity: 0.67,
      directionalIntensity: 1.05,
      directionalColor: '#ffffff',
      accentColor: '#171717',
      floorColor: '#fafafa',
      clouds: [
        {
          position: [-4.1, 1.5, -2],
          speed: 0.09,
          opacity: 0.58,
          scale: [1.35, 0.8, 1.02],
          color: '#ffffff',
        },
        {
          position: [-0.45, 0.1, -4],
          speed: 0.08,
          opacity: 0.57,
          scale: [1.55, 0.92, 1.12],
          color: '#ffffff',
        },
        {
          position: [3.1, 1.1, -2],
          speed: 0.1,
          opacity: 0.6,
          scale: [1.45, 0.86, 1.03],
          color: '#ffffff',
        },
      ],
      cloudDrift: 0.2,
      particleType: 'snow',
      particleCount: 280,
      particleSpeed: 1.45,
      particleSize: 0.076,
      sparklesCount: 40,
      sparklesSize: 1.9,
      sparklesColor: '#ffffff',
      storm: false,
    }
  }

  if (mood === 'storm') {
    return {
      background: '#141414',
      ambientIntensity: 0.35,
      directionalIntensity: 0.54,
      directionalColor: '#f0f0f0',
      accentColor: '#f4f4f4',
      floorColor: '#1b1b1b',
      clouds: [
        {
          position: [-4.6, 1.6, -2],
          speed: 0.12,
          opacity: 0.87,
          scale: [1.55, 0.94, 1.12],
          color: '#9d9d9d',
        },
        {
          position: [-2.2, 0.55, -4],
          speed: 0.11,
          opacity: 0.9,
          scale: [1.44, 0.9, 1.02],
          color: '#989898',
        },
        {
          position: [0.25, 1.35, -3],
          speed: 0.12,
          opacity: 0.91,
          scale: [1.63, 0.98, 1.14],
          color: '#a5a5a5',
        },
        {
          position: [2.7, 0.4, -2],
          speed: 0.11,
          opacity: 0.85,
          scale: [1.4, 0.83, 1],
          color: '#949494',
        },
      ],
      cloudDrift: 0.09,
      particleType: 'rain',
      particleCount: 560,
      particleSpeed: 10.8,
      particleSize: 0.045,
      sparklesCount: 8,
      sparklesSize: 1.2,
      sparklesColor: '#ffffff',
      storm: true,
    }
  }

  return {
    background: '#b2b2b2',
    ambientIntensity: 0.53,
    directionalIntensity: 0.96,
    directionalColor: '#f3f3f3',
    accentColor: '#1b1b1b',
    floorColor: '#ededed',
    clouds: [
      { position: [-4, 1.8, -2], speed: 0.11, opacity: 0.54, color: '#ebebeb' },
      { position: [0, -0.2, -4], speed: 0.1, opacity: 0.46, color: '#ebebeb' },
      { position: [4, 1.2, -1], speed: 0.14, opacity: 0.52, color: '#ebebeb' },
    ],
    cloudDrift: 0.2,
    particleType: 'mist',
    particleCount: 140,
    particleSpeed: 0.75,
    particleSize: 0.06,
    sparklesCount: 16,
    sparklesSize: 1.2,
    sparklesColor: '#f8f8f8',
    storm: false,
  }
}

interface CameraDriftProps {
  mood: WeatherMood
}

function CameraDrift({ mood }: CameraDriftProps) {
  useFrame(({ camera, clock }, delta) => {
    const elapsed = clock.getElapsedTime()
    const lateralAmplitude = mood === 'storm' ? 0.4 : 0.24
    const verticalAmplitude = mood === 'storm' ? 0.28 : 0.16
    const depthAmplitude = mood === 'storm' ? 0.45 : 0.22

    const targetX = Math.sin(elapsed * 0.26) * lateralAmplitude
    const targetY = Math.cos(elapsed * 0.21) * verticalAmplitude
    const targetZ = 9.9 + Math.sin(elapsed * 0.14) * depthAmplitude

    camera.position.x = MathUtils.lerp(camera.position.x, targetX, delta * 1.1)
    camera.position.y = MathUtils.lerp(camera.position.y, targetY, delta * 1.1)
    camera.position.z = MathUtils.lerp(camera.position.z, targetZ, delta * 1.1)
    camera.lookAt(0, -0.15, -2.2)
  })

  return null
}

interface MonolithProps {
  mood: WeatherMood
  accentColor: string
}

function Monolith({ mood, accentColor }: MonolithProps) {
  const groupRef = useRef<Group>(null)
  const wireRef = useRef<Mesh>(null)

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.26
      groupRef.current.position.y = -0.58 + Math.sin(elapsed * 0.8) * 0.14
    }

    if (wireRef.current) {
      wireRef.current.rotation.x += delta * 0.18
      wireRef.current.rotation.z += delta * 0.14
    }
  })

  const wireColor = mood === 'rain' || mood === 'storm' ? '#f4f4f4' : '#171717'

  return (
    <group ref={groupRef} position={[0, -0.55, -2.35]}>
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.45}>
        <mesh ref={wireRef}>
          <octahedronGeometry args={[1.05, 1]} />
          <meshStandardMaterial
            color={wireColor}
            metalness={0.78}
            roughness={0.26}
            wireframe
          />
        </mesh>

        <mesh scale={0.62} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={accentColor}
            metalness={0.35}
            roughness={0.32}
            transparent
            opacity={0.58}
          />
        </mesh>
      </Float>
    </group>
  )
}

interface WindRingsProps {
  mood: WeatherMood
  accentColor: string
}

function WindRings({ mood, accentColor }: WindRingsProps) {
  const groupRef = useRef<Group>(null)

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) {
      return
    }

    const elapsed = clock.getElapsedTime()
    groupRef.current.rotation.z += delta * 0.06
    groupRef.current.rotation.y = Math.sin(elapsed * 0.25) * 0.15
  })

  const ringColor = mood === 'storm' ? '#ffffff' : accentColor

  return (
    <group ref={groupRef} rotation={[Math.PI / 2.5, 0, 0]} position={[0, -1.38, -2.3]}>
      {[1.85, 2.55, 3.24].map((radius, index) => (
        <mesh key={radius} position={[0, 0, index * 0.08]}>
          <torusGeometry args={[radius, 0.03, 16, 120]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.14 + index * 0.07}
          />
        </mesh>
      ))}
    </group>
  )
}

interface AtmosphereParticlesProps {
  type: SceneConfig['particleType']
  count: number
  speed: number
  size: number
  color: string
}

function AtmosphereParticles({
  type,
  count,
  speed,
  size,
  color,
}: AtmosphereParticlesProps) {
  const pointsRef = useRef<Points>(null)

  const seed = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: MathUtils.randFloatSpread(11),
      y: MathUtils.randFloat(-4.5, 5.5),
      z: MathUtils.randFloat(-4.8, 2),
      velocity: MathUtils.randFloat(0.65, 1.35),
      sway: MathUtils.randFloat(0, Math.PI * 2),
    }))
  }, [count])

  const positions = useMemo(() => {
    const values = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3
      values[offset] = seed[index].x
      values[offset + 1] = seed[index].y
      values[offset + 2] = seed[index].z
    }

    return values
  }, [count, seed])

  useFrame(({ clock }, delta) => {
    const points = pointsRef.current

    if (!points) {
      return
    }

    const attribute = points.geometry.getAttribute('position') as BufferAttribute | undefined

    if (!attribute) {
      return
    }

    const values = attribute.array as Float32Array
    const elapsed = clock.getElapsedTime()

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3
      const data = seed[index]

      if (type === 'rain') {
        values[offset + 1] -= delta * speed * data.velocity
        values[offset] += Math.sin(elapsed * 0.8 + data.sway) * delta * 0.06
      }

      if (type === 'snow') {
        values[offset + 1] -= delta * speed * data.velocity * 0.42
        values[offset] += Math.sin(elapsed * 1.3 + data.sway) * delta * 0.35
      }

      if (type === 'mist') {
        values[offset + 1] -= delta * speed * data.velocity * 0.2
        values[offset] += Math.sin(elapsed * 0.7 + data.sway) * delta * 0.32
        values[offset + 2] += Math.cos(elapsed * 0.5 + data.sway) * delta * 0.18
      }

      if (values[offset + 1] < -5) {
        values[offset + 1] = 5.6
        values[offset] = data.x + MathUtils.randFloatSpread(0.8)
        values[offset + 2] = data.z + MathUtils.randFloatSpread(0.55)
      }

      if (type === 'mist' && values[offset + 2] > 2.4) {
        values[offset + 2] = -4.8
      }
    }

    attribute.needsUpdate = true

    points.rotation.y += delta * (type === 'mist' ? 0.018 : 0.005)
  })

  if (type === 'none' || count === 0) {
    return null
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={type === 'mist' ? 0.33 : 0.56}
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

interface ShockLightProps {
  active: boolean
}

function ShockLight({ active }: ShockLightProps) {
  const lightRef = useRef<PointLight>(null)
  const cooldownRef = useRef(0)
  const flashRef = useRef(0)

  useFrame((_, delta) => {
    const light = lightRef.current

    if (!light) {
      return
    }

    if (!active) {
      light.intensity = MathUtils.lerp(light.intensity, 0, delta * 6)
      return
    }

    if (flashRef.current > 0) {
      flashRef.current -= delta
      light.intensity = 3.7 + Math.sin(flashRef.current * 95) * 1.6
      return
    }

    cooldownRef.current -= delta
    light.intensity = MathUtils.lerp(light.intensity, 0.1, delta * 6)

    if (cooldownRef.current <= 0) {
      flashRef.current = MathUtils.randFloat(0.05, 0.18)
      cooldownRef.current = MathUtils.randFloat(1.2, 3.3)
    }
  })

  return <pointLight ref={lightRef} position={[0, 2.8, 1.2]} distance={18} color="#ffffff" intensity={0} />
}

interface WeatherSceneProps {
  weatherCode: number | null
}

export function WeatherScene({ weatherCode }: WeatherSceneProps) {
  const mood = getWmoCodeInfo(weatherCode).mood
  const scene = getSceneConfig(weatherCode)

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 58 }} dpr={[1, 1.7]}>
      <CameraDrift mood={mood} />
      <color attach="background" args={[scene.background]} />
      <fog attach="fog" args={[scene.background, 8.5, 18]} />

      <ambientLight intensity={scene.ambientIntensity} />
      <directionalLight
        position={[6, 8, 5]}
        intensity={scene.directionalIntensity}
        color={scene.directionalColor}
      />
      <pointLight position={[-4.5, 2.8, 3]} intensity={0.42} color={scene.accentColor} />
      <ShockLight active={scene.storm} />

      <Monolith mood={mood} accentColor={scene.accentColor} />
      <WindRings mood={mood} accentColor={scene.accentColor} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, -2.4]}>
        <circleGeometry args={[7.2, 80]} />
        <meshStandardMaterial
          color={scene.floorColor}
          transparent
          opacity={scene.storm ? 0.12 : 0.26}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {scene.clouds.map((cloud) => (
        <Cloud key={cloud.position.join(',')} {...cloud} />
      ))}

      <AtmosphereParticles
        type={scene.particleType}
        count={scene.particleCount}
        speed={scene.particleSpeed}
        size={scene.particleSize}
        color={scene.accentColor}
      />

      <Sparkles
        count={scene.sparklesCount}
        scale={[10, 6, 8]}
        size={scene.sparklesSize}
        speed={0.18}
        noise={1.2}
        color={scene.sparklesColor}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={scene.cloudDrift}
        maxPolarAngle={Math.PI / 1.9}
        minPolarAngle={Math.PI / 3.6}
      />
    </Canvas>
  )
}
