import { describe, expect, it } from 'vitest'
import { getWmoCodeInfo } from './wmoCode'

describe('getWmoCodeInfo', () => {
  it('returns the expected description and monochrome icon metadata for known codes', () => {
    expect(getWmoCodeInfo(0)).toEqual({
      description: 'Clear Sky',
      icon: 'sun',
      mood: 'clear',
    })

    expect(getWmoCodeInfo(61)).toEqual({
      description: 'Slight Rain',
      icon: 'rain',
      mood: 'rain',
    })
  })

  it('returns a sensible fallback for unknown codes', () => {
    expect(getWmoCodeInfo(999)).toEqual({
      description: 'Unknown Conditions',
      icon: 'unknown',
      mood: 'unknown',
    })
  })
})
