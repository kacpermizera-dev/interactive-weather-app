import { OrbitControls, Cloud } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

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
  clouds: SceneCloud[]
}

function getSceneConfig(weatherCode: number | null): SceneConfig {
  if (weatherCode === 0 || weatherCode === 1) {
    return {
      background: '#7dd3fc',
      ambientIntensity: 0.7,
      directionalIntensity: 1.35,
      clouds: [
        {
          position: [3.5, 1.6, -2],
          speed: 0.08,
          opacity: 0.2,
          scale: [0.8, 0.5, 0.8],
        },
      ],
    }
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return {
      background: '#d1d5db',
      ambientIntensity: 0.55,
      directionalIntensity: 0.9,
      clouds: [
        { position: [-4, 0.4, -2], speed: 0.08, opacity: 0.68, scale: [1.3, 0.8, 1] },
        { position: [-1, -0.2, -4], speed: 0.07, opacity: 0.72, scale: [1.4, 0.9, 1] },
        { position: [2, 0.1, -3], speed: 0.06, opacity: 0.7, scale: [1.6, 0.9, 1.1] },
        { position: [4.5, -0.4, -2], speed: 0.07, opacity: 0.65, scale: [1.2, 0.8, 1] },
      ],
    }
  }

  if (
    (weatherCode !== null && weatherCode >= 51 && weatherCode <= 67) ||
    weatherCode === 80 ||
    weatherCode === 81 ||
    weatherCode === 82
  ) {
    return {
      background: '#475569',
      ambientIntensity: 0.45,
      directionalIntensity: 0.75,
      clouds: [
        { position: [-4.5, 1.4, -2], speed: 0.1, opacity: 0.78, scale: [1.4, 0.8, 1.1] },
        { position: [-2, 0.2, -4], speed: 0.09, opacity: 0.74, scale: [1.3, 0.8, 1] },
        { position: [0.5, 1.1, -3], speed: 0.11, opacity: 0.8, scale: [1.5, 0.9, 1.1] },
        { position: [2.5, 0.1, -2], speed: 0.1, opacity: 0.72, scale: [1.3, 0.8, 1] },
        { position: [4.5, 1.5, -1], speed: 0.12, opacity: 0.76, scale: [1.4, 0.85, 1.1] },
      ],
    }
  }

  if (
    weatherCode === 77 ||
    weatherCode === 85 ||
    weatherCode === 86 ||
    (weatherCode !== null && weatherCode >= 71 && weatherCode <= 75)
  ) {
    return {
      background: '#e2e8f0',
      ambientIntensity: 0.6,
      directionalIntensity: 0.95,
      clouds: [
        { position: [-4, 1.5, -2], speed: 0.09, opacity: 0.6, scale: [1.3, 0.8, 1], color: '#ffffff' },
        { position: [-0.5, 0.1, -4], speed: 0.08, opacity: 0.58, scale: [1.5, 0.9, 1.1], color: '#ffffff' },
        { position: [3, 1.1, -2], speed: 0.1, opacity: 0.62, scale: [1.4, 0.85, 1], color: '#ffffff' },
      ],
    }
  }

  if (weatherCode !== null && weatherCode >= 95 && weatherCode <= 99) {
    return {
      background: '#1e293b',
      ambientIntensity: 0.35,
      directionalIntensity: 0.6,
      clouds: [
        { position: [-4.5, 1.6, -2], speed: 0.12, opacity: 0.84, scale: [1.5, 0.9, 1.1] },
        { position: [-2.2, 0.5, -4], speed: 0.11, opacity: 0.86, scale: [1.4, 0.85, 1] },
        { position: [0.2, 1.3, -3], speed: 0.12, opacity: 0.88, scale: [1.6, 0.95, 1.1] },
        { position: [2.6, 0.4, -2], speed: 0.11, opacity: 0.82, scale: [1.4, 0.8, 1] },
        { position: [4.8, 1.5, -1], speed: 0.13, opacity: 0.86, scale: [1.5, 0.9, 1.1] },
      ],
    }
  }

  return {
    background: '#7dd3fc',
    ambientIntensity: 0.5,
    directionalIntensity: 1.2,
    clouds: [
      { position: [-4, 1.8, -2], speed: 0.12, opacity: 0.48 },
      { position: [0, -0.3, -4], speed: 0.1, opacity: 0.35 },
      { position: [4, 1.2, -1], speed: 0.15, opacity: 0.42 },
    ],
  }
}

interface WeatherSceneProps {
  weatherCode: number | null
}

export function WeatherScene({ weatherCode }: WeatherSceneProps) {
  const scene = getSceneConfig(weatherCode)

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <color attach="background" args={[scene.background]} />
      <ambientLight intensity={scene.ambientIntensity} />
      <directionalLight position={[6, 8, 5]} intensity={scene.directionalIntensity} />

      {scene.clouds.map((cloud) => (
        <Cloud key={cloud.position.join(',')} {...cloud} />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  )
}
