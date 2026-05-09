import {
  ChangeEventHandler,
  MouseEventHandler,
  KeyboardEventHandler,
} from 'react'
import { useTheme } from '../../hooks/useTheme'
import styles from './buttonToggle.module.css'

interface Props {
  id: string | number
  on: string
  off: string
  name: string
  className?: string
  wrapperClass?: string
  onChange:
    | ChangeEventHandler<HTMLInputElement>
    | MouseEventHandler<HTMLInputElement>
    | MouseEventHandler<HTMLButtonElement>
    | KeyboardEventHandler<HTMLButtonElement>
  isChecked: boolean
  equal?: boolean
  label: string
  hideLabel?: boolean
  hideOnOff?: boolean
}
const ButtonToggle = ({
  id,
  on,
  off,
  name,
  className,
  wrapperClass,
  isChecked,
  onChange,
  equal,
  label,
  hideLabel,
  hideOnOff,
}: Props) => {
  const lightTheme = useTheme()
  const labelId = `toggle-label-${id}`
  const toggleId = `toggle-${id}`
  const stateId = `toggle-state-${id}`

  return (
    <div
      className={`${styles['toggle-container']} toggle-container ${className}-container ${wrapperClass} ${hideOnOff ? styles.small : ''}`}
      aria-labelledby={labelId}
      role="group"
    >
      <span
        id={labelId}
        className={`label ${hideLabel ? 'scr' : ''}`}
        aria-live="polite"
      >
        {label}
      </span>
      <label
        htmlFor={toggleId}
        className={`${styles.toggle} toggle ${className} focus-within ${
          lightTheme ? styles.light : ''
        } ${equal ? styles.equal : ''}`}
      >
        <span id={stateId} className="scr">
          {isChecked ? on : off}
        </span>
        <input
          id={toggleId}
          type="checkbox"
          name={name}
          checked={isChecked}
          onChange={onChange as ChangeEventHandler<HTMLInputElement>}
          className="scr"
          role="switch"
          aria-labelledby={labelId}
          aria-describedby={stateId}
        />
        <span className={`${styles.slider} slider`} aria-hidden="true"></span>
        <span
          className={`${styles.labels} labels ${hideOnOff ? styles['hide-on-off'] : ''}`}
          data-on={on}
          data-off={off}
          aria-hidden="true"
        ></span>
      </label>
    </div>
  )
}

export default ButtonToggle
