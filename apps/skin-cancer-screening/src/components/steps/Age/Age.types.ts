export interface AgeProps {
  /** Controlled age in years; `undefined` = empty field or not a valid number. */
  value?: number;
  /** Fires on every edit with the parsed age (`undefined` when cleared/invalid). */
  onChange?: (age?: number) => void;
  /** Fires when Continue is activated with a valid adult age (click / Enter). */
  onContinue?: () => void;
  /** Fires when the "Back" link is activated. */
  onBack?: () => void;
  /** 1-based position of this step. Defaults to 3. */
  current?: number;
  /** Total number of steps. Defaults to 14. */
  total?: number;
}
