import axios from 'axios'

import { HttpGetClient } from './client'

export class AxiosClient implements HttpGetClient {
  async get<T>({ url, params }: HttpGetClient.Params): Promise<T> {
    const { data } = await axios.get<T>(url, { params })

    return data
  }
}
