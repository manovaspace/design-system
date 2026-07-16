import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  Card as PrimitiveCard,
  CardAction as PrimitiveCardAction,
  CardContent as PrimitiveCardContent,
  CardDescription as PrimitiveCardDescription,
  CardFooter as PrimitiveCardFooter,
  CardHeader as PrimitiveCardHeader,
  CardTitle as PrimitiveCardTitle,
} from "./primitives/card.js";

export type CardProps = React.ComponentProps<typeof PrimitiveCard> & {
  size?: "default" | "sm";
};

export function Card({ className, size = "default", ...props }: CardProps) {
  return (
    <PrimitiveCard
      data-size={size}
      className={cn(
        "rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-md)]",
        size === "sm" && "gap-4 py-4",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveCardHeader>) {
  return <PrimitiveCardHeader className={className} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveCardTitle>) {
  return (
    <PrimitiveCardTitle
      className={cn("text-[length:var(--font-size-heading)]", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveCardDescription>) {
  return <PrimitiveCardDescription className={className} {...props} />;
}

export function CardAction({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveCardAction>) {
  return <PrimitiveCardAction className={className} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveCardContent>) {
  return <PrimitiveCardContent className={className} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveCardFooter>) {
  return <PrimitiveCardFooter className={className} {...props} />;
}
