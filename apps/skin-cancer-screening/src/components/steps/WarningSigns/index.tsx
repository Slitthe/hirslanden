import { Heading } from '@hirslanden/ds/heading';
import { ArrowLeftIcon } from '@hirslanden/ds/icon';
import { OptionCard } from '@hirslanden/ds/optiongroup';
import { Overline } from '@hirslanden/ds/overline';
import { StepProgress } from '@hirslanden/ds/stepprogress';
import { TextLink } from '@hirslanden/ds/textlink';
import {
  WarningSignsAnswer,
  type WarningSignsProps,
} from '@root/src/components/steps/WarningSigns/WarningSigns.types';
import { useTranslation } from '@root/src/i18n';

const DEFAULT_CURRENT = 1;
const DEFAULT_TOTAL = 14;

export function WarningSigns({
  value,
  onChange,
  onBack,
  current = DEFAULT_CURRENT,
  total = DEFAULT_TOTAL,
}: WarningSignsProps) {
  const { translate } = useTranslation();

  return (
    <section
      data-testid="warning-signs"
      class="mx-auto max-w-2xl border border-border bg-bg p-6 sm:p-8"
    >
      <StepProgress
        current={current}
        total={total}
        label={translate('general.progress.stepOf', { current, total })}
      />

      <div class="mt-6" data-testid="warning-signs-overline">
        <Overline>{translate('steps.warningSigns.overline')}</Overline>
      </div>

      <div class="mt-2" data-testid="warning-signs-question">
        <Heading level={1} className="text-lg!">
          {translate('steps.warningSigns.question')}
        </Heading>
      </div>

      <fieldset
        data-testid="warning-signs-options"
        class="mt-6 flex flex-col gap-3 border-0 p-0 m-0"
      >
        <legend class="sr-only">{translate('steps.warningSigns.question')}</legend>
        <OptionCard
          value={WarningSignsAnswer.Yes}
          title={translate('steps.warningSigns.options.yes.title')}
          description={translate('steps.warningSigns.options.yes.description')}
          selected={value === WarningSignsAnswer.Yes}
          onClick={() => onChange?.(WarningSignsAnswer.Yes)}
        />
        <OptionCard
          value={WarningSignsAnswer.No}
          title={translate('steps.warningSigns.options.no.title')}
          description={translate('steps.warningSigns.options.no.description')}
          selected={value === WarningSignsAnswer.No}
          onClick={() => onChange?.(WarningSignsAnswer.No)}
        />
        <OptionCard
          value={WarningSignsAnswer.Unsure}
          title={translate('steps.warningSigns.options.unsure.title')}
          description={translate('steps.warningSigns.options.unsure.description')}
          selected={value === WarningSignsAnswer.Unsure}
          onClick={() => onChange?.(WarningSignsAnswer.Unsure)}
        />
      </fieldset>

      <div class="mt-8">
        <TextLink leadingIcon={<ArrowLeftIcon />} onClick={onBack}>
          {translate('steps.warningSigns.back')}
        </TextLink>
      </div>
    </section>
  );
}
