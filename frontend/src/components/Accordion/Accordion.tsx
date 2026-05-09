import {
  useState,
  useImperativeHandle,
  forwardRef,
  Ref,
  ReactElement,
  ReactPortal,
  useEffect,
  ReactNode,
  useRef,
} from 'react'
import Icon from '../Icon/Icon'
import { useLanguageContext } from '../../contexts/LanguageContext'

interface accordionProps {
  text: string | ReactNode
  className: string
  children?:
    | string
    | number
    | ReactElement
    | ReactPortal
    | ReactNode
    | null
    | undefined
  isOpen?: boolean
  setIsFormOpen?: (isFormOpen: boolean) => void
  onClick?: () => void
  id?: string
  hideBrackets?: boolean
  showButton?: boolean
  tooltip?: string
  y?: 'above' | 'below'
  x?: 'left' | 'right'
  wrapperClass: string
  closeClass?: string
}

const Accordion = forwardRef(
  (props: accordionProps, ref: Ref<unknown> | undefined) => {
    const { t } = useLanguageContext()

    const { isOpen, onClick } = props
    // Determine if this is a controlled component
    const isControlled = typeof isOpen === 'boolean'
    // For controlled components, use the prop directly; for uncontrolled, use state
    const [internalVisible, setInternalVisible] = useState(false)
    const visible = isControlled ? isOpen : internalVisible
    const [isAnimating, setIsAnimating] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const onOpenRef = useRef<(() => void) | undefined>(onClick)
    useEffect(() => {
      onOpenRef.current = onClick
    }, [onClick])

    const prevVisibleRef = useRef(visible)
    useEffect(() => {
      const wasVisible = prevVisibleRef.current
      prevVisibleRef.current = visible

      if (!wasVisible && visible) {
        onOpenRef.current?.()
      }
    }, [visible])

    const toggleVisibility = () => {
      if (visible) {
        setIsAnimating(true)
        setTimeout(() => {
          if (!isControlled) setInternalVisible(false)
          setIsAnimating(false)
          if (props.setIsFormOpen) {
            props.setIsFormOpen(false)
          }
        }, 300)
      } else {
        setIsAnimating(true)
        if (!isControlled) setInternalVisible(true)
        setTimeout(() => {
          setIsAnimating(false)
        })
        if (props.setIsFormOpen) {
          props.setIsFormOpen(true)
        }
      }
    }

    useImperativeHandle(ref, () => {
      return {
        toggleVisibility,
      }
    })

    const scrollToOpenBtn = () => {
      const container = containerRef.current
      if (container && container.getBoundingClientRect().top < 0) {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
      toggleVisibility()
    }

    return (
      <div
        ref={containerRef}
        id={`${props.id ?? props.className}-container`}
        className={`${visible ? 'open' : `closed ${props.closeClass}`} ${
          props.className
        }-container accordion-container ${props.wrapperClass}`}
      >
        <button
          type="button"
          className={`${
            props.tooltip ? 'tooltip-wrap' : ''
          } accordion-btn open ${props.className}`}
          onClick={toggleVisibility}
          style={
            visible
              ? { display: 'none' }
              : {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
          }
        >
          <span aria-hidden="true" className={props.hideBrackets ? 'hide' : ''}>
            &raquo;&nbsp;
          </span>
          <i>{props.text}</i>
          <span aria-hidden="true" className={props.hideBrackets ? 'hide' : ''}>
            &nbsp;&laquo;
          </span>
          <strong
            className={
              props.tooltip ? `tooltip narrow2 ${props.x} ${props.y}` : ''
            }
          >
            {props.tooltip}
          </strong>
        </button>

        <div
          className={`accordion-inner ${props.className} ${
            isAnimating ? 'animating' : ''
          } ${visible ? 'open' : 'closed'}`}
          // style={visible ? { display: 'block' } : { display: 'none' }}
        >
          <button
            type="button"
            className={`accordion-btn close`}
            onClick={toggleVisibility}
          >
            <Icon lib="fa6" name="FaAnglesUp" />
            {t('Close')}
          </button>

          {props.children}

          {props.showButton && (
            <button
              type="button"
              className={`accordion-btn close`}
              onClick={scrollToOpenBtn}
            >
              <Icon lib="fa6" name="FaAnglesUp" />
              {t('Close')}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Accordion.displayName = 'Accordion'

export default Accordion
