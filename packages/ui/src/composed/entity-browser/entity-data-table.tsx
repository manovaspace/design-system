/**
 * Responsive table + optional mobile list for Entity Browser pages.
 * Owns loading / error / empty states; pages own header columns and row cells.
 */
"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { Table, TableBody } from "../../table.js";
import {
  EntityListBody,
  type EntityListQueryState,
  EntityMobileListBody,
} from "./entity-list-states.js";

/**
 * Static Tailwind class strings per breakpoint (JIT needs literal class names).
 * `md` is the default switch point; `lg` suits wide tables.
 */
const BREAKPOINT_CLASSES = {
  md: {
    mobile: "md:hidden",
    desktop: "hidden md:block",
    table: "hidden table-fixed md:table",
  },
  lg: {
    mobile: "lg:hidden",
    desktop: "hidden lg:block",
    table: "hidden table-fixed lg:table",
  },
} as const;

export type EntityDataTableProps = {
  colSpan: number;
  state: EntityListQueryState;
  header: ReactNode;
  colgroup?: ReactNode;
  tableClassName?: string;
  /** Wrapper around the desktop table (e.g. `max-w-3xl`). */
  desktopClassName?: string;
  /** Mobile list when data is present — omit when the page is table-only. */
  mobile?: ReactNode;
  /**
   * Width where the mobile list gives way to the table. `md` (default) suits
   * tables of a few columns; use `lg` for wide tables so tablets get the rows.
   * Applies only with `mobile`.
   * @defaultValue "md"
   */
  tableFrom?: "md" | "lg";
  children: ReactNode;
};

export function EntityDataTable({
  colSpan,
  state,
  header,
  colgroup,
  tableClassName,
  desktopClassName,
  mobile,
  tableFrom = "md",
  children,
}: EntityDataTableProps) {
  const hasMobile = mobile != null;
  const breakpoint = BREAKPOINT_CLASSES[tableFrom];

  return (
    <>
      {hasMobile ? (
        <div className={breakpoint.mobile}>
          <EntityMobileListBody state={state}>{mobile}</EntityMobileListBody>
        </div>
      ) : null}

      <div
        className={cn(
          "w-full",
          hasMobile && breakpoint.desktop,
          desktopClassName,
        )}
      >
        <Table className={cn(tableClassName, hasMobile && breakpoint.table)}>
          {colgroup}
          {header}
          <TableBody>
            <EntityListBody colSpan={colSpan} state={state}>
              {children}
            </EntityListBody>
          </TableBody>
        </Table>
      </div>
    </>
  );
}
