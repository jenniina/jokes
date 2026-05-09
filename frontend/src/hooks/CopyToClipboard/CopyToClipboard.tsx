import { useCallback, useId, useState } from 'react'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { notify } from '../../reducers/notificationReducer'
import { useAppDispatch } from '../../hooks/useAppDispatch'

interface CopyToClipboardProps {
  value: string
  label: string
  ariaLabel?: string
  className?: string
}

async function copyTextToClipboard(text: string) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export default function CopyToClipboard({
  value,
  label,
  ariaLabel,
  className,
}: CopyToClipboardProps) {
  const { t } = useLanguageContext()
  const dispatch = useAppDispatch()

  const statusId = useId()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await copyTextToClipboard(value)
      setCopied(true)
      void dispatch(notify(t('CopiedToClipboard'), false, 3))
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // If copying fails (permissions, insecure context), notify
      void dispatch(notify(t('FailedToCopy'), true, 5))
    }
  }, [value, dispatch, t])

  return (
    <>
      <button
        type="button"
        className={`${className} tooltip-wrap reset`}
        onClick={() => void handleCopy()}
        aria-label={ariaLabel ?? t('CopyToClipboard')}
        aria-describedby={statusId}
      >
        <strong>{label}</strong>
        <span className="tooltip right below narrow2" role="tooltip">
          {ariaLabel ?? t('CopyToClipboard')}
        </span>{' '}
        <span id={statusId} className="scr" role="status" aria-live="polite">
          {copied ? t('CopiedToClipboard') : ''}
        </span>
      </button>
    </>
  )
}
