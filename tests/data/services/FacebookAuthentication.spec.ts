import { FacebookAuthentication } from '@/domain/features'

class FacebookAuthenticationService {
  constructor (private readonly loadFacebookUserApi: LoadFacebookUserApi) {}

  async execute (params: FacebookAuthentication.Params): Promise<void> {
    await this.loadFacebookUserApi.loadUser(params)
  }
}

interface LoadFacebookUserApi {
  loadUser: (params: LoadFacebookUserByTokenApi.Params) => Promise<void>
}

namespace LoadFacebookUserByTokenApi {
  export type Params = { token: string }
}

class LoadFacebookUserApiSpy implements LoadFacebookUserApi {
  public token?: string

  async loadUser ({ token }: LoadFacebookUserByTokenApi.Params): Promise<void> {
    this.token = token
  }
}

describe('FacebookAuthenticationService', () => {
  it('should call LoadFacebookUserApiSpy with correct args', async () => {
    const facebookApi = new LoadFacebookUserApiSpy()
    const sut = new FacebookAuthenticationService(facebookApi)

    await sut.execute({ token: 'any_token' })

    expect(facebookApi.token).toBe('any_token')
  })
})
