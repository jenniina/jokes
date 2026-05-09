import { useSelector } from 'react-redux'
import { ReducerProps } from '../../types'
import { useEffect, useState } from 'react'
import { useLanguageContext } from '../../contexts/LanguageContext'

const Notification = () => {
  const { t } = useLanguageContext()

  const notification = useSelector(
    (state: ReducerProps) => state.notification ?? null
  )
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClosed(false)
  }, [notification])

  if (notification === null || closed) {
    return null
  }

  return (
    <div
      className={`notification ${notification.isError ? 'error' : ''}`}
      aria-live="assertive"
    >
      <p>
        {notification.message}{' '}
        <button
          type="button"
          className="close"
          onClick={() => {
            setClosed(true)
          }}
        >
          <span>{t('Close')}</span>
          <span aria-hidden="true" className="times">
            &times;
          </span>
        </button>
      </p>
    </div>
  )
}

export default Notification
