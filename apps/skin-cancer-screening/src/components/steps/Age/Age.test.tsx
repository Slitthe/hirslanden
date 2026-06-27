import { Age } from '@root/src/components/steps/Age';
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
  Heading: ({ children }: { children?: ComponentChildren }) => <h1>{children}</h1>,
}));

vi.mock('@hirslanden/ds/text', () => ({
  Text: ({ children }: { children?: ComponentChildren }) => <p>{children}</p>,
}));

vi.mock('@hirslanden/ds/input', () => ({
  Input: ({
    label,
    value,
    onInput,
  }: {
    label?: ComponentChildren;
    value?: string | number;
    onInput?: (event: Event) => void;
  }) => (
    <label data-testid="ds-input-label">
      {label}
      <input data-testid="age-input" value={value} onInput={onInput} />
    </label>
  ),
}));

vi.mock('@hirslanden/ds/button', () => ({
  Button: ({
    children,
    disabled,
    type,
    'data-testid': testId,
  }: {
    children?: ComponentChildren;
    disabled?: boolean;
    type?: 'submit' | 'reset' | 'button';
    'data-testid'?: string;
  }) => (
    <button data-testid={testId} type={type} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('@hirslanden/ds/infocard', () => ({
  InfoCard: ({
    label,
    children,
    role,
    'data-testid': testId,
  }: {
    label?: ComponentChildren;
    children?: ComponentChildren;
    role?: 'status';
    'data-testid'?: string;
  }) => (
    <div data-testid={testId} role={role}>
      <span>{label}</span>
      <div>{children}</div>
    </div>
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
  ArrowLeftIcon: () => <svg data-testid="ds-icon-left" aria-hidden="true" />,
  ArrowRightIcon: () => <svg data-testid="ds-icon-right" aria-hidden="true" />,
}));

test('renders progress with the localized label key and 3 of 14', () => {
  render(<Age />);
  const progress = screen.getByTestId('ds-stepprogress');
  expect(progress).toHaveTextContent('general.progress.stepOf');
  expect(progress).toHaveTextContent('3');
  expect(progress).toHaveTextContent('14');
});

test('renders the overline, question, and description keys', () => {
  render(<Age />);
  expect(screen.getByTestId('age-overline')).toHaveTextContent('steps.age.overline');
  expect(screen.getByTestId('age-question')).toHaveTextContent('steps.age.question');
  expect(screen.getByTestId('age-description')).toHaveTextContent('steps.age.description');
});

test('renders the input label key', () => {
  render(<Age />);
  expect(screen.getByTestId('ds-input-label')).toHaveTextContent('steps.age.label');
});

test('typing a number fires onChange with the parsed age', () => {
  const onChange = vi.fn();
  render(<Age onChange={onChange} />);
  fireEvent.input(screen.getByTestId('age-input'), { target: { value: '30' } });
  expect(onChange).toHaveBeenCalledWith(30);
});

test('clearing the field fires onChange with undefined', () => {
  const onChange = vi.fn();
  render(<Age value={30} onChange={onChange} />);
  fireEvent.input(screen.getByTestId('age-input'), { target: { value: '' } });
  expect(onChange).toHaveBeenCalledWith(undefined);
});

test('reflects the controlled value in the input', () => {
  const { rerender } = render(<Age value={30} />);
  expect(screen.getByTestId('age-input')).toHaveValue('30');
  rerender(<Age />);
  expect(screen.getByTestId('age-input')).toHaveValue('');
});

test('clicking Back fires onBack', () => {
  const onBack = vi.fn();
  render(<Age onBack={onBack} />);
  fireEvent.click(screen.getByTestId('ds-back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('empty value: Continue is shown and disabled, no under-18 message', () => {
  render(<Age />);
  expect(screen.getByTestId('age-continue')).toBeDisabled();
  expect(screen.queryByTestId('age-underage')).toBeNull();
});

test('adult value: Continue is enabled and submitting fires onContinue', () => {
  const onContinue = vi.fn();
  render(<Age value={30} onContinue={onContinue} />);
  expect(screen.getByTestId('age-continue')).not.toBeDisabled();
  fireEvent.submit(screen.getByTestId('age-form'));
  expect(onContinue).toHaveBeenCalledTimes(1);
});

test('out-of-range value: Continue is disabled, no under-18 message', () => {
  render(<Age value={200} />);
  expect(screen.getByTestId('age-continue')).toBeDisabled();
  expect(screen.queryByTestId('age-underage')).toBeNull();
});

test('non-integer value: Continue is disabled, no under-18 message', () => {
  render(<Age value={18.5} />);
  expect(screen.getByTestId('age-continue')).toBeDisabled();
  expect(screen.queryByTestId('age-underage')).toBeNull();
});

test('submit guard: submitting without a valid adult age does not call onContinue', () => {
  const onContinue = vi.fn();
  render(<Age onContinue={onContinue} />);
  fireEvent.submit(screen.getByTestId('age-form'));
  expect(onContinue).not.toHaveBeenCalled();
});

test('under-18 value: after the debounce, shows the message with role=status and hides Continue', async () => {
  render(<Age value={15} />);
  const message = await screen.findByTestId('age-underage');
  expect(message).toHaveTextContent('steps.age.underage.label');
  expect(message).toHaveTextContent('steps.age.underage.body');
  expect(message).toHaveAttribute('role', 'status');
  expect(screen.queryByTestId('age-continue')).toBeNull();
});

test('boundary: 17 is under 18 — message shown after debounce, no Continue', async () => {
  render(<Age value={17} />);
  expect(await screen.findByTestId('age-underage')).toBeInTheDocument();
  expect(screen.queryByTestId('age-continue')).toBeNull();
});

test('boundary: 18 is an adult — Continue enabled, no message', () => {
  render(<Age value={18} />);
  expect(screen.getByTestId('age-continue')).not.toBeDisabled();
  expect(screen.queryByTestId('age-underage')).toBeNull();
});

test('boundary: 120 (max) is an adult — Continue enabled', () => {
  render(<Age value={120} />);
  expect(screen.getByTestId('age-continue')).not.toBeDisabled();
});

test('boundary: 121 is out of range — Continue disabled, no message', () => {
  render(<Age value={121} />);
  expect(screen.getByTestId('age-continue')).toBeDisabled();
  expect(screen.queryByTestId('age-underage')).toBeNull();
});

test('under-18 message is debounced: not shown instantly, Continue stays until it appears', async () => {
  render(<Age value={15} />);
  // Immediately after entry the message is not shown yet (debounced); Continue is still present.
  expect(screen.queryByTestId('age-underage')).toBeNull();
  expect(screen.getByTestId('age-continue')).toBeInTheDocument();

  // After the debounce it appears and Continue is replaced.
  await screen.findByTestId('age-underage');
  expect(screen.queryByTestId('age-continue')).toBeNull();
});

test('typing past an under-18 value does not flash the message', () => {
  const { rerender } = render(<Age value={2} />);
  // "2" is under 18 but the message is debounced, so nothing shows yet.
  expect(screen.queryByTestId('age-underage')).toBeNull();
  // The value settles to an adult age before the debounce elapses → message never appears.
  rerender(<Age value={28} />);
  expect(screen.queryByTestId('age-underage')).toBeNull();
  expect(screen.getByTestId('age-continue')).not.toBeDisabled();
});
