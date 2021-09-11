import { mock, MockProxy } from 'jest-mock-extended'

import { CreateFacebookAccountRepository, LoadFacebookUserApi, LoadUserAccountRepository } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let userAccountRepo: MockProxy<LoadUserAccountRepository &CreateFacebookAccountRepository>
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

  it('should call LoadUserAccountRepository when LoadFacebookUserApi returns data', async () => {
    await sut.execute({ token })

    expect(userAccountRepo.load).toBeCalledWith({ email })
    expect(userAccountRepo.load).toBeCalledTimes(1)
  })

  it('should call CreateFacebookAccountRepository when LoadUserAccountRepository returns data', async () => {
    userAccountRepo.load.mockResolvedValueOnce(undefined)

    await sut.execute({ token })

    expect(userAccountRepo.createFromFacebook).toBeCalledWith({
      name: 'any_fb_name',
      email,
      facebookId: 'any_fb_id'
    })
    expect(userAccountRepo.createFromFacebook).toBeCalledTimes(1)
  })
})
