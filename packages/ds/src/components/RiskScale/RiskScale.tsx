import type { HTMLAttributes } from 'react';
import styles from './RiskScale.module.css';

export interface RiskScaleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  segments: string[];
  activeIndex: number;
}

export function RiskScale({
  title,
  value,
  segments,
  activeIndex,
  className,
  ...rest
}: RiskScaleProps) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')} {...rest}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <div className={styles.scale} role="img" aria-label={`${title}: ${value}`}>
        {segments.map((segment, index) => (
          <div
            key={segment}
            className={styles.segment}
            data-active={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
      <div className={styles.labels}>
        {segments.map((segment) => (
          <span key={segment} className={styles.segmentLabel} data-segment-label="">
            {segment}
          </span>
        ))}
      </div>
    </div>
  );
}
