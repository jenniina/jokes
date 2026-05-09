import React from 'react'

export interface JokeIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string
  hatStyle?: React.CSSProperties
  laughStyle?: React.CSSProperties
  flip?: boolean
}

const JokeIcon: React.FC<JokeIconProps> = ({
  title = 'Logo',
  hatStyle,
  laughStyle,
  flip = false,
  ...props
}) => {
  const iconSize =
    typeof props.fontSize === 'number'
      ? `${props.fontSize}em`
      : (props.fontSize ?? '1em')

  return (
    <span
      className={`joke-icon ${flip ? 'flipped' : ''}`}
      style={{
        ['--joke-icon-size' as string]: iconSize,
        ['--joke-icon-flip' as string]: flip ? -1 : 1,
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        transform: flip ? 'rotate(-24deg)' : 'rotate(24deg)',
        transformOrigin: '50% 70%',
        fontSize: iconSize,
        borderRadius: '50%',
        width: iconSize,
        height: iconSize,
        ...props.style,
      }}
    >
      <svg
        id="joker-icon-hat"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 12 12"
        style={{
          stroke: props.stroke ?? 'currentColor',
          fontSize: '1em',
          fill: props.fill ?? 'var(--color-primary-5)',
          width: '0.8em',
          height: '0.8em',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          margin: '0 0 -0.26em 0',
          zIndex: 1,
          transform: flip ? 'rotate(-26deg)' : 'rotate(26deg)',
          transformOrigin: '50% 111%',
          ...hatStyle,
        }}
        aria-hidden={true}
        {...props}
      >
        <path
          className="hat"
          d="M6,8.2c.5-1.9,1-2.9,1.6-3.7-.8-1.3-1.3-1.8-1.6-1.8s-.8.4-1.6,1.8c.6.8,1.1,2,1.6,3.7h0c0,.1,0,0,0,0Z"
        />
        <path
          className="hat"
          d="M9.6,8.4H2.5c-.6,0-1,.4-1,1s.4,1,.9,1h7.2c.6,0,.9-.4.9-1s-.4-1-.9-1Z"
        />
        <path
          className="hat"
          d="M6,8.2c-.9-3.3-2-4.8-3.3-4.8s-1.8,1.2-1.7,1.9c1.7.2,1.9,1.5,1.6,2.8"
        />
        <path
          className="hat"
          d="M6,8.2c.9-3.3,2-4.8,3.3-4.8s1.7,1,1.7,1.9c-1.7.2-2,1.5-1.5,2.8"
        />
      </svg>
      <svg
        id="joker-icon-laugh"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 12 12"
        aria-hidden={true}
        style={{
          stroke: props.stroke ?? 'currentColor',
          fill: 'transparent',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fontSize: '1em',
          width: '0.8em',
          height: '0.8em',
          margin: '0 0 -0.06em 0',
          zIndex: 0,
          ...laughStyle,
        }}
        {...props}
      >
        <g id="laugh">
          <path
            className="laugh"
            d="M6,1C3.2,1,1,3.2,1,6s2.2,5,5,5,5-2.2,5-5S8.8,1,6,1ZM6,9c-1.5,0-2.8-1-3-2.5h6c-.2,1.5-1.5,2.5-3,2.5Z"
          />
        </g>
        <path className="laugh" d="M8.8,5.1h-1.8l1.4-1" />
        <path className="laugh" d="M3.5,4.1l1.5,1.1h-1.9" />
      </svg>
    </span>
  )
}
export default JokeIcon
