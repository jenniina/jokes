////// Remember to import and place this in component:

//     isTouchDevice();

import React from 'react'

let initialX = 0
let initialY = 0

let zIndex = 1
let zIndex0 = -1
let moveElement = false
let reset = true

export const preventDefault = (e: Event) => {
  e.preventDefault()
  e.stopImmediatePropagation()
}

//Detect touch device
export const isTouchDevice = () => {
  try {
    //Try to create TouchEvent (fails for desktops and throws error)
    document?.createEvent('TouchEvent')
    return true
  } catch {
    return false
  }
}

export function start(
  e:
    | TouchEvent
    | MouseEvent
    | PointerEvent
    | React.TouchEvent
    | React.MouseEvent
    | React.PointerEvent
) {
  e.stopPropagation()
  e.preventDefault()

  if (isTouchDevice()) {
    if (document)
      document.addEventListener('touchmove', preventDefault, {
        passive: false,
      })

    if (document) document.body.style.overflow = 'hidden'
  }
  initialX = !isTouchDevice()
    ? (e as PointerEvent).clientX
    : (e as TouchEvent).touches[0].clientX
  initialY = !isTouchDevice()
    ? (e as PointerEvent).clientY
    : (e as TouchEvent).touches[0].clientY

  moveElement = true
  ;(e.target as HTMLElement).classList.add('drag')
  ;(e.target as HTMLElement).style.setProperty('z-index', `${zIndex}`)
  //increase z-index
  zIndex += 1
  ;(e.target as HTMLElement).focus()
}

//Handle mousemove and touchmove
export function movement(
  e:
    | TouchEvent
    | MouseEvent
    | PointerEvent
    | React.TouchEvent
    | React.MouseEvent
    | React.PointerEvent
) {
  e.stopPropagation()
  e.preventDefault()

  if (moveElement) {
    //e.preventDefault();
    const newX = !isTouchDevice()
      ? (e as PointerEvent).clientX
      : (e as TouchEvent).touches[0].clientX
    const newY = !isTouchDevice()
      ? (e as PointerEvent).clientY
      : (e as TouchEvent).touches[0].clientY
    ;(e.target as HTMLElement).style.top =
      (e.target as HTMLElement).offsetTop - (initialY - newY) + 'px'
    ;(e.target as HTMLElement).style.left =
      (e.target as HTMLElement).offsetLeft - (initialX - newX) + 'px'
    initialX = newX
    initialY = newY
  }
}

//Handle mouse up and touch end, check for element overlap
export const stopMovementCheck = (
  e:
    | TouchEvent
    | MouseEvent
    | PointerEvent
    | React.TouchEvent
    | React.MouseEvent
    | React.PointerEvent
) => {
  e.stopPropagation()
  if (isTouchDevice()) {
    if (document) document.removeEventListener('touchmove', preventDefault)
    if (document) document.body.style.overflowY = 'auto'
    if (document) document.body.style.overflowX = 'hidden'
  }

  moveElement = false
  ;(e.target as HTMLElement).classList.remove('drag')
  ;(e.target as HTMLElement).blur()
}

//Handle mouse leave
export const stopMoving = (
  e: MouseEvent | React.MouseEvent | PointerEvent | React.PointerEvent
) => {
  e.stopPropagation()
  moveElement = false
  ;(e.target as HTMLElement).classList.remove('drag')
  ;(e.target as HTMLElement).blur()
}

//on blob blur
export function blurred(draggable: HTMLElement) {
  draggable.classList.remove('drag')
}

//on focused blob
export function focused(draggable: HTMLElement) {
  draggable.classList.add('drag')
  return () => {
    draggable.classList.remove('drag')
  }
}

//Mousewheel use
export function wheel(draggable: HTMLElement) {
  draggable.addEventListener('wheel', zoom, { passive: false })
  return () => {
    draggable.removeEventListener('wheel', zoom)
  }
}
export function zoom(e: WheelEvent) {
  const value = (e.target as HTMLElement).style.getPropertyValue('--size')
  let scale = parseFloat(value)

  scale += e.deltaY * -0.005
  // Restrict scale
  scale = Math.min(Math.max(2, scale), 20)
  // Apply
  ;(e.target as HTMLElement).style.setProperty('--size', `${scale}`)
  //increase z-index
  zIndex += 1
}

// Keyboard use
export function keyDown(
  e: KeyboardEvent | React.KeyboardEvent<HTMLLIElement>,
  target: HTMLElement,
  windowObj: Window | null,
  escapeFunction:
    | ((
        e:
          | React.PointerEvent<HTMLElement>
          | React.KeyboardEvent<HTMLLIElement>
          | React.MouseEvent<HTMLLIElement, MouseEvent>
          | React.TouchEvent<HTMLLIElement>
          | KeyboardEvent
      ) => void)
    | null,
  enterFunction:
    | ((
        e:
          | React.PointerEvent<HTMLElement>
          | React.KeyboardEvent<HTMLElement>
          | React.MouseEvent<HTMLLIElement, MouseEvent>
          | React.TouchEvent<HTMLLIElement>
          | KeyboardEvent
      ) => void)
    | null,
  deleteFunction:
    | ((
        e:
          | React.PointerEvent<HTMLElement>
          | React.KeyboardEvent<HTMLElement>
          | React.MouseEvent<HTMLLIElement, MouseEvent>
          | React.TouchEvent<HTMLLIElement>
          | KeyboardEvent
      ) => void)
    | null,
  spaceFunction:
    | ((
        e:
          | React.PointerEvent<HTMLElement>
          | React.KeyboardEvent<HTMLElement>
          | React.MouseEvent<HTMLLIElement, MouseEvent>
          | React.TouchEvent<HTMLLIElement>
          | KeyboardEvent
      ) => void)
    | null
) {
  const movePx = 10

  const size = target.style.getPropertyValue('--size')
  let scale = parseFloat(size)

  let attrLeft = windowObj
    ? windowObj.getComputedStyle(target).getPropertyValue('left')
    : target.style.getPropertyValue('left')
  let attrTop = windowObj
    ? windowObj.getComputedStyle(target).getPropertyValue('top')
    : target.style.getPropertyValue('top')

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      target.style.left = parseFloat(attrLeft) - Number(movePx) + 'px'
      attrLeft = windowObj
        ? windowObj.getComputedStyle(target).getPropertyValue('left')
        : target.style.getPropertyValue('left')
      break
    case 'ArrowRight':
      e.preventDefault()
      target.style.left = parseFloat(attrLeft) + Number(movePx) + 'px'
      attrLeft = windowObj
        ? windowObj.getComputedStyle(target).getPropertyValue('left')
        : target.style.getPropertyValue('left')
      break
    case 'ArrowUp':
      e.preventDefault()
      target.style.top = parseFloat(attrTop) - Number(movePx) + 'px'
      attrTop = windowObj
        ? windowObj.getComputedStyle(target).getPropertyValue('top')
        : target.style.getPropertyValue('top')
      break
    case 'ArrowDown':
      e.preventDefault()
      target.style.top = parseFloat(attrTop) + Number(movePx) + 'px'
      attrTop = windowObj
        ? windowObj.getComputedStyle(target).getPropertyValue('top')
        : target.style.getPropertyValue('top')
      break
    case 'Z':
    case 'z': //Move blob to the bottom of the z-index pile
      e.stopPropagation()
      e.preventDefault()
      if (reset) {
        reset = false
        target.style.setProperty('z-index', `${zIndex0}`)
        //Reset z-index
        zIndex0 -= 1
        const cooldown = () => {
          reset = true
        }
        setTimeout(cooldown, 100)
      }
      break
    case 's':
    case 'S': //make smaller
      e.stopPropagation()
      e.preventDefault()
      if (reset) {
        reset = false
        scale -= 1
        scale = Math.min(Math.max(2, scale), 20)

        target.style.setProperty('--size', `${scale}`)

        const cooldown = () => {
          reset = true
        }
        setTimeout(cooldown, 100)
      }
      break
    case 'B':
    case 'b':
    case 'L':
    case 'l': //make larger
      e.stopPropagation()
      e.preventDefault()
      if (reset) {
        reset = false
        scale += 1
        scale = Math.min(Math.max(2, scale), 20)

        target.style.setProperty('--size', `${scale}`)

        const cooldown = () => {
          reset = true
        }
        setTimeout(cooldown, 100)
      }
      break
    case 'Enter':
      if (enterFunction) {
        e.stopPropagation()
        e.preventDefault()
        enterFunction(e)
      }
      break
    case 'Delete':
      if (deleteFunction) {
        e.stopPropagation()
        e.preventDefault()
        deleteFunction(e)
      }
      break
    case 'Escape':
      target.blur()
      if (escapeFunction) {
        e.stopPropagation()
        e.preventDefault()
        escapeFunction(e)
      }
      break
    case ' ':
      if (spaceFunction) {
        e.stopPropagation()
        e.preventDefault()
        spaceFunction(e)
      }
      break
    default:
      e.stopPropagation()
  }
}
