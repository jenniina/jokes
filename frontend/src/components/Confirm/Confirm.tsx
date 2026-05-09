import React from 'react'
import styles from './css/confirm.module.css'
import { useLanguageContext } from '../../contexts/LanguageContext'
import Icon from '../Icon/Icon'

interface ConfirmProps {
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

const Confirm: React.FC<ConfirmProps> = ({
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguageContext()
  return (
    <aside
      id={styles.confirm}
      className={styles.confirm}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-message"
    >
      <div className={styles.content}>
        <p className={styles.message} id="confirm-message">
          {message}
        </p>
        <div className={styles.buttons}>
          <button className={styles['confirm-btn']} onClick={onConfirm}>
            {confirmText ?? t('Confirm')}&nbsp;&nbsp;
            <Icon lib="io" name="IoMdCheckmarkCircleOutline" />
          </button>
          <button className={styles['cancel-btn']} onClick={onCancel}>
            {cancelText ?? t('Cancel')}&nbsp;&nbsp;
            <Icon lib="cg" name="CgUndo" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Confirm
