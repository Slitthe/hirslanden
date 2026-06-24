import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { forwardRef } from 'react';
import { useOptionGroup } from './context.js';
import styles from './OptionCard.module.css';

export interface OptionCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'title'> {
  value: string;
  title: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  selected?: boolean;
}

export const OptionCard = forwardRef<HTMLButtonElement, OptionCardProps>(function OptionCard(
  {
    value,
    title,
    description,
    media,
    selected: selectedProp,
    disabled,
    className,
    onClick,
    ...rest
  },
  ref,
) {
  const group = useOptionGroup();
  const inGroup = group !== null;
  const selected = inGroup ? group.value === value : Boolean(selectedProp);
  const tabIndex = inGroup ? (group.rovingValue === value ? 0 : -1) : undefined;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && inGroup && !disabled) {
      group.select(value);
    }
  }

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-checked is only emitted when role="radio" is applied (inside an OptionGroup); the standalone button uses aria-pressed instead.
    <button
      ref={ref}
      type="button"
      role={inGroup ? 'radio' : undefined}
      aria-checked={inGroup ? selected : undefined}
      aria-pressed={inGroup ? undefined : selected}
      data-value={value}
      data-selected={selected ? 'true' : undefined}
      disabled={disabled}
      tabIndex={tabIndex}
      className={[styles.card, className].filter(Boolean).join(' ')}
      onClick={handleClick}
      {...rest}
    >
      {media ? <span className={styles.media}>{media}</span> : null}
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
    </button>
  );
});
