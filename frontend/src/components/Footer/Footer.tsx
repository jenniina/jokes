import { FC } from 'react'
import { useLanguageContext } from '../../contexts/LanguageContext'

const Footer: FC = () => {
  const { t } = useLanguageContext()

  return (
    <footer id="main-footer" className="main-footer">
      <a className="footer1" href="https://jenniina.fi/">
        <span>Jenniina &copy; {new Date().getFullYear()}</span>
      </a>
      <span className="footer1">{t('TheComediansCompanion')}</span>
      <a className="footer1" href="https://react.jenniina.fi">
        {t('ReactApps')}
      </a>
    </footer>
  )
}
export default Footer
