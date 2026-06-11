import type { HTMLAttributes } from 'react'
import styles from './Heading.module.css'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3
}

export function Heading({ level, className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const classes = [styles.heading, styles[`level${level}`], className].filter(Boolean).join(' ')
  return <Tag className={classes} {...rest} />
}
