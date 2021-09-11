import { mock, MockProxy } from 'jest-mock-extended'

import { LoadFacebookUserApi } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let sut: FacebookAuthenticationService

  beforeEach(() => {
    facebookApi = mock()
    sut = new FacebookAuthenticationService(facebookApi)
  })

  it('should call LoadFacebookUserApiSpy with correct args', async () => {
    await sut.execute({ token: 'any_token' })

    expect(facebookApi.loadUser).toBeCalledWith({ token: 'any_token' })
    expect(facebookApi.loadUser).toBeCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApiSpy returns undefined', async () => {
    facebookApi.loadUser.mockResolvedValueOnce(undefined)

    const authResult = await sut.execute({ token: 'any_token' })

    expect(authResult).toEqual(new AuthenticationError())
  })
})
