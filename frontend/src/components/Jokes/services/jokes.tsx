import { IJoke, IJokeResponse } from '../types'
import api from '../../../services/api'

const baseUrl = `/jokes`

const getAll = async (): Promise<IJoke[]> => {
  const response = await api.get<IJoke[]>(baseUrl)
  return response.data
}

const getJokesByUserId = async (
  userId: string | undefined
): Promise<IJoke[]> => {
  const request = await api.get<IJoke[]>(`${baseUrl}/user/${userId}`)
  return request.data
}

const create = async (newObject: IJoke): Promise<IJokeResponse> => {
  // const config = {
  //   headers: { Authorization: token },
  // }

  // const response = await api.post(baseUrl, newObject, config)
  const response = await api.post<IJokeResponse>(baseUrl, newObject)
  return response.data
}

const update = async (newObject: IJoke): Promise<IJokeResponse> => {
  const request = api.put<IJokeResponse>(
    `${baseUrl}/${newObject._id}`,
    newObject
  )
  return request.then((response) => response.data)
}

const remove = async (id: string | undefined): Promise<IJoke> => {
  const response = await api.delete<IJoke>(`${baseUrl}/${id}`)
  return response.data
}

const search = async (
  jokeId: number,
  language: string,
  category: string,
  type: string
) => {
  const response = await api.get<IJoke>(
    `${baseUrl}/${jokeId}/${language}/${category}/${type}`
  )
  return response.data
}

const deleteUser = async (
  id: string,
  userId: string
): Promise<IJokeResponse> => {
  const response = await api.delete<IJokeResponse>(
    `${baseUrl}/${id}/delete-user/${userId}`
  )
  return response.data
}

export default {
  getAll,
  getJokesByUserId,
  create,
  update,
  remove,
  search,
  deleteUser,
}
