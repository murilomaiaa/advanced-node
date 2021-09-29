import { mocked } from 'ts-jest/utils'
import { mock, MockProxy } from 'jest-mock-extended'

import { LoadFacebookUserApi, SaveFacebookAccountRepository, LoadUserAccountRepository, TokenGenerator } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'
import { AccessToken, FacebookAccount } from '@/domain/models'

jest.mock('@/domain/models/FacebookAccount')

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let crypto: MockProxy<TokenGenerator>
  let userAccountRepo: MockProxy<LoadUserAccountRepository & SaveFacebookAccountRepository>
  let sut: FacebookAuthenticationService
  let token: string
  let email: string

  beforeAll(() => {
    token = 'any_token'
    email = 'any_fb_email'
    facebookApi = mock()
    crypto = mock()
    facebookApi.loadUser.mockResolvedValue({
      name: 'any_fb_name',
      email,
      facebookId: 'any_fb_id'
    })
    userAccountRepo = mock()
    userAccountRepo.load.mockResolvedValue(undefined)
    userAccountRepo.saveWithFacebook.mockResolvedValue({ id: 'any_account_id' })
  })

  beforeEach(() => {
    sut = new FacebookAuthenticationService(facebookApi, userAccountRepo, crypto)
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

  it('should call SaveFacebookAccountRepository with FacebookAccount', async () => {
    const FacebookAccountStub = jest.fn().mockImplementation(() => ({ any: 'any' }))
    mocked(FacebookAccount).mockImplementation(FacebookAccountStub)

    await sut.execute({ token })

    expect(userAccountRepo.saveWithFacebook).toBeCalledWith({ any: 'any' })
    expect(userAccountRepo.saveWithFacebook).toBeCalledTimes(1)
  })

  it('should call TokenGenerator with correct params', async () => {
    await sut.execute({ token })

    expect(crypto.generateToken).toBeCalledWith({ key: 'any_account_id', expirationInMs: AccessToken.expirationInMs })
    expect(crypto.generateToken).toBeCalledTimes(1)
  })

  it('should return an AccessToken on success', async () => {
    crypto.generateToken.mockResolvedValueOnce('any-generated-token')

    const result = await sut.execute({ token })

    expect(result).toEqual(new AccessToken('any-generated-token'))
  })

  it('should rethrow if LoadFacebookUserApi throws', async () => {
    facebookApi.loadUser.mockRejectedValueOnce(new Error('LoadFacebookUserApi'))

    const promise = sut.execute({ token })

    await expect(promise).rejects.toEqual(new Error('LoadFacebookUserApi'))
  })

  it('should rethrow if TokenGenerator throws', async () => {
    facebookApi.loadUser.mockRejectedValueOnce(new Error('TokenGenerator'))

    const promise = sut.execute({ token })

    await expect(promise).rejects.toEqual(new Error('TokenGenerator'))
  })

  it('should rethrow if LoadUserAccountRepository throws', async () => {
    userAccountRepo.load.mockRejectedValueOnce(new Error('LoadUserAccountRepository'))

    const promise = sut.execute({ token })

    await expect(promise).rejects.toEqual(new Error('LoadUserAccountRepository'))
  })

  it('should rethrow if SaveFacebookAccountRepository throws', async () => {
    userAccountRepo.saveWithFacebook.mockRejectedValueOnce(new Error('SaveFacebookAccountRepository'))

    const promise = sut.execute({ token })

    await expect(promise).rejects.toEqual(new Error('SaveFacebookAccountRepository'))
  })
})
