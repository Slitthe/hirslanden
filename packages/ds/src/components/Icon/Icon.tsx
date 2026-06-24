import type { SVGProps } from 'react';

export type IconName = 'plus' | 'minus' | 'arrow-left' | 'arrow-right' | 'arrow-down';

const PATHS: Record<IconName, string> = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  'arrow-down': 'M12 5v14M5 12l7 7 7-7',
};

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  title?: string;
}

export function Icon({ name, size = '1em', title, ...rest }: IconProps) {
  const labelled = title != null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? title : undefined}
      aria-hidden={labelled ? undefined : true}
      {...rest}
    >
      {labelled ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
