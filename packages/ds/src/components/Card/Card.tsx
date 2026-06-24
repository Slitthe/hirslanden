import type { ElementType, HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: 'solid' | 'dashed';
  padding?: 'none' | 'sm' | 'md';
}

export function Card({
  as: Tag = 'div',
  variant = 'solid',
  padding = 'md',
  className,
  ...rest
}: CardProps) {
  return (
    <Tag
      data-variant={variant}
      data-padding={padding}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
