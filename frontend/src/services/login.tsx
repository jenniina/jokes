import { AxiosRequestConfig } from 'axios'
import { credentials } from '../types'
import api from './api'

const baseUrl = `/login`

let token: string | null = null
let config: AxiosRequestConfig<unknown> | undefined

const setToken = (newToken: string | null) => {
  token = `Bearer ${newToken}`
  config = {
    headers: { Authorization: token },
  }
}

const login = async (credentials: credentials) => {
  const response = await api.post<{ token: string }>(
    baseUrl,
    credentials,
    config
  )
  const token = response.data.token
  localStorage.setItem('JokeApptoken', token)
  return response.data
}

export default { login, setToken }
