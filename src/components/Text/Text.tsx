import type { HTMLAttributes } from 'react'
import styles from './Text.module.css'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span'
  tone?: 'default' | 'muted'
  size?: 'sm' | 'md'
}

export function Text({
  as: Tag = 'p',
  tone = 'default',
  size = 'md',
  className,
  ...rest
}: TextProps) {
  return (
    <Tag
      data-tone={tone}
      data-size={size}
      className={[styles.text, className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
