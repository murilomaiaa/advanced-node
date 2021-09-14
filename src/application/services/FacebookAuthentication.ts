import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { CreateFacebookAccountRepository, LoadFacebookUserApi, LoadUserAccountRepository, UpdateFacebookAccountRepository } from '../protocols'

export class FacebookAuthenticationService {
  constructor (
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository & CreateFacebookAccountRepository & UpdateFacebookAccountRepository
  ) {}

  async execute (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const fbData = await this.facebookApi.loadUser(params)

    if (fbData != null) {
      const userAccount = await this.userAccountRepository.load({
        email: fbData.email
      })

      if (userAccount !== undefined) {
        await this.userAccountRepository.updateWithFacebook({
          id: userAccount.id,
          name: userAccount.name ?? fbData.name,
          facebookId: fbData.facebookId
        })
      } else {
        await this.userAccountRepository.createFromFacebook(fbData)
      }
    }

    return new AuthenticationError()
  }
}
