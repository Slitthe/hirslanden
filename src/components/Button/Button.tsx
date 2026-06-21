import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary'

/** `md` is the base 14px size; `lg` is the 18px CTA size used on hirslanden.ch. */
export type ButtonSize = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Defaults to `primary`. */
  variant?: ButtonVariant
  /** Text/padding size. Defaults to `md`. Use `lg` for prominent CTAs. */
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      className={classes}
      {...rest}
    />
  )
})
