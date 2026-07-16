import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../lib/utils.js";

const pageShellContentVariants = cva(
  "mx-auto flex w-full flex-col gap-[var(--space-4)] px-4 py-[var(--space-4)]",
  {
    variants: {
      maxWidth: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
      },
    },
    defaultVariants: {
      maxWidth: "sm",
    },
  },
);

type PageShellProps = React.ComponentProps<"main"> &
  VariantProps<typeof pageShellContentVariants> & {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    contentClassName?: string;
  };

function PageShell({
  className,
  contentClassName,
  maxWidth,
  header,
  footer,
  children,
  ...props
}: PageShellProps) {
  return (
    <main
      data-slot="page-shell"
      className={cn(
        "min-h-dvh bg-background text-foreground",
        "supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]",
        "supports-[padding:max(0px)]:pb-[max(0px,env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    >
      <div
        data-slot="page-shell-content"
        className={cn(
          pageShellContentVariants({ maxWidth }),
          contentClassName,
        )}
      >
        {header}
        {children}
        {footer}
      </div>
    </main>
  );
}

export { PageShell, pageShellContentVariants };
