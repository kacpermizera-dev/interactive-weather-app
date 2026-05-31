const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export interface WeatherData {
  temperature: number
  weatherCode: number
  windSpeed: number
  humidity: number
}

export interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number
    weather_code?: number
    wind_speed_10m?: number
    relative_humidity_2m?: number
  }
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const searchParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
  })

  const response = await fetch(`${OPEN_METEO_BASE_URL}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }

  const data: OpenMeteoResponse = await response.json()

  if (
    data.current?.temperature_2m === undefined ||
    data.current?.weather_code === undefined ||
    data.current?.wind_speed_10m === undefined ||
    data.current?.relative_humidity_2m === undefined
  ) {
    throw new Error('Weather data is unavailable')
  }

  return {
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    humidity: data.current.relative_humidity_2m,
  }
}
