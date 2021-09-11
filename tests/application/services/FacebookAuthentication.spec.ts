import { mock, MockProxy } from 'jest-mock-extended'

import { LoadFacebookUserApi, LoadUserAccountRepository } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let loadUserAccountRepo: MockProxy<LoadUserAccountRepository>
  let sut: FacebookAuthenticationService
  const token = 'any_token'
  const email = 'any_fb_email'

  beforeEach(() => {
    facebookApi = mock()
    facebookApi.loadUser.mockResolvedValue({
      name: 'any_fb_name',
      email,
      facebookId: 'any_fb_id'
    })
    loadUserAccountRepo = mock()

    sut = new FacebookAuthenticationService(facebookApi, loadUserAccountRepo)
  })

  it('should call LoadFacebookUserApiSpy with correct args', async () => {
    await sut.execute({ token })

    expect(facebookApi.loadUser).toBeCalledWith({ token })
    expect(facebookApi.loadUser).toBeCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApiSpy returns undefined', async () => {
    facebookApi.loadUser.mockResolvedValueOnce(undefined)

    const authResult = await sut.execute({ token })

    expect(authResult).toEqual(new AuthenticationError())
  })

  it('should call LoadUserAccountRepository when LoadFacebookUserApiSpy returns data', async () => {
    await sut.execute({ token })

    expect(loadUserAccountRepo.load).toBeCalledWith({ email })
    expect(loadUserAccountRepo.load).toBeCalledTimes(1)
  })
})
