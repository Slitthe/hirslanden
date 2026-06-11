import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { forwardRef } from 'react'
import styles from './TextLink.module.css'

interface BaseProps {
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  children: ReactNode
}

export type TextLinkProps = BaseProps &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>)
  )

export const TextLink = forwardRef<HTMLAnchorElement | HTMLButtonElement, TextLinkProps>(
  function TextLink({ leadingIcon, trailingIcon, children, className, ...rest }, ref) {
    const classes = [styles.link, className].filter(Boolean).join(' ')
    const inner = (
      <>
        {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
        <span>{children}</span>
        {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
      </>
    )

    if (typeof (rest as { href?: string }).href === 'string') {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={classes}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {inner}
        </a>
      )
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {inner}
      </button>
    )
  },
)
