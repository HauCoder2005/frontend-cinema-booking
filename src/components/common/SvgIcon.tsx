"use client";

import React from "react";
import Image from "next/image";

export interface SvgIconProps {
  name: "smartphone" | "mappin" | "shield-check" | "ticket" | "user" | "lock" | "google-g";
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SvgIcon({ name, size = 24, className = "", style = {} }: SvgIconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
}
