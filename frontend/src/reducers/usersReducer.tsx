import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import userService from '../services/users'
import { IUser, ELanguages, IBlacklistedJoke } from '../types'
import { translations as t } from '../i18n/translations'
import { IJoke } from '../components/Jokes/types'
import { sleep } from '../utils'
import { IContent } from '../types'

const usersSlice = createSlice({
  name: 'users',
  initialState: [] as IUser[],
  reducers: {
    register(state, action: PayloadAction<IUser>) {
      //state.push(action.payload);
      return [...state, action.payload]
      //   const updatedUser = action.payload
      //   return state.map((user) => (user._id !== updatedUser._id ? user : updatedUser))
    },
    setUsers(_state, action: PayloadAction<IUser[]>) {
      return action.payload
    },
    remove(state, action: PayloadAction<IUser['_id']>) {
      const id = action.payload
      return state.filter((user) => user?._id !== id)
    },
    update(state, action: PayloadAction<IUser>) {
      const id = action.payload._id
      const updatedUser = action.payload
      return state.map((user) => (user?._id !== id ? user : updatedUser))
    },
    searchUsername(state, action: PayloadAction<{ username: string }>) {
      const username = action.payload.username
      return state.filter((user) => user?.username === username)
    },
    searchId(state, action: PayloadAction<IUser>) {
      const id = action.payload._id
      return state.filter((user) => user?._id === id)
    },
    updateToken(state, action: PayloadAction<IContent>) {
      const id = action.payload.user._id
      const updatedUser = action.payload.user
      return state.map((user) => (user?._id !== id ? user : updatedUser))
    },
    forgotPassword(state, action: PayloadAction<IContent>) {
      return action.payload.user ? [action.payload.user] : state
      // const id = action.payload._id
      // const updatedUser = action.payload
      // return state.map((user) => (user?._id !== id ? user : updatedUser))
    },
  },
})

export const findUserById = (id: string) => {
  return async (
    dispatch: (arg0: { payload: IUser; type: 'users/searchId' }) => void
  ) => {
    const user = await userService.searchId(id)
    void dispatch({ type: 'users/searchId', payload: user })

    await sleep(10)
    return user
  }
}

export const initializeUsers = () => {
  return async (
    dispatch: (arg0: { payload: IUser[]; type: 'users/setUsers' }) => void
  ) => {
    const users = (await userService.getAll()) as unknown as IUser[]
    void dispatch({ type: 'users/setUsers', payload: users })
  }
}

export const createUser = (newUser: IUser) => {
  return async (
    dispatch: (arg0: { payload: IUser; type: 'users/register' }) => IContent
  ) => {
    const response = await userService.createNewUser(newUser)
    const data = response.data as IContent
    void dispatch(register(data.user))
    return data
  }
}

export const removeUser = (id: IUser['_id'], deleteJokes: boolean) => {
  return async (
    dispatch: (arg0: { payload: IUser['_id']; type: 'users/remove' }) => void
  ) => {
    await userService.deleteUser(id, deleteJokes)
    void dispatch(remove(id))
  }
}

export const updateUser = (
  user: Pick<IUser, '_id' | 'language' | 'name' | 'passwordOld' | 'verified'>
) => {
  return async (
    dispatch: (arg0: { payload: IUser; type: 'users/update' }) => IUser
  ) => {
    const content = (await userService.updateUser(user)) as IContent
    void dispatch(update(content.user))
    return content
  }
}
export const addToBlacklistedJokes = (
  userId: IUser['_id'],
  jokeId: IJoke['jokeId'],
  language: ELanguages,
  value: string | undefined
) => {
  return async (
    dispatch: (arg0: { payload: IUser; type: 'users/update' }) => IUser
  ) => {
    const content = (await userService.addToBlacklistedJokes(
      userId,
      jokeId,
      language,
      value
    )) as IContent
    void dispatch(update(content.user))
    return content
  }
}

export const removeJokeFromBlacklisted = (
  userId: IUser['_id'] | undefined,
  joke_id: IBlacklistedJoke['_id'] | undefined,
  language: ELanguages
) => {
  return async (
    dispatch: (arg0: { payload: IUser; type: 'users/update' }) => IUser
  ) => {
    const content = (await userService.removeJokeFromBlacklisted(
      userId,
      joke_id,
      language
    )) as IContent
    void dispatch(update(content.user))
    return content
  }
}

export const updateUsername = (
  user: Pick<IUser, '_id' | 'language' | 'username' | 'passwordOld'>
) => {
  return async () => {
    const content = (await userService.updateUsername(user)) as IContent
    return content
  }
}

export const updatePassword = (
  user: Pick<IUser, '_id' | 'language' | 'password' | 'passwordOld'>
) => {
  return async (
    dispatch: (arg0: { payload: IUser; type: 'users/update' }) => IUser
  ) => {
    const content = (await userService.updatePassword(user)) as IContent
    void dispatch(update(content.user))
    return content
  }
}

export const updateUserToken = (user: Pick<IUser, 'username' | 'language'>) => {
  return async (
    dispatch: (arg0: { payload: IContent; type: 'users/updateToken' }) => void
  ) => {
    const updated = (await userService.updateToken(user)) as IContent
    void dispatch(updateToken(updated))
    //dispatch({ type: 'users/updateToken', payload: updated })
  }
}

export const forgot = (
  username: string | undefined,
  language: string | ELanguages
) => {
  return async (
    dispatch: (arg0: {
      payload: IContent
      type: 'users/forgotPassword'
    }) => void
  ) => {
    if (username) {
      const updated = (await userService.forgot(username, language)) as IContent
      void dispatch(forgotPassword(updated))
      //dispatch({ type: 'users/updateToken', payload: updated })
      return updated
    } else {
      return {
        success: false,
        message: t.PleaseGiveValidEmail[(language as ELanguages) ?? 'en'],
      }
    }
  }
}

export const {
  register,
  setUsers,
  remove,
  update,
  searchUsername,
  searchId,
  updateToken,
  forgotPassword,
} = usersSlice.actions
export default usersSlice.reducer
