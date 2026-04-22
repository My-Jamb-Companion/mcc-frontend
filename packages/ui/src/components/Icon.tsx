import {Icon as IconifyIcon} from "@iconify/react";

type Props = {
  icon: string;
  size?: number;
  className?: string;
  color?: string;
};

export const Icon = ({icon, size = 24, className, color}: Props) => {
  return (
    <IconifyIcon
      icon={icon}
      width={size}
      height={size}
      className={className}
      color={color}
    />
  );
};
