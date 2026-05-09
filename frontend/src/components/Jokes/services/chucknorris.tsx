//https://api.chucknorris.io/jokes/categories
//https://api.chucknorris.io/jokes/random
//https://api.chucknorris.io/jokes/random?category={category}

//     {
//     "categories" : [ "science" ],
//     "icon_url" : "https://assets.chucknorris.host/img/avatar/chuck-norris.png",
//     "id" : "qMx2S76sRpeZQjyni-QVTA",
//     "url" : "",
//     "value" : "Chuck Norris' saliva is used to euthanize Komodo dragons."
//     }
import { INorrisJoke } from '../types'
import axios from 'axios'

const NORRIS_URI = 'https://api.chucknorris.io/jokes'

const getNorrisCategories = async (): Promise<string[] | undefined> => {
  const response = await axios.get<string[]>(`${NORRIS_URI}/categories`)
  if (!response.data) {
    return
  }
  return response.data
}

const getFullyRandomNorrisJoke = async (): Promise<INorrisJoke | undefined> => {
  const response = await axios.get<INorrisJoke>(`${NORRIS_URI}/random`)
  if (!response.data) {
    return
  }
  return response.data
}

const getRandomJokeFromNorrisCategory = async (
  category: string
): Promise<INorrisJoke | undefined> => {
  const response = await axios.get<INorrisJoke>(
    `${NORRIS_URI}/random?category=${category}`
  )
  if (!response.data) {
    return
  }
  return response.data
}

//free text search https://api.chucknorris.io/jokes/search?query={query}
//result: []
//total: 0

const searchNorrisJoke = async (
  query: string
): Promise<INorrisJoke | undefined> => {
  const response = await axios.get<{ result: INorrisJoke[] }>(
    `${NORRIS_URI}/search?query=${query}`
  )
  if (!response.data.result || response.data.result.length === 0) {
    return
  }
  const randomIndex = Math.floor(Math.random() * response.data.result.length)
  return response.data.result[randomIndex]
}

export default {
  getNorrisCategories,
  getFullyRandomNorrisJoke,
  getRandomJokeFromNorrisCategory,
  searchNorrisJoke,
}
