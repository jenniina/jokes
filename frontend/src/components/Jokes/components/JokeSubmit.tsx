import {
  EJokeType,
  IJokeCategoryByLanguage,
  ECategory_en,
  FlagsLanguage,
  TCategoryByLanguages,
  IJoke,
  ECategories,
  EJokeDelivery,
  EJokeSetup,
} from '../types'
import { ELanguages, ELanguagesLong, IUser } from '../../../types'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import ButtonToggle from '../../ButtonToggle/ButtonToggle'
import Accordion from '../../Accordion/Accordion'
import { Select, SelectOption } from '../../Select/Select'
import { createJoke, initializeJokes } from '../reducers/jokeReducer'
import axios, { AxiosError } from 'axios'
import { getErrorMessage } from '../../../utils'
import { notify } from '../../../reducers/notificationReducer'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { v4 as uuidv4 } from 'uuid'
import { initializeUser } from '../../../reducers/authReducer'
import { findUserById } from '../../../reducers/usersReducer'
import { useLanguageContext } from '../../../contexts/LanguageContext'
import { IJokeResponse } from '../types'

interface Props {
  userId: IUser['_id']
  optionsCategory: (enumObj: TCategoryByLanguages) => SelectOption[]
  categoryByLanguages: TCategoryByLanguages
  jokeCategoryByLanguage: IJokeCategoryByLanguage
  options: (enumObj: typeof ELanguagesLong) => SelectOption[]
  getKeyByValue: (
    enumObj: typeof ELanguages,
    value: ELanguages
  ) => undefined | SelectOption['label']
  norrisCategories: SelectOption[]
}
const JokeSubmit = ({
  userId,
  optionsCategory,
  categoryByLanguages,
  jokeCategoryByLanguage,
  options,
  norrisCategories,
}: Props) => {
  const { t, language } = useLanguageContext()

  const coerceToECategories = (v: unknown): ECategories => {
    if (
      typeof v === 'string' &&
      Object.values(ECategories).includes(v as ECategories)
    )
      return v as ECategories
    if (typeof v === 'number') {
      const s = String(v)
      if (Object.values(ECategories).includes(s as ECategories))
        return s as ECategories
    }
    return ECategories.Misc
  }

  const coerceToELanguages = (v: unknown): ELanguages => {
    if (
      typeof v === 'string' &&
      Object.values(ELanguages).includes(v as ELanguages)
    )
      return v as ELanguages
    if (typeof v === 'number') {
      const s = String(v)
      if (Object.values(ELanguages).includes(s as ELanguages))
        return s as ELanguages
    }
    return ELanguages.en
  }

  const [languageSubmit, setLanguageSubmit] = useState<ELanguages>(
    ELanguages[language]
  )
  const [jokeType, setJokeType] = useState<EJokeType>(EJokeType.single)
  const [setupTitle, setSetupTitle] = useState<EJokeSetup>(EJokeSetup.en)
  const [deliveryTitle, setDeliveryTitle] = useState<EJokeDelivery>(
    EJokeDelivery.en
  )
  const [joke, setJoke] = useState<string>('')
  const [setup, setSetup] = useState<string>('')
  const [delivery, setDelivery] = useState<string>('')
  const [isCheckedJokeType, setIsCheckedJokeType] = useState(true)
  const [isCheckedPrivate, setIsCheckedPublic] = useState(true)
  const [isCheckedAnonymous, setIsCheckedAnonymous] = useState(false)
  const [jokeCategory, setJokeCategory] = useState<SelectOption | undefined>({
    label: jokeCategoryByLanguage[language].Misc,
    value: ECategory_en.Misc,
  } as SelectOption)
  const selectAnOption = t('SelectAnOption')
  const [selectedCategory, setSelectedCategory] = useState<ECategories | ''>('')
  const [selectedNorrisCategory, setSelectedNorrisCategory] = useState<
    SelectOption | undefined
  >(norrisCategories[0])
  const [hasNorris, setHasNorris] = useState(false)
  const [saving, setSaving] = useState(false)

  const norrisExists = useCallback(() => {
    if (selectedCategory === ECategories.ChuckNorris) {
      setHasNorris(true)
    } else {
      setHasNorris(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    norrisExists()
  }, [selectedCategory, norrisExists])

  const dispatch = useAppDispatch()

  const handleNewJokeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const isAnyFlagChecked =
      !!formData.get('nsfw') ||
      !!formData.get('religious') ||
      !!formData.get('political') ||
      !!formData.get('racist') ||
      !!formData.get('sexist') ||
      !!formData.get('explicit')

    let jokeObject: Partial<IJoke> = {}

    jokeObject = {
      jokeId: uuidv4(),
      category: coerceToECategories(jokeCategory?.value),
      subCategories: (() => {
        const isChuckNorris =
          jokeCategory?.label === jokeCategoryByLanguage[language].ChuckNorris
        return isChuckNorris && selectedNorrisCategory?.value
          ? [String(selectedNorrisCategory.value)]
          : undefined
      })(),
      language: languageSubmit,
      type: EJokeType.single,
      user: [userId],
      private: isCheckedPrivate,
      verified: !isCheckedPrivate ? false : true,
      anonymous: isCheckedAnonymous,
      author: userId,
      safe:
        jokeCategory?.value === ECategory_en.Dark || isAnyFlagChecked
          ? false
          : true,
      flags: {
        nsfw: !!formData.get('nsfw'),
        religious: !!formData.get('religious'),
        political: !!formData.get('political'),
        racist: !!formData.get('racist'),
        sexist: !!formData.get('sexist'),
        explicit: !!formData.get('explicit'),
      },
    }

    if (jokeType === EJokeType.single) {
      jokeObject = {
        ...jokeObject,
        joke,
        type: EJokeType.single,
      } as IJoke
    } else {
      jokeObject = {
        ...jokeObject,
        setup,
        delivery,
        type: EJokeType.twopart,
      } as IJoke
    }

    void dispatch(createJoke(jokeObject as IJoke))
      .then((r: IJokeResponse) => {
        if (userId)
          void dispatch(findUserById(userId))
            .then(() => dispatch(initializeUser()))
            .then(() => {
              void dispatch(initializeJokes())
              setJoke('')
              setSetup('')
              setDelivery('')
              setSaving(false)
            })
        void dispatch(notify(`${t('SavedJoke')}. ${r.message ?? ''}`, false, 8))
      })
      .catch((errorUnknown: unknown) => {
        console.error(errorUnknown)
        setSaving(false)
        if (axios.isAxiosError(errorUnknown)) {
          const e = errorUnknown as AxiosError<{ message?: string }>
          const message = getErrorMessage(e, t('Error'))
          if (e.code === 'ERR_BAD_RESPONSE') {
            void dispatch(
              notify(
                `${t('Error')}: ${message}. ${t('ReportErrorToAdmin')}`,
                true,
                8
              )
            )
          } else {
            void dispatch(notify(message, true, 8))
          }
        } else {
          const message = getErrorMessage(errorUnknown, t('ReportErrorToAdmin'))
          void dispatch(notify(`${t('Error')}: ${message}`, true, 8))
        }
      })
  }

  const isCheckedJoketypeCallback = useCallback(() => {
    if (isCheckedJokeType) {
      setJokeType(EJokeType.twopart)
    } else {
      setJokeType(EJokeType.single)
    }
  }, [isCheckedJokeType])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    isCheckedJoketypeCallback()
  }, [isCheckedJokeType, isCheckedJoketypeCallback])

  const handleToggleChangeJokeType = () => {
    setIsCheckedJokeType(!isCheckedJokeType)
  }

  const handleToggleChangePublic = () => {
    setIsCheckedPublic(!isCheckedPrivate)
  }

  const handleToggleChangeAnonymous = () => {
    setIsCheckedAnonymous(!isCheckedAnonymous)
  }

  const setupTitles = useCallback(() => {
    setSetupTitle(EJokeSetup[language])
    setDeliveryTitle(EJokeDelivery[language])
  }, [language])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setupTitles()
  }, [language, setupTitles])

  return (
    <Accordion
      text={t('ClickHereToWriteYourOwnJoke')}
      className="submit"
      wrapperClass="submit-wrap"
    >
      <div className="submit-inner">
        <h2>{t('SubmitAJoke')}</h2>
        <p className="textcenter">{t('SubmitAJokeTo')} jokes.jenniina.fi</p>
        <p className="textcenter mb3">
          {t('IfTheJokeIsNotPrivateVerificationIsNeeded')}
        </p>
        <form onSubmit={handleNewJokeSubmit} className="form-submit-new">
          <div className="toggle-wrap">
            <ButtonToggle
              isChecked={isCheckedJokeType}
              name="submit-joketype"
              id="submit-joketype"
              hideLabel={false}
              label={`${t('JokeTypeTitle')}: `}
              className={`${language} submit joketype`}
              on={t('TwoPart')}
              off={t('Single')}
              onChange={handleToggleChangeJokeType}
              equal={true}
            />
            <ButtonToggle
              isChecked={isCheckedPrivate}
              name="submit-private"
              id="submit-private"
              hideLabel={false}
              label={`${t('Privacy')}: `}
              className={`${language} submit private`}
              on={t('Private')}
              off={t('Public')}
              onChange={handleToggleChangePublic}
              equal={false}
            />
            <ButtonToggle
              isChecked={isCheckedAnonymous}
              name="submit-anonymous"
              id="submit-anonymous"
              hideLabel={false}
              label={`${t('PublishWithNickname')}: `}
              className={`${language} submit anonymous`}
              on={t('Anonymous')}
              off={t('Nickname')}
              onChange={handleToggleChangeAnonymous}
              equal={false}
            />
          </div>

          {jokeType === EJokeType.single ? (
            <label htmlFor="submit-joke-single-input" className="textarea-wrap">
              <span>{t('Joke')}</span>
              <textarea
                name="joke"
                id="submit-joke-single-input"
                required
                rows={5}
                value={joke}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setJoke(e.target.value)
                }}
              />
            </label>
          ) : (
            <>
              <div className="textarea-wrap">
                <label htmlFor="submit-setup-input">
                  <span>{setupTitle}</span>
                  <textarea
                    id="submit-setup-input"
                    name="setup"
                    required
                    rows={3}
                    value={setup}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                      setSetup(e.target.value)
                    }}
                  />
                </label>
              </div>
              <div className="textarea-wrap">
                <label htmlFor="submit-delivery-input">
                  <span>{deliveryTitle}</span>
                  <textarea
                    id="submit-delivery-input"
                    name="delivery"
                    value={delivery}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                      setDelivery(e.target.value)
                    }}
                    required
                    rows={3}
                  />
                </label>
              </div>
            </>
          )}

          {categoryByLanguages ? (
            <>
              <Select
                language={language}
                id="submit-category-select"
                className="submit"
                z={4}
                instructions={`${t('CategoryTitle')}:`}
                selectAnOption={selectAnOption}
                value={jokeCategory}
                options={optionsCategory(categoryByLanguages)}
                onChange={(o: SelectOption | undefined) => {
                  setJokeCategory(o)
                  setSelectedCategory(coerceToECategories(o?.value))
                }}
              />
              <Select
                language={language}
                id="jokeCategoryNorrisCategories-submit"
                className={`category extras narrow ${
                  hasNorris ? '' : 'hidden'
                }`}
                z={3}
                instructions={`Chuck Norris Category:`}
                selectAnOption={t('Any')}
                value={selectedNorrisCategory}
                options={norrisCategories}
                onChange={(o) => {
                  setSelectedNorrisCategory(o)
                }}
              />
            </>
          ) : (
            ''
          )}
          <Select
            language={language}
            id="submit-language"
            className="submit narrow"
            z={2}
            instructions={`${t('JokeLanguage')}:`}
            options={options(ELanguagesLong)}
            value={
              language
                ? ({
                    value: ELanguages[languageSubmit],
                    label: ELanguagesLong[languageSubmit],
                  } as SelectOption)
                : undefined
            }
            onChange={(o) => {
              setLanguageSubmit(coerceToELanguages(o?.value))
            }}
          />

          <fieldset>
            <legend>{t('AddWarningTitle')}</legend>

            <div className="checkbox-wrap">
              <div>
                <input
                  type="checkbox"
                  id="flag-nsfw"
                  name="nsfw"
                  value="nsfw"
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
                />
                <label htmlFor="flag-religious">
                  {FlagsLanguage[language].religious}
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="flag-political"
                  name="political"
                  value="political"
                />
                <label htmlFor="flag-political">
                  {FlagsLanguage[language].political}
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="flag-racist"
                  name="racist"
                  value="racist"
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
                />
                <label htmlFor="flag-explicit">
                  {FlagsLanguage[language].explicit}
                </label>
              </div>
            </div>
          </fieldset>
          <p>
            {isCheckedPrivate
              ? t('JokeIsSetToPrivateAndWillOnlyBeSeenByYouAndTheAdministrator')
              : t(
                  'JokeIsSetToPublicAndWillNeedVerificationFromAnAdministrator'
                )}
            <br />
            <br />
            {isCheckedAnonymous
              ? t('PublishAnonymously')
              : t('PublishWithNickname')}
          </p>
          <button
            type="submit"
            className="small"
            disabled={saving}
            id="submit-new-joke"
          >
            {saving ? t('Saving') : isCheckedPrivate ? t('Publish') : t('Send')}
          </button>
        </form>
      </div>
    </Accordion>
  )
}

export default JokeSubmit
