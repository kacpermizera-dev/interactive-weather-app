import { useEffect, useState } from 'react'
import {
  fetchCurrentWeather,
  searchLocationsByName,
  type WeatherData,
} from './api/weather'
import { WeatherScene } from './components/3d/WeatherScene.tsx'
import { WeatherCard } from './components/ui/WeatherCard.tsx'
import { getWmoCodeInfo } from './utils/wmoCode'

interface LocationData {
  id: string
  latitude: number
  longitude: number
  label: string
}

type LocationSource = 'device' | 'fallback' | 'search' | 'saved'
type TemperatureUnit = 'celsius' | 'fahrenheit'
type WindSpeedUnit = 'kmh' | 'mph'
type TimeFormat = '12h' | '24h'

export interface AppSettings {
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
  timeFormat: TimeFormat
}

interface CachedWeatherSnapshot {
  weather: WeatherData
  location: LocationData
  cachedAt: string
}

const DEFAULT_LOCATION: LocationData = {
  id: 'default-la',
  latitude: 34.0522,
  longitude: -118.2437,
  label: 'Los Angeles, USA (fallback)',
}

const SAVED_LOCATIONS_KEY = 'interactive-weather.saved-locations.v1'
const SETTINGS_KEY = 'interactive-weather.settings.v1'
const ONBOARDING_KEY = 'interactive-weather.onboarding-complete.v1'
const WEATHER_CACHE_KEY = 'interactive-weather.cached-weather.v1'
const MAX_SAVED_LOCATIONS = 8

const DEFAULT_SETTINGS: AppSettings = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  timeFormat: '24h',
}

function createLocationId(latitude: number, longitude: number, label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return `${slug}-${latitude.toFixed(4)}-${longitude.toFixed(4)}`
}

function normalizeLocation(location: Omit<LocationData, 'id'> & { id?: string }): LocationData {
  return {
    ...location,
    id: location.id ?? createLocationId(location.latitude, location.longitude, location.label),
  }
}

function readSavedLocations(): LocationData[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(SAVED_LOCATIONS_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item): item is Omit<LocationData, 'id'> & { id?: string } => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.latitude === 'number' &&
          typeof item.longitude === 'number' &&
          typeof item.label === 'string'
        )
      })
      .map((item) => normalizeLocation(item))
      .slice(0, MAX_SAVED_LOCATIONS)
  } catch {
    return []
  }
}

function readSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)

    if (!raw) {
      return DEFAULT_SETTINGS
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings>

    return {
      temperatureUnit:
        parsed.temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
      windSpeedUnit: parsed.windSpeedUnit === 'mph' ? 'mph' : 'kmh',
      timeFormat: parsed.timeFormat === '12h' ? '12h' : '24h',
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function readOnboardingComplete(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(ONBOARDING_KEY) === 'true'
}

function getCachedWeatherKey(locationId: string): string {
  return `${WEATHER_CACHE_KEY}.${locationId}`
}

function readCachedWeather(locationId: string): CachedWeatherSnapshot | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(getCachedWeatherKey(locationId))

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as CachedWeatherSnapshot

    if (
      typeof parsed.cachedAt !== 'string' ||
      typeof parsed.weather?.updatedAt !== 'string' ||
      typeof parsed.location?.label !== 'string'
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function writeCachedWeather(snapshot: CachedWeatherSnapshot) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    getCachedWeatherKey(snapshot.location.id),
    JSON.stringify(snapshot),
  )
}

function getCurrentLocation(): Promise<{
  location: LocationData
  source: LocationSource
}> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({
      location: DEFAULT_LOCATION,
      source: 'fallback',
    })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = normalizeLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            label: 'Your location',
          })

        resolve({
          location,
          source: 'device',
        })
      },
      () => {
        resolve({
          location: DEFAULT_LOCATION,
          source: 'fallback',
        })
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
  const [activeLocation, setActiveLocation] = useState<LocationData | null>(
    DEFAULT_LOCATION,
  )
  const [locationSource, setLocationSource] = useState<LocationSource>('fallback')
  const [settings, setSettings] = useState<AppSettings>(() => readSettings())
  const [onboardingComplete, setOnboardingComplete] = useState(() =>
    readOnboardingComplete(),
  )
  const [savedLocations, setSavedLocations] = useState<LocationData[]>(() =>
    readSavedLocations(),
  )
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staleNotice, setStaleNotice] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    if (!onboardingComplete) {
      return
    }

    let active = true

    async function initializeLocation() {
      const currentLocation = await getCurrentLocation()

      if (active) {
        setActiveLocation(currentLocation.location)
        setLocationSource(currentLocation.source)
      }
    }

    void initializeLocation()

    return () => {
      active = false
    }
  }, [onboardingComplete])

  useEffect(() => {
    if (!activeLocation) {
      return
    }

    const locationToLoad = activeLocation

    let active = true

    async function loadWeather() {
      try {
        if (active) {
          setLoading(true)
          setError(null)
          setStaleNotice(null)
        }

        const data = await fetchCurrentWeather(
          locationToLoad.latitude,
          locationToLoad.longitude,
        )

        if (active) {
          setWeather(data)
          setError(null)
          setStaleNotice(null)
          writeCachedWeather({
            weather: data,
            location: locationToLoad,
            cachedAt: new Date().toISOString(),
          })
        }
      } catch {
        if (active) {
          const cachedWeather = readCachedWeather(locationToLoad.id)

          if (cachedWeather) {
            setWeather(cachedWeather.weather)
            setError(null)
            setStaleNotice(
              `Showing saved forecast from ${new Date(
                cachedWeather.cachedAt,
              ).toLocaleString()}.`,
            )
          } else {
            setWeather(null)
            setError(
              navigator.onLine
                ? 'Weather service is not responding right now.'
                : 'You appear to be offline. Connect to refresh the forecast.',
            )
          }
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
  }, [activeLocation, requestKey])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(savedLocations))
  }, [savedLocations])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      ONBOARDING_KEY,
      onboardingComplete ? 'true' : 'false',
    )
  }, [onboardingComplete])

  async function handleSearch(query: string) {
    const normalizedQuery = query.trim()

    if (normalizedQuery.length < 2) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    try {
      setSearchLoading(true)
      setSearchError(null)

      const matches = await searchLocationsByName(normalizedQuery)
      setSearchResults(matches.map((location) => normalizeLocation(location)))
    } catch {
      setSearchResults([])
      setSearchError('Could not search locations right now.')
    } finally {
      setSearchLoading(false)
    }
  }

  function handleSearchLocationSelect(location: LocationData) {
    setActiveLocation({ ...location })
    setLocationSource('search')
    setOnboardingComplete(true)
    setSearchResults([])
    setSearchError(null)
  }

  function handleSavedLocationSelect(location: LocationData) {
    setActiveLocation({ ...location })
    setLocationSource('saved')
    setOnboardingComplete(true)
    setSearchResults([])
    setSearchError(null)
  }

  async function handleUseDeviceLocation() {
    setLoading(true)
    const currentLocation = await getCurrentLocation()
    setActiveLocation(currentLocation.location)
    setLocationSource(currentLocation.source)
    setOnboardingComplete(true)
  }

  function handleUseDefaultLocation() {
    setActiveLocation(DEFAULT_LOCATION)
    setLocationSource('fallback')
    setOnboardingComplete(true)
  }

  function handleSaveLocation() {
    if (!activeLocation) {
      return
    }

    setSavedLocations((currentLocations) => {
      const deduplicated = currentLocations.filter(
        (location) => location.id !== activeLocation.id,
      )

      return [activeLocation, ...deduplicated].slice(0, MAX_SAVED_LOCATIONS)
    })
  }

  function handleDeleteSavedLocation(locationId: string) {
    setSavedLocations((currentLocations) =>
      currentLocations.filter((location) => location.id !== locationId),
    )
  }

  const isActiveLocationSaved = activeLocation
    ? savedLocations.some((location) => location.id === activeLocation.id)
    : false

  const mood = getWmoCodeInfo(weather?.weatherCode).mood

  return (
    <div className={`app-shell mood-${mood}`}>
      <div className="scene-layer">
        <WeatherScene weatherCode={weather?.weatherCode ?? null} />
      </div>
      <div className="atmosphere-grid" />
      <div className="noise-layer" />
      <div className="atmosphere-glow atmosphere-glow-left" />
      <div className="atmosphere-glow atmosphere-glow-right" />

      <div className="content-wrap">
        <div className="w-full max-w-3xl">
          <WeatherCard
            weather={weather}
            loading={loading}
            error={error}
            location={activeLocation}
            mood={mood}
            locationSource={locationSource}
            settings={settings}
            onSettingsChange={setSettings}
            onboardingComplete={onboardingComplete}
            staleNotice={staleNotice}
            isActiveLocationSaved={isActiveLocationSaved}
            onRetry={() => setRequestKey((value) => value + 1)}
            onUseDeviceLocation={handleUseDeviceLocation}
            onUseDefaultLocation={handleUseDefaultLocation}
            onSearch={handleSearch}
            searchResults={searchResults}
            searchLoading={searchLoading}
            searchError={searchError}
            onSelectSearchLocation={handleSearchLocationSelect}
            onSelectSavedLocation={handleSavedLocationSelect}
            onSaveLocation={handleSaveLocation}
            savedLocations={savedLocations}
            onDeleteSavedLocation={handleDeleteSavedLocation}
          />
        </div>
      </div>
    </div>
  )
}

export default App
