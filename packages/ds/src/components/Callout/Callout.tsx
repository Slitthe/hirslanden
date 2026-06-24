import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Callout.module.css'

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'accent' | 'subtle'
  action?: ReactNode
  children: ReactNode
}

export function Callout({
  variant = 'accent',
  action,
  children,
  className,
  ...rest
}: CalloutProps) {
  return (
    <div
      data-variant={variant}
      className={[styles.callout, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className={styles.content}>{children}</div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
