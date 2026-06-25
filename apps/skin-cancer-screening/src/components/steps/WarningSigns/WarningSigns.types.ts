/** The answer to the step-1 "warning signs" question. */
export enum WarningSignsAnswer {
  Yes = 'yes',
  No = 'no',
  Unsure = 'unsure',
}

export interface WarningSignsProps {
  /** Controlled selected answer; `undefined` means no card is selected yet. */
  value?: WarningSignsAnswer;
  /** Fires when an answer is chosen — the auto-advance signal for the parent flow. */
  onChange?: (answer: WarningSignsAnswer) => void;
  /** Fires when the "Back" link is activated. */
  onBack?: () => void;
  /** 1-based position of this step. Defaults to 1. */
  current?: number;
  /** Total number of steps. Defaults to 14. */
  total?: number;
}
