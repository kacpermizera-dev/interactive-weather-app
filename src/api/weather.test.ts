import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentWeather, searchLocationsByName } from './weather'

const fetchMock = vi.fn()

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  fetchMock.mockReset()
})

describe('fetchCurrentWeather', () => {
  it('returns parsed weather and forecast data for a valid response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'Asia/Kolkata',
        current: {
          time: '2026-06-01T12:00',
          temperature_2m: 31.2,
          apparent_temperature: 35.1,
          weather_code: 1,
          wind_speed_10m: 13.8,
          relative_humidity_2m: 66,
        },
        hourly: {
          time: ['2026-06-01T12:00', '2026-06-01T13:00', '2026-06-01T14:00'],
          temperature_2m: [31.2, 31.8, 32.1],
          weather_code: [1, 2, 2],
          precipitation_probability: [20, 18, 17],
          uv_index: [7.2, 7.4, 7.6],
        },
        daily: {
          time: ['2026-06-01', '2026-06-02'],
          weather_code: [1, 3],
          temperature_2m_max: [33.6, 34.1],
          temperature_2m_min: [27.9, 28.1],
          precipitation_probability_max: [42, 30],
        },
      }),
    } satisfies Partial<Response>)
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCurrentWeather(19.076, 72.8777)).resolves.toEqual({
      temperature: 31.2,
      apparentTemperature: 35.1,
      weatherCode: 1,
      windSpeed: 13.8,
      humidity: 66,
      precipitationChance: 20,
      uvIndex: 7.2,
      timezone: 'Asia/Kolkata',
      updatedAt: '2026-06-01T12:00',
      hourlyForecast: [
        {
          time: '2026-06-01T12:00',
          temperature: 31.2,
          weatherCode: 1,
          precipitationChance: 20,
        },
        {
          time: '2026-06-01T13:00',
          temperature: 31.8,
          weatherCode: 2,
          precipitationChance: 18,
        },
        {
          time: '2026-06-01T14:00',
          temperature: 32.1,
          weatherCode: 2,
          precipitationChance: 17,
        },
      ],
      dailyForecast: [
        {
          date: '2026-06-01',
          weatherCode: 1,
          tempMax: 33.6,
          tempMin: 27.9,
          precipitationChance: 42,
        },
        {
          date: '2026-06-02',
          weatherCode: 3,
          tempMax: 34.1,
          tempMin: 28.1,
          precipitationChance: 30,
        },
      ],
    })

    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.searchParams.get('latitude')).toBe('19.076')
    expect(url.searchParams.get('longitude')).toBe('72.8777')
    expect(url.searchParams.get('timezone')).toBe('auto')
    expect(url.searchParams.get('current')).toContain('apparent_temperature')
    expect(url.searchParams.get('hourly')).toContain('precipitation_probability')
    expect(url.searchParams.get('daily')).toContain('temperature_2m_max')
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

  it('throws when required current fields are missing', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'Europe/Warsaw',
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

  it('throws when forecast arrays are unavailable', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'Europe/Warsaw',
        current: {
          time: '2026-06-01T12:00',
          temperature_2m: 21.4,
          apparent_temperature: 19.8,
          weather_code: 61,
          wind_speed_10m: 12.2,
          relative_humidity_2m: 65,
        },
      }),
    } satisfies Partial<Response>)
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCurrentWeather(40.7128, -74.006)).rejects.toThrow(
      'Weather forecast is unavailable',
    )
  })
})

describe('searchLocationsByName', () => {
  it('returns parsed locations for a valid response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 2950159,
            name: 'Berlin',
            latitude: 52.52437,
            longitude: 13.41053,
            admin1: 'Berlin',
            country: 'Germany',
          },
        ],
      }),
    } satisfies Partial<Response>)
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchLocationsByName('Berlin')).resolves.toEqual([
      {
        id: '2950159',
        latitude: 52.52437,
        longitude: 13.41053,
        label: 'Berlin, Berlin, Germany',
      },
    ])

    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.searchParams.get('name')).toBe('Berlin')
    expect(url.searchParams.get('count')).toBe('7')
  })

  it('returns an empty array for very short queries', async () => {
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchLocationsByName('a')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws when geocoding API response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    } satisfies Partial<Response>)
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchLocationsByName('Warsaw')).rejects.toThrow(
      'Failed to search locations',
    )
  })
})
