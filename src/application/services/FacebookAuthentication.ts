import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { CreateFacebookAccountRepository, LoadFacebookUserApi, LoadUserAccountRepository } from '../protocols'

export class FacebookAuthenticationService {
  constructor (
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository &CreateFacebookAccountRepository
  ) {}

  async execute (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const fbData = await this.facebookApi.loadUser(params)

    if (fbData != null) {
      await this.userAccountRepository.load({
        email: fbData.email
      })
      await this.userAccountRepository.createFromFacebook(fbData)
    }

    return new AuthenticationError()
  }
}
