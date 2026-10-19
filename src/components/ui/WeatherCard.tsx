import { useState, type FormEvent } from 'react'
import type { AppSettings } from '../../App'
import type { DailyForecastItem, WeatherData } from '../../api/weather'
import { getWmoCodeInfo, type WmoCodeInfo } from '../../utils/wmoCode'
import { WeatherGlyph } from './WeatherGlyph'

interface LocationData {
  id: string
  latitude: number
  longitude: number
  label: string
}

type LocationSource = 'device' | 'fallback' | 'search' | 'saved'
type TemperatureUnit = 'celsius' | 'fahrenheit'
type WeatherAlert = {
  title: string
  detail: string
  tone: 'watch' | 'warning'
}

interface WeatherCardProps {
  weather: WeatherData | null
  loading: boolean
  error: string | null
  location: LocationData | null
  mood: WmoCodeInfo['mood']
  locationSource: LocationSource
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
  onboardingComplete: boolean
  staleNotice: string | null
  isActiveLocationSaved: boolean
  onRetry: () => void
  onUseDeviceLocation: () => void | Promise<void>
  onUseDefaultLocation: () => void
  onSearch: (query: string) => void | Promise<void>
  searchResults: LocationData[]
  searchLoading: boolean
  searchError: string | null
  onSelectSearchLocation: (location: LocationData) => void
  onSelectSavedLocation: (location: LocationData) => void
  onSaveLocation: () => void
  savedLocations: LocationData[]
  onDeleteSavedLocation: (locationId: string) => void
}

function formatTemperature(value: number, unit: TemperatureUnit): string {
  const temperature =
    unit === 'fahrenheit' ? Math.round((value * 9) / 5 + 32) : Math.round(value)

  return `${temperature}°${unit === 'fahrenheit' ? 'F' : 'C'}`
}

function formatDateTime(value: string, settings: AppSettings, timeZone?: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: settings.timeFormat === '12h',
    timeZone,
  }).format(date)
}

function formatTime(value: string, settings: AppSettings, timeZone?: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: settings.timeFormat === '12h',
    timeZone,
  }).format(date)
}

function formatLocalTime(timeZone: string, settings: AppSettings): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: settings.timeFormat === '12h',
    timeZone,
  }).format(new Date())
}

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatCoordinates(location: LocationData): string {
  return `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`
}

function formatWindSpeed(value: number, unit: AppSettings['windSpeedUnit']): string {
  const windSpeed = unit === 'mph' ? Math.round(value / 1.609) : Math.round(value)

  return `${windSpeed} ${unit === 'mph' ? 'mph' : 'km/h'}`
}

function getSourceLabel(source: LocationSource): string {
  switch (source) {
    case 'device':
      return 'Device fix'
    case 'search':
      return 'Search result'
    case 'saved':
      return 'Saved place'
    default:
      return 'Fallback'
  }
}

function getWeatherAlerts(weather: WeatherData | null): WeatherAlert[] {
  if (!weather) {
    return []
  }

  const alerts: WeatherAlert[] = []

  if ([82, 95, 96, 99].includes(weather.weatherCode)) {
    alerts.push({
      title: 'Storm risk',
      detail: 'Thunderstorm conditions are possible around this location.',
      tone: 'warning',
    })
  }

  if (weather.precipitationChance >= 70) {
    alerts.push({
      title: 'High precipitation',
      detail: `${Math.round(weather.precipitationChance)}% chance of rain in the current window.`,
      tone: 'watch',
    })
  }

  if (weather.uvIndex >= 7) {
    alerts.push({
      title: 'High UV',
      detail: `UV index is ${Math.round(weather.uvIndex)}. Shade and sunscreen matter today.`,
      tone: 'watch',
    })
  }

  if (weather.windSpeed >= 45) {
    alerts.push({
      title: 'Strong wind',
      detail: `Wind is near ${Math.round(weather.windSpeed)} km/h. Outdoor plans may be affected.`,
      tone: 'warning',
    })
  }

  return alerts
}

function getDailyBrief(weather: WeatherData | null): string {
  if (!weather) {
    return 'Choose a location to build a daily brief.'
  }

  if (weather.precipitationChance >= 60) {
    return 'Rain is likely enough that an umbrella belongs in the plan.'
  }

  if (weather.uvIndex >= 7) {
    return 'Clear conditions with high UV. Good day outside, but protect your skin.'
  }

  if (weather.apparentTemperature >= 30) {
    return 'It will feel warm. Hydration and shade breaks are worth planning.'
  }

  if (weather.windSpeed >= 35) {
    return 'Breezy conditions may make cycling, running, or commuting feel rougher.'
  }

  return 'No major weather friction detected for the next few hours.'
}

export function WeatherCard({
  weather,
  loading,
  error,
  location,
  mood,
  locationSource,
  settings,
  onSettingsChange,
  onboardingComplete,
  staleNotice,
  isActiveLocationSaved,
  onRetry,
  onUseDeviceLocation,
  onUseDefaultLocation,
  onSearch,
  searchResults,
  searchLoading,
  searchError,
  onSelectSearchLocation,
  onSelectSavedLocation,
  onSaveLocation,
  savedLocations,
  onDeleteSavedLocation,
}: WeatherCardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState<DailyForecastItem | null>(null)
  const condition = getWmoCodeInfo(weather?.weatherCode)
  const alerts = getWeatherAlerts(weather)
  const activeSelectedDay = selectedDay ?? weather?.dailyForecast[0] ?? null

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSearch(searchQuery)
  }

  function updateSettings(nextSettings: Partial<AppSettings>) {
    onSettingsChange({
      ...settings,
      ...nextSettings,
    })
  }

  return (
    <section className="weather-panel" aria-label="Interactive weather">
      {!onboardingComplete ? (
        <section className="onboarding-panel" aria-label="Location setup">
          <div>
            <p className="weather-kicker">Set up forecast</p>
            <h2>Start with your weather home.</h2>
            <p>
              Use device location for local forecasts, or continue with the default
              city and search manually.
            </p>
          </div>
          <div className="onboarding-actions">
            <button className="weather-button" type="button" onClick={onUseDeviceLocation}>
              Use my location
            </button>
            <button
              className="weather-button weather-button-outline"
              type="button"
              onClick={onUseDefaultLocation}
            >
              Search manually
            </button>
          </div>
        </section>
      ) : null}

      <header className="weather-header">
        <div className="status-tape">
          <span className="status-dot" />
          <span className="status-text">
            {loading ? 'Updating forecast' : error ? 'Offline reading' : 'Live forecast'}
          </span>
          <span className="status-badge">{getSourceLabel(locationSource)}</span>
        </div>

        <div className="weather-location-row">
          <div>
            <p className="weather-kicker">Interactive Weather</p>
            <p className="weather-subkicker">
              {weather ? `Local time ${formatLocalTime(weather.timezone, settings)}` : mood}
            </p>
            <h1 className="weather-location-label">
              {location?.label ?? 'Locating weather station'}
            </h1>
            {location ? (
              <p className="weather-location-coords">{formatCoordinates(location)}</p>
            ) : null}
          </div>

          <button
            className="weather-button weather-button-outline"
            type="button"
            onClick={onSaveLocation}
            disabled={!location || isActiveLocationSaved}
          >
            {isActiveLocationSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </header>

      <section className="settings-section" aria-label="Weather settings">
        <div className="settings-group" role="group" aria-label="Temperature unit">
          <span>Temp</span>
          <button
            className={settings.temperatureUnit === 'celsius' ? 'active' : ''}
            type="button"
            onClick={() => updateSettings({ temperatureUnit: 'celsius' })}
          >
            °C
          </button>
          <button
            className={settings.temperatureUnit === 'fahrenheit' ? 'active' : ''}
            type="button"
            onClick={() => updateSettings({ temperatureUnit: 'fahrenheit' })}
          >
            °F
          </button>
        </div>
        <div className="settings-group" role="group" aria-label="Wind unit">
          <span>Wind</span>
          <button
            className={settings.windSpeedUnit === 'kmh' ? 'active' : ''}
            type="button"
            onClick={() => updateSettings({ windSpeedUnit: 'kmh' })}
          >
            km/h
          </button>
          <button
            className={settings.windSpeedUnit === 'mph' ? 'active' : ''}
            type="button"
            onClick={() => updateSettings({ windSpeedUnit: 'mph' })}
          >
            mph
          </button>
        </div>
        <div className="settings-group" role="group" aria-label="Time format">
          <span>Time</span>
          <button
            className={settings.timeFormat === '24h' ? 'active' : ''}
            type="button"
            onClick={() => updateSettings({ timeFormat: '24h' })}
          >
            24h
          </button>
          <button
            className={settings.timeFormat === '12h' ? 'active' : ''}
            type="button"
            onClick={() => updateSettings({ timeFormat: '12h' })}
          >
            12h
          </button>
        </div>
      </section>

      {staleNotice ? <p className="offline-notice">{staleNotice}</p> : null}

      <div className="weather-main-grid">
        <div className="weather-current-card">
          {loading ? (
            <div className="weather-loading" aria-label="Loading weather">
              <div className="skeleton skeleton-temp" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line-short" />
            </div>
          ) : error ? (
            <div className="weather-error-block">
              <p className="weather-error-message">{error}</p>
              <button className="weather-button" type="button" onClick={onRetry}>
                Retry
              </button>
            </div>
          ) : weather ? (
            <>
              <div className="weather-temp-wrap">
                <p className="weather-temperature">
                  {formatTemperature(weather.temperature, settings.temperatureUnit)}
                </p>
                <button
                  className="weather-mode-badge"
                  type="button"
                  onClick={() =>
                    updateSettings({
                      temperatureUnit:
                        settings.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius',
                    })
                  }
                >
                  {settings.temperatureUnit === 'celsius' ? 'Use °F' : 'Use °C'}
                </button>
              </div>

              <p className="weather-description">{condition.description}</p>
              <p className="weather-meta">
                Updated {formatDateTime(weather.updatedAt, settings, weather.timezone)}
                {' · '}
                {weather.timezone}
              </p>

              <div className="metric-grid">
                <div className="metric-pill">
                  <span>Feels</span>
                  <strong>
                    {formatTemperature(weather.apparentTemperature, settings.temperatureUnit)}
                  </strong>
                </div>
                <div className="metric-pill">
                  <span>Rain</span>
                  <strong>{Math.round(weather.precipitationChance)}%</strong>
                </div>
                <div className="metric-pill">
                  <span>UV index</span>
                  <strong>{Math.round(weather.uvIndex)}</strong>
                </div>
              </div>
            </>
          ) : (
            <p className="weather-empty">Weather data will appear here.</p>
          )}
        </div>

        <div className="weather-icon-card">
          <div className="weather-icon-orbit">
            <span className="orbit-line orbit-line-a" />
            <span className="orbit-line orbit-line-b" />
            <span className="orbit-line orbit-line-c" />
            <WeatherGlyph icon={condition.icon} className="weather-icon" />
          </div>
          {weather ? (
            <div className="weather-side-stats">
              <p className="weather-icon-caption">Local now</p>
              <strong>{formatLocalTime(weather.timezone, settings)}</strong>
              <span>
                Wind {formatWindSpeed(weather.windSpeed, settings.windSpeedUnit)} · Humidity{' '}
                {Math.round(weather.humidity)}%
              </span>
            </div>
          ) : (
            <p className="weather-icon-caption">{condition.description}</p>
          )}
        </div>
      </div>

      {weather ? (
        <>
          <section className="brief-section" aria-label="Daily brief">
            <div>
              <p className="forecast-label">Today brief</p>
              <strong>{getDailyBrief(weather)}</strong>
            </div>
            <div className="brief-metrics">
              <span>{formatWindSpeed(weather.windSpeed, settings.windSpeedUnit)}</span>
              <span>{Math.round(weather.humidity)}% humidity</span>
              <span>UV {Math.round(weather.uvIndex)}</span>
            </div>
          </section>

          {alerts.length > 0 ? (
            <section className="alerts-section" aria-label="Weather alerts">
              {alerts.map((alert) => (
                <article className={`alert-card alert-${alert.tone}`} key={alert.title}>
                  <span>{alert.tone === 'warning' ? 'Warning' : 'Watch'}</span>
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                </article>
              ))}
            </section>
          ) : null}

          <section className="forecast-section" aria-label="Hourly forecast">
            <div className="forecast-header">
              <p>Next hours</p>
              <span>Precipitation shown per hour</span>
            </div>
            <div className="hourly-strip">
              {weather.hourlyForecast.slice(0, 8).map((hour) => {
                const hourInfo = getWmoCodeInfo(hour.weatherCode)

                return (
                  <div className="hourly-item" key={hour.time}>
                    <span>{formatTime(hour.time, settings, weather.timezone)}</span>
                    <WeatherGlyph icon={hourInfo.icon} className="hourly-icon" />
                    <strong>
                      {formatTemperature(hour.temperature, settings.temperatureUnit)}
                    </strong>
                    <span>{Math.round(hour.precipitationChance)}%</span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="forecast-section" aria-label="Daily forecast">
            <div className="forecast-header">
              <p>7-day forecast</p>
              <span>High / low</span>
            </div>
            <div className="daily-grid">
              {weather.dailyForecast.map((day) => {
                const dayInfo = getWmoCodeInfo(day.weatherCode)

                return (
                  <button
                    className={`daily-item${
                      activeSelectedDay?.date === day.date ? ' daily-item-active' : ''
                    }`}
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                  >
                    <span>{formatDate(day.date)}</span>
                    <WeatherGlyph icon={dayInfo.icon} className="daily-icon" />
                    <strong>
                      {formatTemperature(day.tempMax, settings.temperatureUnit)} /{' '}
                      {formatTemperature(day.tempMin, settings.temperatureUnit)}
                    </strong>
                    <span>{Math.round(day.precipitationChance)}%</span>
                  </button>
                )
              })}
            </div>
            {activeSelectedDay ? (
              <div className="day-detail-panel">
                <div>
                  <span>Selected day</span>
                  <strong>{formatDate(activeSelectedDay.date)}</strong>
                </div>
                <div>
                  <span>Conditions</span>
                  <strong>{getWmoCodeInfo(activeSelectedDay.weatherCode).description}</strong>
                </div>
                <div>
                  <span>Range</span>
                  <strong>
                    {formatTemperature(activeSelectedDay.tempMax, settings.temperatureUnit)}
                    {' / '}
                    {formatTemperature(activeSelectedDay.tempMin, settings.temperatureUnit)}
                  </strong>
                </div>
                <div>
                  <span>Rain chance</span>
                  <strong>{Math.round(activeSelectedDay.precipitationChance)}%</strong>
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      <section className="search-section" aria-label="Search locations">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <label className="search-label" htmlFor="weather-location-search">
            Search location
          </label>
          <div className="search-row">
            <input
              className="search-input"
              id="weather-location-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="City or place"
              type="search"
            />
            <button className="weather-button" type="submit" disabled={searchLoading}>
              {searchLoading ? 'Searching' : 'Search'}
            </button>
          </div>
        </form>

        {searchError ? (
          <p className="search-feedback search-feedback-error">{searchError}</p>
        ) : null}
        {searchLoading ? <p className="search-feedback">Searching locations...</p> : null}

        {searchResults.length > 0 ? (
          <ul className="results-grid">
            {searchResults.map((result) => (
              <li key={result.id}>
                <button
                  className="result-chip"
                  type="button"
                  onClick={() => onSelectSearchLocation(result)}
                >
                  <span className="result-chip-label">{result.label}</span>
                  <span className="result-chip-coords">{formatCoordinates(result)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="saved-section" aria-label="Saved locations">
        <div className="saved-header">
          <p>Saved locations</p>
          <span>{savedLocations.length}</span>
        </div>

        {savedLocations.length > 0 ? (
          <ul className="saved-list">
            {savedLocations.map((savedLocation) => (
              <li className="saved-item" key={savedLocation.id}>
                <button
                  className="saved-location-button"
                  type="button"
                  onClick={() => onSelectSavedLocation(savedLocation)}
                >
                  <span>{savedLocation.label}</span>
                  <span aria-hidden="true">›</span>
                </button>
                <button
                  aria-label={`Delete ${savedLocation.label}`}
                  className="saved-delete-button"
                  type="button"
                  onClick={() => onDeleteSavedLocation(savedLocation.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="saved-empty">No saved locations yet.</p>
        )}
      </section>
    </section>
  )
}
