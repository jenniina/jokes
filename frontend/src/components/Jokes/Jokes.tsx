import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
// import FormJoke from './components/FormJoke'
import { SelectOption } from '../Select/Select'
import './css/joke.css'
import {
  IJoke,
  EJokeType,
  ESafemode,
  EQueryKey,
  ECategories,
  IJokeCategoryByLanguage,
  ESortBy,
  EExtraCategories,
  ECategory_en,
  ECategory_cs,
  ECategory_de,
  ECategory_es,
  ECategory_fr,
  ECategory_pt,
  ECategory_fi,
  TCategoryByLanguages,
  norrisCategoryTranslations as norrisCats,
  jokeCategoryByLanguage,
  INorrisJoke,
  IDadJoke,
  IJokeContent,
} from './types'
import {
  ELanguages,
  ReducerProps,
  IUser,
  IBlacklistedJoke,
  ELanguagesLong,
  TPublicUserNamesMap,
  IPublicUserName,
} from '../../types'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { notify } from '../../reducers/notificationReducer'
import {
  createJoke,
  deleteUserFromJoke,
  getJokesByUserId,
  initializeJokes,
  removeJoke,
  saveMostRecentJoke,
  updateJoke,
} from './reducers/jokeReducer'
import { initializeUser } from '../../reducers/authReducer'
import UserJokes from './components/UserJokes'
import norrisService from './services/chucknorris'
import dadjokeService from './services/dadjokes'
import { useNavigate } from 'react-router-dom'
import {
  addToBlacklistedJokes,
  removeJokeFromBlacklisted,
  findUserById,
} from '../../reducers/usersReducer'
import { AxiosError } from 'axios'
import { options, getRandomMinMax, getErrorMessage } from '../../utils'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useConfirm } from '../../contexts/ConfirmContext'
import FormJoke from './components/FormJoke'
import JokeSubmit from './components/JokeSubmit'
import useLocalStorage from '../../hooks/useStorage'
import usersService from '../../services/users'
import Icon from '../Icon/Icon'
import JokeIcon from '../Icon/JokeIcon'
import useWindowSize from '../../hooks/useWindowSize'
import { useTheme } from '../../hooks/useTheme'

function Jokes() {
  const { t, language } = useLanguageContext()
  const confirm = useConfirm()

  const lightTheme = useTheme()

  const jokes = useSelector((state: ReducerProps) => {
    return state.jokes?.jokes
  })
  const recentJoke = useSelector((state: ReducerProps) => {
    return state.jokes?.joke
  })
  const user = useSelector((state: ReducerProps) => {
    return state.auth?.user
  })

  const { windowWidth } = useWindowSize()

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

  // const user = localUser
  //   ? users?.find((user: IUser) => user._id === localUser.user._id)
  //   : undefined

  const categoryByLanguagesConst = useMemo(() => {
    return {
      en: ECategory_en,
      es: ECategory_es,
      fr: ECategory_fr,
      de: ECategory_de,
      pt: ECategory_pt,
      cs: ECategory_cs,
      fi: ECategory_fi,
    }
  }, [])

  const translateWordLanguage = t('LanguageTitle')
  const [joke, setJoke] = useState<string>('')
  const [delivery, setDelivery] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const [jokeLanguage, setJokeLanguage] = useLocalStorage<ELanguages>(
    'jokeLanguage',
    ELanguages.en
  )
  const [jokeCategory, setJokeCategory] = useState<ECategories | null>(
    ECategories.Misc
  )
  const [categoryValues, setCategoryValues] = useState<SelectOption[]>([])
  const [norrisCategories, setNorrisCategories] = useState<SelectOption[]>([
    { value: 'any', label: 'Any' },
  ])
  const [selectedNorrisCategory, setSelectedNorrisCategory] = useState<
    SelectOption | undefined
  >(norrisCategories[0])
  const [subCategoryResults, setSubCategoryResults] = useState<string[]>([])
  const [isCheckedJokeType, setIsCheckedJokeType] = useState<boolean>(false)
  const [isCheckedSafemode, setIsCheckedSafemode] = useState<boolean>(true)
  const [queryValue, setQueryValue] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [reveal, setReveal] = useState<boolean>(true)
  const [jokeId, setJokeId] = useState<IJoke['jokeId']>('')
  const [visibleJoke, setVisibleJoke] = useState<boolean>(false)
  const [editId, setEditId] = useState<IJoke['_id'] | null>(null)
  const [lastJokes, setLastJokes] = useState<
    { jokeId: string | undefined; language: ELanguages }[]
  >([])
  const [sending, setSending] = useState<boolean>(false)

  const [flags, setFlags] = useState({
    nsfw: false,
    religious: false,
    political: false,
    racist: false,
    sexist: false,
    explicit: false,
  })

  const lastJokesLength = 6
  const queryInputRef = useRef<HTMLInputElement>(null)

  const dispatch = useAppDispatch()

  const hasNorris = useMemo(() => {
    const norrisExists = categoryValues?.find((v) => v.value === 'ChuckNorris')
      ? true
      : false
    return queryValue === '' ? norrisExists : false
  }, [queryValue, categoryValues])

  useEffect(() => {
    void dispatch(initializeUser())
  }, [dispatch])

  const initializeJokesData = useCallback(async () => {
    try {
      await dispatch(initializeJokes())
      notify(`${t('JokesLoaded')}...`, false, 3)
    } catch (err: unknown) {
      const message = getErrorMessage(err, t('Error'))
      void dispatch(notify(`${t('Error')}: ${message}`, true, 8))
    }
  }, [dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void initializeJokesData()
  }, [initializeJokesData])

  const derivedCategoryByLanguages = useMemo(
    () => categoryByLanguagesConst[language],
    [language, categoryByLanguagesConst]
  )

  const handleToggleChangeSafemode = () => {
    setIsCheckedSafemode(!isCheckedSafemode)
  }
  const handleToggleChangeEJokeType = () => {
    setIsCheckedJokeType(!isCheckedJokeType)
  }

  const safemode = isCheckedSafemode ? ESafemode.Safe : ESafemode.Unsafe
  const jokeType = isCheckedJokeType ? EJokeType.twopart : EJokeType.single

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setVisibleJoke(true)
    }, 400)
    setReveal(true)
    setTimeout(() => {
      void void fetchApi()
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setSending(false)
      }, 500)
      queryInputRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 600)
  }

  const handleDelete =
    (id: IJoke['_id'], joke: string) =>
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      setSending(true)
      if (
        await confirm({
          message: `${t('Delete')} ${t('Joke').toLowerCase()} "${joke}"?`,
        })
      ) {
        try {
          // Make an API request to delete the user's ID from the joke's user array
          void dispatch(deleteUserFromJoke(id!, user?._id ?? '')).then(() => {
            void dispatch(initializeJokes())
          })
          setSending(false)
        } catch (err: unknown) {
          const message = getErrorMessage(err, t('ErrorDeletingJoke'))
          void dispatch(notify(message, true, 8))
          setSending(false)
        }
      } else return
    }

  const handleUpdate =
    (id: IJoke['_id'], joke: IJoke) =>
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      setSending(true)
      const jokeObject = jokes.find((j) => j._id === id)
      if (!jokeObject) {
        void dispatch(notify(`${t('Error')}!`, true, 8))
        setSending(false)
        return
      }
      const handleDispatch = async (joke: IJoke) => {
        try {
          await dispatch(updateJoke(joke))
          await dispatch(initializeJokes())
          const r = (await dispatch(
            updateJoke({ ...joke, verified: false, _id: id })
          )) as IJokeContent
          void dispatch(
            notify(`${t('SavedJoke')}. ${r.message ?? ''}`, false, 8)
          )
          setEditId(null)
          setSending(false)
        } catch (e) {
          console.error(e)
          const errorMessage =
            (e as AxiosError)?.code === 'ERR_BAD_RESPONSE'
              ? ((e as AxiosError<AxiosError>)?.response?.data?.message ?? '')
              : ((e as Error)?.message ?? '')
          await dispatch(notify(`${t('Error')}: ${errorMessage}`, true, 8))
          setSending(false)
        }
      }
      const update = async () => {
        if (jokeObject.private === true && joke.private === false) {
          if (
            joke.category === ECategories.Dark ||
            Object.values(joke.flags)?.some((value) => value)
          ) {
            await handleDispatch({
              ...joke,
              private: true,
              verified: false,
              safe: false,
            })
            setSending(false)
          } else {
            await handleDispatch({
              ...joke,
              private: true,
              verified: false,
              _id: id,
            })
            setSending(false)
          }
        } else if (
          joke.category != ECategories.Dark &&
          !Object.values(joke.flags)?.some((value) => value)
        ) {
          await handleDispatch({ ...joke, safe: true, _id: id })
          setSending(false)
        } else if (
          joke.category === ECategories.Dark ||
          Object.values(joke.flags)?.some((value) => value)
        ) {
          await handleDispatch({ ...joke, safe: false, _id: id })
          setSending(false)
        } else {
          await handleDispatch(joke)
          setSending(false)
        }
      }
      if (jokeObject.private === true && joke.private === false) {
        if (
          await confirm({ message: t('AreYouSureYouWantToMakeThisJokePublic') })
        ) {
          void update()
        }
      } else if (jokeObject.private === false && joke.private === true) {
        if (
          await confirm({
            message: t('AreYouSureYouWantToMakeThisJokePrivate'),
          })
        ) {
          void update()
        }
      } else void update()
    }

  // const options = (
  //   enumObj: typeof ECategories | typeof EJokeType | typeof ESafemode | typeof ELanguages
  // ) => {
  //   return Object.keys(enumObj).map((key) => ({
  //     value: enumObj[key as keyof typeof enumObj],
  //     label: key,
  //   })) as SelectOption[]
  // }

  const optionsCategory = (enumObj: TCategoryByLanguages) => {
    return Object.entries(enumObj).map(([key, value]: [string, string]) => ({
      value: key,
      label: value,
    })) as SelectOption[]
  }

  const optionsSortBy = (enumObj: typeof ESortBy) => {
    return Object.entries(
      enumObj as Record<string, Record<string, string>>
    ).map(([key, value]) => ({
      value: key,
      label: value[language],
    })) as SelectOption[]
  }

  function getKeyByValue(
    enumObj:
      | TCategoryByLanguages
      | typeof ECategories
      | typeof EJokeType
      | typeof ESafemode
      | typeof ELanguages
      | typeof EExtraCategories,
    value: ECategories | EJokeType | ESafemode | ELanguages | EExtraCategories
  ) {
    for (const key in enumObj) {
      if (enumObj[key as keyof typeof enumObj] === value) {
        return key
      }
    }
    // Handle the case where the value is not found in the enum
    return undefined
  }

  const [foundJoke, setFoundJoke] = useState<IJoke | undefined>(undefined)

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
  }

  useEffect(() => {
    if (!recentJoke?.jokeId) {
      setFoundJoke(undefined)
      return
    }

    const findJoke = jokes?.find(
      (j: IJoke) =>
        j.jokeId.toString() === recentJoke.jokeId.toString() &&
        j.language === recentJoke?.language &&
        j.category === recentJoke?.category
    )
    setFoundJoke(findJoke)
  }, [recentJoke, jokes])

  const handleJokeSave = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    const userId = user?._id
    if (!userId) {
      void dispatch(notify(`${t('LoginOrRegisterToSave')}`, false, 8))
      return
    }

    let didSave = false

    if (foundJoke) {
      if (foundJoke.user.includes(userId.toString())) {
        void dispatch(notify(`${t('JokeAlreadySaved')}`, false, 8))
        return
      }
      try {
        await dispatch(
          updateJoke({ ...foundJoke, user: [...foundJoke.user, userId] })
        )
        await dispatch(initializeJokes())
        didSave = true
      } catch (err: unknown) {
        const message = getErrorMessage(err, t('Error'))
        void dispatch(notify(`${t('Error')}:: ${message}`, true, 8))
        return
      }
    } else {
      if (recentJoke && recentJoke?.type === EJokeType.single) {
        try {
          await dispatch(
            createJoke({
              jokeId: recentJoke?.jokeId.toString() ?? jokeId.toString(),
              joke: joke,
              type: EJokeType.single,
              category:
                recentJoke?.category ?? jokeCategory ?? ECategories.Misc,
              subCategories:
                (recentJoke?.subCategories ?? subCategoryResults?.length > 0)
                  ? subCategoryResults
                  : undefined,
              language: recentJoke?.language ?? jokeLanguage,
              safe: !Object.values(flags)?.some((value) => value),
              user: [userId],

              flags: {
                nsfw: recentJoke?.flags.nsfw,
                religious: recentJoke?.flags.religious,
                political: recentJoke?.flags.political,
                racist: recentJoke?.flags.racist,
                sexist: recentJoke?.flags.sexist,
                explicit: recentJoke?.flags.explicit,
              },
            })
          )
          await dispatch(initializeJokes())
          didSave = true
        } catch (err: unknown) {
          const message = getErrorMessage(err, t('Error'))
          void dispatch(notify(`${t('Error')}*: ${message}`, true, 8))
          return
        }
      } else if (recentJoke && recentJoke?.type === EJokeType.twopart) {
        try {
          await dispatch(
            createJoke({
              jokeId: recentJoke?.jokeId.toString() ?? jokeId.toString(),
              setup: joke,
              delivery: delivery,
              type: EJokeType.twopart,
              category:
                recentJoke?.category ?? jokeCategory ?? ECategories.Misc,
              subCategories:
                subCategoryResults?.length > 0 ? subCategoryResults : undefined,
              language: recentJoke?.language ?? jokeLanguage,
              safe: !Object.values(recentJoke?.flags)?.some((value) => value),
              user: [userId],

              flags: {
                nsfw: recentJoke?.flags.nsfw,
                religious: recentJoke?.flags.religious,
                political: recentJoke?.flags.political,
                racist: recentJoke?.flags.racist,
                sexist: recentJoke?.flags.sexist,
                explicit: recentJoke?.flags.explicit,
              },
            })
          )
          await dispatch(initializeJokes())
          didSave = true
        } catch (err: unknown) {
          const message = getErrorMessage(err, t('Error'))
          void dispatch(notify(`${t('Error')}: ${message}`, true, 8))
          return
        }
      }
    }

    if (didSave) {
      await dispatch(notify(`${t('SavedJoke')}`, false, 8))
    }
  }

  //for ChuckNorris and DadJoke
  const setJokeData = (
    jokeData: INorrisJoke | IDadJoke,
    type: 'norris' | 'dad',
    category: ECategories,
    subCategories: string[] | undefined,
    repeat: boolean,
    userId?: IUser['_id']
  ) => {
    if (isJokeBlacklisted(jokeData.id)) {
      void fetchApi()
      return
    }
    if (
      repeat &&
      lastJokes?.some(
        (joke) => joke.jokeId === jokeData.id && joke.language === ELanguages.en
      )
    ) {
      // If it is found in the lastJokes, fetch again
      void fetchApi()
      return
    }
    //if defined
    if (jokeData?.id)
      setLastJokes((prevJokes) => [
        ...prevJokes,
        { jokeId: jokeData.id, language: ELanguages.en },
      ])
    if (lastJokes?.length > lastJokesLength) {
      void setLastJokes((prevJokes) => prevJokes.slice(1))
    }

    setJokeCategory(category)
    setSubCategoryResults(subCategories ?? [])

    let jokeText
    if (type === 'dad') {
      jokeText = (jokeData as IDadJoke).joke
    } else {
      jokeText = (jokeData as INorrisJoke).value
    }

    void dispatch(
      saveMostRecentJoke({
        jokeId: jokeData.id.toString(),
        joke: jokeText,
        type: EJokeType.single,
        category: category,
        subCategories:
          subCategories && subCategories?.length > 0
            ? subCategories
            : undefined,
        language: ELanguages.en,

        safe:
          (jokeData as INorrisJoke)?.categories?.includes('explicit') ||
          (jokeData as INorrisJoke)?.categories?.includes('political') ||
          (jokeData as INorrisJoke)?.categories?.includes('religion')
            ? false
            : true,
        user: userId ? [userId] : [],
        flags: {
          nsfw:
            (jokeData as INorrisJoke).categories?.some(
              (category) => category === 'nsfw'
            ) ?? false,
          religious:
            (jokeData as INorrisJoke).categories?.some(
              (category) => category === 'religion'
            ) ?? false,
          political:
            (jokeData as INorrisJoke).categories?.some(
              (category) => category === 'political'
            ) ?? false,
          racist:
            (jokeData as INorrisJoke).categories?.some(
              (category) => category === 'racist'
            ) ?? false,
          sexist:
            (jokeData as INorrisJoke).categories?.some(
              (category) => category === 'sexist'
            ) ?? false,
          explicit:
            (jokeData as INorrisJoke).categories?.some(
              (category) => category === 'explicit'
            ) ?? false,
        },
      })
    )

    setFlags({
      explicit:
        (jokeData as INorrisJoke)?.categories?.includes('explicit') ?? false,
      religious:
        (jokeData as INorrisJoke)?.categories?.includes('religious') ?? false,
      political:
        (jokeData as INorrisJoke)?.categories?.includes('political') ?? false,
      racist:
        (jokeData as INorrisJoke)?.categories?.includes('racist') ?? false,
      sexist:
        (jokeData as INorrisJoke)?.categories?.includes('sexist') ?? false,
      nsfw:
        (jokeData as INorrisJoke)?.categories?.includes('explicit') ?? false,
    })
    setJoke((jokeData as IDadJoke).joke ?? (jokeData as INorrisJoke).value)
    setDelivery('')
    setJokeId(jokeData.id)
    setJokeLanguage(ELanguages.en)
    setJoke((jokeData as IDadJoke).joke ?? (jokeData as INorrisJoke).value)
  }

  const getRandomNorrisCategory = () => {
    const filteredCategories =
      safemode === ESafemode.Unsafe
        ? norrisCategories.filter((category) => category.value !== 'any')
        : norrisCategories.filter(
            (category) =>
              category.value !== 'any' &&
              category.value !== 'explicit' &&
              category.value !== 'religion' &&
              category.value !== 'political'
          )

    const randomIndex = Math.floor(Math.random() * filteredCategories?.length)
    const selectedCategory = filteredCategories[randomIndex]

    return selectedCategory
  }

  type IJokeExtra = IJoke & {
    translatedLanguage: string
    name: string
  }
  const [userJokes, setUserJokes] = useState<IJokeExtra[]>([])

  useEffect(() => {
    if (Array.isArray(jokes) && jokes?.length > 0) {
      const processJokes = () => {
        return jokes.map((joke) => {
          const authorNameFromPublic =
            typeof joke.author === 'string'
              ? publicUserNames?.[joke.author]
              : undefined

          const jokeLanguage =
            ELanguagesLong[joke.language as keyof typeof ELanguages]

          return {
            ...joke,
            translatedLanguage: jokeLanguage ?? '',
            name: joke.anonymous
              ? t('Anonymous')
              : ((authorNameFromPublic ?? '') as string),
          }
        })
      }

      const processedJokes = processJokes()
      const filteredJokes = processedJokes
        .filter((joke) => joke.safe === isCheckedSafemode)
        .sort((a, b) => b.user?.length - a.user?.length)

      setUserJokes(filteredJokes)
    }
  }, [jokes, language, isCheckedSafemode, t, publicUserNames])

  // Fetch joke from API or database
  const fetchApi = async (retryCount = 0) => {
    const categories = categoryValues.map(
      (category) => category.value as ECategories
    )
    const selectedCategory =
      categories.length > 1
        ? getRandomSelectedCategory()
        : (categories[0] ?? null)

    if (retryCount > 5) {
      return
    }

    const handleJokes = (jokes: IJoke[] | undefined) => {
      if (jokes && jokes?.length > 0) {
        const random = jokes[Math.floor(Math.random() * jokes?.length)]
        if (
          lastJokes?.some(
            (joke) =>
              joke.jokeId === random.jokeId && joke.language === jokeLanguage
          )
        ) {
          // If it is found in the lastJokes, fetch again
          void fetchApi()
          return
        }
        setLastJokes((prevJokes) => [
          ...prevJokes,
          { jokeId: random.jokeId, language: jokeLanguage },
        ])

        if (lastJokes?.length > lastJokesLength) {
          setLastJokes((prevJokes) => prevJokes.slice(1))
        }
        if (random) {
          setJokeId(random.jokeId)
          setJokeLanguage(random.language ?? jokeLanguage)
          setJokeCategory(random.category)
          if ('joke' in random) {
            setJoke(random.joke)
          } else if ('setup' in random) {
            setJoke(random.setup)
          }
          setDelivery('delivery' in random ? random?.delivery : '')
          if (
            (random.private === false || random.private === undefined) &&
            random.anonymous === false
          ) {
            const authorNameFromPublic =
              typeof random.author === 'string'
                ? publicUserNames?.[random.author]
                : undefined

            setAuthor((authorNameFromPublic ?? '') as string)
          } else {
            setAuthor('')
          }

          void dispatch(saveMostRecentJoke(random))
          return
        } else {
          void dispatch(
            notify(
              `${t('Error')}! ${t('NoJokeFoundWithThisSearchTerm')}. ${t(
                'TryAnotherSearchTerm'
              )}`,
              true,
              8
            )
          )

          setJoke('')
          setDelivery('')
          setAuthor('')
          return
        }
      } else {
        void dispatch(
          notify(
            `${t('Error')}! ${t('NoJokeFoundWithThisSearchTerm')}. ${t(
              'TryAnotherSearchTerm'
            )}`,
            true,
            8
          )
        )

        setJoke('')
        setDelivery('')
        setAuthor('')
        return
      }
    }

    const jokeType = isCheckedJokeType ? EJokeType.twopart : EJokeType.single
    const filteredJokes = userJokes?.filter(
      (joke) =>
        joke.language === jokeLanguage &&
        (selectedCategory === null || joke.category === selectedCategory) &&
        ((joke.private === false && joke.verified === true) ||
          joke.private === undefined) &&
        joke.safe === isCheckedSafemode &&
        joke.type === jokeType
    )
    const isEmpty = categoryValues?.length < 1
    const isChuckNorris = selectedCategory === ECategories.ChuckNorris
    const isDadJoke = selectedCategory === ECategories.DadJoke
    const normalizedQueryValue = queryValue.replace(/&$/, '').trim()
    const isQueryNotEmpty = normalizedQueryValue !== ''

    let newFilteredJokes = filteredJokes

    if (isQueryNotEmpty) {
      newFilteredJokes = filteredJokes?.filter((joke) => {
        if (joke) {
          const searchTermMatches =
            ('joke' in joke
              ? joke.joke
                  ?.toLowerCase()
                  .includes(normalizedQueryValue.toLowerCase())
              : false) ??
            ('setup' in joke
              ? joke.setup
                  ?.toLowerCase()
                  .includes(normalizedQueryValue.toLowerCase())
              : false) ??
            ('delivery' in joke
              ? joke.delivery
                  ?.toLowerCase()
                  .includes(normalizedQueryValue.toLowerCase())
              : false) ??
            joke.name
              ?.toLowerCase()
              .includes(normalizedQueryValue.toLowerCase()) ??
            joke.category
              ?.toLowerCase()
              .includes(normalizedQueryValue.toLowerCase()) ??
            joke.subCategories?.includes(normalizedQueryValue.toLowerCase()) ??
            joke.translatedLanguage
              ?.toLowerCase()
              .includes(normalizedQueryValue.toLowerCase())

          const categoryMatches =
            selectedCategory !== null
              ? joke.category === selectedCategory
              : true

          const languageMatches = joke.language === jokeLanguage

          const norrisCategoryMatches =
            selectedNorrisCategory?.value !== '' &&
            selectedNorrisCategory?.value !== 'any'
              ? joke.subCategories?.includes(
                  String(selectedNorrisCategory?.value ?? '')
                )
              : true

          if (
            joke.safe === isCheckedSafemode &&
            joke.type === jokeType &&
            ((joke.private === false && joke.verified === true) ||
              joke.private === undefined)
          ) {
            return (
              languageMatches &&
              categoryMatches &&
              norrisCategoryMatches &&
              searchTermMatches
            )
          } else {
            return false
          }
        }
      })
    }

    newFilteredJokes = newFilteredJokes?.filter((joke) => {
      // Check if the joke is blacklisted
      const isBlacklisted = user?.blacklistedJokes?.some(
        (blacklistedJoke: IBlacklistedJoke) =>
          blacklistedJoke.jokeId === joke.jokeId &&
          blacklistedJoke.language === joke.language
      )
      // Return true if the joke is not blacklisted
      return !isBlacklisted
    })

    // Because Finnish jokes are only in the database, we need to handle them differently
    if (
      newFilteredJokes &&
      newFilteredJokes?.length > 0 &&
      jokeLanguage === ELanguages.fi
    ) {
      void handleJokes(newFilteredJokes)
      return
    }
    // Occasionally get a joke from the database instead of the APIs:
    else if (
      newFilteredJokes &&
      newFilteredJokes?.length > 0 &&
      Math.random() < 0.1
    ) {
      void handleJokes(newFilteredJokes)
      return
    }

    if (isChuckNorris || isDadJoke) {
      // ChuckNorris and DadJoke only appear in English in the API, so for other languages, you search for a joke from the database
      if (jokeLanguage !== ELanguages.en) {
        void handleJokes(newFilteredJokes)
        return
      } else if (isChuckNorris && isDadJoke) {
        const random = Math.floor(getRandomMinMax(1, 2.999))
        if (random === 1 && isChuckNorris) {
          const query = isQueryNotEmpty ? normalizedQueryValue : null
          const joke = await fetchAndSetJoke(
            norrisService,
            query,
            ECategories.ChuckNorris,
            !isQueryNotEmpty
          )

          if (!joke) {
            noJoke()
            return
          }
        } else if (random > 1 && isDadJoke) {
          const query = isQueryNotEmpty ? normalizedQueryValue : null
          const joke = await fetchAndSetJoke(
            dadjokeService,
            query,
            ECategories.DadJoke,
            !isQueryNotEmpty
          )
          if (!joke) {
            noJoke()
            return
          }
        }
      } else if (isChuckNorris) {
        const query = isQueryNotEmpty ? normalizedQueryValue : null
        const joke = await fetchAndSetJoke(
          norrisService,
          query,
          ECategories.ChuckNorris,
          !isQueryNotEmpty
        )
        if (!joke) {
          noJoke()
          return
        }
      } else if (isDadJoke) {
        const query = isQueryNotEmpty ? normalizedQueryValue : null
        const joke = await fetchAndSetJoke(
          dadjokeService,
          query,
          ECategories.DadJoke,
          !isQueryNotEmpty
        )
        if (!joke) {
          noJoke()
          return
        }
      }
    } else if (isEmpty && !isCheckedJokeType) {
      const rand = Math.floor(getRandomMinMax(1, 10.999))
      const query = isQueryNotEmpty ? normalizedQueryValue : null
      if (rand === 1) {
        if (
          !(await fetchAndSetJoke(
            norrisService,
            query,
            ECategories.ChuckNorris,
            !isQueryNotEmpty
          ))
        ) {
          await fetchAndSetJoke(
            dadjokeService,
            query,
            ECategories.DadJoke,
            false
          )
        }
      } else if (rand === 2) {
        if (
          !(await fetchAndSetJoke(
            dadjokeService,
            query,
            ECategories.DadJoke,
            false
          ))
        ) {
          await fetchAndSetJoke(
            norrisService,
            query,
            ECategories.ChuckNorris,
            !isQueryNotEmpty
          )
        }
      } else if (rand > 2) {
        void fetchFromJokeAPI(0, selectedCategory)
      }
    } else {
      void fetchFromJokeAPI(0, selectedCategory)
    }
  }

  interface IDadService {
    getRandomDadJoke(): Promise<IDadJoke | undefined>
    searchDadJokes(query: string): Promise<IDadJoke | undefined>
  }
  interface INorrisService {
    getFullyRandomNorrisJoke(): Promise<INorrisJoke | undefined>
    getRandomJokeFromNorrisCategory(
      category: string
    ): Promise<INorrisJoke | undefined>
    searchNorrisJoke(query: string): Promise<INorrisJoke | undefined>
  }

  type TJokeService = IDadService | INorrisService

  async function fetchAndSetJoke(
    service: TJokeService,
    query: string | null,
    category: ECategories.DadJoke | ECategories.ChuckNorris,
    isRandom: boolean
  ) {
    // let joke: IJoke | undefined = undefined

    try {
      let joke: IDadJoke | INorrisJoke | undefined = undefined
      if (category === ECategories.ChuckNorris && service === norrisService) {
        if (
          !isCheckedSafemode &&
          (!selectedNorrisCategory?.value ||
            selectedNorrisCategory?.value === 'any')
        ) {
          joke = await service.getFullyRandomNorrisJoke()
        } else if (
          selectedNorrisCategory?.value &&
          selectedNorrisCategory?.value !== 'any'
        ) {
          joke = await service.getRandomJokeFromNorrisCategory(
            String(selectedNorrisCategory?.value ?? '')
          )
        } else {
          const randomCategory = getRandomNorrisCategory()
          joke = query
            ? await service.searchNorrisJoke(query)
            : await service.getRandomJokeFromNorrisCategory(
                String(randomCategory.value ?? '')
              )
        }
      } else if (
        category === ECategories.DadJoke &&
        service === dadjokeService
      ) {
        joke = query
          ? await service.searchDadJokes(query)
          : await service.getRandomDadJoke()
      }

      if (!joke) {
        void fetchFromJokeAPI()
      } else {
        if (isJokeBlacklisted(joke.id ?? '')) {
          void fetchApi()
          return
        }
        setJokeCategory(category)
        setJokeId(joke.id ?? '')

        const type = category === ECategories.DadJoke ? 'dad' : 'norris'

        setJokeData(joke, type, category, [], isRandom, user?._id)
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err, t('Error'))
      void dispatch(notify(message, true, 8))
      console.error(err)
      void fetchFromJokeAPI()
    } finally {
    }

    return !!joke
  }

  const noJoke = () => {
    void dispatch(
      notify(`${t('Error')}! ${t('NoJokeFoundWithThisSearchTerm')}`, true, 8)
    )

    setJoke('')
    setDelivery('')
  }

  const getRandomSelectedCategory = useCallback(() => {
    if (categoryValues.length < 1) {
      return null
    }

    const selectedCategories = categoryValues.map(
      (category) => category.value as ECategories
    )

    return selectedCategories[
      Math.floor(Math.random() * selectedCategories.length)
    ]
  }, [categoryValues])

  useEffect(() => {
    if (categoryValues?.length < 1) {
      setJokeCategory(null)
    }
  }, [categoryValues])

  const fetchFromJokeAPI = async (
    retryCount = 0,
    selectedCategory: ECategories | null = getRandomSelectedCategory()
  ) => {
    const category =
      selectedCategory &&
      selectedCategory !== ECategories.ChuckNorris &&
      selectedCategory !== ECategories.DadJoke
        ? selectedCategory
        : 'Any'
    // console.log(
    //   `https://v2.jokeapi.dev/joke/${category}?${queryKey}${queryValue}lang=${language}&format=json${safemode}&type=${jokeType}`
    // )

    await fetch(
      `https://v2.jokeapi.dev/joke/${category}?${queryKey}${queryValue}lang=${jokeLanguage}&format=json${safemode}&type=${jokeType}`
    )
      .then((res) => res.json() as Promise<IJokeApiResponse>)
      .then((data: IJokeApiResponse) => {
        if (retryCount > 5) {
          return
        }
        if (data.error || data.id === undefined) {
          if (category === 'Any') {
            void dispatch(
              notify(
                `${t('Error')}! ${t('NoJokeFoundWithThisSearchTerm')}. ${t(
                  'MaybeTryAnotherLanguage'
                )}`,
                true,
                10
              )
            )
            setJoke('')
            setDelivery('')
            setJokeId('')
            return
          }

          setJoke('')
          setDelivery('')
          void dispatch(
            notify(
              `${t('Error')}! ${t('NoJokeFoundWithThisSearchTerm')}`,
              true,
              8
            )
          )

          setJokeId('')
          return
        }

        const responseJokeId = data.id.toString()

        if (
          isJokeBlacklisted(responseJokeId) ||
          (queryKey === EQueryKey.None &&
            lastJokes?.some(
              (joke) =>
                joke.jokeId === responseJokeId && joke.language === jokeLanguage
            ))
        ) {
          void fetchFromJokeAPI(retryCount + 1, selectedCategory)
          return
        }

        setLastJokes((prevJokes) => [
          ...prevJokes,
          { jokeId: responseJokeId, language: jokeLanguage },
        ])
        if (lastJokes?.length > lastJokesLength) {
          setLastJokes((prevJokes) => prevJokes.slice(1))
        }

        setFlags({
          nsfw: data.flags?.nsfw ?? false,
          religious: data.flags?.religious ?? false,
          political: data.flags?.political ?? false,
          racist: data.flags?.racist ?? false,
          sexist: data.flags?.sexist ?? false,
          explicit: data.flags?.explicit ?? false,
        })
        setJokeCategory(data.category as ECategories)
        if (jokeType === EJokeType.twopart) {
          void dispatch(
            saveMostRecentJoke({
              jokeId: responseJokeId,
              setup: data.setup!,
              delivery: data.delivery!,
              type: EJokeType.twopart,
              category: data.category as ECategories,
              subCategories:
                subCategoryResults?.length > 0 ? subCategoryResults : undefined,
              language: jokeLanguage,
              safe:
                jokeCategory === ECategories.Dark ||
                !Object.values(flags)?.some((value) => value)
                  ? false
                  : true,
              user: user ? [user._id] : [],
              flags: {
                nsfw: flags.nsfw,
                religious: flags.religious,
                political: flags.political,
                racist: flags.racist,
                sexist: flags.sexist,
                explicit: flags.explicit,
              },
            })
          )
          setJokeCategory(data.category! as ECategories)
          setJoke(data.setup!)
          setDelivery(data.delivery!)
          setJokeId(responseJokeId)
        } else {
          void dispatch(
            saveMostRecentJoke({
              jokeId: responseJokeId,
              joke: data.joke!,
              type: EJokeType.single,
              category: data.category as ECategories,
              subCategories:
                subCategoryResults?.length > 0 ? subCategoryResults : undefined,
              language: jokeLanguage,
              safe:
                jokeCategory === ECategories.Dark ||
                !Object.values(flags)?.some((value) => value)
                  ? false
                  : true,
              user: user ? [user._id] : [],
              flags: {
                nsfw: flags.nsfw,
                religious: flags.religious,
                political: flags.political,
                racist: flags.racist,
                sexist: flags.sexist,
                explicit: flags.explicit,
              },
            })
          )
          setJokeCategory(data.category! as ECategories)
          setJoke(data.joke!)
          setDelivery('')
          setJokeId(responseJokeId)
        }
      })
      .catch((err: unknown) => {
        const message = getErrorMessage(err, t('Error'))
        void dispatch(notify(`${t('Error')}! ${message}`, true, 8))
      })
  }

  function isJokeBlacklisted(jokeId: string): boolean {
    return (
      user?.blacklistedJokes?.some(
        (blacklistedJoke: IBlacklistedJoke) =>
          blacklistedJoke.jokeId === jokeId &&
          blacklistedJoke.language === jokeLanguage
      ) ?? false
    )
  }

  const optionsNorris = useCallback(
    (enumObj: string[], any: boolean) => {
      const options = Object.entries(enumObj)?.map(([, value]) => ({
        value: value,
        label: norrisCats[value as keyof typeof norrisCats]?.[language]
          ? norrisCats[value as keyof typeof norrisCats]?.[language]
          : value.charAt(0).toUpperCase() + value.slice(1),
      })) as SelectOption[]
      if (any)
        options.unshift({
          value: 'any',
          label: norrisCats.any[language] ?? t('Any'),
        })
      return options
    },
    [language] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const fetchNorrisCategories = useCallback(async () => {
    const norrisCat = (await norrisService.getNorrisCategories()) ?? []
    const norrisCatOptions = optionsNorris(norrisCat, true)
    const filteredNorrisCategories = isCheckedSafemode
      ? norrisCatOptions.filter(
          (category) =>
            category.value !== 'explicit' &&
            category.value !== 'religion' &&
            category.value !== 'political'
        )
      : norrisCatOptions

    if (isCheckedSafemode) setSelectedNorrisCategory(norrisCatOptions[0])
    setNorrisCategories(filteredNorrisCategories)
  }, [isCheckedSafemode, optionsNorris])

  const getCategoryInLanguage = (
    category: ECategories | null,
    language: ELanguages
  ): string => {
    const categoryMapping: IJokeCategoryByLanguage = {
      en: ECategory_en,
      es: ECategory_es,
      fr: ECategory_fr,
      de: ECategory_de,
      pt: ECategory_pt,
      cs: ECategory_cs,
      fi: ECategory_fi,
    }
    let modifiedCategory = category

    if (category === ECategories.ChuckNorris) {
      modifiedCategory = 'ChuckNorris' as ECategories
    }
    if (category === ECategories.DadJoke) {
      modifiedCategory = 'DadJoke' as ECategories
    }

    return categoryMapping[language as keyof typeof categoryMapping][
      modifiedCategory as keyof (typeof categoryMapping)[typeof language]
    ]
  }

  useEffect(() => {
    void fetchNorrisCategories()
  }, [fetchNorrisCategories])

  const queryKey = useMemo(
    () =>
      queryValue.trim() === '' || queryValue === '&'
        ? EQueryKey.None
        : EQueryKey.Contains,
    [queryValue]
  )

  useEffect(() => {
    if (queryValue === '&') {
      setQueryValue('')
    }
  }, [queryValue])

  const navigate = useNavigate()

  const navigateToLogin = () => {
    navigate('?login=true')
  }

  const handleBlacklistUpdate = async (
    jokeId: IJoke['jokeId'],
    language: ELanguages,
    value: string | undefined
  ) => {
    if (!user) {
      void dispatch(notify(t('PleaseLogin'), true, 5))
      navigateToLogin()
      return
    } else if (
      await confirm({ message: `${t('AreYouSureYouWantToHideThisJoke')}` })
    ) {
      const isAlreadyBlacklisted = user?.blacklistedJokes?.some(
        (blacklistedJoke: IBlacklistedJoke) =>
          blacklistedJoke.jokeId === jokeId &&
          blacklistedJoke.language === language
      )
      if (isAlreadyBlacklisted) {
        void dispatch(notify(t('ThisJokeIsAlreadyBlacklisted'), true, 3))
        void dispatch(findUserById(user?._id ?? '')).then(
          () => void dispatch(initializeUser())
        )
        setJoke('')
        setDelivery('')
        setAuthor('')
        setJokeId('')
        return
      } else if (user) {
        //delete joke from user's array if it is there
        await dispatch(getJokesByUserId(user?._id))
          .then((data) => {
            const joke = data?.find(
              (joke: IJoke) =>
                joke.jokeId?.toString() === jokeId?.toString() &&
                joke.language === language
            )
            if (joke) {
              void dispatch(removeJoke(joke?._id)).then(
                () => void dispatch(initializeJokes())
              )
            }
          })
          .then(() => {
            void dispatch(
              addToBlacklistedJokes(user?._id ?? '', jokeId, language, value)
            )
              .then(() => {
                void dispatch(notify(`${t('JokeHidden')}`, false, 3))
                void dispatch(initializeJokes())
                  .then(() => dispatch(findUserById(user?._id ?? '')))
                  .then(() => dispatch(initializeUser()))
                  .then(() => {
                    setJoke('')
                    setDelivery('')
                    setAuthor('')
                    setJokeId('')
                  })
              })
              .catch((err: unknown) => {
                const message = getErrorMessage(err, t('ErrorDeletingJoke'))
                void dispatch(notify(`${t('Error')}*: ${message}`, true, 8))

                setJoke('')
                setDelivery('')
                setAuthor('')
                setJokeId('')
              })
          })
      }
    }
  }

  const handleRemoveJokeFromBlacklisted = async (
    e: React.FormEvent<HTMLFormElement>,
    joke: IJoke,
    bjoke_id: IBlacklistedJoke['_id']
  ) => {
    e.preventDefault()
    void dispatch(saveMostRecentJoke(joke))
    setSending(true)
    if (
      await confirm({ message: `${t('AreYouSureYouWantToRestoreThisJoke')}` })
    ) {
      if (user) {
        await dispatch(
          removeJokeFromBlacklisted(user._id, bjoke_id, joke?.language)
        )
          .then(() => {
            void dispatch(initializeJokes())
              .then(async () => await dispatch(findUserById(user._id ?? '')))
              .then(() => void dispatch(initializeUser()))
              .then(
                () => void dispatch(notify(`${t('JokeRestored')}`, false, 3))
              )
          })
          .catch((err: unknown) => {
            const message = getErrorMessage(err, t('ErrorDeletingJoke'))
            void dispatch(notify(message, true, 8))
          })
        setSending(false)
      } else {
        void dispatch(notify(`${t('ErrorDeletingJoke')}`, false, 3))
        setSending(false)
      }
    }
    void setTimeout(() => {
      void (async () => {
        if (await confirm({ message: `${t('WouldYouLikeToSaveTheJoke')}` })) {
          if (user) {
            void handleJokeSave(e)
            void dispatch(initializeJokes())
            await dispatch(findUserById(user._id ?? ''))
              .then(() => void dispatch(initializeUser()))
              .then(() => void dispatch(notify(`${t('SavedJoke')}`, false, 8)))
              .catch((err: unknown) => {
                const message = getErrorMessage(err, t('ErrorDeletingJoke'))
                void dispatch(notify(message, true, 8))
              })
            setSending(false)
          } else {
            void dispatch(notify(`${t('ErrorDeletingJoke')}`, false, 3))
            setSending(false)
          }
        }
      })()
    }, 600)
  }

  const fill1 = lightTheme
    ? 'hsl(var(--hue-tertiary), var(--sat-fade), 80%)'
    : 'hsl(var(--hue-tertiary), var(--sat-fade), 12%)'

  const fill2 = lightTheme
    ? 'hsl(var(--hue-secondary), var(--sat), 88%)'
    : 'hsl(var(--hue-secondary), 100%, 4%)'

  return (
    <>
      <section
        className={`joke-container jokeform card ${language}`}
        id="jokeform"
      >
        <div>
          <div className="jokes-wrap">
            <h1
              style={{
                display: 'flex',
                flexFlow: windowWidth < 600 ? 'column nowrap' : 'row nowrap',
                alignItems: windowWidth < 600 ? 'center' : 'flex-end',
                justifyContent: 'center',
                gap: '0',
                color: lightTheme
                  ? 'hsl(var(--hue-tertiary), var(--sat-fade), 15%)'
                  : 'hsl(var(--hue-tertiary), var(--sat-fade), 70%)',
              }}
            >
              <p style={{ width: '1.4em', margin: 0 }}>
                <JokeIcon
                  aria-hidden="true"
                  stroke="currentColor"
                  strokeWidth={lightTheme ? 0.66 : 0.3}
                  fontSize={1.28}
                  flip={true}
                  hatStyle={{
                    fill: fill1,
                  }}
                />
              </p>
              <span
                style={{
                  fontSize: '0.9em',
                  zIndex: 2,
                  flex: '0 1 max-content',
                  borderRadius: '0.2em',
                }}
              >
                {t('TheComediansCompanion')}
              </span>
              <p
                style={{
                  width: '1.4em',
                  margin: '0 0.11em 0 -0.11em',
                }}
              >
                <JokeIcon
                  aria-hidden="true"
                  stroke="currentColor"
                  strokeWidth={lightTheme ? 0.66 : 0.3}
                  fontSize={1}
                  hatStyle={{
                    fill: fill2,
                  }}
                />
              </p>
            </h1>
            <p className="center textcenter mb3">
              <big>{t('AJokeGeneratorForTheComicallyInclined')}</big>
            </p>

            <FormJoke
              sending={sending}
              handleFormSubmit={handleFormSubmit}
              queryInputRef={queryInputRef}
              jokeLanguage={jokeLanguage}
              setJokeLanguage={setJokeLanguage}
              jokeCategory={jokeCategory}
              setJokeCategory={setJokeCategory}
              categoryValues={categoryValues}
              setCategoryValues={setCategoryValues}
              setQueryValue={setQueryValue}
              joke={joke}
              delivery={delivery}
              jokeId={jokeId}
              author={author}
              options={options}
              getKeyByValue={getKeyByValue}
              query={query}
              setQuery={setQuery}
              isCheckedSafemode={isCheckedSafemode}
              isCheckedJokeType={isCheckedJokeType}
              handleToggleChangeSafemode={handleToggleChangeSafemode}
              handleToggleChangeEJokeType={handleToggleChangeEJokeType}
              submitted={submitted}
              reveal={reveal}
              setReveal={setReveal}
              handleJokeSave={handleJokeSave}
              optionsCategory={optionsCategory}
              categoryByLanguages={derivedCategoryByLanguages}
              visibleJoke={visibleJoke}
              setVisibleJoke={setVisibleJoke}
              norrisCategories={norrisCategories}
              selectedNorrisCategory={selectedNorrisCategory}
              setSelectedNorrisCategory={setSelectedNorrisCategory}
              hasNorris={hasNorris}
              getCategoryInLanguage={getCategoryInLanguage}
              subCategoryResults={subCategoryResults}
              handleBlacklistUpdate={handleBlacklistUpdate}
            />
          </div>
        </div>
      </section>

      <section className={`joke-container ${language}`}>
        <div>
          {user && (
            <JokeSubmit
              userId={user?._id}
              categoryByLanguages={derivedCategoryByLanguages}
              getKeyByValue={getKeyByValue}
              options={options}
              optionsCategory={optionsCategory}
              jokeCategoryByLanguage={jokeCategoryByLanguage}
              norrisCategories={norrisCategories}
            />
          )}
        </div>
      </section>

      <section className={`joke-container card ${language}`}>
        <div>
          <UserJokes
            sending={sending}
            user={user}
            handleDelete={handleDelete}
            isCheckedSafemode={isCheckedSafemode}
            setIsCheckedSafemode={setIsCheckedSafemode}
            handleToggleChangeSafemode={handleToggleChangeSafemode}
            translateWordLanguage={translateWordLanguage}
            options={options}
            optionsSortBy={optionsSortBy}
            norrisCategories={norrisCategories}
            getCategoryInLanguage={getCategoryInLanguage}
            handleUpdate={handleUpdate}
            editId={editId}
            setEditId={setEditId}
            handleRemoveJokeFromBlacklisted={handleRemoveJokeFromBlacklisted}
            handleBlacklistUpdate={handleBlacklistUpdate}
          />
        </div>
      </section>
    </>
  )
}

export default Jokes
