import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useLanguageContext } from '../../../contexts/LanguageContext'
import { useConfirm } from '../../../contexts/ConfirmContext'
import { notify } from '../../../reducers/notificationReducer'
import { getErrorMessage } from '../../../utils'
import api from '../../../services/api'
import usersService from '../../../services/users'
import { RootState } from '../../../store'
import { ELanguages, TPublicUserNamesMap, IUser } from '../../../types'
import {
  ECategories,
  EJokeType,
  IJoke,
  norrisCategoryTranslations as norrisCat,
} from '../types'
import { initializeJokes } from '../reducers/jokeReducer'
import Icon from '../../Icon/Icon'

interface Props {
  user: IUser | undefined
  getCategoryInLanguage: (
    category: ECategories | null,
    language: ELanguages
  ) => string | undefined
}

const Unverified = ({ user, getCategoryInLanguage }: Props) => {
  const { t, language } = useLanguageContext()
  const confirm = useConfirm()
  const dispatch = useAppDispatch()

  const jokes = useSelector((state: RootState) => state.jokes?.jokes)
  const [visibleJokes, setVisibleJokes] = useState<Record<string, boolean>>({})
  const [workingJokeId, setWorkingJokeId] = useState<string | null>(null)
  const [publicUserNames, setPublicUserNames] = useState<TPublicUserNamesMap>(
    {}
  )

  const unverifiedJokes = useMemo(() => {
    return [...(jokes ?? [])]
      .filter((joke) => joke.private === false && joke.verified === false)
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeB - timeA
      })
  }, [jokes])

  useEffect(() => {
    const authorIds = Array.from(
      new Set(
        unverifiedJokes
          .map((joke) => joke.author)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      )
    )

    if (authorIds.length === 0) {
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const names = await usersService.getPublicUserNamesByIds(authorIds)
        if (!cancelled) {
          setPublicUserNames(names)
        }
      } catch {
        // Best-effort only; author names are optional.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [unverifiedJokes])

  const handleVisibility = (jokeId: IJoke['jokeId']) => {
    setVisibleJokes((prevVisibleJokes) => ({
      ...prevVisibleJokes,
      [jokeId]: !prevVisibleJokes[jokeId],
    }))
  }

  const refreshJokes = async () => {
    await dispatch(initializeJokes())
  }

  const handleVerify = async (jokeId: string | undefined) => {
    if (!jokeId) {
      return
    }

    setWorkingJokeId(jokeId)
    try {
      const response = await api.get<{ message?: string }>(
        `/jokes/${jokeId}/verification`
      )
      await refreshJokes()
      void dispatch(
        notify(
          response.data?.message ?? t('JokeVerificationSucceeded'),
          false,
          8
        )
      )
    } catch (error) {
      const message = getErrorMessage(error, t('JokeVerificationFailed'))
      void dispatch(notify(message, true, 8))
    } finally {
      setWorkingJokeId(null)
    }
  }

  const handleBlock = async (joke: IJoke) => {
    if (!joke._id) {
      return
    }

    const jokeLabel = joke.type === EJokeType.single ? joke.joke : joke.setup
    const confirmed = await confirm({
      message: `${t('Block')} ${t('Joke').toLowerCase()} "${jokeLabel}"?`,
    })

    if (!confirmed) {
      return
    }

    setWorkingJokeId(joke._id)
    try {
      const response = await api.put<{ message?: string }>(
        `/jokes/${joke._id}/block`
      )
      await refreshJokes()
      void dispatch(notify(response.data?.message ?? t('Blocked'), false, 8))
    } catch (error) {
      const message = getErrorMessage(error, t('Error'))
      void dispatch(notify(message, true, 8))
    } finally {
      setWorkingJokeId(null)
    }
  }

  if ((user?.role ?? 0) <= 2) {
    return null
  }

  return (
    <>
      <h2>{t('UnverifiedJokes')}</h2>
      <p className="mb3 flex center textcenter">{t('PendingVerification')}</p>

      <ul className="userjokeslist">
        {unverifiedJokes.length > 0 ? (
          unverifiedJokes.map((joke) => {
            const isWorking = workingJokeId === joke._id
            const authorName =
              !joke.anonymous && typeof joke.author === 'string'
                ? (publicUserNames[joke.author] ?? '')
                : ''

            return (
              <li key={joke._id}>
                <div className="primary-wrap">
                  {joke.type === EJokeType.single ? (
                    <p>{joke.joke}</p>
                  ) : (
                    <div>
                      <p>{joke.setup}</p>
                      <p>
                        {joke.delivery ? (
                          <button
                            type="button"
                            onClick={() => handleVisibility(joke.jokeId)}
                            className={`delivery ${
                              visibleJokes[joke.jokeId] ? 'reveal' : ''
                            }`}
                          >
                            <span
                              {...(visibleJokes[joke.jokeId]
                                ? { 'aria-hidden': true }
                                : { 'aria-hidden': false })}
                            >
                              <Icon lib="bi" name="BiChevronsRight" />{' '}
                              {t('ClickToReveal')}{' '}
                              <Icon lib="bi" name="BiChevronsLeft" />
                            </span>
                            <p aria-live="assertive">
                              {visibleJokes[joke.jokeId] ? joke.delivery : ''}
                            </p>
                          </button>
                        ) : (
                          ''
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="secondary-wrap">
                  <div>
                    <span>
                      {t('CategoryTitle')}:{' '}
                      {getCategoryInLanguage(joke.category, language)}
                      {joke.subCategories &&
                      joke.subCategories.length > 0 &&
                      joke.subCategories.find((category) => category !== 'any')
                        ? ` (${joke.subCategories
                            .filter((category) => category !== 'any')
                            .map(
                              (category) =>
                                norrisCat[category as keyof typeof norrisCat]?.[
                                  language
                                ]?.toLowerCase() ?? category
                            )
                            .join(', ')})`
                        : ''}
                    </span>
                    <span>
                      {t('LanguageTitle')}: {joke.language}
                    </span>
                    {joke.anonymous ? (
                      <span>{t('Anonymous')}</span>
                    ) : authorName ? (
                      <span>
                        {t('Author')}: {authorName}
                      </span>
                    ) : null}
                    <span>{t('PendingVerification')}</span>
                  </div>

                  <div className="button-wrap">
                    <button
                      type="button"
                      disabled={isWorking}
                      className="restore"
                      onClick={() => void handleVerify(joke._id)}
                    >
                      {t('Verify')}
                    </button>
                    <button
                      type="button"
                      disabled={isWorking}
                      className="delete danger"
                      onClick={() => void handleBlock(joke)}
                    >
                      {t('Block')}
                    </button>
                  </div>
                </div>
              </li>
            )
          })
        ) : (
          <li className="margin0auto max-content">{t('NoUnverifiedJokes')}</li>
        )}
      </ul>
    </>
  )
}

export default Unverified
