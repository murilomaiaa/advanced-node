import { AccessToken } from '@/domain/models'

describe('AccessToken', () => {
  it('should create with a value', async () => {
    const sut = new AccessToken('any-value')

    expect(sut).toEqual({ value: 'any-value' })
  })

  it('should expire in 1800000 ms', () => {
    expect(AccessToken.expirationInMs).toBe(1800000)
  })
})
