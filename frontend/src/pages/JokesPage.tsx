import { SyntheticEvent } from 'react'
import {
  jokeCategoryByLanguage,
  jokeCategoryAny,
} from '../components/Jokes/types'
import Accordion from '../components/Accordion/Accordion'
import Icon from '../components/Icon/Icon'
import {
  breakpointSmall,
  ELanguages,
  ELanguagesLong,
  LanguageOfLanguage,
} from '../types'
import { Select, SelectOption } from '../components/Select/Select'
import { options } from '../utils'
import { useLanguageContext } from '../contexts/LanguageContext'
import Jokes from '../components/Jokes/Jokes'
import SEO from '../components/SEO/SEO'
import useWindowSize from '../hooks/useWindowSize'

export default function JokesPage({ type }: { type: string }) {
  const { t, language } = useLanguageContext()
  const { windowWidth } = useWindowSize()

  return (
    <>
      <SEO
        title={`${t('Jokes')} | ${t('TheComediansCompanion')}`}
        description={t('AJokeGeneratorForTheComicallyInclined')}
        canonicalUrl="https://jokes.jenniina.fi"
        ogTitle={`${t('Jokes')} | jokes.jenniina.fi`}
      />
      <div
        className={`${type} ${language}`}
        style={
          windowWidth < breakpointSmall
            ? { marginTop: '7em' }
            : { marginTop: '5em' }
        }
      >
        <Jokes />
      </div>
    </>
  )
}
