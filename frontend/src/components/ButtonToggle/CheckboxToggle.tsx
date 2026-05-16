import { ChangeEventHandler } from 'react'
import { useTheme } from '../../hooks/useTheme'
import styles from './buttonToggle.module.css'

interface Props {
  id: string | number
  name: string
  label: string
  checked: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  className?: string
  wrapperClass?: string
}

const CheckboxToggle = ({
  id,
  name,
  label,
  checked,
  onChange,
  className,
  wrapperClass,
}: Props) => {
  const lightTheme = useTheme()
  const checkboxId = `checkbox-${id}`

  return (
    <label
      htmlFor={checkboxId}
      className={`${styles['checkbox-container']} ${className ?? ''} ${wrapperClass ?? ''} ${lightTheme ? styles.light : ''}`}
    >
      <input
        id={checkboxId}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="scr"
      />
      <span className={styles['checkbox-box']} aria-hidden="true">
        <span className={styles['checkbox-mark']}></span>
      </span>
      <span className={styles['checkbox-label']}>{label}</span>
    </label>
  )
}

export default CheckboxToggle
