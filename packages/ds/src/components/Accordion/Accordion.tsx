import type { HTMLAttributes } from 'react';
import { useCallback, useMemo, useState } from 'react';
import styles from './Accordion.module.css';
import { AccordionContext } from './context.js';

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  allowMultiple?: boolean;
  defaultOpen?: string[];
  value?: string[];
  onChange?: (openItems: string[]) => void;
}

export function Accordion({
  allowMultiple = true,
  defaultOpen = [],
  value: controlled,
  onChange,
  className,
  children,
  ...rest
}: AccordionProps) {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultOpen);
  const openItems = isControlled ? controlled : uncontrolled;

  const toggle = useCallback(
    (itemValue: string) => {
      const isOpen = openItems.includes(itemValue);
      let next: string[];
      if (isOpen) {
        next = openItems.filter((v) => v !== itemValue);
      } else {
        next = allowMultiple ? [...openItems, itemValue] : [itemValue];
      }
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [openItems, allowMultiple, isControlled, onChange],
  );

  const contextValue = useMemo(() => ({ openItems, toggle }), [openItems, toggle]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={[styles.accordion, className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}
