import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentWeather } from './weather'

const fetchMock = vi.fn()

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  fetchMock.mockReset()
})

describe('fetchCurrentWeather', () => {
  it('returns parsed weather data for a valid response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 21.4,
          weather_code: 61,
          wind_speed_10m: 12.2,
          relative_humidity_2m: 65,
        },
      }),
    } satisfies Partial<Response>)
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCurrentWeather(40.7128, -74.006)).resolves.toEqual({
      temperature: 21.4,
      weatherCode: 61,
      windSpeed: 12.2,
      humidity: 65,
    })

    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.searchParams.get('latitude')).toBe('40.7128')
    expect(url.searchParams.get('longitude')).toBe('-74.006')
    expect(url.searchParams.get('current')).toBe(
      'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
    )
  })

  it('throws when the API response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    } satisfies Partial<Response>)
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCurrentWeather(40.7128, -74.006)).rejects.toThrow(
      'Failed to fetch weather data',
    )
  })

  it('throws when required fields are missing from the response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 21.4,
          weather_code: 61,
          wind_speed_10m: 12.2,
        },
      }),
    } satisfies Partial<Response>)
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCurrentWeather(40.7128, -74.006)).rejects.toThrow(
      'Weather data is unavailable',
    )
  })
})
