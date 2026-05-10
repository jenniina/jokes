// https://official-joke-api.appspot.com/jokes/random
// https://official-joke-api.appspot.com/types
// [
//     "general",
//     "knock-knock",
//     "programming",
//     "dad"
// ]
// https://official-joke-api.appspot.com/jokes/programming/random
// [
//     {
//         "type": "programming",
//         "setup": "What's the best thing about a Boolean?",
//         "punchline": "Even if you're wrong, you're only off by a bit.",
//         "id": 409
//     }
// ]

import axios from 'axios'
import { EOfficialJokeType, IOfficialJoke } from '../types'

const OFFICIAL_JOKE_URI = 'https://official-joke-api.appspot.com/jokes'

type OfficialJokeResponse = [IOfficialJoke]

const getRandomOfficialJoke = async (type: EOfficialJokeType) => {
  const response = await axios.get<OfficialJokeResponse>(
    `${OFFICIAL_JOKE_URI}/${type}/random`
  )
  if (!response.data || response.data[0] === undefined) {
    return null
  }
  return response.data[0]
}

export default { getRandomOfficialJoke }
