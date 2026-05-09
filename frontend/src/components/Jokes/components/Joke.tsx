import React from 'react'
import { ELanguages } from '../../../types'
import { ECategories, IJoke } from '../types'
import { useLanguageContext } from '../../../contexts/LanguageContext'

interface Props {
  joke: string
  delivery?: string
  author: string
  jokeCategory: ECategories | null
  reveal: boolean
  visibleJoke: boolean
  setReveal: (reveal: boolean) => void
  handleJokeSave: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  getCategoryInLanguage: (
    category: ECategories | null,
    language: ELanguages
  ) => string | undefined
  subCategoryResults: string[]
  jokeId: IJoke['jokeId']
  jokeLanguage: ELanguages
  handleBlacklistUpdate: (
    jokeId: IJoke['jokeId'],
    language: ELanguages,
    value: string | undefined
  ) => Promise<void>
  sending: boolean
}
const Joke = ({
  joke,
  delivery,
  author,
  jokeCategory,
  reveal,
  setReveal,
  handleJokeSave,
  sending,
  visibleJoke,
  getCategoryInLanguage,
  subCategoryResults,
  jokeId,
  jokeLanguage,
  handleBlacklistUpdate,
}: Props) => {
  const { t, language } = useLanguageContext()

  const hasDelivery = Boolean(delivery && delivery.trim().length > 0)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void handleJokeSave(e)
      }}
      id="joke-form"
      className={`joke-form-save ${joke && visibleJoke ? 'fadeIn' : ''}`}
    >
      <article
        aria-live="polite"
        className={`joke ${visibleJoke ? 'fadeIn' : ''}`}
      >
        <p
          className={`${visibleJoke ? 'fadeIn' : ''} ${
            !delivery ? 'no-delivery' : ''
          }`}
        >
          <small>
            {t('CategoryTitle')}:{' '}
            {getCategoryInLanguage(jokeCategory, language)}
          </small>
        </p>
        <p
          className={`${visibleJoke ? 'fadeIn' : ''} ${
            !delivery ? 'no-delivery' : ''
          }`}
        >
          {joke}
        </p>

        {hasDelivery ? (
          <button
            type="button"
            onClick={() => setReveal(!reveal)}
            className={`delivery has-delivery ${
              !reveal ? 'reveal' : ''
            } ${visibleJoke ? 'fadeIn' : ''}`}
          >
            <>
              <span
                {...(!reveal
                  ? { 'aria-hidden': true }
                  : { 'aria-hidden': false })}
              >
                {t('ClickToReveal')}
              </span>
              <p
                aria-live="assertive"
                className={`${visibleJoke ? 'fadeIn' : ''}`}
              >
                {!reveal ? delivery : ''}
              </p>
            </>
          </button>
        ) : (
          ''
        )}
        {author ? (
          <p className={`author ${visibleJoke ? 'fadeIn' : ''}`}>
            <small>
              {t('Author')}: {author}
            </small>
          </p>
        ) : (
          ''
        )}
        {subCategoryResults.length > 0 ? (
          <p className={`sub-categories ${visibleJoke ? 'fadeIn' : ''}`}>
            <small>
              {t('CategoryTitle')}:{' '}
              {subCategoryResults.map((category) => category).join(', ')}
            </small>
          </p>
        ) : (
          ''
        )}
      </article>
      {joke || delivery ? (
        <div className="save-delete-wrap">
          <button
            type="submit"
            disabled={sending}
            className={`submit ${visibleJoke ? 'fadeIn' : ''}`}
          >
            {t('SaveJoke')}
          </button>
          <button
            type="button"
            className={`delete danger narrow ${visibleJoke ? 'fadeIn' : ''}`}
            onClick={() =>
              void handleBlacklistUpdate(
                jokeId,
                jokeLanguage,
                jokeCategory === ECategories.ChuckNorris &&
                  language === ELanguages.en
                  ? joke
                  : undefined
              )
            }
          >
            {t('Block')}
          </button>
        </div>
      ) : (
        ''
      )}
    </form>
  )
}

export default Joke
