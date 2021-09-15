import { mock, MockProxy } from 'jest-mock-extended'

import { LoadFacebookUserApi, SaveFacebookAccountRepository, LoadUserAccountRepository } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let userAccountRepo: MockProxy<LoadUserAccountRepository & SaveFacebookAccountRepository>
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
    userAccountRepo = mock()
    userAccountRepo.load.mockResolvedValue(undefined)

    sut = new FacebookAuthenticationService(facebookApi, userAccountRepo)
  })

  it('should call LoadFacebookUserApi with correct args', async () => {
    await sut.execute({ token })

    expect(facebookApi.loadUser).toBeCalledWith({ token })
    expect(facebookApi.loadUser).toBeCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApi returns undefined', async () => {
    facebookApi.loadUser.mockResolvedValueOnce(undefined)

    const authResult = await sut.execute({ token })

    expect(authResult).toEqual(new AuthenticationError())
  })

  it('should call LoadUserAccountRepository when LoadFacebookUserApi returns data', async () => {
    await sut.execute({ token })

    expect(userAccountRepo.load).toBeCalledTimes(1)
    expect(userAccountRepo.load).toBeCalledWith({ email })
  })

  it('should call SaveFacebookAccountRepository when LoadUserAccountRepository returns undefined', async () => {
    await sut.execute({ token })

    expect(userAccountRepo.saveWithFacebook).toBeCalledWith({
      name: 'any_fb_name',
      email,
      facebookId: 'any_fb_id'
    })
    expect(userAccountRepo.saveWithFacebook).toBeCalledTimes(1)
  })

  it('should update name', async () => {
    userAccountRepo.load.mockResolvedValueOnce({
      id: 'any_id'
    })

    await sut.execute({ token })

    expect(userAccountRepo.saveWithFacebook).toBeCalledWith({
      name: 'any_fb_name',
      id: 'any_id',
      email: 'any_fb_email',
      facebookId: 'any_fb_id'
    })
    expect(userAccountRepo.saveWithFacebook).toBeCalledTimes(1)
  })

  it('should not update name', async () => {
    userAccountRepo.load.mockResolvedValueOnce({
      id: 'any_id',
      name: 'any_name'
    })

    await sut.execute({ token })

    expect(userAccountRepo.saveWithFacebook).toBeCalledWith({
      id: 'any_id',
      name: 'any_name',
      facebookId: 'any_fb_id',
      email: 'any_fb_email'
    })
    expect(userAccountRepo.saveWithFacebook).toBeCalledTimes(1)
  })
})
