import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { useLanguageContext } from '../contexts/LanguageContext'
import { useConfirm } from '../contexts/ConfirmContext'
import { useTheme } from '../hooks/useTheme'
import { initializeUser, logout } from '../reducers/authReducer'
import { notify } from '../reducers/notificationReducer'
import { removeUser } from '../reducers/usersReducer'
import { ELanguages, ELanguagesLong, ReducerProps } from '../types'
import type { SelectOption } from '../components/Select/Select'
import SEO from '../components/SEO/SEO'
import Icon from '../components/Icon/Icon'
import PasswordEdit from '../components/Edit/components/PasswordEdit'
import UsernameEdit from '../components/Edit/components/UsernameEdit'
import LanguageEdit from '../components/Edit/components/LanguageEdit'
import NicknameEdit from '../components/Edit/components/NicknameEdit'
import styles from '../components/Edit/css/useredit.module.css'

interface Props {
  type: string
}

const Breadcrumbs = () => {
  const { t } = useLanguageContext()
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">{t('Home')}</a> / <span aria-current="page">{t('Edit')}</span>
    </nav>
  )
}

export default function UserEditPage({ type }: Props) {
  const { t } = useLanguageContext()
  const confirm = useConfirm()
  const lightTheme = useTheme()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)

  const user = useSelector((state: ReducerProps) => {
    return state.auth?.user
  })

  useEffect(() => {
    void dispatch(initializeUser()).catch(console.error)
  }, [dispatch])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [user, navigate])

  const languageOptions = (enumObj: typeof ELanguagesLong): SelectOption[] => {
    return Object.values(ELanguages).map((lang) => ({
      value: lang,
      label: enumObj[lang],
    }))
  }

  const handleUserRemove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)

    if (!user?._id) {
      setSending(false)
      return
    }

    if (
      await confirm({
        message: `${t('AreYouSureYouWantToDelete')} ${user.username}?`,
      })
    ) {
      if (
        await confirm({
          message: t('YouWillLoseAllTheDataAssociatedWithIt'),
        })
      ) {
        await dispatch(removeUser(user._id, false)).then(async () => {
          await dispatch(logout())
          navigate('/')
          void dispatch(notify(t('AccountDeleted'), false, 8))
          setSending(false)
        })
        return
      }
    }

    setSending(false)
  }

  return (
    <>
      <SEO
        title={`${t('Edit')} | jokes.jenniina.fi`}
        description={t('EditUserSettings')}
        canonicalUrl="https://jokes.jenniina.fi/edit"
      />
      <div className={`edit ${type} ${lightTheme ? styles.light : ''}`}>
        <div className="inner-wrap">
          <section className="card">
            <div>
              <Breadcrumbs />
              <div className={styles.editform}>
                <NicknameEdit user={user} />
              </div>
              <div className={styles.editform}>
                <UsernameEdit user={user} />
              </div>
              <div className={styles.editform}>
                <LanguageEdit user={user} options={languageOptions} />
              </div>
              <div className={styles.editform}>
                <PasswordEdit user={user} />
              </div>
              {user ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void handleUserRemove(e)
                  }}
                  className="flex center"
                >
                  <button
                    type="submit"
                    disabled={sending || user.name === 'temp'}
                    className={`submit danger ${styles['delete-account']} ${styles.submit}`}
                  >
                    <Icon lib="ti" name="TiDeleteOutline" />{' '}
                    {t('DeleteAccount')}
                  </button>
                </form>
              ) : (
                ''
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
