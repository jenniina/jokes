import { useSelector } from 'react-redux'
import { ReducerProps } from '../../types'
import { useState } from 'react'
import { useLanguageContext } from '../../contexts/LanguageContext'

const Notification = () => {
  const { t } = useLanguageContext()

  const notification = useSelector(
    (state: ReducerProps) => state.notification ?? null
  )
  const notificationKey = notification
    ? `${notification.message}-${notification.isError}`
    : null
  const [dismissedNotificationKey, setDismissedNotificationKey] = useState<
    string | null
  >(null)
  const closed =
    notificationKey !== null && dismissedNotificationKey === notificationKey

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
            setDismissedNotificationKey(notificationKey)
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
