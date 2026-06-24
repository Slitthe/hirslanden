import type { HTMLAttributes } from 'react';
import styles from './List.module.css';

export type ListProps = HTMLAttributes<HTMLUListElement>;

export function List({ className, ...rest }: ListProps) {
  return <ul className={[styles.list, className].filter(Boolean).join(' ')} {...rest} />;
}
