import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { LoadFacebookUserApi, LoadUserAccountRepository, SaveFacebookAccountRepository } from '../protocols'

export class FacebookAuthenticationService {
  constructor (
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository & SaveFacebookAccountRepository
  ) {}

  async execute (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const fbData = await this.facebookApi.loadUser(params)

    if (fbData != null) {
      const userAccount = await this.userAccountRepository.load({
        email: fbData.email
      })

      await this.userAccountRepository.saveWithFacebook({
        id: userAccount?.id,
        name: userAccount?.name ?? fbData.name,
        facebookId: fbData.facebookId,
        email: fbData.email
      })
    }

    return new AuthenticationError()
  }
}
