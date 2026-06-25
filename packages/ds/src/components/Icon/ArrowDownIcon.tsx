import { IconBase, type IconProps } from './IconBase.js';

export function ArrowDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </IconBase>
  );
}
