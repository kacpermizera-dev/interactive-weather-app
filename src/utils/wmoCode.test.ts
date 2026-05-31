import { describe, expect, it } from 'vitest'
import { getWmoCodeInfo } from './wmoCode'

describe('getWmoCodeInfo', () => {
  it('returns the expected description and emoji for known codes', () => {
    expect(getWmoCodeInfo(0)).toEqual({
      description: 'Clear Sky',
      emoji: '☀️',
    })

    expect(getWmoCodeInfo(61)).toEqual({
      description: 'Slight Rain',
      emoji: '🌧️',
    })
  })

  it('returns a sensible fallback for unknown codes', () => {
    expect(getWmoCodeInfo(999)).toEqual({
      description: 'Unknown Conditions',
      emoji: '❓',
    })
  })
})
