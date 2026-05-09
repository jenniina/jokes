import { useState, useEffect, FC, useCallback } from 'react'
import styles from './scrolltotop.module.css'
import Icon from '../Icon/Icon'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useIsClient, useWindow } from '../../hooks/useSSR'

const ScrollToTop: FC = () => {
  const isClient = useIsClient()
  const windowObj = useWindow()

  const { t } = useLanguageContext()
  const [showTopBtn, setShowTopBtn] = useState(false)

  const scrollY = useCallback(() => {
    if (!isClient || !windowObj) return
    if (windowObj.scrollY > 500) {
      setShowTopBtn(true)
    } else {
      setShowTopBtn(false)
    }
  }, [isClient, windowObj])

  useEffect(() => {
    if (!isClient || !windowObj) return
    windowObj.addEventListener('scroll', scrollY)
    return () => {
      windowObj.removeEventListener('scroll', scrollY)
    }
  }, [isClient, windowObj, scrollY])

  const goToTop = () => {
    if (!isClient || !windowObj) return
    windowObj.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      id="to-top-btn"
      className={`to-top-btn ${styles['to-top-btn']} ${
        showTopBtn ? styles.show : ''
      }`}
      onClick={goToTop}
    >
      <Icon lib="bi" name="BiChevronsUp" className={styles.icon} />
      <span className="scr">{t('ScrollToTheTop')}</span>
    </button>
  )
}

export default ScrollToTop
