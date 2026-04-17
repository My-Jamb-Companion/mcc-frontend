"use client";

import { Icon as IconifyIcon } from "@iconify/react";

type Props = {
  name: string;
  size?: number;
  className?: string;
};

export const Icon = ({ name, size = 24, className }: Props) => {
  return (
    <IconifyIcon
      icon={name}
      width={size}
      height={size}
      className={className}
    />
  );
};