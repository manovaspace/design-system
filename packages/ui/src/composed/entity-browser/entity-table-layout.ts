/**
 * Shared Entity Browser table chrome — directory and queue lists stay visually aligned.
 * Pages own columns; these classes standardize header band and action column alignment.
 */
export const entityTableHeaderRowClass = "bg-muted/30 hover:bg-muted/30";

export const entityTableActionsHeadClass = "text-end";

export const entityTableActionsCellClass = "text-end";

/** Default cell padding — breathable without wasting row height. */
export const entityTableCellClass = "px-3 py-2.5";

/** Logical-start column (customer/name in RTL) — inset from the table shell. */
export const entityTableStartEdgeCellClass = "ps-4";

/** Logical-end column (actions in RTL) — inset from the table shell. */
export const entityTableEndEdgeCellClass = "pe-3";
