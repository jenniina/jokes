//https://icanhazdadjoke.com/
// {
//     "id": "R7UfaahVfFd",
//     "joke": "My dog used to chase people on a bike a lot. It got so bad I had to take his bike away.",
//     "status": 200
//   }

import axios from 'axios'
import { IDadJoke } from '../types'

const DADJOKE_URI = 'https://icanhazdadjoke.com/'

const getRandomDadJoke = async () => {
  const response = await axios.get<IDadJoke>(DADJOKE_URI, {
    headers: { Accept: 'application/json' },
  })
  if (!response.data) {
    return
  }
  return response.data
}

// Search for dad jokes
// GET https://icanhazdadjoke.com/search - search for dad jokes.

// This endpoint accepts the following optional query string parameters:

// page - which page of results to fetch (default: 1)
// limit - number of results to return per page (default: 20) (max: 30)
// term - search term to use (default: list all jokes)
// Receive search results back as JSON:

// $ curl -H "Accept: application/json" https://icanhazdadjoke.com/search
// {
//   "current_page": 1,
//   "limit": 20,
//   "next_page": 2,
//   "previous_page": 1,
//   "results": [
//     {
//       "id": "M7wPC5wPKBd",
//       "joke": "Did you hear the one about the guy with the broken hearing aid? Neither did he."
//     },
//     {
//       "id": "MRZ0LJtHQCd",
//       "joke": "What do you call a fly without wings? A walk."
//     },
//     ...
//     {
//       "id": "usrcaMuszd",
//       "joke": "What's the worst thing about ancient history class? The teachers tend to Babylon."
//     }
//   ],
//   "search_term": "",
//   "status": 200,
//   "total_jokes": 307,
//   "total_pages": 15
// }

const searchDadJokes = async (searchTerm: string) => {
  const response = await axios.get<{ results: IDadJoke[] }>(
    `${DADJOKE_URI}/search?term=${searchTerm}&limit=100`,
    {
      headers: { Accept: 'application/json' },
    }
  )
  if (!response.data || response.data.results.length === 0) {
    return
  }
  const randomIndex = Math.floor(Math.random() * response.data.results.length)
  return response.data.results[randomIndex]
}
//https://icanhazdadjoke.com/j/5YQwUqCJyEd

const getDadJokeById = async (id: string) => {
  const response = await axios.get<IDadJoke>(`${DADJOKE_URI}/j/${id}`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.data) {
    return
  }
  return response.data
}

export default { getRandomDadJoke, searchDadJokes, getDadJokeById }
