import { PreviousDiagnosis } from '@root/src/components/steps/PreviousDiagnosis';
import { PreviousDiagnosisAnswer } from '@root/src/components/steps/PreviousDiagnosis/PreviousDiagnosis.types';
import { fireEvent, render, screen } from '@testing-library/preact';
import type { ComponentChildren } from 'preact';

// translate(key) -> key, so assertions check keys, not copy.
vi.mock('@root/src/i18n', () => ({
  useTranslation: () => ({ translate: (key: string) => key }),
}));

// Minimal DS stand-ins; forward only what the tests need.
vi.mock('@hirslanden/ds/stepprogress', () => ({
  StepProgress: ({ current, total, label }: { current: number; total: number; label?: string }) => (
    <div data-testid="ds-stepprogress">{`${label}|${current}|${total}`}</div>
  ),
}));

vi.mock('@hirslanden/ds/overline', () => ({
  Overline: ({ children }: { children?: ComponentChildren }) => <span>{children}</span>,
}));

vi.mock('@hirslanden/ds/heading', () => ({
  Heading: ({ children, id }: { children?: ComponentChildren; id?: string }) => (
    <h1 id={id}>{children}</h1>
  ),
}));

vi.mock('@hirslanden/ds/text', () => ({
  Text: ({ children }: { children?: ComponentChildren }) => <p>{children}</p>,
}));

vi.mock('@hirslanden/ds/optiongroup', () => ({
  OptionCard: ({
    value,
    title,
    description,
    selected,
    onClick,
  }: {
    value: string;
    title?: ComponentChildren;
    description?: ComponentChildren;
    selected?: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid={`ds-option-${value}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span>{title}</span>
      <span>{description}</span>
    </button>
  ),
}));

vi.mock('@hirslanden/ds/textlink', () => ({
  TextLink: ({ children, onClick }: { children?: ComponentChildren; onClick?: () => void }) => (
    <button type="button" data-testid="ds-back" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@hirslanden/ds/icon', () => ({
  ArrowLeftIcon: () => <svg data-testid="ds-icon" aria-hidden="true" />,
}));

test('renders progress with the localized label key and 2 of 14', () => {
  render(<PreviousDiagnosis />);
  const progress = screen.getByTestId('ds-stepprogress');
  expect(progress).toHaveTextContent('general.progress.stepOf');
  expect(progress).toHaveTextContent('2');
  expect(progress).toHaveTextContent('14');
});

test('renders the overline and question keys', () => {
  render(<PreviousDiagnosis />);
  expect(screen.getByTestId('previous-diagnosis-overline')).toHaveTextContent(
    'steps.previousDiagnosis.overline',
  );
  expect(screen.getByTestId('previous-diagnosis-question')).toHaveTextContent(
    'steps.previousDiagnosis.question',
  );
});

test('renders the description key', () => {
  render(<PreviousDiagnosis />);
  expect(screen.getByTestId('previous-diagnosis-description')).toHaveTextContent(
    'steps.previousDiagnosis.description',
  );
});

test('renders both option keys (title + description)', () => {
  render(<PreviousDiagnosis />);
  expect(screen.getByTestId('ds-option-yes')).toHaveTextContent(
    'steps.previousDiagnosis.options.yes.title',
  );
  expect(screen.getByTestId('ds-option-yes')).toHaveTextContent(
    'steps.previousDiagnosis.options.yes.description',
  );
  expect(screen.getByTestId('ds-option-no')).toHaveTextContent(
    'steps.previousDiagnosis.options.no.title',
  );
  expect(screen.getByTestId('ds-option-no')).toHaveTextContent(
    'steps.previousDiagnosis.options.no.description',
  );
});

test('selecting an option fires onChange with the answer enum', () => {
  const onChange = vi.fn();
  render(<PreviousDiagnosis onChange={onChange} />);
  fireEvent.click(screen.getByTestId('ds-option-no'));
  expect(onChange).toHaveBeenCalledWith(PreviousDiagnosisAnswer.No);
});

test('clicking Back fires onBack', () => {
  const onBack = vi.fn();
  render(<PreviousDiagnosis onBack={onBack} />);
  fireEvent.click(screen.getByTestId('ds-back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('reflects the controlled value as the selected card', () => {
  render(<PreviousDiagnosis value={PreviousDiagnosisAnswer.No} />);
  expect(screen.getByTestId('ds-option-no')).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('ds-option-yes')).toHaveAttribute('aria-pressed', 'false');
});

test('controlled: clicking an option does not change selection on its own', () => {
  render(<PreviousDiagnosis onChange={vi.fn()} />);
  fireEvent.click(screen.getByTestId('ds-option-yes'));
  // No internal state — selection only follows the `value` prop the parent passes back.
  expect(screen.getByTestId('ds-option-yes')).toHaveAttribute('aria-pressed', 'false');
});
