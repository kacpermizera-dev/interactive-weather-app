export interface WmoCodeInfo {
  description: string
  icon: 'sun' | 'sun-cloud' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm' | 'unknown'
  mood: 'clear' | 'cloudy' | 'mist' | 'rain' | 'snow' | 'storm' | 'unknown'
}

const UNKNOWN_WMO_CODE_INFO: WmoCodeInfo = {
  description: 'Unknown Conditions',
  icon: 'unknown',
  mood: 'unknown',
}

const WMO_CODE_MAP: Record<number, WmoCodeInfo> = {
  0: { description: 'Clear Sky', icon: 'sun', mood: 'clear' },
  1: { description: 'Mainly Clear', icon: 'sun-cloud', mood: 'clear' },
  2: { description: 'Partly Cloudy', icon: 'sun-cloud', mood: 'cloudy' },
  3: { description: 'Overcast', icon: 'cloud', mood: 'cloudy' },
  45: { description: 'Fog', icon: 'fog', mood: 'mist' },
  48: { description: 'Depositing Rime Fog', icon: 'fog', mood: 'mist' },
  51: { description: 'Light Drizzle', icon: 'drizzle', mood: 'rain' },
  53: { description: 'Moderate Drizzle', icon: 'drizzle', mood: 'rain' },
  55: { description: 'Dense Drizzle', icon: 'rain', mood: 'rain' },
  56: { description: 'Light Freezing Drizzle', icon: 'rain', mood: 'rain' },
  57: { description: 'Dense Freezing Drizzle', icon: 'rain', mood: 'rain' },
  61: { description: 'Slight Rain', icon: 'rain', mood: 'rain' },
  63: { description: 'Moderate Rain', icon: 'rain', mood: 'rain' },
  65: { description: 'Heavy Rain', icon: 'rain', mood: 'rain' },
  66: { description: 'Light Freezing Rain', icon: 'rain', mood: 'rain' },
  67: { description: 'Heavy Freezing Rain', icon: 'rain', mood: 'rain' },
  71: { description: 'Slight Snow Fall', icon: 'snow', mood: 'snow' },
  73: { description: 'Moderate Snow Fall', icon: 'snow', mood: 'snow' },
  75: { description: 'Heavy Snow Fall', icon: 'snow', mood: 'snow' },
  77: { description: 'Snow Grains', icon: 'snow', mood: 'snow' },
  80: { description: 'Slight Rain Showers', icon: 'drizzle', mood: 'rain' },
  81: { description: 'Moderate Rain Showers', icon: 'rain', mood: 'rain' },
  82: { description: 'Violent Rain Showers', icon: 'storm', mood: 'storm' },
  85: { description: 'Slight Snow Showers', icon: 'snow', mood: 'snow' },
  86: { description: 'Heavy Snow Showers', icon: 'snow', mood: 'snow' },
  95: { description: 'Thunderstorm', icon: 'storm', mood: 'storm' },
  96: { description: 'Thunderstorm with Slight Hail', icon: 'storm', mood: 'storm' },
  99: { description: 'Thunderstorm with Heavy Hail', icon: 'storm', mood: 'storm' },
}

export function getWmoCodeInfo(code: number | null | undefined): WmoCodeInfo {
  return WMO_CODE_MAP[code ?? Number.NaN] ?? UNKNOWN_WMO_CODE_INFO
}
