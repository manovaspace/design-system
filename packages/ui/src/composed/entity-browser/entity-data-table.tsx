"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Table, TableBody } from "../../table";
import {
  EntityListBody,
  type EntityListQueryState,
  EntityMobileListBody,
} from "./entity-list-states";

export type EntityDataTableProps = {
  colSpan: number;
  state: EntityListQueryState;
  header: ReactNode;
  colgroup?: ReactNode;
  tableClassName?: string;
  desktopClassName?: string;
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
