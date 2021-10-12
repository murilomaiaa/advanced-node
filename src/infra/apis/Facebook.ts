import { LoadFacebookUserApi } from '@/application/protocols'
import { HttpGetClient } from '../http/client'

type GetAccessToken = { access_token: string }

type GetDebugToken = { data: { user_id: string } }

type GetUserInfo = { id: string, name: string, email: string }

export class FacebookApi implements LoadFacebookUserApi {
  private readonly baseUrl = 'https://graph.facebool.com'
  constructor(
    private readonly httpClient: HttpGetClient,
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {}

  async loadUser(params: LoadFacebookUserApi.Params): Promise<LoadFacebookUserApi.Result> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_token } = await this.httpClient.get<GetAccessToken>({
      url: `${this.baseUrl}/oauth/access_token`,
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      }
    })

    const debugToken = await this.httpClient.get<GetDebugToken>({
      url: `${this.baseUrl}/debug_token`,
      params: {
        access_token,
        input_token: params.token
      }
    })

    const userInfo = await this.httpClient.get<GetUserInfo>({
      url: `${this.baseUrl}/${debugToken.data.user_id}`,
      params: {
        fields: ['id', 'name', 'email'].join(','),
        access_token: params.token
      }
    })

    return {
      facebookId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name
    }
  }
}
