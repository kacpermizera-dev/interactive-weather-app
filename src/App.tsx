import { useEffect, useState } from 'react'
import { fetchCurrentWeather, type WeatherData } from './api/weather'
import { WeatherScene } from './components/3d/WeatherScene'
import { WeatherCard } from './components/ui/WeatherCard'

interface LocationData {
  latitude: number
  longitude: number
  label: string
}

const DEFAULT_LOCATION: LocationData = {
  latitude: 40.7128,
  longitude: -74.006,
  label: 'New York City (fallback)',
}

function getCurrentLocation(): Promise<LocationData> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(DEFAULT_LOCATION)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          label: 'Your location',
        })
      },
      () => {
        resolve(DEFAULT_LOCATION)
      },
      {
        maximumAge: 300_000,
        timeout: 10_000,
      },
    )
  })
}

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadWeather() {
      try {
        if (active) {
          setLoading(true)
          setError(null)
          setWeather(null)
        }

        const currentLocation = await getCurrentLocation()

        if (!active) {
          return
        }

        setLocation(currentLocation)

        const data = await fetchCurrentWeather(
          currentLocation.latitude,
          currentLocation.longitude,
        )

        if (active) {
          setWeather(data)
          setError(null)
        }
      } catch {
        if (active) {
          setWeather(null)
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
  }, [requestKey])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <WeatherScene weatherCode={weather?.weatherCode ?? null} />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
        <div className="pointer-events-auto w-full max-w-sm">
          <WeatherCard
            weather={weather}
            loading={loading}
            error={error}
            location={location}
            onRetry={() => setRequestKey((value) => value + 1)}
          />
        </div>
      </div>
    </div>
  )
}

export default App
