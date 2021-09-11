import { mock } from 'jest-mock-extended'

import { LoadFacebookUserApi } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'

describe('FacebookAuthenticationService', () => {
  it('should call LoadFacebookUserApiSpy with correct args', async () => {
    const facebookApi = mock<LoadFacebookUserApi>()
    const sut = new FacebookAuthenticationService(facebookApi)

    await sut.execute({ token: 'any_token' })

    expect(facebookApi.loadUser).toBeCalledWith({ token: 'any_token' })
    expect(facebookApi.loadUser).toBeCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApiSpy returns undefined', async () => {
    const facebookApi = mock<LoadFacebookUserApi>()
    facebookApi.loadUser.mockResolvedValueOnce(undefined)

    const sut = new FacebookAuthenticationService(facebookApi)

    const authResult = await sut.execute({ token: 'any_token' })

    expect(authResult).toEqual(new AuthenticationError())
  })
})
