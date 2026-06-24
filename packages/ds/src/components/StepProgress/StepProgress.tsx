import type { HTMLAttributes } from 'react'
import styles from './StepProgress.module.css'

export interface StepProgressProps extends HTMLAttributes<HTMLDivElement> {
  current: number
  total: number
  label?: string
}

export function StepProgress({ current, total, label, className, ...rest }: StepProgressProps) {
  const text = label ?? `Step ${current} of ${total}`
  const pct = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')} {...rest}>
      <div className={styles.label}>{text}</div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuetext={text}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
