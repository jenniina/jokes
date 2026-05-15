import React, { useCallback, useEffect, useState, useMemo } from 'react'
import {
  EJokeType,
  IJoke,
  ESortBy,
  norrisCategoryTranslations as norrisCat,
  ECategories,
  FlagsLanguage,
} from '../types'
import {
  IUser,
  ELanguages,
  LanguageOfLanguage,
  ELanguagesLong,
  ILanguageOfLanguage,
  IBlacklistedJoke,
} from '../../../types'
import ButtonToggle from '../../ButtonToggle/ButtonToggle'
import { Select, SelectOption } from '../../Select/Select'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import Accordion from '../../Accordion/Accordion'
import {
  initializeJokes,
  saveMostRecentJoke,
  updateJoke,
} from '../reducers/jokeReducer'
import { notify } from '../../../reducers/notificationReducer'
import { initializeUser } from '../../../reducers/authReducer'
import norrisService from '../services/chucknorris'
import { getErrorMessage } from '../../../utils'
import dadjokeService from '../services/dadjokes'
import { useLanguageContext } from '../../../contexts/LanguageContext'
import { RootState } from '../../../store'
import { useNavigate } from 'react-router-dom'
import usersService from '../../../services/users'
import { TPublicUserNamesMap } from '../../../types'
import Icon from '../../Icon/Icon'
import CopyToClipboard from '../../CopyToClipboard/CopyToClipboard'
import Unverified from './Unverified'

interface Props {
  user: IUser | undefined
  handleDelete: (
    jokeId: IJoke['_id'],
    joke: string
  ) => (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  handleUpdate: (
    jokeId: IJoke['_id'],
    joke: IJoke
  ) => (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  translateWordLanguage: string
  isCheckedSafemode: boolean
  setIsCheckedSafemode: (isCheckedSafemode: boolean) => void
  handleToggleChangeSafemode: () => void
  optionsSortBy: (enumObj: typeof ESortBy) => SelectOption[]
  options: (enumObj: typeof ELanguagesLong) => SelectOption[]
  norrisCategories: SelectOption[]
  getCategoryInLanguage: (
    category: ECategories | null,
    language: ELanguages
  ) => string | undefined
  editId: IJoke['_id'] | null
  setEditId: (editId: IJoke['_id']) => void
  handleRemoveJokeFromBlacklisted: (
    e: React.FormEvent<HTMLFormElement>,
    joke: IJoke,
    bjoke_id: IBlacklistedJoke['_id']
  ) => Promise<void>
  handleBlacklistUpdate: (
    jokeId: IJoke['jokeId'],
    language: ELanguages,
    value: string | undefined
  ) => Promise<void>
  sending: boolean
}

interface IJokeApiResponse {
  id?: number | string
  joke?: string
  setup?: string
  delivery?: string
  flags?: {
    nsfw?: boolean
    religious?: boolean
    political?: boolean
    racist?: boolean
    sexist?: boolean
    explicit?: boolean
  }
  category?: string
  error?: boolean
  type?: 'single' | 'twopart'
  jokeId?: string | number
  language?: ELanguages
  lang?: ELanguages
  safe?: boolean
}

enum ESortBy_en {
  popularity = 'popularity',
  category = 'category',
  language = 'language',
  name = 'name',
  age = 'age',
}

export enum EOrderByAge {
  newest = 'newest',
  oldest = 'oldest',
}

const UserJokes = ({
  user,
  handleDelete,
  handleUpdate,
  isCheckedSafemode,
  setIsCheckedSafemode,
  handleToggleChangeSafemode,
  translateWordLanguage,
  optionsSortBy,
  options,
  norrisCategories,
  getCategoryInLanguage,
  editId,
  setEditId,
  handleRemoveJokeFromBlacklisted,
  handleBlacklistUpdate,
  sending,
}: Props) => {
  const { t, language } = useLanguageContext()
  const navigate = useNavigate()

  const getLanguageLabel = useCallback(
    (langCode: ELanguages) => {
      const languageKey = ELanguagesLong[
        langCode as keyof typeof ELanguagesLong
      ] as keyof ILanguageOfLanguage[ELanguages]

      return (
        LanguageOfLanguage?.[language]?.[languageKey] ??
        ELanguagesLong?.[langCode as keyof typeof ELanguagesLong] ??
        String(langCode)
      )
    },
    [language]
  )

  const userId = user?._id ?? undefined
  const jokes = useSelector((state: RootState) => state.jokes?.jokes)

  const [publicUserNames, setPublicUserNames] = useState<TPublicUserNamesMap>(
    {}
  )

  useEffect(() => {
    if (!Array.isArray(jokes) || jokes.length === 0) return

    const authorIds = Array.from(
      new Set(
        jokes
          .map((j) => j?.author)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      )
    )

    if (authorIds.length === 0) return

    let cancelled = false
    void (async () => {
      try {
        const names = await usersService.getPublicUserNamesByIds(authorIds)
        if (!cancelled) {
          setPublicUserNames((prev) => ({
            ...prev,
            ...names,
          }))
        }
      } catch {
        // Best-effort only; author names are optional.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [jokes])

  type IJokeVisible = IJoke & {
    visible: boolean
    translatedLanguage: string
    name: string
  }

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [visibleJokes, setVisibleJokes] = useState<
    Record<IJoke['jokeId'], boolean>
  >({})
  const [showLocalJokes, setShowLocalJokes] = useState<boolean>(false)
  const [showBlacklistedJokes, setShowBlacklistedJokes] =
    useState<boolean>(false)
  const [showUnverifiedJokes, setShowUnverifiedJokes] = useState<boolean>(false)
  const [fetchedJokes, setFetchedJokes] = useState<IJoke[]>([])
  const [isRandom, setIsRandom] = useState<boolean>(false)
  const [randomTrigger, setRandomTrigger] = useState<number>(0)
  const [sortBy, setSortBy] = useState<ESortBy_en>(ESortBy_en.popularity)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<
    ECategories | 'ChuckNorris' | ''
  >('')
  const [selectedLanguage, setSelectedLanguage] = useState<ELanguages | ''>('')
  const [selectedNorrisCategoryValue, setSelectedNorrisCategoryValue] =
    useState<SelectOption | undefined>(norrisCategories[0])
  const [newJoke, setNewJoke] = useState<IJoke | undefined>(undefined)
  const [jokeLanguage, setJokeLanguage] = useState<ELanguages>(ELanguages.en)
  const [jokeCategory, setJokeCategory] = useState<ECategories>(
    ECategories.Misc
  )
  const [isCheckedNewest, setIsCheckedNewest] = useState<boolean>(true)
  const [latestNumber, setLatestNumber] = useState<number>(3)
  const [latest, setLatest] = useState<boolean>(false)
  const localStart = React.useRef<HTMLDivElement>(null)

  const [hasLoadedJokes, setHasLoadedJokes] = useState(false)

  const dispatch = useAppDispatch()
  const isAdmin = (user?.role ?? 0) > 2
  const localJokes = !userId || showLocalJokes
  const showBlacklistedView = Boolean(userId) && showBlacklistedJokes
  const showUnverifiedView = Boolean(userId) && isAdmin && showUnverifiedJokes
  const normalizedSelectedCategory = String(selectedCategory)
  const hasNorris =
    normalizedSelectedCategory === ECategories.ChuckNorris ||
    normalizedSelectedCategory === 'ChuckNorris'
  const sortByAge = isCheckedNewest ? EOrderByAge.newest : EOrderByAge.oldest

  const userJokes = useMemo(() => {
    if (!Array.isArray(jokes) || jokes.length === 0) {
      return []
    }

    const updatedJokes = jokes.map((joke) => {
      const jokesLanguage = getLanguageLabel(joke.language)
      const authorName =
        typeof joke.author === 'string'
          ? (publicUserNames[joke.author] ?? '')
          : ''

      return {
        ...joke,
        visible: false,
        translatedLanguage: jokesLanguage ?? joke.language,
        name: joke.anonymous ? '' : authorName,
      }
    })

    return updatedJokes
      .filter((joke) => (isCheckedSafemode ? joke.safe : joke.safe === false))
      .sort((a, b) => b.user?.length - a.user?.length)
  }, [jokes, getLanguageLabel, isCheckedSafemode, publicUserNames])

  const handleToggleChangeNewest = () => {
    setCurrentPage(1)
    setIsCheckedNewest((prev) => !prev)
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        await dispatch(initializeUser())
        await dispatch(initializeJokes())
      } finally {
        if (!cancelled) {
          setHasLoadedJokes(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [dispatch])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1)
    setSearchTerm(event.target.value)
  }

  const handleVisibility = (jokeId: IJoke['jokeId']) => {
    setVisibleJokes((prevVisibleJokes) => ({
      ...prevVisibleJokes,
      [jokeId]: !prevVisibleJokes[jokeId],
    }))
  }

  const handleCategoryChange = (category: string) => {
    let modifiedCategory: ECategories | '' = category as ECategories | ''
    if (category === 'Chuck Norris') {
      modifiedCategory = 'ChuckNorris' as ECategories
    } else if (category === 'Dad Joke') {
      modifiedCategory = 'DadJoke' as ECategories
    }
    setCurrentPage(1)
    setSelectedCategory(modifiedCategory)
  }

  const handleJokeSave = (_id: IJoke['_id']) => {
    if (!userId) {
      void dispatch(notify(`${t('LoginOrRegisterToSave')}`, false, 8))
      navigate('/?login=true')
      return
    }
    const findJoke = jokes?.find((j: IJoke) => j._id === _id)
    if (!findJoke) {
      void dispatch(notify(`${t('NoJokeFound')}`, true, 8))
      return
    }
    if (findJoke) {
      if (findJoke.user?.includes(userId?.toString())) {
        void dispatch(notify(`${t('JokeAlreadySaved')}`, false, 8))
        return
      }
      void dispatch(
        updateJoke({
          ...findJoke,
          user: [...(findJoke.user ?? []), userId],
        })
      )
        .then(() => {
          void dispatch(initializeJokes())
          void dispatch(notify(`${t('SavedJoke')}`, false, 8))
        })
        .catch((err: unknown) => {
          const message = getErrorMessage(err, t('Error'))
          void dispatch(notify(`${t('Error')}: ${message}`, true, 8))
        })
    }
  }

  let norrisOptions = Array.from(
    new Set(
      userJokes
        ?.filter(
          (joke) =>
            (joke.private === false && joke.verified === true) ||
            joke.private === undefined
        )
        ?.flatMap((joke) => joke.subCategories)
    )
  ).map((subCategory) => {
    const translatedLabel = (subCategory as keyof typeof norrisCat)
      ? norrisCat[subCategory as keyof typeof norrisCat][language] ||
        subCategory
      : ''
    const firstLetter =
      translatedLabel?.charAt(0).toUpperCase() ?? subCategory ?? ''
    const restOfLabel = translatedLabel?.slice(1) ?? subCategory ?? ''
    return {
      label: firstLetter + restOfLabel,
      value: subCategory,
    }
  }) as SelectOption[]

  norrisOptions = norrisOptions.filter((option) => option.value !== 'any')
  norrisOptions.unshift({
    label:
      norrisCat.any[language].charAt(0).toUpperCase() +
      norrisCat.any[language].slice(1),
    value: 'any',
  })

  const selectedNorrisCategory = useMemo(() => {
    if (norrisOptions.length === 0) {
      return undefined
    }

    if (!selectedNorrisCategoryValue) {
      return norrisOptions[0]
    }

    return (
      norrisOptions.find(
        (option) => option.value === selectedNorrisCategoryValue.value
      ) ?? norrisOptions[0]
    )
  }, [norrisOptions, selectedNorrisCategoryValue])

  const filteredJokes = useMemo(() => {
    let nextFilteredJokes = [...userJokes]

    if (sortBy === ESortBy_en.age) {
      nextFilteredJokes = [...userJokes].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return sortByAge === EOrderByAge.newest ? timeB - timeA : timeA - timeB
      })
    }

    nextFilteredJokes = nextFilteredJokes.filter((joke) => {
      const normalizedSearchTerm = searchTerm.toLowerCase()
      const jokeText = 'joke' in joke ? joke.joke?.toLowerCase() : undefined
      const setupText = 'setup' in joke ? joke.setup?.toLowerCase() : undefined
      const deliveryText =
        'delivery' in joke ? joke.delivery?.toLowerCase() : undefined
      const selectedNorrisCategoryValue = selectedNorrisCategory?.value
      const searchTermMatches =
        jokeText?.includes(normalizedSearchTerm) ??
        setupText?.includes(normalizedSearchTerm) ??
        deliveryText?.includes(normalizedSearchTerm) ??
        joke.name?.toLowerCase().includes(normalizedSearchTerm) ??
        joke.category?.toLowerCase().includes(normalizedSearchTerm) ??
        joke.subCategories?.includes(normalizedSearchTerm) ??
        joke.translatedLanguage?.toLowerCase().includes(normalizedSearchTerm) ??
        false

      const categoryMatches = selectedCategory
        ? joke.category === selectedCategory
        : true
      const languageMatches =
        selectedLanguage !== '' ? joke.language === selectedLanguage : true
      const norrisCategoryMatches =
        selectedNorrisCategoryValue !== '' &&
        selectedNorrisCategoryValue !== 'any'
          ? joke.subCategories?.includes(String(selectedNorrisCategoryValue))
          : true

      if (
        (localJokes && joke.private === false && joke.verified === true) ||
        (localJokes && joke.private === undefined)
      ) {
        return (
          languageMatches &&
          categoryMatches &&
          norrisCategoryMatches &&
          searchTermMatches
        )
      }

      if (!localJokes && joke.user?.includes(userId)) {
        return (
          languageMatches &&
          categoryMatches &&
          norrisCategoryMatches &&
          searchTermMatches
        )
      }

      return false
    })

    nextFilteredJokes = nextFilteredJokes.filter((joke) => {
      const isBlacklisted = user?.blacklistedJokes?.some(
        (blacklistedJoke: IBlacklistedJoke) =>
          blacklistedJoke.jokeId === joke.jokeId &&
          blacklistedJoke.language === joke.language
      )

      return !isBlacklisted
    })

    if (sortBy === ESortBy_en.popularity) {
      nextFilteredJokes = nextFilteredJokes.sort(
        (a, b) => b.user?.length - a.user?.length
      )
    }

    if (sortBy === ESortBy_en.category) {
      nextFilteredJokes = nextFilteredJokes.sort((a, b) =>
        a.category > b.category ? 1 : -1
      )
    }

    if (sortBy === ESortBy_en.language) {
      nextFilteredJokes = nextFilteredJokes.sort((a, b) =>
        a.translatedLanguage > b.translatedLanguage ? 1 : -1
      )
    }

    if (sortBy === ESortBy_en.name) {
      nextFilteredJokes = nextFilteredJokes.sort((a, b) =>
        a.name > b.name ? 1 : -1
      )
    }

    if (isRandom && nextFilteredJokes.length > 0) {
      const randomJoke =
        nextFilteredJokes[Math.floor(Math.random() * nextFilteredJokes.length)]
      return [randomJoke]
    }

    return latest ? nextFilteredJokes.slice(0, latestNumber) : nextFilteredJokes
  }, [
    isRandom,
    latest,
    latestNumber,
    localJokes,
    randomTrigger,
    searchTerm,
    selectedCategory,
    selectedLanguage,
    selectedNorrisCategory,
    sortBy,
    sortByAge,
    user?.blacklistedJokes,
    userId,
    userJokes,
  ])

  const resetFilters = () => {
    setSelectedCategory('')
    setSelectedLanguage('')
    setSelectedNorrisCategoryValue(norrisOptions[0])
    setSearchTerm('')
    setIsRandom(false)
    setRandomTrigger((prev) => prev + 1)
    setSortBy(ESortBy_en.popularity)
    setCurrentPage(1)
    setIsCheckedSafemode(true)
  }

  //  https://v2.jokeapi.dev/joke/Any?idRange=3&lang={language}&format=json

  const findBlackListedJokeFromAPI = useCallback(
    async (id: string, language: ELanguages, query: string | undefined) => {
      try {
        if (query) {
          let joke = null
          try {
            joke = await norrisService.searchNorrisJoke(query)
          } catch (err: unknown) {
            const message = getErrorMessage(err, t('Error'))
            void dispatch(notify(message, true, 8))
            console.error(err)
            return null
          } finally {
            return {
              jokeId: joke?.id,
              joke: joke?.value,
              category: ECategories.ChuckNorris,
              language: ELanguages.en,
              type: EJokeType.single,
              safe:
                joke?.categories?.includes('explicit') ||
                joke?.categories?.includes('political') ||
                joke?.categories?.includes('religion')
                  ? false
                  : true,
            }
          }
        } else {
          const response = await fetch(
            `https://v2.jokeapi.dev/joke/Any?idRange=${id}&lang=${language}&format=json`
          )
          const data = (await response.json()) as IJokeApiResponse

          if (data.error) {
            const result = await dadjokeService.getDadJokeById(id)
            return {
              jokeId: result?.id,
              joke: result?.joke,
              category: ECategories.DadJoke,
              language: ELanguages.en,
              type: EJokeType.single,
              safe: true,
            }
          } else {
            if (data.type === 'twopart') {
              return {
                jokeId: data.id,
                setup: data.setup,
                delivery: data.delivery,
                category: data.category,
                language: data.lang,
                type: EJokeType.twopart,
                safe:
                  data.flags?.nsfw ||
                  data.flags?.religious ||
                  data.flags?.political ||
                  data.flags?.racist ||
                  data.flags?.sexist ||
                  data.flags?.explicit ||
                  !data.safe
                    ? false
                    : true,
              }
            } else {
              return {
                jokeId: data.id,
                joke: data.joke,
                category: data.category,
                language: data.lang,
                type: EJokeType.single,
                safe:
                  data.flags?.nsfw ||
                  data.flags?.religious ||
                  data.flags?.political ||
                  data.flags?.racist ||
                  data.flags?.sexist ||
                  data.flags?.explicit ||
                  !data.safe
                    ? false
                    : true,
              }
            }
          }
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err, t('Error'))
        void dispatch(notify(message, true, 8))
        console.error(err)
        return null
      }
    },
    [dispatch, t]
  )

  useEffect(() => {
    const fetchJokes = async () => {
      if (Array.isArray(jokes) && jokes.length > 0 && user?.blacklistedJokes) {
        const fetchedJokes = await Promise.all(
          user?.blacklistedJokes?.map(
            async (blacklistedJoke: IBlacklistedJoke) => {
              const query = blacklistedJoke.value
              return await findBlackListedJokeFromAPI(
                blacklistedJoke.jokeId,
                blacklistedJoke.language,
                query ?? undefined
              )
            }
          ) || []
        )
        setFetchedJokes(
          fetchedJokes.filter((joke): joke is IJoke => joke !== null)
        )
      }
    }

    void fetchJokes()
  }, [user?.blacklistedJokes, jokes, findBlackListedJokeFromAPI])

  // filter fetchedJokes joke, setup and delivery according to searchTerm

  const filteredFetchedJokes = fetchedJokes?.filter((joke) => {
    if (joke) {
      const searchTermMatches =
        ('joke' in joke
          ? joke.joke?.toLowerCase().includes(searchTerm.toLowerCase())
          : false) ||
        ('setup' in joke
          ? joke.setup?.toLowerCase().includes(searchTerm.toLowerCase())
          : false) ||
        ('delivery' in joke
          ? joke.delivery?.toLowerCase().includes(searchTerm.toLowerCase())
          : false) ||
        joke.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        joke.subCategories?.includes(searchTerm?.toLowerCase())

      return searchTermMatches
    }
  })

  const safeCurrentPage =
    filteredJokes.length === 0
      ? 1
      : Math.min(
          Math.max(currentPage, 1),
          Math.ceil(filteredJokes.length / itemsPerPage)
        )
  const indexOfLastItem = safeCurrentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredJokes?.slice(indexOfFirstItem, indexOfLastItem)

  const pageNumbers = useMemo(() => {
    const pageNumbers: number[] = []
    for (let i = 1; i <= Math.ceil(filteredJokes?.length / itemsPerPage); i++) {
      pageNumbers?.push(i)
    }
    return pageNumbers
  }, [filteredJokes, itemsPerPage])

  const visiblePageNumbers = useMemo(() => {
    if (pageNumbers.length <= 3) {
      return pageNumbers
    }

    if (safeCurrentPage <= 2) {
      return pageNumbers.slice(0, 3)
    }

    if (safeCurrentPage >= pageNumbers.length - 1) {
      return pageNumbers.slice(-3)
    }

    return pageNumbers.slice(safeCurrentPage - 2, safeCurrentPage + 1)
  }, [pageNumbers, safeCurrentPage])

  const handlePageChange = (pageNumber: number, scroll: boolean) => {
    const nextPage =
      pageNumbers.length === 0
        ? 1
        : Math.min(Math.max(pageNumber, 1), pageNumbers.length)
    setCurrentPage(nextPage)

    if (localStart.current && scroll) {
      requestAnimationFrame(() => {
        if (!localStart.current) return
        const top =
          localStart.current.getBoundingClientRect().top + window.scrollY - 260
        window.scrollTo({ top, behavior: 'smooth' })
      })
    }
  }

  const pagination = (index: number) => (
    <div className="pagination">
      {pageNumbers?.length > 1 && (
        <div>
          <span>
            {safeCurrentPage} / {pageNumbers?.length}
          </span>
        </div>
      )}
      <div>
        <div className="chevrons-wrap back">
          <button
            className={`inner-nav-btn first tooltip-wrap ${
              safeCurrentPage === 1 ? 'disabled' : ''
            } ${pageNumbers?.length <= 3 ? 'hidden' : ''}`}
            disabled={safeCurrentPage === 1}
            onClick={() => handlePageChange(1, true)}
          >
            <Icon lib="bi" name="BiChevronsLeft" />{' '}
            <span className="tooltip narrow2 below right">
              {t('FirstPage')}
            </span>
          </button>
          <button
            className={`inner-nav-btn back tooltip-wrap ${
              safeCurrentPage === 1 ? 'disabled' : ''
            } ${pageNumbers?.length <= 3 ? 'hidden' : ''}`}
            disabled={safeCurrentPage === 1}
            onClick={() => handlePageChange(safeCurrentPage - 1, true)}
          >
            <Icon lib="bi" name="BiChevronLeft" />{' '}
            <span className="tooltip narrow2 below right">{t('Back')}</span>
          </button>
        </div>
        <div className={`numbers${pageNumbers?.length === 1 ? ' hidden' : ''}`}>
          {visiblePageNumbers?.map((number) => (
            <button
              key={number}
              className={`${
                number > 9
                  ? 'over9'
                  : number > 99
                    ? 'over99'
                    : number > 999
                      ? 'over999'
                      : ''
              } ${number === safeCurrentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(number, true)}
            >
              <span>{number}</span>
            </button>
          ))}
        </div>
        <div className="chevrons-wrap forward">
          <button
            className={`inner-nav-btn forward tooltip-wrap ${
              safeCurrentPage === pageNumbers?.length ? 'disabled' : ''
            } ${pageNumbers?.length <= 3 ? 'hidden' : ''}`}
            disabled={safeCurrentPage === pageNumbers?.length}
            onClick={() => handlePageChange(safeCurrentPage + 1, true)}
          >
            <Icon lib="bi" name="BiChevronRight" />{' '}
            <span className="tooltip narrow2 below left">{t('Next')}</span>
          </button>
          <button
            className={`inner-nav-btn last tooltip-wrap ${
              safeCurrentPage === pageNumbers?.length ? 'disabled' : ''
            } ${pageNumbers?.length <= 3 ? 'hidden' : ''}`}
            disabled={safeCurrentPage === pageNumbers?.length}
            onClick={() => handlePageChange(pageNumbers?.length, true)}
          >
            <Icon lib="bi" name="BiChevronsRight" />
            <span className="tooltip narrow2 left below">
              {t('LastPage')}: {pageNumbers?.length}
            </span>
          </button>
        </div>
      </div>
      <div>
        <input
          aria-labelledby="items-per-page"
          className="items-per-page narrow"
          name="items-per-page"
          id={`items-per-page-input-${index}`}
          type="number"
          min="1"
          max="100"
          defaultValue={itemsPerPage}
          onChange={(e) => {
            setCurrentPage(1)
            setItemsPerPage(
              e.target.valueAsNumber > 0 ? e.target.valueAsNumber : 1
            )
          }}
        />{' '}
        <span id="items-per-page">{t('PerPage')}</span>{' '}
      </div>
    </div>
  )
  return (
    <div className="saved" id="saved">
      {userId && (
        <div className="local-saved-wrap">
          <button
            className={`btn${
              localJokes && !showBlacklistedView && !showUnverifiedView
                ? ' active'
                : ''
            }`}
            onClick={() => {
              setCurrentPage(1)
              setShowLocalJokes(true)
              setShowBlacklistedJokes(false)
              setShowUnverifiedJokes(false)
            }}
          >
            {!localJokes ? t('SeeLocalJokes') : t('LocalJokes')}
          </button>
          <button
            className={`btn${
              !localJokes && !showBlacklistedView && !showUnverifiedView
                ? ' active'
                : ''
            }`}
            onClick={() => {
              setCurrentPage(1)
              setShowLocalJokes(false)
              setShowBlacklistedJokes(false)
              setShowUnverifiedJokes(false)
            }}
          >
            {t('YourSavedJokes')}
          </button>
          {isAdmin && (
            <button
              className={`btn${showUnverifiedView ? ' active' : ''}`}
              onClick={() => {
                setCurrentPage(1)
                setShowUnverifiedJokes(true)
                setShowBlacklistedJokes(false)
              }}
            >
              {t('UnverifiedJokes')}
            </button>
          )}
        </div>
      )}
      <div className="saved-inner">
        <div className="filler"></div>
        <div>
          {showUnverifiedView ? (
            <Unverified
              user={user}
              getCategoryInLanguage={getCategoryInLanguage}
            />
          ) : (
            <>
              {!showBlacklistedView && (
                <>
                  <h2>{localJokes ? t('LocalJokes') : t('YourSavedJokes')}</h2>
                  {localJokes && (
                    <p className="mb3 flex center textcenter">
                      {' '}
                      {t('UserSubmittedJokes')}
                    </p>
                  )}

                  <div className="toggle-wrap">
                    <div className="toggle-inner-wrap">
                      <div className="safemode-wrap">
                        <ButtonToggle
                          isChecked={isCheckedSafemode}
                          name="safemode"
                          id="safemode2"
                          className={`${language} ${
                            !isCheckedSafemode ? 'unsafe' : ''
                          } userjokes safemode`}
                          label={`${t('Filter')}: `}
                          hideLabel={false}
                          on={t('SafeTitle')}
                          off={t('UnsafeTitle')}
                          onChange={handleToggleChangeSafemode}
                        />
                        {sortBy === ESortBy_en.age && (
                          <ButtonToggle
                            isChecked={isCheckedNewest}
                            name="age"
                            id="age"
                            className={`${language} age`}
                            label={`${t('Age')}: `}
                            hideLabel={false}
                            on={t('Newest')}
                            off={t('Oldest')}
                            onChange={() => {
                              handleToggleChangeNewest()
                            }}
                            equal={true}
                          />
                        )}
                      </div>
                      <div className="sortby-wrap">
                        <Select
                          language={language}
                          id="sortby"
                          className="sortby"
                          z={6}
                          instructions={`${t('OrderBy')}:`}
                          options={optionsSortBy(ESortBy)}
                          value={
                            {
                              label: ESortBy[sortBy][ELanguages[language]],
                              value: ESortBy[sortBy][ELanguages[language]],
                            } as SelectOption
                          }
                          onChange={(o: SelectOption | undefined) => {
                            setSortBy(o?.value as ESortBy_en)
                          }}
                        />
                      </div>
                    </div>
                    <div className="toggle-inner-wrap">
                      <div>
                        <Select
                          language={language}
                          id="joke-languages"
                          className="language-filter"
                          z={5}
                          instructions={`${t('FilterByLanguage')}:`}
                          options={[
                            { label: t('All'), value: '' },
                            ...Array.from(
                              new Set(userJokes?.map((joke) => joke.language))
                            ).map((langCode) => {
                              return {
                                label: getLanguageLabel(langCode),
                                value: langCode,
                              }
                            }),
                          ]}
                          value={
                            selectedLanguage
                              ? ({
                                  label: getLanguageLabel(selectedLanguage),
                                  value: selectedLanguage,
                                } as SelectOption)
                              : { label: t('All'), value: '' }
                          }
                          onChange={(o: SelectOption | undefined) => {
                            setSelectedLanguage(o?.value as ELanguages)
                          }}
                        />
                      </div>
                      <div>
                        <Select
                          language={language}
                          id="single-category-select"
                          className="single-category-select"
                          z={4}
                          instructions={`${t('FilterByCategory')}:`}
                          options={[
                            { label: t('SelectACategory'), value: '' },
                            ...(Object.values(ECategories).map((category) => {
                              return {
                                label: getCategoryInLanguage(
                                  category,
                                  language
                                ),
                                value: category,
                              }
                            }) as SelectOption[]),
                          ]}
                          value={
                            selectedCategory
                              ? ({
                                  label: getCategoryInLanguage(
                                    selectedCategory as ECategories,
                                    language
                                  ),
                                  value: selectedCategory,
                                } as SelectOption)
                              : { label: t('SelectACategory'), value: '' }
                          }
                          onChange={(o) => {
                            handleCategoryChange(String(o?.value ?? ''))
                          }}
                        />
                      </div>
                    </div>
                    <div className="toggle-inner-wrap">
                      <div>
                        <Select
                          language={language}
                          id="userNorrisCategories"
                          className={`category extras ${hasNorris ? '' : 'hidden'}`}
                          z={3}
                          instructions={`${t('FilterFurther')}:`}
                          selectAnOption={norrisOptions[0].label}
                          value={selectedNorrisCategory}
                          options={norrisOptions}
                          onChange={(o) => {
                            setCurrentPage(1)
                            setSelectedNorrisCategoryValue(o)
                          }}
                        />
                      </div>
                      <div
                        className={
                          hasNorris
                            ? 'search-jokes-wrap'
                            : 'full search-jokes-wrap'
                        }
                      >
                        <div className="search-jokes input-wrap">
                          <label htmlFor="search-jokes">
                            <input
                              type="text"
                              id="search-jokes"
                              value={searchTerm}
                              onChange={handleSearchChange}
                              placeholder={t('Search')}
                            />
                            <span>{t('SearchByKeyword')}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="reset-btn-wrap mb3">
                    <button
                      className="reset-btn delete danger"
                      onClick={() => resetFilters()}
                    >
                      <Icon lib="md" name="MdOutlineSettingsBackupRestore" />{' '}
                      <span>{t('Reset')}</span>
                    </button>
                  </div>
                </>
              )}
              <div className="button-wrap">
                {!showBlacklistedJokes && (
                  <>
                    <button
                      className={`icontext random-btn ${isRandom ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentPage(1)
                        setShowBlacklistedJokes(false)
                        setIsRandom(true)
                        setRandomTrigger((prev) => prev + 1)
                        setLatest(false)
                      }}
                    >
                      {t('Random')} <Icon lib="fa" name="FaRandom" />
                    </button>{' '}
                    <button
                      className={`icontext all-or-latest-btn ${
                        !isRandom && !latest ? 'active' : ''
                      }`}
                      onClick={() => {
                        setIsRandom(false)
                        setShowBlacklistedJokes(false)
                        setLatest(false)
                      }}
                    >
                      {t('AllJokes')} <Icon lib="fa" name="FaList" />
                    </button>
                    <div className="flex center">
                      <button
                        className={`icontext all-or-latest-btn ${
                          latest ? 'active' : ''
                        }`}
                        onClick={() => {
                          setIsRandom(false)
                          setShowBlacklistedJokes(false)
                          setIsCheckedNewest(true)
                          setSortBy(ESortBy_en.age)
                          setLatest(true)
                        }}
                      >
                        {t('Latest')}
                        <span className="scr">{latestNumber}</span>{' '}
                        {latestNumber === 3 && (
                          <Icon lib="md" name="MdOutlineFilter3" />
                        )}
                        {latestNumber === 4 && (
                          <Icon lib="md" name="MdOutlineFilter4" />
                        )}
                        {latestNumber === 5 && (
                          <Icon lib="md" name="MdOutlineFilter5" />
                        )}
                        {latestNumber === 6 && (
                          <Icon lib="md" name="MdOutlineFilter6" />
                        )}
                        {latestNumber === 7 && (
                          <Icon lib="md" name="MdOutlineFilter7" />
                        )}
                        {latestNumber === 8 && (
                          <Icon lib="md" name="MdOutlineFilter8" />
                        )}
                        {latestNumber === 9 && (
                          <Icon lib="md" name="MdOutlineFilter9" />
                        )}
                        {latestNumber > 9 && (
                          <Icon lib="md" name="MdOutlineFilter9Plus" />
                        )}
                      </button>
                      <div>
                        <input
                          type="number"
                          min={3}
                          max={100}
                          id="number-of-latest"
                          defaultValue={latestNumber}
                          className="narrow"
                          onChange={(e) => {
                            setLatestNumber(e.target.valueAsNumber)
                          }}
                        />
                        <label htmlFor="number-of-latest" className="scr">
                          <span>{t('HowMany')}</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
                {user && (
                  <button
                    className={`blocked-btn danger ${
                      showBlacklistedJokes ? 'active' : ''
                    }`}
                    onClick={() => setShowBlacklistedJokes((prev) => !prev)}
                  >
                    {showBlacklistedJokes ? (
                      <>
                        {t('HideBlockedJokes')}{' '}
                        <Icon lib="im" name="ImBlocked" />
                      </>
                    ) : (
                      <>
                        {t('Blocked')} <Icon lib="im" name="ImEyeBlocked" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {!isRandom && !showBlacklistedJokes && pagination(1)}

              {/* Pagination scroll anchor (always present) */}
              <div ref={localStart} />

              {user &&
              showBlacklistedJokes &&
              filteredFetchedJokes?.length > 0 ? (
                <div className="blocked-controls-wrap">
                  <div className="input-wrap search-blacklist">
                    <label htmlFor="searchBlacklistedJokes">
                      <input
                        id="searchBlacklistedJokes"
                        type="text"
                        onChange={handleSearchChange}
                      />
                      <span>{t('SearchByKeyword')}</span>
                    </label>
                  </div>
                </div>
              ) : showBlacklistedJokes ? (
                <p className="textcenter">{t('NoJokesYet')}</p>
              ) : (
                ''
              )}

              <ul
                className={`userjokeslist ${
                  showBlacklistedJokes ? 'blockedJokes' : ''
                }`}
              >
                {user && showBlacklistedJokes ? (
                  filteredFetchedJokes?.map((joke, index) => (
                    <li key={user?.blacklistedJokes?.[index]?.jokeId ?? index}>
                      <form
                        onSubmit={(e) => {
                          void dispatch(saveMostRecentJoke(joke))
                          void handleRemoveJokeFromBlacklisted(
                            e,
                            joke,
                            user?.blacklistedJokes?.[index]?._id
                          )
                        }}
                      >
                        <button className="" type="submit" disabled={sending}>
                          {t('Restore')}
                        </button>
                      </form>
                      {joke ? (
                        joke.type === EJokeType.single ? (
                          <p>{joke.joke}</p>
                        ) : (
                          <div>
                            <p>{joke.setup}</p>
                            <p>{joke.delivery}</p>
                          </div>
                        )
                      ) : (
                        ``
                      )}
                    </li>
                  ))
                ) : currentItems && currentItems?.length > 0 ? (
                  currentItems?.map((joke: IJokeVisible) => {
                    const { ...restOfJoke } = joke
                    return (
                      <li key={joke._id}>
                        <div className="primary-wrap">
                          {joke.type === EJokeType.single ? (
                            <p className="">{joke.joke}</p>
                          ) : (
                            <div>
                              <p className="">{joke.setup}</p>
                              <p>
                                {joke.delivery ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleVisibility(joke.jokeId)
                                    }
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
                                      {visibleJokes[joke.jokeId]
                                        ? joke.delivery
                                        : ''}
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
                              {getCategoryInLanguage(joke.category, language)}{' '}
                              {joke.subCategories &&
                              joke.subCategories?.length > 0 &&
                              joke.subCategories?.find(
                                (category) => category !== 'any'
                              ) ? (
                                <>
                                  (
                                  {joke.subCategories
                                    ?.filter((category) => category !== 'any')
                                    ?.map((category) => {
                                      return (
                                        norrisCat[
                                          category as keyof typeof norrisCat
                                        ][language].toLowerCase() ?? category
                                      )
                                    })
                                    .join(', ')}
                                  )
                                </>
                              ) : (
                                ''
                              )}
                            </span>
                            <span>
                              {translateWordLanguage}:{' '}
                              {joke.translatedLanguage ??
                                getLanguageLabel(joke.language)}
                            </span>
                            {joke.anonymous ? (
                              <span>{t('Anonymous')} </span>
                            ) : joke.anonymous === false ? (
                              <span>
                                {t('Author')}: {joke.name ?? ''}
                              </span>
                            ) : (
                              ''
                            )}
                            {!localJokes && userId && joke.private ? (
                              <span>{t('Private')}</span>
                            ) : !localJokes &&
                              userId &&
                              joke.private === false ? (
                              <span>{t('Public')}</span>
                            ) : (
                              ''
                            )}
                            {joke.private === false &&
                              joke.verified === false && (
                                <span>{t('PendingVerification')}</span>
                              )}

                            {joke.user?.length > 1 && (
                              <span>
                                {t('SavedBy')} {joke.user?.length}
                              </span>
                            )}
                          </div>

                          <div>
                            {userId && joke.user?.includes(userId) && (
                              <form
                                onSubmit={
                                  joke.type === EJokeType.single
                                    ? handleDelete(joke?._id, joke?.joke)
                                    : handleDelete(joke?._id, joke?.setup)
                                }
                                className="button-wrap"
                              >
                                <button
                                  type="submit"
                                  disabled={sending}
                                  className="delete danger"
                                >
                                  {joke.user?.length > 1
                                    ? t('Remove')
                                    : t('Delete')}
                                </button>
                              </form>
                            )}
                            {userId &&
                              joke.author !== userId &&
                              !joke.user?.includes(userId) && (
                                <button
                                  onClick={() =>
                                    void handleBlacklistUpdate(
                                      joke.jokeId,
                                      joke.language,
                                      joke.category ===
                                        ECategories.ChuckNorris &&
                                        joke.type === EJokeType.single
                                        ? joke.joke
                                        : undefined
                                    )
                                  }
                                  className="delete danger"
                                >
                                  {t('Block')}
                                </button>
                              )}

                            {!joke.user?.includes(userId) && (
                              <button
                                onClick={() => handleJokeSave(joke._id)}
                                className="save"
                              >
                                {t('SaveJoke')} <Icon lib="md" name="MdSave" />
                              </button>
                            )}

                            <CopyToClipboard
                              value={
                                joke.type === EJokeType.single
                                  ? joke.joke
                                  : joke.setup + ' \n' + joke.delivery
                              }
                              restore
                              label={t('Copy')}
                              ariaLabel={t('CopyToClipboard')}
                              className="copy restore button"
                            />

                            {userId &&
                              joke.user?.includes(userId) &&
                              joke.author === userId && (
                                <Accordion
                                  id={`joke-edit-${joke.jokeId}`}
                                  className={`joke-edit`}
                                  wrapperClass="joke-edit-wrap"
                                  text={t('Edit')}
                                  setIsFormOpen={(isOpen) => {
                                    setEditId(isOpen ? joke.jokeId : undefined)
                                  }}
                                  onClick={() => {
                                    setJokeLanguage(joke.language)
                                    setJokeCategory(joke.category)
                                    setNewJoke(restOfJoke as IJoke)
                                  }}
                                  isOpen={editId === joke.jokeId}
                                >
                                  <form
                                    onSubmit={handleUpdate(
                                      joke?._id,
                                      newJoke ?? joke
                                    )}
                                    className="joke-edit"
                                  >
                                    <div className="edit-wrap">
                                      {joke.private === true &&
                                      joke.type === EJokeType.twopart ? (
                                        <>
                                          <div className="input-wrap">
                                            <label htmlFor="edit-setup">
                                              <input
                                                required
                                                type="text"
                                                name="edit-setup"
                                                id="setup"
                                                defaultValue={joke.setup}
                                                onChange={(e) => {
                                                  setNewJoke(
                                                    (prev) =>
                                                      ({
                                                        ...prev,
                                                        setup: e.target.value,
                                                      }) as IJoke
                                                  )
                                                }}
                                              />
                                              <span>{t('JokeSetup')}</span>
                                            </label>
                                          </div>
                                          <div className="input-wrap">
                                            <label htmlFor="edit-delivery">
                                              <input
                                                required
                                                type="text"
                                                name="delivery"
                                                id="edit-delivery"
                                                defaultValue={joke.delivery}
                                                onChange={(e) => {
                                                  setNewJoke(
                                                    (prev) =>
                                                      ({
                                                        ...prev,
                                                        delivery:
                                                          e.target.value,
                                                      }) as IJoke
                                                  )
                                                }}
                                              />
                                              <span>
                                                {t('JokeDelivery')}
                                              </span>{' '}
                                            </label>
                                          </div>
                                        </>
                                      ) : joke.private === true &&
                                        joke.type === EJokeType.single ? (
                                        <div className="input-wrap">
                                          <label htmlFor="edit-joke">
                                            <input
                                              required
                                              type="text"
                                              name="joke"
                                              id="edit-joke"
                                              defaultValue={joke.joke}
                                              onChange={(e) => {
                                                setNewJoke(
                                                  (prev) =>
                                                    ({
                                                      ...prev,
                                                      joke: e.target.value,
                                                    }) as IJoke
                                                )
                                              }}
                                            />
                                            <span>{t('Joke')}</span>
                                          </label>
                                        </div>
                                      ) : (
                                        <div>
                                          {t('OnlyPrivateJokesCanBeEdited')}.{' '}
                                          {t('Note')}{' '}
                                          {t(
                                            'RepublishingWillRequireVerificationFromAnAdministrator'
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {joke.private === true && (
                                      <>
                                        <div className="flex column center gap">
                                          <Select
                                            language={language}
                                            id="edit-language"
                                            className="edit-language"
                                            z={3}
                                            instructions={`${t('LanguageTitle')}:`}
                                            hide
                                            options={options(ELanguagesLong)}
                                            value={
                                              {
                                                label:
                                                  getLanguageLabel(
                                                    jokeLanguage
                                                  ),
                                                value: jokeLanguage,
                                              } as SelectOption
                                            }
                                            onChange={(o) => {
                                              setJokeLanguage(
                                                o?.value as ELanguages
                                              )
                                              setNewJoke(
                                                (prev) =>
                                                  ({
                                                    ...prev,
                                                    language:
                                                      o?.value as ELanguages,
                                                  }) as IJoke
                                              )
                                            }}
                                          />
                                          <Select
                                            language={language}
                                            id="edit-category"
                                            className="edit-category"
                                            z={2}
                                            instructions={`${t('SelectCategory')}:`}
                                            hide
                                            options={[
                                              { label: t('Any'), value: '' },
                                              ...(Object.values(
                                                ECategories
                                              ).map((category) => {
                                                return {
                                                  label: getCategoryInLanguage(
                                                    category,
                                                    language
                                                  ),
                                                  value: category,
                                                }
                                              }) as SelectOption[]),
                                            ]}
                                            value={
                                              {
                                                label: getCategoryInLanguage(
                                                  jokeCategory,
                                                  language
                                                ),
                                                value: jokeCategory,
                                              } as SelectOption
                                            }
                                            onChange={(
                                              o: SelectOption | undefined
                                            ) => {
                                              const { ...restOfJoke } = joke
                                              setJokeCategory(
                                                o?.value as ECategories
                                              )
                                              setNewJoke(() => ({
                                                ...restOfJoke,
                                                category:
                                                  o?.value as ECategories,
                                              }))
                                            }}
                                          />
                                        </div>

                                        <fieldset>
                                          <legend>
                                            {t('AddWarningTitle')}
                                          </legend>

                                          <div className="checkbox-wrap">
                                            <div>
                                              <input
                                                type="checkbox"
                                                id="flag-nsfw"
                                                name="nsfw"
                                                value="nsfw"
                                                onChange={() => {
                                                  setNewJoke(() => ({
                                                    ...restOfJoke,
                                                    nsfw: !joke.flags.nsfw,
                                                  }))
                                                }}
                                              />
                                              <label htmlFor="flag-nsfw">
                                                {FlagsLanguage[language].nsfw}
                                              </label>
                                            </div>
                                            <div>
                                              <input
                                                type="checkbox"
                                                id="flag-religious"
                                                name="religious"
                                                value="religious"
                                                onChange={() => {
                                                  setNewJoke(() => ({
                                                    ...restOfJoke,
                                                    religious:
                                                      !joke.flags.religious,
                                                  }))
                                                }}
                                              />
                                              <label htmlFor="flag-religious">
                                                {
                                                  FlagsLanguage[language]
                                                    .religious
                                                }
                                              </label>
                                            </div>
                                            <div>
                                              <input
                                                type="checkbox"
                                                id="flag-political"
                                                name="political"
                                                value="political"
                                                onChange={() => {
                                                  setNewJoke(() => ({
                                                    ...restOfJoke,
                                                    political:
                                                      !joke.flags.political,
                                                  }))
                                                }}
                                              />
                                              <label htmlFor="flag-political">
                                                {
                                                  FlagsLanguage[language]
                                                    .political
                                                }
                                              </label>
                                            </div>
                                            <div>
                                              <input
                                                type="checkbox"
                                                id="flag-racist"
                                                name="racist"
                                                value="racist"
                                                onChange={() => {
                                                  setNewJoke(() => ({
                                                    ...restOfJoke,
                                                    racist: !joke.flags.racist,
                                                  }))
                                                }}
                                              />
                                              <label htmlFor="flag-racist">
                                                {FlagsLanguage[language].racist}
                                              </label>
                                            </div>
                                            <div>
                                              <input
                                                type="checkbox"
                                                id="flag-sexist"
                                                name="sexist"
                                                value="sexist"
                                                onChange={() => {
                                                  setNewJoke(() => ({
                                                    ...restOfJoke,
                                                    sexist: !joke.flags.sexist,
                                                  }))
                                                }}
                                              />
                                              <label htmlFor="flag-sexist">
                                                {FlagsLanguage[language].sexist}
                                              </label>
                                            </div>
                                            <div>
                                              <input
                                                type="checkbox"
                                                id="flag-explicit"
                                                name="explicit"
                                                value="explicit"
                                                onChange={() => {
                                                  setNewJoke(() => ({
                                                    ...restOfJoke,
                                                    explicit:
                                                      !joke.flags.explicit,
                                                  }))
                                                }}
                                              />
                                              <label htmlFor="flag-explicit">
                                                {
                                                  FlagsLanguage[language]
                                                    .explicit
                                                }
                                              </label>
                                            </div>
                                          </div>
                                        </fieldset>
                                      </>
                                    )}
                                    <fieldset className="flex center gap margin0auto">
                                      <div>
                                        <input
                                          type="checkbox"
                                          name="anonymous"
                                          id="edit-anonymous"
                                          defaultChecked={joke.anonymous}
                                          onChange={() => {
                                            const { ...restOfJoke } = joke
                                            setNewJoke(() => ({
                                              ...restOfJoke,
                                              anonymous: !joke.anonymous,
                                            }))
                                          }}
                                        />
                                        <label htmlFor="edit-anonymous">
                                          Anonymous:
                                        </label>
                                      </div>
                                      <div>
                                        <input
                                          type="checkbox"
                                          name="private"
                                          id="edit-private"
                                          defaultChecked={joke.private}
                                          onChange={() => {
                                            const { ...restOfJoke } = joke
                                            setNewJoke(() => ({
                                              ...restOfJoke,
                                              private: !joke.private,
                                            }))
                                          }}
                                        />
                                        <label htmlFor="edit-private">
                                          Private:
                                        </label>
                                      </div>
                                    </fieldset>
                                    <button
                                      type="submit"
                                      disabled={sending}
                                      className="save"
                                    >
                                      {t('SaveJoke')}
                                    </button>
                                  </form>
                                </Accordion>
                              )}
                          </div>
                        </div>
                      </li>
                    )
                  })
                ) : hasLoadedJokes ? (
                  <li className="margin0auto max-content">{t('NoJokesYet')}</li>
                ) : (
                  <li className="margin0auto max-content">
                    {t('LoadingJokes')}
                    <br />
                    <br />({t('ThisMayTakeUpToAMinute')})
                  </li>
                )}
              </ul>
            </>
          )}
          {!showUnverifiedJokes &&
            !isRandom &&
            !showBlacklistedJokes &&
            pagination(2)}
        </div>
        <div className="filler below"></div>
      </div>
      {userId && (
        <div className="local-saved-wrap below">
          <button
            className={`btn${
              localJokes && !showBlacklistedView && !showUnverifiedView
                ? ' active'
                : ''
            }`}
            onClick={() => {
              setCurrentPage(1)
              setShowLocalJokes(true)
              setShowBlacklistedJokes(false)
              setShowUnverifiedJokes(false)
            }}
          >
            {!localJokes ? t('SeeLocalJokes') : t('LocalJokes')}
          </button>
          <button
            className={`btn${
              !localJokes && !showBlacklistedView && !showUnverifiedView
                ? ' active'
                : ''
            }`}
            onClick={() => {
              setCurrentPage(1)
              setShowLocalJokes(false)
              setShowBlacklistedJokes(false)
              setShowUnverifiedJokes(false)
            }}
          >
            {t('YourSavedJokes')}
          </button>
          {isAdmin && (
            <button
              className={`btn${showUnverifiedJokes ? ' active' : ''}`}
              onClick={() => {
                setShowUnverifiedJokes(true)
                setShowBlacklistedJokes(false)
              }}
            >
              {t('UnverifiedJokes')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default UserJokes
