import type { InputHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
import styles from './Input.module.css';

/** Unique marker used by scripts/verify-treeshake.mjs to detect Input in a bundle. */
const INPUT_BUILD_MARKER = '__HDS_INPUT_MARKER__';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text, associated with the input for accessibility. */
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={styles.wrapper} data-hds-marker={INPUT_BUILD_MARKER}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={[styles.input, className].filter(Boolean).join(' ')}
        {...rest}
      />
    </div>
  );
});
