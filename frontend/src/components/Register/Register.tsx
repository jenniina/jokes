import { FormEvent, useEffect, useRef } from 'react'
import Accordion from '../Accordion/Accordion'
import { useSelector } from 'react-redux'
import { ReducerProps } from '../../types'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { initializeUser } from '../../reducers/authReducer'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { Link } from 'react-router-dom'

interface Props {
  handleRegister: (e: FormEvent<HTMLFormElement>) => void
  username: string
  setUsername: (username: string) => void
  password: string
  setPassword: (password: string) => void
  confirmPassword: string
  name: string
  setName: (name: string) => void
  setConfirmPassword: (confirmPassword: string) => void
  setIsFormOpen?: (isFormOpen: boolean) => void
  text?: string
  isOpen?: boolean
  sending: boolean
}
const Register = ({
  handleRegister,
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  name,
  setName,
  setIsFormOpen,
  isOpen,
  text,
  sending,
}: Props) => {
  const { t } = useLanguageContext()

  const dispatch = useAppDispatch()

  const formRegisterRef = useRef<HTMLDivElement>(null)

  const user = useSelector((state: ReducerProps) => {
    return state.auth?.user
  })

  useEffect(() => {
    void dispatch(initializeUser())
  }, [dispatch])

  return (
    <div className="register-wrap">
      {!user ? (
        <>
          <Accordion
            className={`accordion-register register`}
            wrapperClass="register-wrap"
            text={t('Register')}
            ref={formRegisterRef}
            setIsFormOpen={setIsFormOpen}
            isOpen={isOpen}
            hideBrackets={true}
          >
            <>
              <h2>{t('Register')}</h2>
              <form onSubmit={handleRegister} className={`register ${text}`}>
                <p>{t('PleaseUseGoodTasteWhenChoosingYourNickname')}</p>
                <div className="input-wrap">
                  <label>
                    <input
                      required
                      type="text"
                      name="name"
                      id={`name-${text}`}
                      value={name}
                      autoComplete="name"
                      onChange={({ target }) => setName(target.value)}
                    />
                    <span>{t('Nickname')}</span>
                  </label>
                </div>
                <div className="input-wrap">
                  <label>
                    <input
                      required
                      type="text"
                      name="username"
                      id={`username-${text}`}
                      value={username}
                      autoComplete="email"
                      onChange={({ target }) =>
                        setUsername(target.value.trim())
                      }
                    />
                    <span>{t('Email')}</span>
                  </label>
                </div>
                <div className="input-wrap">
                  <label>
                    <input
                      required
                      type="password"
                      name="password"
                      id={`password-${text}`}
                      value={password}
                      autoComplete="on"
                      onChange={({ target }) =>
                        setPassword(target.value.trim())
                      }
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
                      id={`confirmPassword-${text}`}
                      value={confirmPassword}
                      onChange={({ target }) =>
                        setConfirmPassword(target.value.trim())
                      }
                    />
                    <span>{t('ConfirmPassword')}</span>
                  </label>
                </div>
                <Link
                  to="/info"
                  style={{
                    display: 'block',
                    margin: '1em auto',
                    textAlign: 'center',
                  }}
                >
                  {t('Info')}
                </Link>
                <button type="submit" disabled={sending} className="restore">
                  {t('Register')}
                </button>
              </form>
            </>
          </Accordion>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

export default Register
