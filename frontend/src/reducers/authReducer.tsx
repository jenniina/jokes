import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import loginService from '../services/login'
import userService from '../services/users'
import { IUser } from '../types'
import { sleep } from '../utils'
import api from '../services/api'

type StoredUser = IUser & { token?: string | null }

const authSlice = createSlice({
  name: 'auth',
  initialState: null as IUser | null,
  reducers: {
    setUser(_state, action: PayloadAction<IUser | null>) {
      return action.payload
    },
    loginUser(_state, action: PayloadAction<IUser | null>) {
      return action.payload
    },
    logoutUser(_state, action: PayloadAction<IUser | null>) {
      return action.payload
    },
  },
})

export const initializeUser = () => {
  return async (
    dispatch: (arg0: { payload: IUser | null; type: string }) => void
  ) => {
    const loggedUserJSON = window?.localStorage.getItem('loggedJokeAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON) as StoredUser

      await api.get('/auth/ping', {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      // set token for api interceptor
      if (user.token) localStorage.setItem('JokeApptoken', user.token)

      await sleep(10)
      void dispatch(setUser(user))
    }
  }
}

export const login = (username: string, password: string, language: string) => {
  return async (
    dispatch: (arg0: { payload: IUser | null; type: string }) => void
  ) => {
    const user = (await loginService.login({
      username,
      password,
      language,
    })) as StoredUser

    if (window)
      window.localStorage.setItem('loggedJokeAppUser', JSON.stringify(user))
    if (user.token) window.localStorage.setItem('JokeApptoken', user.token)

    return dispatch(loginUser(user))
  }
}

export const logout = () => {
  return async (
    dispatch: (arg0: { payload: IUser | null; type: string }) => void
  ) => {
    if (window) {
      window.localStorage.removeItem('loggedJokeAppUser')
      window.localStorage.removeItem('JokeApptoken')
    }
    await sleep(10)
    void dispatch(logoutUser(null))
  }
}

export const refreshUser = (user: IUser) => {
  return async (
    dispatch: (arg0: { payload: IUser | null; type: string }) => void
  ) => {
    const loggedUserJSON = window?.localStorage.getItem('loggedJokeAppUser')
    if (!loggedUserJSON) return

    await api.get('/auth/ping', {
      headers: { Authorization: `Bearer ${JSON.parse(loggedUserJSON).token}` },
    })

    const data = JSON.parse(loggedUserJSON) as StoredUser
    const token = data.token ?? null

    if (token) localStorage.setItem('JokeApptoken', token)

    window?.localStorage.setItem(
      'loggedJokeAppUser',
      JSON.stringify({ ...user, token })
    )
    await sleep(10)
    void dispatch(setUser(user))
  }
}

export const logoutAllDevices = (userId: string) => {
  return async (
    dispatch: (arg0: { payload: IUser | null; type: string }) => void
  ) => {
    // revoke sessions on server (invalidates ALL tokens, including this one)
    await userService.revokeSessions(userId)

    // clear local state immediately
    if (window) {
      window.localStorage.removeItem('loggedJokeAppUser')
      window.localStorage.removeItem('JokeApptoken')
    }

    await sleep(10)
    void dispatch(logoutUser(null))

    // optional redirect to login
    window.location.href = '?login=true'
  }
}

export const { setUser, loginUser, logoutUser } = authSlice.actions
export default authSlice.reducer
