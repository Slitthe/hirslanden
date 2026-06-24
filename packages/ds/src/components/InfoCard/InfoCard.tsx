import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from '../Card/index.js'
import { Overline } from '../Overline/index.js'
import styles from './InfoCard.module.css'

export interface InfoCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  children: ReactNode
}

export function InfoCard({ label, children, className, ...rest }: InfoCardProps) {
  return (
    <Card
      variant="dashed"
      className={[styles.infoCard, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Overline>{label}</Overline>
      <div className={styles.body}>{children}</div>
    </Card>
  )
}
