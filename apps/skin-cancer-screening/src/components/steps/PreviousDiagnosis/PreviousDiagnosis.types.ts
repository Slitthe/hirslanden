/** The answer to the step-2 "previous diagnosis" question. */
export enum PreviousDiagnosisAnswer {
  Yes = 'yes',
  No = 'no',
}

export interface PreviousDiagnosisProps {
  /** Controlled selected answer; `undefined` means no card is selected yet. */
  value?: PreviousDiagnosisAnswer;
  /** Fires when an answer is chosen — the auto-advance signal for the parent flow. */
  onChange?: (answer: PreviousDiagnosisAnswer) => void;
  /** Fires when the "Back" link is activated. */
  onBack?: () => void;
  /** 1-based position of this step. Defaults to 2. */
  current?: number;
  /** Total number of steps. Defaults to 14. */
  total?: number;
}
