import { AxiosResponse } from 'axios'
import { IUser as user, ELanguages, IBlacklistedJoke } from '../types'
import {
  IContent,
  IResponse,
  IToken,
  IPublicUserName,
  TPublicUserNamesMap,
} from '../types'
import api from './api'

const baseUrl = `/users`

const getAll = async () => {
  const response = await api.get('/users')
  return response.data as IContent
}

const createNewUser = async (newUser: user) => {
  const response = await api.post(baseUrl + '/register', newUser)
  return response
}

const deleteUser = async (id: user['_id'], deleteJokes: boolean) => {
  const response = await api.delete(`${baseUrl}/${id}/${deleteJokes}`)
  return response.data as AxiosResponse<IResponse>
}

const updateUser = async (
  user: Pick<user, '_id' | 'language' | 'name' | 'passwordOld'>
): Promise<IResponse> => {
  const newUserSettings = {
    _id: user._id,
    name: user.name,
    language: user.language,
    passwordOld: user.passwordOld,
  }
  const response = await api.put(`${baseUrl}/${user._id}`, newUserSettings)
  return response.data as IResponse
}
const addToBlacklistedJokes = async (
  id: user['_id'],
  jokeId: string,
  language: string,
  value: string | undefined
): Promise<IResponse> => {
  const valueObject = {
    value,
  }
  const response = await api.put(
    `${baseUrl}/${id}/${jokeId}/${language}`,
    valueObject
  )
  return response.data as IResponse
}

// router.delete('/api/users/:id/:jokeId/:language', removeJokeFromBlacklisted)
const removeJokeFromBlacklisted = async (
  id: user['_id'] | undefined,
  joke_id: IBlacklistedJoke['_id'] | undefined,
  language: ELanguages
): Promise<IResponse> => {
  const response = await api.delete(`${baseUrl}/${id}/${joke_id}/${language}`)
  return response.data as IResponse
}

const updateUsername = async (
  user: Pick<user, '_id' | 'language' | 'username' | 'passwordOld'>
): Promise<IResponse> => {
  const newUserSettings = {
    _id: user._id,
    username: user.username,
    language: user.language,
    passwordOld: user.passwordOld,
  }
  const response = await api.put(`${baseUrl}`, newUserSettings)
  return response.data as IResponse
}
const updatePassword = async (
  user: Pick<user, '_id' | 'language' | 'password' | 'passwordOld'>
): Promise<IResponse> => {
  const newUserSettings = {
    _id: user._id,
    language: user.language,
    password: user.password,
    passwordOld: user.passwordOld,
  }
  const response = await api.put(`${baseUrl}/${user._id}`, newUserSettings)
  return response.data as IResponse
}

const updateToken = async (
  user: Pick<user, 'username' | 'language'>
): Promise<IToken> => {
  const response = await api.put(`${baseUrl}/request-new-token`, user)
  return response.data as IToken
}

const searchUsername = async (username: string): Promise<IResponse> => {
  const response = await api.get(`${baseUrl}/username/${username}`)
  return response.data as IResponse
}

const searchId = async (id: string | undefined) => {
  const response = await api.get(`${baseUrl}/${id}`)
  return response.data as user
}

const forgot = async (
  username: string | undefined,
  language: string | ELanguages
): Promise<IResponse> => {
  const response = await api.post(`${baseUrl}/forgot`, {
    username,
    language,
  })
  return response.data as IResponse
}
const revokeSessions = async (id: string) => {
  const response = await api.post(`${baseUrl}/${id}/revoke-sessions`)
  return response.data
}

const getPublicUserNamesByIds = async (
  ids: string[]
): Promise<TPublicUserNamesMap> => {
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean)
  if (uniqueIds.length === 0) return {}

  const response = await api.post('/users/public/names', { ids: uniqueIds })

  const users = (response.data?.users ?? []) as IPublicUserName[]
  const map: TPublicUserNamesMap = {}

  for (const user of users) {
    if (user?._id) map[user._id] = user?.name ?? ''
  }

  return map
}

export default {
  getAll,
  createNewUser,
  deleteUser,
  updateUser,
  updateUsername,
  updatePassword,
  searchUsername,
  searchId,
  updateToken,
  forgot,
  addToBlacklistedJokes,
  removeJokeFromBlacklisted,
  revokeSessions,
  getPublicUserNamesByIds,
}
