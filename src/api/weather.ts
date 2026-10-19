const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export interface HourlyForecastItem {
  time: string
  temperature: number
  weatherCode: number
  precipitationChance: number
}

export interface DailyForecastItem {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  precipitationChance: number
}

export interface WeatherData {
  temperature: number
  apparentTemperature: number
  weatherCode: number
  windSpeed: number
  humidity: number
  precipitationChance: number
  uvIndex: number
  timezone: string
  updatedAt: string
  hourlyForecast: HourlyForecastItem[]
  dailyForecast: DailyForecastItem[]
}

export interface LocationSearchResult {
  id: string
  latitude: number
  longitude: number
  label: string
}

interface OpenMeteoResponse {
  timezone?: string
  current?: {
    time?: string
    temperature_2m?: number
    apparent_temperature?: number
    weather_code?: number
    wind_speed_10m?: number
    relative_humidity_2m?: number
  }
  hourly?: {
    time?: string[]
    temperature_2m?: number[]
    weather_code?: number[]
    precipitation_probability?: number[]
    uv_index?: number[]
  }
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    precipitation_probability_max?: number[]
  }
}

interface OpenMeteoGeocodingResult {
  id?: number
  name?: string
  latitude?: number
  longitude?: number
  country?: string
  admin1?: string
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[]
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatLocationLabel(result: {
  name: string
  country?: string
  admin1?: string
}): string {
  const segments = [result.name, result.admin1, result.country].filter(Boolean)
  return segments.join(', ')
}

function getCurrentHourIndex(data: OpenMeteoResponse): number {
  const currentTime = data.current?.time
  const hourlyTimes = data.hourly?.time

  if (!currentTime || !hourlyTimes?.length) {
    return 0
  }

  const index = hourlyTimes.indexOf(currentTime)
  return index >= 0 ? index : 0
}

function buildHourlyForecast(data: OpenMeteoResponse): HourlyForecastItem[] {
  const times = data.hourly?.time
  const temperatures = data.hourly?.temperature_2m
  const codes = data.hourly?.weather_code
  const precipitationProbabilities = data.hourly?.precipitation_probability

  if (!times || !temperatures || !codes || !precipitationProbabilities) {
    return []
  }

  const startIndex = getCurrentHourIndex(data)
  const maxLength = Math.min(
    times.length,
    temperatures.length,
    codes.length,
    precipitationProbabilities.length,
    startIndex + 24,
  )

  const hourlyForecast: HourlyForecastItem[] = []

  for (let index = startIndex; index < maxLength; index += 1) {
    const time = times[index]
    const temperature = temperatures[index]
    const weatherCode = codes[index]
    const precipitationChance = precipitationProbabilities[index]

    if (
      typeof time === 'string' &&
      isFiniteNumber(temperature) &&
      isFiniteNumber(weatherCode) &&
      isFiniteNumber(precipitationChance)
    ) {
      hourlyForecast.push({
        time,
        temperature,
        weatherCode,
        precipitationChance,
      })
    }
  }

  return hourlyForecast
}

function buildDailyForecast(data: OpenMeteoResponse): DailyForecastItem[] {
  const dates = data.daily?.time
  const codes = data.daily?.weather_code
  const maxTemperatures = data.daily?.temperature_2m_max
  const minTemperatures = data.daily?.temperature_2m_min
  const precipitationProbabilities = data.daily?.precipitation_probability_max

  if (!dates || !codes || !maxTemperatures || !minTemperatures || !precipitationProbabilities) {
    return []
  }

  const maxLength = Math.min(
    dates.length,
    codes.length,
    maxTemperatures.length,
    minTemperatures.length,
    precipitationProbabilities.length,
    7,
  )

  const dailyForecast: DailyForecastItem[] = []

  for (let index = 0; index < maxLength; index += 1) {
    const date = dates[index]
    const weatherCode = codes[index]
    const tempMax = maxTemperatures[index]
    const tempMin = minTemperatures[index]
    const precipitationChance = precipitationProbabilities[index]

    if (
      typeof date === 'string' &&
      isFiniteNumber(weatherCode) &&
      isFiniteNumber(tempMax) &&
      isFiniteNumber(tempMin) &&
      isFiniteNumber(precipitationChance)
    ) {
      dailyForecast.push({
        date,
        weatherCode,
        tempMax,
        tempMin,
        precipitationChance,
      })
    }
  }

  return dailyForecast
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const searchParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: 'auto',
    forecast_days: '7',
    current:
      'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m',
    hourly: 'temperature_2m,weather_code,precipitation_probability,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  })

  const response = await fetch(`${OPEN_METEO_BASE_URL}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }

  const data: OpenMeteoResponse = await response.json()

  if (
    !isFiniteNumber(data.current?.temperature_2m) ||
    !isFiniteNumber(data.current?.apparent_temperature) ||
    !isFiniteNumber(data.current?.weather_code) ||
    !isFiniteNumber(data.current?.wind_speed_10m) ||
    !isFiniteNumber(data.current?.relative_humidity_2m) ||
    typeof data.current?.time !== 'string' ||
    typeof data.timezone !== 'string'
  ) {
    throw new Error('Weather data is unavailable')
  }

  const currentHourIndex = getCurrentHourIndex(data)
  const precipitationChance =
    data.hourly?.precipitation_probability?.[currentHourIndex] ?? 0
  const uvIndex = data.hourly?.uv_index?.[currentHourIndex] ?? 0

  const hourlyForecast = buildHourlyForecast(data)
  const dailyForecast = buildDailyForecast(data)

  if (!hourlyForecast.length || !dailyForecast.length) {
    throw new Error('Weather forecast is unavailable')
  }

  return {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    humidity: data.current.relative_humidity_2m,
    precipitationChance: isFiniteNumber(precipitationChance)
      ? precipitationChance
      : 0,
    uvIndex: isFiniteNumber(uvIndex) ? uvIndex : 0,
    timezone: data.timezone,
    updatedAt: data.current.time,
    hourlyForecast,
    dailyForecast,
  }
}

export async function searchLocationsByName(
  query: string,
): Promise<LocationSearchResult[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const searchParams = new URLSearchParams({
    name: normalizedQuery,
    count: '7',
    language: 'en',
    format: 'json',
  })

  const response = await fetch(
    `${OPEN_METEO_GEOCODING_URL}?${searchParams.toString()}`,
  )

  if (!response.ok) {
    throw new Error('Failed to search locations')
  }

  const data: OpenMeteoGeocodingResponse = await response.json()

  if (!data.results?.length) {
    return []
  }

  return data.results
    .filter((result): result is Required<Pick<OpenMeteoGeocodingResult, 'name' | 'latitude' | 'longitude'>> & OpenMeteoGeocodingResult => {
      return (
        typeof result.name === 'string' &&
        isFiniteNumber(result.latitude) &&
        isFiniteNumber(result.longitude)
      )
    })
    .map((result, index) => {
      const label = formatLocationLabel(result)
      const stableId =
        result.id ??
        `${result.name}-${result.latitude}-${result.longitude}-${index}`

      return {
        id: stableId.toString(),
        latitude: result.latitude,
        longitude: result.longitude,
        label,
      }
    })
}
