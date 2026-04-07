import { describe, it, expect } from 'vitest'
import { urlBase64ToUint8Array } from './usePushSubscription'

describe('urlBase64ToUint8Array', () => {
  it('converts a base64url string to Uint8Array', () => {
    const result = urlBase64ToUint8Array('dGVzdA')  // 'test' in base64url
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles padding correctly', () => {
    // 'te' in base64url = 'dGU'
    const result = urlBase64ToUint8Array('dGU')
    expect(result).toBeInstanceOf(Uint8Array)
  })
})
