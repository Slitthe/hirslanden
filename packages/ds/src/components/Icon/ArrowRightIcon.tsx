import { IconBase, type IconProps } from './IconBase.js';

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </IconBase>
  );
}
