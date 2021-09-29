import { mocked } from 'ts-jest/utils'
import { mock, MockProxy } from 'jest-mock-extended'

import { LoadFacebookUserApi, SaveFacebookAccountRepository, LoadUserAccountRepository, TokenGenerator } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'
import { FacebookAccount } from '@/domain/models'

jest.mock('@/domain/models/FacebookAccount')

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let crypto: MockProxy<TokenGenerator>
  let userAccountRepo: MockProxy<LoadUserAccountRepository & SaveFacebookAccountRepository>
  let sut: FacebookAuthenticationService
  const token = 'any_token'
  const email = 'any_fb_email'

  beforeEach(() => {
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

    expect(crypto.generateToken).toBeCalledWith({ key: 'any_account_id' })
    expect(crypto.generateToken).toBeCalledTimes(1)
  })
})
