import { Button } from '@hirslanden/ds/button';
import { Heading } from '@hirslanden/ds/heading';
import { ArrowLeftIcon, ArrowRightIcon } from '@hirslanden/ds/icon';
import { InfoCard } from '@hirslanden/ds/infocard';
import { Input } from '@hirslanden/ds/input';
import { Overline } from '@hirslanden/ds/overline';
import { StepProgress } from '@hirslanden/ds/stepprogress';
import { Text } from '@hirslanden/ds/text';
import { TextLink } from '@hirslanden/ds/textlink';
import type { AgeProps } from '@root/src/components/steps/Age/Age.types';
import { useTranslation } from '@root/src/i18n';
import { useEffect, useState } from 'preact/hooks';

const DEFAULT_CURRENT = 3;
const DEFAULT_TOTAL = 14;
const MIN_AGE = 0;
const MAX_AGE = 120;
const ADULT_AGE = 18;
/** Debounce before the under-18 message appears, so a transient digit (e.g. "2" while typing "28") doesn't flash it. */
const UNDERAGE_REVEAL_DELAY_MS = 500;

export function Age({
  value,
  onChange,
  onContinue,
  onBack,
  current = DEFAULT_CURRENT,
  total = DEFAULT_TOTAL,
}: AgeProps) {
  const { translate } = useTranslation();

  const hasAge = typeof value === 'number' && Number.isFinite(value);
  const isValidAge = hasAge && Number.isInteger(value) && value >= MIN_AGE && value <= MAX_AGE;
  const isAdult = isValidAge && value >= ADULT_AGE;
  const isUnderage = isValidAge && value < ADULT_AGE;

  const underageLabel = translate('steps.age.underage.label');
  const underageBody = translate('steps.age.underage.body');

  // The age stays controlled by the parent; this only delays *revealing* the under-18 message
  // until the value settles, so digits typed en route (e.g. "2" while typing "28") don't flash it.
  const [showUnderage, setShowUnderage] = useState(false);
  useEffect(() => {
    if (!isUnderage) {
      setShowUnderage(false);
      return;
    }
    const timer = setTimeout(() => setShowUnderage(true), UNDERAGE_REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isUnderage]);

  return (
    <section data-testid="age" class="mx-auto max-w-2xl border border-border bg-bg p-6 sm:p-8">
      <StepProgress
        current={current}
        total={total}
        label={translate('general.progress.stepOf', { current, total })}
      />

      <div class="mt-6" data-testid="age-overline">
        <Overline>{translate('steps.age.overline')}</Overline>
      </div>

      <div class="mt-2" data-testid="age-question">
        <Heading level={1} className="text-lg!">
          {translate('steps.age.question')}
        </Heading>
      </div>

      <div class="mt-2" data-testid="age-description">
        <Text tone="muted">{translate('steps.age.description')}</Text>
      </div>

      <form
        noValidate
        data-testid="age-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (isAdult) {
            onContinue?.();
          }
        }}
      >
        <div
          class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6"
          data-testid="age-field"
        >
          <Input
            label={translate('steps.age.label')}
            type="number"
            inputMode="numeric"
            min={MIN_AGE}
            max={MAX_AGE}
            step={1}
            value={hasAge ? String(value) : ''}
            onInput={(event) => {
              const raw = event.currentTarget.value;
              if (raw === '') {
                onChange?.(undefined);
                return;
              }
              const parsed = Number(raw);
              onChange?.(Number.isNaN(parsed) ? undefined : parsed);
            }}
            data-testid="age-input"
            className="w-24 shrink-0"
          />

          {showUnderage ? (
            <InfoCard
              label={underageLabel}
              role="status"
              data-testid="age-underage"
              className="w-full sm:flex-1"
            >
              {underageBody}
            </InfoCard>
          ) : null}
        </div>

        <div
          class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          data-testid="age-actions"
        >
          <TextLink leadingIcon={<ArrowLeftIcon />} onClick={onBack}>
            {translate('steps.age.back')}
          </TextLink>

          {showUnderage ? null : (
            // TODO(ds): Button has no trailing-icon slot — a Continue-with-arrow CTA
            // recurs across steps; candidate to add an icon slot to @hirslanden/ds Button.
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!isAdult}
              data-testid="age-continue"
              className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              {translate('steps.age.continue')}
              <ArrowRightIcon />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
