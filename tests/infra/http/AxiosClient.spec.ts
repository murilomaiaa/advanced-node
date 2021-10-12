import axios from 'axios'

import { HttpGetClient } from '@/infra/http/client'

jest.mock('axios')

export class AxiosClient {
  async get({ url, params }: HttpGetClient.Params): Promise<void> {
    await axios.get(url, { params })
  }
}
describe('AxiosClient', () => {
  let sut: AxiosClient
  let fakeAxios: jest.Mocked<typeof axios>
  let url: string
  let params: object

  beforeAll(() => {
    fakeAxios = axios as jest.Mocked<typeof axios>

    url = 'any_url'
    params = { any: 'any' }
  })

  beforeEach(() => {
    sut = new AxiosClient()
  })

  describe('get', () => {
    it('should call get with correct args', async () => {
      await sut.get({ url, params })

      expect(fakeAxios.get).toHaveBeenCalledTimes(1)
      expect(fakeAxios.get).toHaveBeenCalledWith(url, { params })
    })
  })
})
