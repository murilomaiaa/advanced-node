import { LoadFacebookUserApi } from '@/application/protocols'
import { HttpGetClient } from '../http/client'

type GetAccessToken = { access_token: string }

export class FacebookApi {
  private readonly baseUrl = 'https://graph.facebool.com'
  constructor(
    private readonly httpClient: HttpGetClient,
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {}

  async loadUser(params: LoadFacebookUserApi.Params): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_token } = await this.httpClient.get<GetAccessToken>({
      url: `${this.baseUrl}/oauth/access_token`,
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      }
    })

    await this.httpClient.get({
      url: `${this.baseUrl}/debug_token`,
      params: {
        access_token,
        input_token: params.token
      }
    })
  }
}
