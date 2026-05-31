import { useEffect, useState } from 'react'
import { fetchCurrentWeather, type WeatherData } from './api/weather'
import { WeatherScene } from './components/3d/WeatherScene'
import { WeatherCard } from './components/ui/WeatherCard'

const DEFAULT_COORDINATES = {
  latitude: 40.7128,
  longitude: -74.006,
}

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadWeather() {
      try {
        const data = await fetchCurrentWeather(
          DEFAULT_COORDINATES.latitude,
          DEFAULT_COORDINATES.longitude,
        )

        if (active) {
          setWeather(data)
          setError(null)
        }
      } catch {
        if (active) {
          setError('Unable to load weather right now.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadWeather()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <WeatherScene />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
        <div className="pointer-events-auto w-full max-w-sm">
          <WeatherCard weather={weather} loading={loading} error={error} />
        </div>
      </div>
    </div>
  )
}

export default App
