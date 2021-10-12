import { LoadFacebookUserApi } from '@/application/protocols'
import { HttpGetClient } from '../http/client'

type AppToken = { access_token: string }

type DebugToken = { data: { user_id: string } }

type FbUserInfo = { id: string, name: string, email: string }

export class FacebookApi implements LoadFacebookUserApi {
  private readonly baseUrl = 'https://graph.facebool.com'
  constructor(
    private readonly httpClient: HttpGetClient,
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {}

  async loadUser(params: LoadFacebookUserApi.Params): Promise<LoadFacebookUserApi.Result> {
    const userInfo = await this.getUserInfo(params.token)

    return {
      facebookId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name
    }
  }

  private async getAppToken(): Promise<AppToken> {
    return this.httpClient.get<AppToken>({
      url: `${this.baseUrl}/oauth/access_token`,
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      }
    })
  }

  private async getDebugToken(clientToken: string): Promise<DebugToken> {
    const appToken = await this.getAppToken()

    return this.httpClient.get<DebugToken>({
      url: `${this.baseUrl}/debug_token`,
      params: {
        input_token: clientToken,
        access_token: appToken.access_token
      }
    })
  }

  private async getUserInfo(clientToken: string): Promise<FbUserInfo> {
    const debugToken = await this.getDebugToken(clientToken)

    return this.httpClient.get<FbUserInfo>({
      url: `${this.baseUrl}/${debugToken.data.user_id}`,
      params: {
        access_token: clientToken,
        fields: ['id', 'name', 'email'].join(',')
      }
    })
  }
}
