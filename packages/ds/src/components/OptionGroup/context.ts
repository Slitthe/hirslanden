import { createContext, useContext } from 'react';

export interface OptionGroupContextValue {
  /** Currently selected value, if any. */
  value: string | undefined;
  /** Value that should be in the tab order (roving tabindex target). */
  rovingValue: string | undefined;
  /** Select a value. */
  select: (value: string) => void;
}

export const OptionGroupContext = createContext<OptionGroupContextValue | null>(null);

export function useOptionGroup(): OptionGroupContextValue | null {
  return useContext(OptionGroupContext);
}
