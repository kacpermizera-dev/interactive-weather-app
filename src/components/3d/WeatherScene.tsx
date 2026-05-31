import { OrbitControls, Cloud } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

export function WeatherScene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <color attach="background" args={['#7dd3fc']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} />

      <Cloud position={[-4, 1.8, -2]} speed={0.12} opacity={0.48} />
      <Cloud position={[0, -0.3, -4]} speed={0.1} opacity={0.35} />
      <Cloud position={[4, 1.2, -1]} speed={0.15} opacity={0.42} />

      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
    </Canvas>
  )
}
