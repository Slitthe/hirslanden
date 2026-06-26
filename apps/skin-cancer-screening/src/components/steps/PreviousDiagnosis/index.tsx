import { Heading } from '@hirslanden/ds/heading';
import { ArrowLeftIcon } from '@hirslanden/ds/icon';
import { OptionCard } from '@hirslanden/ds/optiongroup';
import { Overline } from '@hirslanden/ds/overline';
import { StepProgress } from '@hirslanden/ds/stepprogress';
import { Text } from '@hirslanden/ds/text';
import { TextLink } from '@hirslanden/ds/textlink';
import {
  PreviousDiagnosisAnswer,
  type PreviousDiagnosisProps,
} from '@root/src/components/steps/PreviousDiagnosis/PreviousDiagnosis.types';
import { useTranslation } from '@root/src/i18n';

const DEFAULT_CURRENT = 2;
const DEFAULT_TOTAL = 14;

export function PreviousDiagnosis({
  value,
  onChange,
  onBack,
  current = DEFAULT_CURRENT,
  total = DEFAULT_TOTAL,
}: PreviousDiagnosisProps) {
  const { translate } = useTranslation();

  return (
    <section
      data-testid="previous-diagnosis"
      class="mx-auto max-w-2xl border border-border bg-bg p-6 sm:p-8"
    >
      <StepProgress
        current={current}
        total={total}
        label={translate('general.progress.stepOf', { current, total })}
      />

      <div class="mt-6" data-testid="previous-diagnosis-overline">
        <Overline>{translate('steps.previousDiagnosis.overline')}</Overline>
      </div>

      <div class="mt-2" data-testid="previous-diagnosis-question">
        <Heading level={1} className="text-xl!">
          {translate('steps.previousDiagnosis.question')}
        </Heading>
      </div>

      <div class="mt-2" data-testid="previous-diagnosis-description">
        <Text tone="muted">{translate('steps.previousDiagnosis.description')}</Text>
      </div>

      <fieldset
        data-testid="previous-diagnosis-options"
        class="mt-6 flex flex-col gap-3 border-0 p-0 m-0"
      >
        <legend class="sr-only">{translate('steps.previousDiagnosis.question')}</legend>
        <OptionCard
          value={PreviousDiagnosisAnswer.Yes}
          title={translate('steps.previousDiagnosis.options.yes.title')}
          description={translate('steps.previousDiagnosis.options.yes.description')}
          selected={value === PreviousDiagnosisAnswer.Yes}
          onClick={() => onChange?.(PreviousDiagnosisAnswer.Yes)}
        />
        <OptionCard
          value={PreviousDiagnosisAnswer.No}
          title={translate('steps.previousDiagnosis.options.no.title')}
          description={translate('steps.previousDiagnosis.options.no.description')}
          selected={value === PreviousDiagnosisAnswer.No}
          onClick={() => onChange?.(PreviousDiagnosisAnswer.No)}
        />
      </fieldset>

      <div class="mt-8">
        <TextLink leadingIcon={<ArrowLeftIcon />} onClick={onBack}>
          {translate('steps.previousDiagnosis.back')}
        </TextLink>
      </div>
    </section>
  );
}
