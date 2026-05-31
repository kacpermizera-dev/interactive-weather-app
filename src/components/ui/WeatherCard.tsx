import type { WeatherData } from '../../api/weather'
import { getWmoCodeInfo } from '../../utils/wmoCode'

interface WeatherCardProps {
  weather: WeatherData | null
  loading: boolean
  error: string | null
  location: {
    latitude: number
    longitude: number
    label: string
  } | null
  onRetry?: () => void
}

export function WeatherCard({
  weather,
  loading,
  error,
  location,
  onRetry,
}: WeatherCardProps) {
  const weatherInfo = weather ? getWmoCodeInfo(weather.weatherCode) : null

  return (
    <div className="rounded-3xl border border-white/35 bg-white/30 p-6 text-white shadow-2xl backdrop-blur-xl md:p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-white/80">Current Weather</p>
      {location ? (
        <p className="mt-2 text-sm text-white/75">
          {location.label} · {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      ) : null}
      <div className="mt-4 min-h-24">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-12 w-32 rounded-full bg-white/35" />
            <div className="h-5 w-40 rounded-full bg-white/25" />
            <div className="h-4 w-52 rounded-full bg-white/20" />
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-rose-100">{error}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Try again
              </button>
            ) : null}
          </div>
        ) : weather ? (
          <>
            <p className="text-5xl font-thin leading-none">{Math.round(weather.temperature)}°C</p>
            <p className="mt-3 text-xl text-white/90">
              {weatherInfo?.emoji} {weatherInfo?.description}
            </p>
            <p className="mt-3 text-sm text-white/80">
              Wind: {Math.round(weather.windSpeed)} km/h · Humidity:{' '}
              {Math.round(weather.humidity)}%
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
