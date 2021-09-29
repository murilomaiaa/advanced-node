import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { AccessToken, FacebookAccount } from '@/domain/models'
import { LoadFacebookUserApi, LoadUserAccountRepository, SaveFacebookAccountRepository, TokenGenerator } from '../protocols'

export class FacebookAuthenticationService implements FacebookAuthentication {
  constructor (
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository & SaveFacebookAccountRepository,
    private readonly crypto: TokenGenerator
  ) {}

  async execute (params: FacebookAuthentication.Params): Promise<FacebookAuthentication.Result> {
    const fbData = await this.facebookApi.loadUser(params)

    if (fbData != null) {
      const userAccount = await this.userAccountRepository.load({
        email: fbData.email
      })

      const fbAccount = new FacebookAccount(fbData, userAccount)

      const { id } = await this.userAccountRepository.saveWithFacebook(fbAccount)

      const token = await this.crypto.generateToken({ key: id, expirationInMs: AccessToken.expirationInMs })

      return new AccessToken(token)
    }

    return new AuthenticationError()
  }
}
