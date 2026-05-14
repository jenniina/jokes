import React, { useState } from 'react'
import { IUser } from '../../../types'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { notify } from '../../../reducers/notificationReducer'
import { updateUsername } from '../../../reducers/usersReducer'
import { getErrorMessage } from '../../../utils'
import { useLanguageContext } from '../../../contexts/LanguageContext'
import { login, logout } from '../../../reducers/authReducer'
import styles from '../css/edit.module.css'

interface Props {
  user: IUser | undefined
}

const UsernameEdit = ({ user }: Props) => {
  const { t, language } = useLanguageContext()
  const dispatch = useAppDispatch()

  const [username, setUsername] = useState<IUser['username']>(
    user?.username ?? ''
  )
  const [passwordOld, setPasswordOld] = useState<IUser['password']>('')
  const [sending, setSending] = useState(false)

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)

    if (!user?._id) {
      setSending(false)
      return
    }

    const editedUser = {
      _id: user._id,
      username,
      passwordOld,
      language,
    }

    if (username.trim() === user.username.trim()) {
      void dispatch(notify(t('UsernameIsTheSame'), true, 5))
      setSending(false)
      return
    }

    await dispatch(updateUsername(editedUser))
      .then((res) => {
        if (res) {
          if (res.success === false) {
            void dispatch(notify(res.message ?? t('Error'), true, 5))
          } else {
            void dispatch(
              notify(
                `${res.message} --- ${t('RememberToLogOutAndLogBackInWithYourNewEmailOnceConfirmed')}`,
                false,
                12
              )
            )
            void dispatch(logout())
              .then(() => {
                void dispatch(notify(t('LoggedOut'), false, 4))
              })
              .then(async () => {
                await dispatch(login(username, passwordOld, language)).then(
                  () => {
                    setPasswordOld('')
                  }
                )
              })
              .catch((err: unknown) => {
                const message = getErrorMessage(err, t('Error'))
                console.error(err)
                void dispatch(notify(`${t('Error')}: ${message}`, true, 8))
              })
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
      <h2>{t('EditEmail')}</h2>
      <p className={styles.p}>
        {t('SendsAnEmailToTheNewAddressForVerification')}
      </p>
      <p className={`${styles.p} ${styles['p-last']}`}>
        {t('CurrentEmail')}: <strong>{user.username}</strong>
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleUserSubmit(e)
        }}
        className={styles['edit-user']}
      >
        <div className="input-wrap">
          <label>
            <input
              required
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={({ target }) => setUsername(target.value.trim())}
            />
            <span>{t('Email')}</span>
          </label>
        </div>

        <div className="input-wrap">
          <label>
            <input
              required
              type="password"
              name="old-password"
              id="old-password-username"
              value={passwordOld}
              onChange={({ target }) => setPasswordOld(target.value)}
            />
            <span>{t('CurrentPassword')}</span>
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

export default UsernameEdit
