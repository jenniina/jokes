import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { IJoke } from '../types'
import jokeService from '../services/jokes'
import { sleep } from '../../../utils'
import { IJokeResponse } from '../types'

const jokeSlice = createSlice({
  name: 'joke',
  initialState: { jokes: [] as IJoke[], joke: null as IJoke | null },
  reducers: {
    create(state, action: PayloadAction<IJokeResponse>) {
      const newJoke: IJoke = action.payload.joke!
      state.jokes?.push(newJoke)
    },
    setJokes(state, action: PayloadAction<IJoke[]>) {
      state.jokes = action.payload
    },
    remove(state, action: PayloadAction<IJoke>) {
      const id = action.payload._id
      state.jokes = state.jokes?.filter((joke) => joke?._id !== id) ?? []
    },
    search(state, action: PayloadAction<IJoke>) {
      state.joke = action.payload
    },
    editJoke(state, action: PayloadAction<IJoke>) {
      const id = action.payload._id
      const updatedJoke = action.payload
      state.jokes?.map((joke) => (joke?._id !== id ? joke : updatedJoke))
    },
    deleteUser(state, action: PayloadAction<IJokeResponse>) {
      const updatedJoke = action.payload.joke

      if (!updatedJoke?._id) {
        return
      }

      if (updatedJoke.user.length === 0) {
        state.jokes = state.jokes.filter((joke) => joke._id !== updatedJoke._id)
        return
      }

      state.jokes = state.jokes.map((joke) =>
        joke._id === updatedJoke._id ? updatedJoke : joke
      )
    },
    save(state, action: PayloadAction<IJoke>) {
      const newJoke = action.payload
      const existingJoke = state.jokes?.find(
        (joke) =>
          joke.jokeId === newJoke.jokeId && joke.language === newJoke.language
      )
      if (existingJoke) {
        state.jokes?.map((joke) =>
          joke.jokeId !== newJoke.jokeId && joke.language === newJoke.language
            ? joke
            : newJoke
        )
      } else {
        // If the joke does not exist in the state, add it
        state.jokes?.push(newJoke)
      }
    },
    setJoke(state, action: PayloadAction<IJoke | null>) {
      state.joke = action.payload
    },
  },
})

export const saveMostRecentJoke = (joke: IJoke) => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/setJoke' }) => void
  ) => {
    await sleep(10)
    void dispatch(setJoke(joke))
  }
}

export const initializeJokes = () => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/setJokes' }) => void
  ) => {
    const jokes = await jokeService.getAll()
    void dispatch(setJokes(jokes))
  }
}

export const getJokesByUserId = (userId: string | undefined) => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/setJokes' }) => void
  ) => {
    const jokes = await jokeService.getJokesByUserId(userId)
    void dispatch(setJokes(jokes))
    return jokes
  }
}

export const createJoke = (joke: IJoke) => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/create' }) => void
  ) => {
    const newJoke = await jokeService.create(joke)
    void dispatch(create(newJoke))
    return newJoke
  }
}

export const removeJoke = (id: string | undefined) => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/remove' }) => void
  ) => {
    const deletedJoke = await jokeService.remove(id)
    void dispatch(remove(deletedJoke))
  }
}

export const findJoke = (
  jokeId: number,
  language: string,
  category: string,
  type: string
) => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/search' }) => IJoke
  ) => {
    const joke = await jokeService.search(jokeId, language, category, type)
    void dispatch({ type: 'joke/search', payload: joke })
    return joke
  }
}

export const updateJoke = (joke: IJoke) => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/editJoke' }) => void
  ) => {
    const updatedJoke = await jokeService.update(joke)
    void dispatch({ type: 'joke/editJoke', payload: updatedJoke })
    return updatedJoke
  }
}

export const deleteUserFromJoke = (id: string, userId: string) => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/deleteUser' }) => void
  ) => {
    const deletedUser = await jokeService.deleteUser(id, userId)
    void dispatch({ type: 'joke/deleteUser', payload: deletedUser })
    return deletedUser
  }
}

export const removeDuplicateJoke = (jokes: IJoke[]) => {
  return async (
    dispatch: (arg0: { payload: unknown; type: 'joke/setJokes' }) => void
  ) => {
    const uniqueJokes = jokes?.filter(
      (joke, index, self) =>
        index === self.findIndex((t) => t.jokeId === joke.jokeId)
    )
    void dispatch(setJokes(uniqueJokes))
    await sleep(10)
    return uniqueJokes
  }
}

export const { create, setJokes, setJoke, remove, editJoke, deleteUser, save } =
  jokeSlice.actions
export default jokeSlice.reducer
