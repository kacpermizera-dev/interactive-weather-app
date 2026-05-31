import type { WeatherData } from '../../api/weather'

interface WeatherCardProps {
  weather: WeatherData | null
  loading: boolean
  error: string | null
}

export function WeatherCard({ weather, loading, error }: WeatherCardProps) {
  return (
    <div className="rounded-3xl border border-white/35 bg-white/30 p-6 text-white shadow-2xl backdrop-blur-xl md:p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-white/80">Current Weather</p>
      <div className="mt-4 min-h-20">
        {loading ? (
          <p className="text-2xl font-light">Loading…</p>
        ) : error ? (
          <p className="text-sm text-rose-100">{error}</p>
        ) : weather ? (
          <>
            <p className="text-5xl font-thin leading-none">{Math.round(weather.temperature)}°C</p>
            <p className="mt-3 text-sm text-white/80">WMO Code: {weather.weatherCode}</p>
          </>
        ) : null}
      </div>
    </div>
  )
}
