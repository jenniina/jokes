import {
  forwardRef,
  FormEvent,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme, useThemeUpdate } from '../../hooks/useTheme'
import {
  breakpoint,
  breakpointSmall,
  ELanguages,
  ELanguagesLong,
  IUser,
  ReducerProps,
} from '../../types'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { notify } from '../../reducers/notificationReducer'
import { createUser } from '../../reducers/usersReducer'
import FormLogin from '../Login/Login'
import Register from '../Register/Register'
import PasswordReset from '../PasswordReset/PasswordReset'
import Accordion from '../Accordion/Accordion'
import { Select, SelectOption } from '../Select/Select'
import { options, getErrorMessage } from '../../utils'
import { useLanguageContext } from '../../contexts/LanguageContext'
import Icon from '../Icon/Icon'
import styles from './nav.module.css'
import useExitVisibility from '../../hooks/useExitVisibility'
import useWindowSize from '../../hooks/useWindowSize'
import { isTouchDevice } from '../../hooks/useDraggable'
import { useSelector } from 'react-redux'
import {
  initializeUser,
  logout,
  logoutAllDevices,
} from '../../reducers/authReducer'
import JokeIcon from '../Icon/JokeIcon'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import { useIsClient, useWindow } from '../../hooks/useSSR'
import useScrollDirection from '../../hooks/useScrollDirection'
import CopyToClipboard from '../CopyToClipboard/CopyToClipboard'
import api from '../../services/api'

type Form = 'login' | 'register' | 'reset' | null

const Nav = forwardRef<{ getStyle: () => boolean }>((_props, ref) => {
  const dispatch = useAppDispatch()

  const isClient = useIsClient()
  const windowObj = useWindow()

  const scrollDirection = useScrollDirection()

  const user = useSelector((state: ReducerProps) => {
    return state.auth?.user
  })

  const location = useLocation()
  const navigate = useNavigate()
  const lightTheme = useTheme()
  const toggleTheme = useThemeUpdate()
  const { t, language, setLanguage } = useLanguageContext()

  const clickOutsideRef = useRef<HTMLDivElement>(null)
  const handledVerifyJokeId = useRef<string | null>(null)

  const closeToolbar = () => {
    if (toolbar.open) {
      toolbar.hide()
    }
  }

  useOutsideClick({
    ref: clickOutsideRef,
    onOutsideClick: closeToolbar,
  })

  const [openForm, setOpenForm] = useState<Form>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [sending, setSending] = useState(false)
  const [verifyingJokeId, setVerifyingJokeId] = useState<string | null>(null)
  const [authHydrated, setAuthHydrated] = useState(false)

  const { windowWidth } = useWindowSize()
  const touchDevice = isTouchDevice()

  const mainMenu = useExitVisibility(true)
  const toolbar = useExitVisibility(false)

  useImperativeHandle(ref, () => ({
    getStyle: () => false,
  }))

  useEffect(() => {
    let cancelled = false

    const hydrateAuth = async () => {
      if (user) {
        if (!cancelled) setAuthHydrated(true)
        return
      }

      const storedUser = window.localStorage.getItem('loggedJokeAppUser')

      if (!storedUser) {
        if (!cancelled) setAuthHydrated(true)
        return
      }

      try {
        await dispatch(initializeUser())
      } finally {
        if (!cancelled) setAuthHydrated(true)
      }
    }

    void hydrateAuth()

    return () => {
      cancelled = true
    }
  }, [dispatch, user])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('login') === 'true') {
      mainMenu.show()
      toolbar.show()
      setOpenForm('login')
    } else if (params.get('register') === 'true') {
      mainMenu.show()
      toolbar.show()
      setOpenForm('register')
    } else if (params.get('reset') === 'true') {
      mainMenu.show()
      toolbar.show()
      setOpenForm('reset')
    }
  }, [location.search])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const jokeVerification = params.get('jokeVerification')

    if (!jokeVerification) {
      return
    }

    const notificationMessage =
      jokeVerification === 'success'
        ? t('JokeVerificationSucceeded')
        : jokeVerification === 'not-found'
          ? t('JokeVerificationNotFound')
          : t('JokeVerificationFailed')

    void dispatch(
      notify(notificationMessage, jokeVerification !== 'success', 8)
    )

    params.delete('jokeVerification')
    const nextSearch = params.toString()
    void navigate(
      `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash}`,
      { replace: true }
    )
  }, [dispatch, location.hash, location.pathname, location.search, navigate, t])

  const isLoginFormOpen = openForm === 'login'

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const jokeId = params.get('verifyJoke')

    if (!jokeId) {
      handledVerifyJokeId.current = null
      if (verifyingJokeId !== null) {
        setVerifyingJokeId(null)
      }
      return
    }

    if (handledVerifyJokeId.current === jokeId) {
      return
    }

    if (!authHydrated) {
      return
    }

    if (!user) {
      mainMenu.show()
      toolbar.show()
      setOpenForm('login')

      if (verifyingJokeId !== jokeId) {
        setVerifyingJokeId(jokeId)
        void dispatch(notify(t('PleaseLoginToVerifyJoke'), false, 8))
      }

      return
    }

    if (verifyingJokeId === jokeId) {
      return
    }

    setVerifyingJokeId(jokeId)
    handledVerifyJokeId.current = jokeId

    void api
      .get(`/jokes/${jokeId}/verification`)
      .then((response) => {
        void dispatch(
          notify(
            response.data?.message ?? t('JokeVerificationSucceeded'),
            false,
            8
          )
        )
      })
      .catch((error: unknown) => {
        const message = getErrorMessage(error, t('JokeVerificationFailed'))
        void dispatch(notify(message, true, 8))
      })
      .finally(() => {
        params.delete('verifyJoke')
        params.delete('login')
        const nextSearch = params.toString()
        void navigate(
          `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash}`,
          { replace: true }
        )
        setVerifyingJokeId(null)
      })
  }, [
    dispatch,
    location.hash,
    location.pathname,
    location.search,
    mainMenu,
    navigate,
    toolbar,
    authHydrated,
    t,
    user,
    verifyingJokeId,
  ])
  const isRegisterFormOpen = openForm === 'register'
  const isResetFormOpen = openForm === 'reset'

  const bindForm = (form: Exclude<Form, null>) => (next: boolean) => {
    setOpenForm(next ? form : null)
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      void dispatch(notify(t('PasswordsDoNotMatch'), true, 8))
      return
    }

    setSending(true)
    try {
      const result = await dispatch(
        createUser({
          username,
          password,
          name,
          language,
        } as IUser)
      )

      void dispatch(
        notify(result.message ?? t('RegistrationSuccesful'), false, 8)
      )

      setUsername('')
      setPassword('')
      setConfirmPassword('')
      setName('')
      setOpenForm('login')
    } catch (error) {
      const message = getErrorMessage(error, t('Error'))
      void dispatch(notify(`${t('Error')}: ${message}`, true, 8))
    } finally {
      setSending(false)
    }
  }

  const handleLogout = useCallback(() => {
    void dispatch(logout())
  }, [dispatch])

  const toggleToolbar = useCallback(() => {
    if (!toolbar.open) {
      toolbar.show()
    } else {
      toolbar.hide()
    }
  }, [toolbar])

  const scrolledDown = useCallback(() => {
    if (!isClient || !windowObj) return
    if (windowObj.scrollY > 100 && scrollDirection === 'down') {
      mainMenu.hide()
      toolbar.hide()
    } else {
      mainMenu.show()
    }
  }, [mainMenu, isClient, windowObj, scrollDirection])

  useEffect(() => {
    window.addEventListener('scroll', scrolledDown)
    return () => {
      window.removeEventListener('scroll', scrolledDown)
    }
  }, [scrolledDown])

  return (
    <header
      id="main-navigation"
      ref={clickOutsideRef}
      className={`main-header ${styles['main-header']} ${lightTheme ? styles.light : ''} ${styles.menumain} menumain ${
        mainMenu.open ? styles.show : styles.hidden
      }`}
    >
      <div className={styles['header-inner-wrap']}>
        <div
          className={`${styles['logo-container']}`}
          style={
            windowWidth < breakpointSmall ? { gap: '0.4em' } : { gap: '0.3em' }
          }
        >
          <JokeIcon
            strokeWidth={lightTheme ? 0.7 : 0.4}
            fontSize={1.3}
            flip
            hatStyle={{
              fill: lightTheme
                ? 'var(--color-primary-6)'
                : 'var(--color-primary-7)',
            }}
          />
          <span>{t('TheComediansCompanion')}</span>
        </div>
        <button className={styles.settings} onClick={() => toggleToolbar()}>
          <Icon
            lib="io5"
            name="IoSettingsSharp"
            style={
              windowWidth < breakpointSmall
                ? { fontSize: '1.3em' }
                : { fontSize: '1.8em' }
            }
            aria-hidden={true}
          />
          <span
            id="settings"
            className={windowWidth > breakpoint && !touchDevice ? '' : 'scr'}
          >
            {t('Settings')}
          </span>
        </button>
        <nav
          id="settings-toolbar"
          onTransitionEnd={toolbar.onTransitionEnd}
          className={`${styles.toolbar} ${
            toolbar.open ? styles.show : toolbar.hidden ? styles.hidden : ''
          }`}
          aria-labelledby="settings"
        >
          <Select
            language={language}
            id="language-navbar"
            className={`language ${styles.language}`}
            instructions={t('LanguageTitle')}
            hide
            options={options(ELanguagesLong)}
            value={
              language
                ? ({
                    value: language,
                    label: ELanguagesLong[language],
                  } as SelectOption)
                : undefined
            }
            onChange={(o) => {
              setLanguage(o?.value as ELanguages)
            }}
          />
          <div className={styles.toolwrap}>
            <label htmlFor="dlt-btn">
              {lightTheme ? t('DarkMode') : t('LightMode')}
            </label>
            <button
              id="dlt-btn"
              className={
                lightTheme
                  ? `${styles['dlt-btn']}`
                  : `${styles.active} ${styles['dlt-btn']} ${styles['toolbar-btn']}`
              }
              onClick={toggleTheme}
            >
              <div className={`${styles['dlt-inner-wrapper']}`}>
                <div className={`${styles['dlt-btn-inner-left']}`}>
                  <div className={`${styles['dlt-innermost']}`}>
                    <span className="scr">
                      {lightTheme ? t('DarkMode') : t('LightMode')}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className={styles.loginregister}>
            {!user ? (
              <>
                <div
                  className={`${styles.loginregisterwrap} ${
                    openForm === null ? styles.closed : ''
                  }`}
                >
                  <FormLogin
                    setIsFormOpen={bindForm('login')}
                    isOpen={isLoginFormOpen}
                    text="nav"
                  />
                  <Register
                    setIsFormOpen={bindForm('register')}
                    isOpen={isRegisterFormOpen}
                    handleRegister={handleRegister}
                    username={username}
                    setUsername={setUsername}
                    password={password}
                    setPassword={setPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    name={name}
                    setName={setName}
                    text="nav"
                    sending={sending}
                  />
                  {!user && (
                    <div className="password-reset-wrap">
                      <Accordion
                        className="password-reset"
                        wrapperClass="password-reset-wrap"
                        text={`${t('ForgotPassword')}`}
                        isOpen={isResetFormOpen}
                        setIsFormOpen={bindForm('reset')}
                        hideBrackets={true}
                      >
                        <PasswordReset text="login" />
                      </Accordion>
                    </div>
                  )}
                  <div className="mt3 flex column gap-half left">
                    <span>{t('IfYouDontWantToRegister')} </span>
                    <div className="flex align-center column gap-half left">
                      <CopyToClipboard
                        value={`temp${String.fromCharCode(64)}jenniina.fi`}
                        label="temp <at> jenniina <dot> fi"
                        ariaLabel={t('CopyAddressToClipboard')}
                        className="m0"
                        onClick={() => setOpenForm('login')}
                      />
                      <div className="flex column gap-half left mt1">
                        {t('Password')}:{' '}
                        <CopyToClipboard
                          value="TempAtJenniina"
                          label="TempAtJenniina"
                          ariaLabel={t('CopyToClipboard')}
                          className="m0"
                          onClick={() => setOpenForm('login')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span>
                  {t('LoggedInAs')} <i>{user.name ?? user.username}</i>
                </span>
                <button
                  onClick={handleLogout}
                  id="logoutnav"
                  className={`logout danger ${styles.logout}`}
                >
                  {t('Logout')} &times;
                </button>
                <button
                  disabled={user.name === 'temp'}
                  onClick={() =>
                    user && dispatch(logoutAllDevices(user._id ?? ''))
                  }
                  className={`reset ${styles['logout-all']}`}
                >
                  [{t('LogoutAllDevices')}]
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
})

export default Nav
