/**
 * Shared Entity Browser table chrome — directory and queue lists stay visually aligned.
 * Pages own columns; these classes standardize header band and action column alignment.
 *
 * ## Column Priority Tiers (The 5-Column Rule)
 *
 * No list page should show more than 5–6 columns at `md` (768 px).
 * Use these tier classes on **both** `<TableHead>` and `<TableCell>` for a column:
 *
 * | Tier          | Class               | Visible from | What belongs here                      |
 * |---------------|---------------------|-------------|----------------------------------------|
 * | **Essential** | (none / always)     | `md` 768 px | Identity, status, primary metric, actions |
 * | **Standard**  | `entityColStandard` | `lg` 1024 px| Phone, date, category — important detail |
 * | **Extended**  | `entityColExtended` | `xl` 1280 px| Sub-totals, dimensions, computed values  |
 *
 * Decision tree:
 * 1. Primary identifier / triage field → Essential
 * 2. Available on detail page, not needed for scanning → Standard
 * 3. Derived value or rarely non-zero → Extended
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

/* ---------------------------------------------------------------------------
 * Column priority tiers — responsive visibility
 * Apply to BOTH <TableHead> and <TableCell> via cn():
 *   const phoneCol = cn(entityColStandard, "min-w-0 whitespace-nowrap", entityTableCellClass);
 * --------------------------------------------------------------------------- */

/**
 * **Essential** — column visible whenever the desktop table renders (`md+`).
 * Identity columns, status, primary metric, and actions.
 * Empty string: no hiding needed; the table itself is already `hidden md:table`.
 */
export const entityColEssential = "";

/**
 * **Standard** — column hidden below `lg` (1 024 px).
 * Important details that don't fit the initial scan: phone, date, category.
 */
export const entityColStandard = "hidden lg:table-cell";

/**
 * **Extended** — column hidden below `xl` (1 280 px).
 * Nice-to-have columns: sub-totals, dimensions, computed metrics, counts.
 */
export const entityColExtended = "hidden xl:table-cell";
