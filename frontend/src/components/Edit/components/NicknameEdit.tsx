import React, { useState } from 'react'
import { IUser } from '../../../types'
import { initializeUser, refreshUser } from '../../../reducers/authReducer'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { notify } from '../../../reducers/notificationReducer'
import { findUserById, updateUser } from '../../../reducers/usersReducer'
import { getErrorMessage } from '../../../utils'
import { useLanguageContext } from '../../../contexts/LanguageContext'
import styles from '../css/edit.module.css'

interface Props {
  user: IUser | undefined
}

const NicknameEdit = ({ user }: Props) => {
  const { t, language } = useLanguageContext()
  const dispatch = useAppDispatch()

  const [name, setName] = useState<IUser['name']>(user?.name ?? '')
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
      name,
      passwordOld,
      language,
    }

    await dispatch(updateUser(editedUser))
      .then(async (res) => {
        if (res) {
          if (res.success === false) {
            void dispatch(notify(`${t('Error')}: ${res.message}`, true, 5))
          } else {
            void dispatch(notify(res.message ?? t('UserUpdated'), false, 5))
            void dispatch(refreshUser(res.user))
            await dispatch(findUserById(user._id ?? ''))
            void dispatch(initializeUser())
            setPasswordOld('')
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
      <h2>{t('EditPreferredNickname')}</h2>
      <p className={styles.p}>
        {t('CurrentNickname')}: <strong>{user.name}</strong>
      </p>
      <p className={`${styles.p} ${styles['p-last']}`}>
        {t('PleaseUseGoodTasteWhenChoosingYourNickname')}
      </p>

      <form
        onSubmit={(e) => void handleUserSubmit(e)}
        className={styles['edit-user']}
      >
        <div className="input-wrap">
          <label>
            <input
              required
              type="text"
              name="name"
              id="name-edit"
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
            <span>{t('Nickname')}</span>
          </label>
        </div>
        <div className="input-wrap">
          <label>
            <input
              required
              type="password"
              name="old-password"
              id="old-password-user"
              value={passwordOld}
              onChange={({ target }) => setPasswordOld(target.value)}
            />
            <span>{t('CurrentPassword')}</span>
          </label>
        </div>
        <button type="submit" disabled={sending || user.name === 'temp'}>
          {t('Edit')}
        </button>
      </form>
    </>
  )
}

export default NicknameEdit
