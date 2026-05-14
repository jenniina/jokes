import React, { useState } from 'react'
import { IUser } from '../../../types'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { notify } from '../../../reducers/notificationReducer'
import { updatePassword } from '../../../reducers/usersReducer'
import { getErrorMessage } from '../../../utils'
import { useLanguageContext } from '../../../contexts/LanguageContext'
import styles from '../css/edit.module.css'

interface Props {
  user: IUser | undefined
}

const PasswordEdit = ({ user }: Props) => {
  const { t, language } = useLanguageContext()
  const dispatch = useAppDispatch()

  const [passwordOld, setPasswordOld] = useState<IUser['password']>('')
  const [password, setPassword] = useState<IUser['password']>('')
  const [confirmPassword, setConfirmPassword] = useState<IUser['password']>('')
  const [sending, setSending] = useState(false)

  const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)

    if (password !== confirmPassword) {
      void dispatch(notify(t('PasswordsDoNotMatch'), true, 5))
      setSending(false)
      return
    }

    if (password.length < 10) {
      void dispatch(notify(t('PasswordMustBeAtLeastTenCharacters'), true, 5))
      setSending(false)
      return
    }

    if (!user?._id) {
      setSending(false)
      return
    }

    const editedUser = {
      _id: user._id,
      passwordOld,
      password,
      language,
    }

    void dispatch(updatePassword(editedUser))
      .then((res) => {
        if (res) {
          if (res.success === false) {
            void dispatch(notify(res.message ?? t('Error'), true, 5))
          } else {
            void dispatch(notify(res.message ?? t('UserUpdated'), false, 5))
            setPasswordOld('')
            setPassword('')
            setConfirmPassword('')
          }
        }
        setSending(false)
      })
      .catch((err: unknown) => {
        console.error(err)
        const message = getErrorMessage(err, t('UserNotUpdated'))
        void dispatch(notify(message, true, 8))
        setSending(false)
      })
  }

  if (!user) return null

  return (
    <>
      <h2>{t('EditPassword')}</h2>

      <form onSubmit={handleUserSubmit} className={styles['edit-user']}>
        <div className="input-wrap">
          <label>
            <input
              required
              type="password"
              name="old-password"
              id="old-password"
              value={passwordOld}
              onChange={({ target }) => setPasswordOld(target.value)}
            />
            <span>{t('CurrentPassword')}</span>
          </label>
        </div>
        <div className="input-wrap">
          <label>
            <input
              required
              type="password"
              name="password"
              id="password-edit"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
            <span>{t('Password')}</span>
          </label>
        </div>
        <div className="input-wrap">
          <label>
            <input
              required
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={({ target }) => setConfirmPassword(target.value)}
            />
            <span>{t('ConfirmPassword')}</span>
          </label>
        </div>
        {user.name === 'temp' && (
          <small>({t('CannotBeChangedForTestUser')})</small>
        )}
        <button type="submit" disabled={sending || user.name === 'temp'}>
          {t('Edit')}
        </button>
      </form>
    </>
  )
}

export default PasswordEdit
