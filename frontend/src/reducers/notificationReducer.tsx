import { createSlice } from '@reduxjs/toolkit'
import { sleep } from '../utils'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: null as { message: string | null; isError: boolean } | null,
  reducers: {
    newNotification(
      _state,
      action: { payload: { message: string | null; isError: boolean } | null }
    ) {
      return action.payload
    },
  },
})

export const notify = (
  message: string | null,
  isError: boolean,
  seconds: number
) => {
  return async (
    dispatch: (arg0: {
      payload: { message: string | null; isError: boolean } | null
      type: 'notification/newNotification'
    }) => void
  ) => {
    void dispatch(newNotification({ message, isError }))
    await sleep(seconds * 1000)
    void dispatch(newNotification(null))
  }
}

export const { newNotification } = notificationSlice.actions
export default notificationSlice.reducer
