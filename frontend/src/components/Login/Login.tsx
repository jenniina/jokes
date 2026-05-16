import { useEffect, useRef, useState, FormEvent } from 'react'
import Accordion from '../Accordion/Accordion'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { notify } from '../../reducers/notificationReducer'
import {
  initializeUser,
  login,
  logout,
  logoutAllDevices,
} from '../../reducers/authReducer'
import { useSelector } from 'react-redux'
import { ReducerProps } from '../../types'
import { Link } from 'react-router-dom'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { getErrorMessage } from '../../utils'

interface LoginProps {
  setIsFormOpen?: (isFormOpen: boolean) => void
  isOpen?: boolean
  text?: string
}

const FormLogin = ({ setIsFormOpen, isOpen, text }: LoginProps) => {
  const { t, language } = useLanguageContext()

  const dispatch = useAppDispatch()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const formLoginRef = useRef(null)

  const user = useSelector((state: ReducerProps) => {
    return state.auth?.user
  })

  useEffect(() => {
    void dispatch(initializeUser())
  }, [dispatch])

  const handleLogout = () => {
    void dispatch(logout())
      .then(() => {
        void dispatch(notify(`${t('LoggedOut')}`, false, 4))
      })
      .catch((err: unknown) => {
        const message = getErrorMessage(err, t('Error'))
        console.error(err)
        void dispatch(notify(`${t('Error')}: ${message}`, true, 8))
      })
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    void dispatch(notify(`${t('LoggingIn')}`, false, 3))
    setLoggingIn(true)
    await dispatch(login(username, password, language))
      .then(() => {
        setLoggingIn(false)
        setUsername('')
        setPassword('')
        setIsFormOpen?.(false)
      })
      .catch((err: unknown) => {
        setLoggingIn(false)
        console.error(err)
        const message = getErrorMessage(err, t('Error'))
        void dispatch(notify(message, true, 8))
      })
  }

  return (
    <>
      {user ? (
        <div className="logout-wrap">
          <span>
            {t('LoggedInAs')} {user?.name ?? user.username}{' '}
          </span>
          <Link to="/edit">{t('Edit')}</Link>
          <button
            onClick={handleLogout}
            id={`logout-${text}`}
            className={`logout danger ${text}`}
          >
            {t('Logout')} &times;
          </button>
          <button
            disabled={user.name === 'temp'}
            onClick={() => {
              if (!user) return
              dispatch(logoutAllDevices(user._id ?? ''))
                .then(() => {
                  void dispatch(notify(t('AllSessionsRevoked'), false, 4))
                })
                .catch((err: unknown) => {
                  console.error(err)
                  const message = getErrorMessage(err, t('Error'))
                  void dispatch(notify(message, true, 8))
                })
            }}
            className="reset logout-all"
          >
            [{t('LogoutAllDevices')}]
          </button>
        </div>
      ) : (
        <>
          <Accordion
            className="login"
            wrapperClass="login-wrap"
            text={t('Login')}
            ref={formLoginRef}
            setIsFormOpen={setIsFormOpen}
            isOpen={isOpen}
            hideBrackets={true}
          >
            <>
              <h2>{t('Login')}</h2>

              <form
                onSubmit={(event) => void handleLogin(event)}
                className="login"
              >
                <div className="input-wrap">
                  <label>
                    <input
                      name="username"
                      type="text"
                      value={username}
                      required
                      autoComplete="email"
                      onChange={({ target }) =>
                        setUsername(target.value.trim())
                      }
                    />
                    <span>{t('Email')}: </span>
                  </label>
                </div>
                <div className="input-wrap">
                  <label>
                    <input
                      name="password"
                      type="password"
                      required
                      value={password}
                      autoComplete="on"
                      onChange={({ target }) =>
                        setPassword(target.value.trim())
                      }
                    />
                    <span>{t('Password')}: </span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loggingIn}
                  id={`login-${text}`}
                  className={`login ${text} restore`}
                >
                  {loggingIn ? t('LoggingIn') : t('Login')}
                </button>
              </form>
            </>
          </Accordion>
        </>
      )}
    </>
  )
}

export default FormLogin
