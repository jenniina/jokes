import React, { LegacyRef, RefObject } from 'react'
//import Joke from './Joke'
import { Select } from '../../Select/Select'
import { SelectOption } from '../../Select/Select'
import ButtonToggle from '../../ButtonToggle/ButtonToggle'
import {
  EJokeType,
  ESafemode,
  ECategories,
  TCategoryByLanguages,
  IJoke,
} from '../types'
import { ELanguages, ELanguagesLong } from '../../../types'
import { FaAnglesDown } from 'react-icons/fa6'
import { useLanguageContext } from '../../../contexts/LanguageContext'
import Joke from './Joke'

interface Props {
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  queryInputRef: LegacyRef<HTMLInputElement> | undefined
  jokeLanguage: ELanguages
  setJokeLanguage: (jokeLanguage: ELanguages) => void
  jokeCategory: ECategories | null
  setJokeCategory: (jokeCategory: ECategories | null) => void
  setQueryValue: (queryValue: string) => void
  optionsCategory: (enumObj: TCategoryByLanguages) => SelectOption[]
  setQuery: (query: string) => void
  categoryByLanguages: TCategoryByLanguages
  categoryValues: SelectOption[]
  setCategoryValues: (categoryValues: SelectOption[]) => void
  query: string
  joke: string
  delivery?: string
  jokeId: IJoke['jokeId']
  author: string
  submitted: boolean
  reveal: boolean
  setReveal: (reveal: boolean) => void
  isCheckedSafemode: boolean
  isCheckedJokeType: boolean
  visibleJoke: boolean
  setVisibleJoke: (visibleJoke: boolean) => void
  handleToggleChangeSafemode: () => void
  handleToggleChangeEJokeType: () => void
  handleJokeSave: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  options: (enumObj: typeof ELanguagesLong) => SelectOption[]
  getKeyByValue: (
    enumObj:
      | typeof ECategories
      | typeof EJokeType
      | typeof ESafemode
      | typeof ELanguages,
    value: ECategories | EJokeType | ESafemode | ELanguages
  ) => undefined | SelectOption['label']
  norrisCategories: SelectOption[]
  selectedNorrisCategory: SelectOption | undefined
  setSelectedNorrisCategory: (
    selectedNorrisCategory: SelectOption | undefined
  ) => void
  hasNorris: boolean
  getCategoryInLanguage: (
    category: ECategories | null,
    language: ELanguages
  ) => string | undefined
  subCategoryResults: string[]
  handleBlacklistUpdate: (
    jokeId: IJoke['jokeId'],
    language: ELanguages,
    value: string | undefined
  ) => Promise<void>
  sending: boolean
}
const Form = ({
  handleFormSubmit,
  queryInputRef,
  jokeLanguage,
  setJokeLanguage,
  jokeCategory,
  categoryValues,
  setCategoryValues,
  setJokeCategory,
  setQueryValue,
  setQuery,
  joke,
  query,
  delivery,
  jokeId,
  author,
  options,
  submitted,
  isCheckedSafemode,
  isCheckedJokeType,
  handleToggleChangeSafemode,
  handleToggleChangeEJokeType,
  reveal,
  setReveal,
  handleJokeSave,
  optionsCategory,
  categoryByLanguages,
  visibleJoke,
  setVisibleJoke,
  norrisCategories,
  selectedNorrisCategory,
  setSelectedNorrisCategory,
  hasNorris,
  getCategoryInLanguage,
  subCategoryResults,
  handleBlacklistUpdate,
  sending,
}: Props) => {
  const { t, language: uiLanguage } = useLanguageContext()

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setVisibleJoke(false)
          setTimeout(() => {
            handleFormSubmit(e)
          }, 400)
        }}
        className="joke"
      >
        <div className="controls-wrap">
          <Select
            language={uiLanguage}
            id="language-joke"
            className="language full"
            z={4}
            instructions={`${t('SelectALanguage')}:`}
            options={options(ELanguagesLong)}
            value={
              jokeLanguage
                ? ({
                    value: jokeLanguage,
                    label: ELanguagesLong[jokeLanguage],
                  } as SelectOption)
                : undefined
            }
            onChange={(o) => {
              setJokeLanguage(o?.value as ELanguages)
              setJokeCategory(ECategories.Misc)
            }}
          />

          <div className="toggle-wrap">
            <ButtonToggle
              isChecked={isCheckedSafemode}
              name="safemode"
              id="safemode"
              className={`${uiLanguage} ${
                !isCheckedSafemode ? 'unsafe' : ''
              } safemode`}
              label={`${t('SafemodeTitle')}: `}
              on={t('SafeTitle')}
              off={t('UnsafeTitle')}
              onChange={handleToggleChangeSafemode}
            />

            <ButtonToggle
              isChecked={isCheckedJokeType}
              name="joketype"
              id="joketype"
              className={`${uiLanguage} joketype`}
              label={`${t('JokeTypeTitle')}: `}
              on={t('TwoPart')}
              off={t('Single')}
              onChange={handleToggleChangeEJokeType}
              equal={true}
            />
          </div>
        </div>

        {categoryByLanguages ? (
          <Select
            language={uiLanguage}
            multiple
            id="jokeCategory"
            className={`category`}
            z={3}
            instructions={`${t('SelectACategory')}:`}
            selectAnOption={t('Any')}
            value={categoryValues}
            options={optionsCategory(categoryByLanguages)}
            onChange={(o: SelectOption[]) => {
              setCategoryValues(o)
            }}
          />
        ) : (
          ''
        )}

        <Select
          language={uiLanguage}
          id="jokeCategoryNorrisCategories"
          className={`category extras ${hasNorris ? '' : 'hidden'}`}
          z={2}
          instructions={`${t('ChuckNorrisCategory')}:`}
          selectAnOption={t('Any')}
          value={selectedNorrisCategory}
          options={norrisCategories}
          onChange={(o) => {
            setSelectedNorrisCategory(o)
          }}
        />

        <div className="flex column center">
          <div className="input-wrap">
            <label htmlFor="queryValue">
              <input
                ref={queryInputRef}
                type="text"
                id="queryValue"
                name="queryValue"
                value={query}
                onChange={(e) => {
                  setQuery((e.target as HTMLInputElement).value)
                  setQueryValue(
                    encodeURIComponent((e.target as HTMLInputElement).value) +
                      '&'
                  )
                }}
              />
              <span>{t('SearchByKeyword')}</span>
            </label>
          </div>

          <button id="generate-joke" type="submit" disabled={sending}>
            {t('FindAJoke')}
          </button>
        </div>
      </form>

      <div className={`downwards-arrow ${submitted ? 'play' : ''}`}>
        <FaAnglesDown />
      </div>
      <Joke
        sending={sending}
        joke={joke}
        delivery={delivery}
        author={author}
        jokeId={jokeId}
        jokeLanguage={jokeLanguage}
        reveal={reveal}
        jokeCategory={jokeCategory}
        setReveal={setReveal}
        handleJokeSave={handleJokeSave}
        visibleJoke={visibleJoke}
        getCategoryInLanguage={getCategoryInLanguage}
        subCategoryResults={subCategoryResults}
        handleBlacklistUpdate={handleBlacklistUpdate}
      />
    </>
  )
}

export default Form
