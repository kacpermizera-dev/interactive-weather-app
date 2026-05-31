export interface WmoCodeInfo {
  description: string
  emoji: string
}

const UNKNOWN_WMO_CODE_INFO: WmoCodeInfo = {
  description: 'Unknown Conditions',
  emoji: '❓',
}

const WMO_CODE_MAP: Record<number, WmoCodeInfo> = {
  0: { description: 'Clear Sky', emoji: '☀️' },
  1: { description: 'Mainly Clear', emoji: '🌤️' },
  2: { description: 'Partly Cloudy', emoji: '⛅️' },
  3: { description: 'Overcast', emoji: '☁️' },
  45: { description: 'Fog', emoji: '🌫️' },
  48: { description: 'Depositing Rime Fog', emoji: '🌫️' },
  51: { description: 'Light Drizzle', emoji: '🌦️' },
  53: { description: 'Moderate Drizzle', emoji: '🌦️' },
  55: { description: 'Dense Drizzle', emoji: '🌧️' },
  61: { description: 'Slight Rain', emoji: '🌧️' },
  63: { description: 'Moderate Rain', emoji: '🌧️' },
  65: { description: 'Heavy Rain', emoji: '🌧️' },
  71: { description: 'Slight Snow Fall', emoji: '🌨️' },
  73: { description: 'Moderate Snow Fall', emoji: '🌨️' },
  75: { description: 'Heavy Snow Fall', emoji: '❄️' },
  80: { description: 'Slight Rain Showers', emoji: '🌦️' },
  81: { description: 'Moderate Rain Showers', emoji: '🌧️' },
  82: { description: 'Violent Rain Showers', emoji: '⛈️' },
  95: { description: 'Thunderstorm', emoji: '⛈️' },
  96: { description: 'Thunderstorm with Slight Hail', emoji: '⛈️' },
  99: { description: 'Thunderstorm with Heavy Hail', emoji: '⛈️' },
}

export function getWmoCodeInfo(code: number | null | undefined): WmoCodeInfo {
  return WMO_CODE_MAP[code ?? Number.NaN] ?? UNKNOWN_WMO_CODE_INFO
}
