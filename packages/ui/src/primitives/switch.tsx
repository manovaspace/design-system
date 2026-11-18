"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/utils.js";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default" | "touch";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 data-[size=touch]:relative data-[size=touch]:h-11 data-[size=touch]:w-14 data-[size=touch]:shadow-none data-[size=touch]:data-[state=checked]:bg-transparent data-[size=touch]:data-[state=unchecked]:bg-transparent dark:data-[size=touch]:data-[state=unchecked]:bg-transparent data-[size=touch]:before:absolute data-[size=touch]:before:inset-x-0 data-[size=touch]:before:top-1/2 data-[size=touch]:before:h-6 data-[size=touch]:before:-translate-y-1/2 data-[size=touch]:before:rounded-full data-[size=touch]:before:bg-input data-[size=touch]:data-[state=checked]:before:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=touch]/switch:relative group-data-[size=touch]/switch:size-5 data-[state=checked]:translate-x-[calc(100%-2px)] rtl:data-[state=checked]:-translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 rtl:data-[state=unchecked]:-translate-x-0 group-data-[size=touch]/switch:data-[state=checked]:translate-x-[calc(100%+14px)] rtl:group-data-[size=touch]/switch:data-[state=checked]:-translate-x-[calc(100%+14px)] dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
