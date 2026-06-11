import type { HTMLAttributes, KeyboardEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OptionGroupContext } from './context.js'
import styles from './OptionGroup.module.css'

export interface OptionGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  label?: string
}

const NAV_KEYS = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']

export function OptionGroup({
  value: controlled,
  defaultValue,
  onChange,
  label,
  className,
  children,
  ...rest
}: OptionGroupProps) {
  const isControlled = controlled !== undefined
  const [uncontrolled, setUncontrolled] = useState<string | undefined>(defaultValue)
  const value = isControlled ? controlled : uncontrolled
  const [rovingValue, setRovingValue] = useState<string | undefined>(defaultValue)
  const groupRef = useRef<HTMLDivElement>(null)

  const select = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  // Roving tabindex target: the selected value, or (when nothing is selected)
  // the first enabled radio in DOM order.
  useEffect(() => {
    if (value !== undefined) {
      setRovingValue(value)
      return
    }
    const first = groupRef.current?.querySelector<HTMLElement>('[role="radio"]:not([disabled])')
    setRovingValue(first?.dataset.value)
  }, [value])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!NAV_KEYS.includes(event.key)) return
    const group = groupRef.current
    if (!group) return
    const radios = Array.from(
      group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])'),
    )
    if (radios.length === 0) return
    const currentIndex = radios.indexOf(document.activeElement as HTMLButtonElement)
    let nextIndex = currentIndex
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % radios.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex <= 0 ? radios.length - 1 : currentIndex - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = radios.length - 1
        break
    }
    event.preventDefault()
    const next = radios[nextIndex]
    next?.focus()
    next?.click()
  }, [])

  const contextValue = useMemo(() => ({ value, rovingValue, select }), [value, rovingValue, select])

  return (
    <OptionGroupContext.Provider value={contextValue}>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={label}
        className={[styles.group, className].filter(Boolean).join(' ')}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    </OptionGroupContext.Provider>
  )
}
