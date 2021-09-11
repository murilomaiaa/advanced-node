import { mock, MockProxy } from 'jest-mock-extended'

import { CreateFacebookAccountRepository, LoadFacebookUserApi, LoadUserAccountRepository } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let loadUserAccountRepo: MockProxy<LoadUserAccountRepository>
  let createFacebookAccountRepo: MockProxy<CreateFacebookAccountRepository>
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
    createFacebookAccountRepo = mock()

    sut = new FacebookAuthenticationService(facebookApi, loadUserAccountRepo, createFacebookAccountRepo)
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

    expect(loadUserAccountRepo.load).toBeCalledTimes(1)
    expect(loadUserAccountRepo.load).toBeCalledWith({ email })
  })

  it('should call LoadUserAccountRepository when LoadFacebookUserApi returns data', async () => {
    await sut.execute({ token })

    expect(loadUserAccountRepo.load).toBeCalledWith({ email })
    expect(loadUserAccountRepo.load).toBeCalledTimes(1)
  })

  it('should call CreateFacebookAccountRepository when LoadUserAccountRepository returns data', async () => {
    loadUserAccountRepo.load.mockResolvedValueOnce(undefined)

    await sut.execute({ token })

    expect(createFacebookAccountRepo.createFromFacebook).toBeCalledWith({
      name: 'any_fb_name',
      email,
      facebookId: 'any_fb_id'
    })
    expect(createFacebookAccountRepo.createFromFacebook).toBeCalledTimes(1)
  })
})
