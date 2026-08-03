import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  Table as PrimitiveTable,
  TableBody as PrimitiveTableBody,
  TableCaption as PrimitiveTableCaption,
  TableCell as PrimitiveTableCell,
  TableFooter as PrimitiveTableFooter,
  TableHead as PrimitiveTableHead,
  TableHeader as PrimitiveTableHeader,
  TableRow as PrimitiveTableRow,
} from "./primitives/table.js";

export function Table({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTable>) {
  return <PrimitiveTable className={className} {...props} />;
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTableHeader>) {
  return <PrimitiveTableHeader className={className} {...props} />;
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTableBody>) {
  return <PrimitiveTableBody className={className} {...props} />;
}

export function TableFooter({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTableFooter>) {
  return <PrimitiveTableFooter className={className} {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTableRow>) {
  return (
    <PrimitiveTableRow
      className={cn("hover:bg-muted/50", className)}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTableHead>) {
  return <PrimitiveTableHead className={className} {...props} />;
}

export function TableCell({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTableCell>) {
  return <PrimitiveTableCell className={className} {...props} />;
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTableCaption>) {
  return <PrimitiveTableCaption className={className} {...props} />;
}
