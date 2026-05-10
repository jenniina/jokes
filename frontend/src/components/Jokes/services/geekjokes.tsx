// Node.js (es6):
// var request = require('request');

// let options = {
//     url: 'https://geek-jokes.sameerkumar.website/api?format=json',
//     method: 'GET'
// }

// request(options, (err, response, body) => {
//     if(!err && response.statusCode == 200)
//         console.log(body)
// });
// Response:
// {
//    "joke": "You know how they say if you die in your dream then you will die in real life? In actuality, if you dream of death then Chuck Norris will find you and kill you."
// }

import axios from 'axios'

const GEEKJOKE_URI = 'https://geek-jokes.sameerkumar.website/api?format=json'

const getRandomGeekJoke = async () => {
  const response = await axios.get<{ joke: string }>(GEEKJOKE_URI)
  if (!response.data) {
    return
  }
  return response.data.joke
}

export default { getRandomGeekJoke }
