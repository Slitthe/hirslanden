import { IconBase, type IconProps } from './IconBase.js';

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </IconBase>
  );
}
