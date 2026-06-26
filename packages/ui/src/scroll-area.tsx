import type { ComponentProps } from "react";

export { ScrollBar } from "./primitives/scroll-area.js";

import { cn } from "./lib/utils.js";
import { ScrollArea as PrimitiveScrollArea } from "./primitives/scroll-area.js";

export type ScrollAreaProps = ComponentProps<typeof PrimitiveScrollArea> & {
  viewportClassName?: string;
};

/** Public ScrollArea — optional viewportClassName for inner viewport styling. */
export function ScrollArea({
  viewportClassName,
  children,
  className,
  ...props
}: ScrollAreaProps) {
  if (!viewportClassName) {
    return (
      <PrimitiveScrollArea className={className} {...props}>
        {children}
      </PrimitiveScrollArea>
    );
  }

  return (
    <PrimitiveScrollArea className={className} {...props}>
      <div className={cn(viewportClassName)}>{children}</div>
    </PrimitiveScrollArea>
  );
}
