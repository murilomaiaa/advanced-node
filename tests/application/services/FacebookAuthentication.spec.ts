import { LoadFacebookUserApi } from '@/application/protocols'
import { FacebookAuthenticationService } from '@/application/services'
import { AuthenticationError } from '@/domain/errors'

class LoadFacebookUserApiSpy implements LoadFacebookUserApi {
  public token?: string
  public result = undefined

  async loadUser ({ token }: LoadFacebookUserApi.Params): Promise<LoadFacebookUserApi.Result> {
    this.token = token
    return this.result
  }
}

describe('FacebookAuthenticationService', () => {
  it('should call LoadFacebookUserApiSpy with correct args', async () => {
    const facebookApi = new LoadFacebookUserApiSpy()
    const sut = new FacebookAuthenticationService(facebookApi)

    await sut.execute({ token: 'any_token' })

    expect(facebookApi.token).toBe('any_token')
  })

  it('should return AuthenticationError when LoadFacebookUserApiSpy returns undefined', async () => {
    const facebookApi = new LoadFacebookUserApiSpy()
    facebookApi.result = undefined
    const sut = new FacebookAuthenticationService(facebookApi)

    const authResult = await sut.execute({ token: 'any_token' })

    expect(authResult).toEqual(new AuthenticationError())
  })
})
