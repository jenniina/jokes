import { useEffect, useRef, useCallback } from 'react'
import styles from './modal.module.css'
import { useModal } from '../../hooks/useModal'
import { useLanguageContext } from '../../contexts/LanguageContext'

const Modal = () => {
  const { modal, closeModal } = useModal()

  const { t } = useLanguageContext()

  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback((container: HTMLElement | null) => {
    if (!container) {
      return [] as HTMLElement[]
    }

    const focusableElements: HTMLElement[] = []
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (!(node instanceof HTMLElement)) {
            return NodeFilter.FILTER_SKIP
          }

          const tagName = node.tagName.toLowerCase()
          const isFocusableTag = [
            'button',
            'input',
            'select',
            'textarea',
          ].includes(tagName)
          const isFocusableLink = tagName === 'a' && node.hasAttribute('href')
          const hasTabIndex = node.hasAttribute('tabindex')
          const isDisabled = node.hasAttribute('disabled')
          const isHidden = node.getAttribute('aria-hidden') === 'true'

          return !isDisabled &&
            !isHidden &&
            (isFocusableTag || isFocusableLink || hasTabIndex)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP
        },
      }
    )

    let currentNode = walker.nextNode()
    while (currentNode) {
      if (currentNode instanceof HTMLElement && currentNode.tabIndex >= 0) {
        focusableElements.push(currentNode)
      }
      currentNode = walker.nextNode()
    }

    return focusableElements
  }, [])

  const handleClose = useCallback(() => {
    closeModal()
    if (previouslyFocusedElement.current)
      previouslyFocusedElement.current.focus()
    else document?.body.focus()
  }, [closeModal])

  useEffect(() => {
    if (modal) {
      previouslyFocusedElement.current = document?.activeElement as HTMLElement

      closeButtonRef.current?.focus()

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = getFocusableElements(
            modalContentRef.current
          )
          if (focusableElements.length === 0) {
            e.preventDefault()
            return
          }
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (e.shiftKey) {
            // Shift + Tab
            if (document?.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            }
          } else {
            // Tab
            if (document?.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        } else if (e.key === 'Escape') {
          handleClose()
        }
      }

      document?.addEventListener('keydown', handleKeyDown)

      return () => {
        document?.removeEventListener('keydown', handleKeyDown)
        if (previouslyFocusedElement.current)
          previouslyFocusedElement.current.focus()
        else document?.body.focus()
      }
    }
  }, [modal, handleClose, getFocusableElements])

  if (!modal?.children) {
    return null
  }

  return (
    <div
      className={`${styles['modal-overlay']}`}
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClose()
      }}
      tabIndex={0}
      role="button"
      aria-label="Close modal"
    >
      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={modalContentRef}
        className={`${styles['modal-content']} ${modal.className ?? ''}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') e.stopPropagation()
        }}
        role="dialog"
        aria-modal="true"
        aria-label={modal.title}
      >
        <button
          ref={closeButtonRef}
          className={`${styles['close-button']} tooltip-wrap`}
          onClick={handleClose}
        >
          <span aria-hidden="true">&times;</span>
          <span className="scr">{t('Close')}</span>
          <span aria-hidden="true" className="tooltip below left narrow2">
            {t('Close')}
          </span>
        </button>
        {modal?.children}
      </div>
    </div>
  )
}

export default Modal
