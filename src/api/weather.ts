const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export interface WeatherData {
  temperature: number
  weatherCode: number
}

export async function fetchCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const searchParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,weather_code',
  })

  const response = await fetch(`${OPEN_METEO_BASE_URL}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }

  const data: {
    current?: {
      temperature_2m?: number
      weather_code?: number
    }
  } = await response.json()

  if (
    data.current?.temperature_2m === undefined ||
    data.current?.weather_code === undefined
  ) {
    throw new Error('Weather data is unavailable')
  }

  return {
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
  }
}
