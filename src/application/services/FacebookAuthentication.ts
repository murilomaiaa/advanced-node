import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { FacebookAccount } from '@/domain/models'
import { LoadFacebookUserApi, LoadUserAccountRepository, SaveFacebookAccountRepository, TokenGenerator } from '../protocols'

export class FacebookAuthenticationService {
  constructor (
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository & SaveFacebookAccountRepository,
    private readonly crypto: TokenGenerator
  ) {}

  async execute (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const fbData = await this.facebookApi.loadUser(params)

    if (fbData != null) {
      const userAccount = await this.userAccountRepository.load({
        email: fbData.email
      })

      const fbAccount = new FacebookAccount(fbData, userAccount)

      const { id } = await this.userAccountRepository.saveWithFacebook(fbAccount)

      await this.crypto.generateToken({ key: id })
    }

    return new AuthenticationError()
  }
}
