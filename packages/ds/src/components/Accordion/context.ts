import { createContext, useContext } from 'react';

export interface AccordionContextValue {
  openItems: string[];
  toggle: (value: string) => void;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordion(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('AccordionItem must be used within an Accordion');
  }
  return ctx;
}
