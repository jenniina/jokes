import { SyntheticEvent, useRef, useState } from 'react'
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
import { useOutsideClick } from '../hooks/useOutsideClick'

export default function JokesPage({ type }: { type: string }) {
  const { t, language } = useLanguageContext()
  const { windowWidth } = useWindowSize()

  const [openAccordion, setOpenAccordion] = useState(false)

  const clickOutsideRef = useRef<HTMLDivElement>(null)

  const closeAccordion = () => {
    if (openAccordion) {
      setOpenAccordion(false)
    }
  }

  useOutsideClick({
    ref: clickOutsideRef,
    onOutsideClick: closeAccordion,
  })

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
        <div className="flex column accordion-wrap" ref={clickOutsideRef}>
          <Accordion
            text={
              <Icon
                className={`info-icon ${openAccordion ? 'gray' : ''}`}
                lib="gr"
                name="GrCircleInformation"
                aria-hidden="true"
              />
            }
            className="info"
            wrapperClass="medium info-wrap"
            hideBrackets
            isOpen={openAccordion}
            setIsFormOpen={() => setOpenAccordion((prev) => !prev)}
            tooltip={t('Info')}
            x="left"
            y="below"
          >
            <div className="flex column gap-1 left">
              <p>{t('JokesAppIntro')}</p>
              <p>{t('JokesAppIntro2')}</p>
              <p className="mt2">
                {t('By')} <a href="https://jenniina.fi"> Jenniina </a>
              </p>
              <p>
                <a href="https://github.com/jenniina/jokes">GitHub</a>
              </p>
            </div>
          </Accordion>
        </div>
        <Jokes />
      </div>
    </>
  )
}
