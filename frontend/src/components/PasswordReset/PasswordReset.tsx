import { useState, FormEvent } from 'react'
import Icon from '../Icon/Icon'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { notify } from '../../reducers/notificationReducer'
import { forgot } from '../../reducers/usersReducer'
import { useLanguageContext } from '../../contexts/LanguageContext'

interface Props {
  text?: string
}

const PasswordReset = ({ text }: Props) => {
  const { t, language } = useLanguageContext()

  const dispatch = useAppDispatch()

  const [username, setUsername] = useState<string | undefined>('')
  const [sending, setSending] = useState(false)

  const handleForgot = async (event: FormEvent) => {
    event.preventDefault()
    setSending(true)
    void dispatch(notify(`${t('SendingEmail')}`, false, 2))

    if (username) {
      await dispatch(forgot(username, language))
        .then(r => {
          void dispatch(notify(r.message ?? t('EmailSent'), false, 3))
          setSending(false)
        })
        .catch(() => {
          void dispatch(notify(t('EmailSent'), false, 3))
          setSending(false)
          // else {
          //  void dispatch(notify(`${t('Error')}: ${e.message}`, true, 8))
          // }
        })
    } else {
      void dispatch(
        notify(`${t('Error')}: ${t('Email')} ${t('Password')}`, true, 8)
      )
      setSending(false)
    }
  }

  return (
    <>
      <h2>{t('ForgotPassword')}</h2>

      <form onSubmit={e => void handleForgot(e)} className="forgot">
        <div className="input-wrap">
          <label>
            <input
              name="username"
              type="text"
              value={username}
              required
              autoComplete="email"
              onChange={({ target }) => setUsername(target.value.trim())}
            />
            <span>{t('Email')}: </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={sending}
          id={`forgot-${text}`}
          className="forgot-btn restore"
        >
          <span>{t('SendResetLink')}</span>{' '}
          <Icon lib="ri" name="RiMailSendLine" />
        </button>
      </form>
    </>
  )
}

export default PasswordReset
