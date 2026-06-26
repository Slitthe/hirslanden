import type { ElementType, HTMLAttributes } from 'react';
import styles from './Text.module.css';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span';
  tone?: 'default' | 'muted';
  size?: 'sm' | 'md';
}

export function Text({
  as: Tag = 'p',
  tone = 'default',
  size = 'md',
  className,
  ...rest
}: TextProps) {
  const Component = Tag as ElementType;
  return (
    <Component
      data-tone={tone}
      data-size={size}
      className={[styles.text, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
