import axios from 'axios'

import { HttpGetClient } from '@/infra/http/client'

jest.mock('axios')

export class AxiosClient {
  async get({ url, params }: HttpGetClient.Params): Promise<void> {
    await axios.get(url, { params })
  }
}

const makeFakeArgs = (): HttpGetClient.Params => ({
  url: 'any_url',
  params: {
    any: 'any'
  }
})

describe('AxiosClient', () => {
  describe('get', () => {
    it('should call get with correct args', async () => {
      const fakeAxios = axios as jest.Mocked<typeof axios>
      const sut = new AxiosClient()

      await sut.get(makeFakeArgs())

      expect(fakeAxios.get).toHaveBeenCalledWith('any_url', {
        params: {
          any: 'any'
        }
      })
    })
  })
})
