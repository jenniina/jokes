import { Link } from 'react-router-dom'
import styles from './css/info.module.css'

import { useLanguageContext } from '../../contexts/LanguageContext'
import SEO from '../../components/SEO/SEO'
import { useEffect } from 'react'
export default function Disclaimer({ type }: { type: string }) {
  const { t } = useLanguageContext()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEO
        title={`${t('PrivacyAndDataSecurityInformationForLoggedInUsers')} | colors.jenniina.fi`}
        description={t('PrivacyAndDataSecurityInformationForLoggedInUsers')}
        canonicalUrl={'https://colors.jenniina.fi/info'}
      />
      {/* Murupolku etusivulle */}
      <nav className="breadcrumbs">
        <Link to="/">{t('Home')}</Link> / <span>{t('Info')}</span>
      </nav>
      <div className={`disclaimer ${type} ${styles.disclaimer}`}>
        <div className="inner-wrap">
          <section>
            <div className="medium">
              <div className="mt1">
                <p>{t('ThisDisclaimerExplainsHowWeHandleYourPersonalData')}</p>
                <p>
                  {t(
                    'ByUsingOurServiceYouAgreeToTheTermsOutlinedInThisDisclaimer'
                  )}
                </p>
                <p>{t('Updated')}: 17.5.2026</p>
              </div>
              <div className="mt3">
                <h1>{t('Info')}</h1>
                <h2>{t('TheDataController')}</h2>
                <p>
                  {t('TheDataControllerIs')}{' '}
                  <a href="https://jenniina.fi">{t('Home')}</a>.
                </p>
                <h2>{t('DataCollectionAndStorage')}</h2>
                <p>{t('WeCollectAndStoreTheEmailAddress')}</p>
                <p>{t('YourPasswordIsSecurelyHashed')}</p>
                <p>{t('OtherPersonalDataIsNotCollected')}</p>
                <h2>{t('LegalBasisForProcessing')}</h2>
                <p>{t('WeProcessYourPersonalDataOnBasisOf')} </p>
                <ul>
                  <li>{t('ContractToProvideServices')}</li>
                </ul>
                <h2>{t('DataProtection')}</h2>
                <p>{t('WeUseIndustryStandardSecurityMeasures')}</p>
                <p>{t('AccessToYourDataIsRestricted')}</p>
                <h2>{t('UserResponsibilities')}</h2>
                <p>{t('PleaseChooseAStrongAndUniquePassword')}</p>
                <p>{t('DoNotShareYourPasswordWithAnyone')}</p>
                <h2>{t('YourRights')}</h2>
                <p>{t('YouHaveTheRightToAccessModifyOrDelete')}</p>
                <p>
                  {t('IfYouHaveAnyConcernsAboutYourDataSecurity')}:{' '}
                  <a href="https://react.jenniina.fi/contact">
                    {t('ContactForm')}
                  </a>
                </p>
                <h2>{t('ChangesToThisDisclaimer')}</h2>
                <p>{t('WeMayUpdateThisDisclaimerFromTimeToTime')}</p>
                <p>{t('ByUsingOurService')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
