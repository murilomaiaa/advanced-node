import { AxiosClient } from '@/infra/http/AxiosClient'
import axios from 'axios'

jest.mock('axios')

describe('AxiosClient', () => {
  let sut: AxiosClient
  let fakeAxios: jest.Mocked<typeof axios>
  let url: string
  let params: object

  beforeAll(() => {
    fakeAxios = axios as jest.Mocked<typeof axios>
    fakeAxios.get.mockResolvedValue({
      status: 200,
      data: 'any_data'
    })

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

    it('should return data on success', async () => {
      const result = await sut.get<string>({ url, params })

      expect(result).toEqual('any_data')
    })

    it('should rethrow if get throws', async () => {
      fakeAxios.get.mockRejectedValueOnce(new Error('any axios error'))

      const promise = sut.get<string>({ url, params })

      await expect(promise).rejects.toEqual(new Error('any axios error'))
    })
  })
})
