import type { HTMLAttributes } from 'react';
import styles from './Heading.module.css';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3;
  /** Render in muted greige (live hero-title treatment) instead of the warm-taupe default. */
  muted?: boolean;
}

export function Heading({ level, muted = false, className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  const classes = [styles.heading, styles[`level${level}`], muted && styles.muted, className]
    .filter(Boolean)
    .join(' ');
  return <Tag className={classes} {...rest} />;
}
