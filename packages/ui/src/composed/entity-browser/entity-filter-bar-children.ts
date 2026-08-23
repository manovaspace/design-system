import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export interface PartitionedFilterBarChildren {
  search: ReactNode[];
  filters: ReactNode[];
}

function isSearchElement(node: ReactNode): boolean {
  if (!isValidElement(node)) {
    return false;
  }
  const el = node as ReactElement<{ id?: string; "data-slot"?: string }>;
  if (el.props?.["data-slot"] === "entity-search-field") {
    return true;
  }
  const name =
    typeof el.type === "function"
      ? (el.type.name ?? "")
      : typeof el.type === "object" && el.type !== null && "displayName" in el.type
        ? String((el.type as { displayName?: string }).displayName ?? "")
        : "";
  return name === "EntitySearchField" || el.props?.id === "search";
}

export function partitionFilterBarChildren(
  children: ReactNode,
): PartitionedFilterBarChildren {
  const search: ReactNode[] = [];
  const filters: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (child == null || child === false) {
      return;
    }
    if (isSearchElement(child)) {
      search.push(child);
    } else {
      filters.push(child);
    }
  });

  return { search, filters };
}
