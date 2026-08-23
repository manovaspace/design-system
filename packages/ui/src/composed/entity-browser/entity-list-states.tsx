"use client";

import type { ReactNode } from "react";
import {
  EntityMobileEmptyFiltered,
  EntityMobileLoadingList,
  EntityMobileMessage,
} from "./entity-mobile-states";
import {
  EntityTableEmptyFiltered,
  EntityTableLoadingRows,
  EntityTableMessageRow,
} from "./entity-table-states";

export type EntityListQueryState = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  hasActiveFilters?: boolean;
  loadErrorMessage: string;
  emptyMessage: string;
  emptyFilteredMessage?: string;
  clearFiltersLabel?: string;
  onClearFilters?: () => void;
  emptyContent?: ReactNode;
  loadingRows?: number;
};

export function EntityListBody({
  colSpan,
  state,
  children,
}: {
  colSpan: number;
  state: EntityListQueryState;
  children: ReactNode;
}) {
  const {
    isLoading,
    isError,
    isEmpty,
    hasActiveFilters,
    loadErrorMessage,
    emptyMessage,
    emptyFilteredMessage,
    clearFiltersLabel,
    onClearFilters,
    emptyContent,
    loadingRows,
  } = state;

  if (isLoading) {
    return <EntityTableLoadingRows colSpan={colSpan} rows={loadingRows} />;
  }

  if (isError) {
    return (
      <EntityTableMessageRow colSpan={colSpan} tone="destructive">
        {loadErrorMessage}
      </EntityTableMessageRow>
    );
  }

  if (isEmpty) {
    if (
      hasActiveFilters &&
      emptyFilteredMessage &&
      clearFiltersLabel &&
      onClearFilters
    ) {
      return (
        <EntityTableEmptyFiltered
          colSpan={colSpan}
          message={emptyFilteredMessage}
          clearLabel={clearFiltersLabel}
          onClear={onClearFilters}
        />
      );
    }

    return (
      <EntityTableMessageRow colSpan={colSpan}>
        {emptyContent ?? emptyMessage}
      </EntityTableMessageRow>
    );
  }

  return children;
}

export function EntityMobileListBody({
  state,
  children,
}: {
  state: EntityListQueryState;
  children: ReactNode;
}) {
  const {
    isLoading,
    isError,
    isEmpty,
    hasActiveFilters,
    loadErrorMessage,
    emptyMessage,
    emptyFilteredMessage,
    clearFiltersLabel,
    onClearFilters,
    emptyContent,
    loadingRows,
  } = state;

  if (isLoading) {
    return <EntityMobileLoadingList rows={loadingRows} />;
  }

  if (isError) {
    return (
      <EntityMobileMessage tone="destructive">
        {loadErrorMessage}
      </EntityMobileMessage>
    );
  }

  if (isEmpty) {
    if (
      hasActiveFilters &&
      emptyFilteredMessage &&
      clearFiltersLabel &&
      onClearFilters
    ) {
      return (
        <EntityMobileEmptyFiltered
          message={emptyFilteredMessage}
          clearLabel={clearFiltersLabel}
          onClear={onClearFilters}
        />
      );
    }

    return (
      <EntityMobileMessage>{emptyContent ?? emptyMessage}</EntityMobileMessage>
    );
  }

  return children;
}
