import type { HTMLAttributes } from 'react'
import styles from './Overline.module.css'

export interface OverlineProps extends HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'div'
}

export function Overline({ as: Tag = 'span', className, ...rest }: OverlineProps) {
  return <Tag className={[styles.overline, className].filter(Boolean).join(' ')} {...rest} />
}
