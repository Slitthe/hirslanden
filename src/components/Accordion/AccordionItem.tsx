import type { ReactNode } from 'react'
import { useId } from 'react'
import { Icon } from '../Icon/index.js'
import styles from './AccordionItem.module.css'
import { useAccordion } from './context.js'

export interface AccordionItemProps {
  value: string
  title: ReactNode
  children: ReactNode
  disabled?: boolean
}

export function AccordionItem({ value, title, children, disabled }: AccordionItemProps) {
  const { openItems, toggle } = useAccordion()
  const open = openItems.includes(value)
  const headingId = useId()
  const panelId = useId()

  return (
    <div className={styles.item}>
      <h3 className={styles.heading}>
        <button
          type="button"
          id={headingId}
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => toggle(value)}
        >
          <span className={styles.title}>{title}</span>
          <Icon name={open ? 'minus' : 'plus'} />
        </button>
      </h3>
      <section id={panelId} aria-labelledby={headingId} hidden={!open}>
        <div className={styles.panelInner}>{children}</div>
      </section>
    </div>
  )
}
