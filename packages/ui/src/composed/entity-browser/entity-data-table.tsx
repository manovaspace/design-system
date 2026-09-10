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

export type EntityDataTableProps = {
  colSpan: number;
  state: EntityListQueryState;
  header: ReactNode;
  colgroup?: ReactNode;
  tableClassName?: string;
  /** Wrapper around the desktop table (e.g. `hidden md:block max-w-3xl`). */
  desktopClassName?: string;
  /** Mobile list when data is present — omit when the page is table-only. */
  mobile?: ReactNode;
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
  children,
}: EntityDataTableProps) {
  const hasMobile = mobile != null;

  return (
    <>
      {hasMobile ? (
        <div className="md:hidden">
          <EntityMobileListBody state={state}>{mobile}</EntityMobileListBody>
        </div>
      ) : null}

      <div
        className={cn(
          "w-full",
          hasMobile && "hidden md:block",
          desktopClassName,
        )}
      >
        <Table
          className={cn(
            tableClassName,
            hasMobile && "hidden table-fixed md:table",
          )}
        >
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
