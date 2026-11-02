"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { useDirection } from "../direction-provider.js";
import { iconProps } from "../icon.js";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "../icons.js";
import { cn } from "../lib/utils.js";

/** A workspace the switcher can display and select. @experimental */
export type WorkspaceSwitcherItem = {
  id: string;
  name: string;
  logoSrc?: string;
  subtitle?: string;
};

/** Caller-supplied copy for the workspace switcher. @experimental */
export type WorkspaceSwitcherLabels = {
  /** Accessible name of the trigger button. */
  trigger: string;
  /** Accessible name of the workspace listbox. */
  list: string;
  /** Shown when there are no workspaces. */
  empty: string;
  /** Label of the optional create action. Required when `onCreate` is set. */
  create?: string;
};

/** Props for WorkspaceSwitcher. @experimental */
export type WorkspaceSwitcherProps = {
  workspaces: WorkspaceSwitcherItem[];
  currentId: string;
  onSwitch: (id: string) => void;
  /** All visible copy is supplied by the caller; no language is hardcoded. */
  labels: WorkspaceSwitcherLabels;
  onCreate?: () => void;
  className?: string;
};

function workspaceInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toUpperCase();
}

function WorkspaceMark({
  workspace,
  className,
}: {
  workspace: WorkspaceSwitcherItem;
  className?: string;
}) {
  if (workspace.logoSrc) {
    return (
      <img
        src={workspace.logoSrc}
        alt=""
        data-slot="workspace-switcher-logo"
        className={cn(
          "size-6 shrink-0 rounded-[var(--radius-sm)] object-cover",
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      data-slot="workspace-switcher-initials"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-muted text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {workspaceInitials(workspace.name)}
    </span>
  );
}

function WorkspaceText({
  workspace,
  className,
}: {
  workspace: WorkspaceSwitcherItem;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 flex-col", className)}>
      <span className="truncate text-sm font-medium text-foreground">
        {workspace.name}
      </span>
      {workspace.subtitle ? (
        <span className="truncate text-xs text-muted-foreground">
          {workspace.subtitle}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Workspace chooser with a listbox, single and empty states.
 *
 * The caller owns workspace data, authorization and every visible label.
 * Accessibility: the trigger is a button with `aria-haspopup="listbox"` and
 * `aria-expanded`; the popup is a labelled `role="listbox"` with
 * `aria-selected` options. Arrow keys, Home/End, Enter/Space, Escape and
 * type-ahead are supported; Escape and selection return focus to the trigger.
 * Interactive targets are at least 44px. Layout uses logical properties and
 * the chevron mirrors in RTL. Single-workspace and empty states render static
 * text with no menu.
 *
 * @experimental API may change.
 */
export function WorkspaceSwitcher({
  workspaces,
  currentId,
  onSwitch,
  labels,
  onCreate,
  className,
}: WorkspaceSwitcherProps) {
  const direction = useDirection();
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const typeaheadRef = useRef({ query: "", at: 0 });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const current = workspaces.find((item) => item.id === currentId);
  const singleWorkspace = workspaces.length === 1 ? workspaces[0] : undefined;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;
  const isRtl = direction === "rtl";

  useEffect(() => {
    if (open) {
      listboxRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const root = rootRef.current;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!root?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnFocusOut = (event: FocusEvent) => {
      if (!root?.contains(event.relatedTarget as Node | null)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    root?.addEventListener("focusout", closeOnFocusOut);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      root?.removeEventListener("focusout", closeOnFocusOut);
    };
  }, [open]);

  const openList = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const closeAndFocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const selectWorkspace = (id: string) => {
    setOpen(false);
    onSwitch(id);
    triggerRef.current?.focus();
  };

  const currentIndex = workspaces.findIndex((item) => item.id === currentId);

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Enter" &&
      event.key !== " "
    ) {
      return;
    }

    event.preventDefault();
    openList(
      event.key === "ArrowUp"
        ? workspaces.length - 1
        : Math.max(0, currentIndex),
    );
  };

  const handleTypeAhead = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return false;
    }

    const now = Date.now();
    const previous = typeaheadRef.current;
    const query =
      now - previous.at > 500 ? event.key : previous.query + event.key;
    typeaheadRef.current = { query, at: now };

    const needle = query.toLowerCase();
    const start = activeIndex < 0 ? 0 : activeIndex + 1;
    for (let offset = 0; offset < workspaces.length; offset += 1) {
      const index = (start + offset) % workspaces.length;
      const workspace = workspaces[index];
      if (workspace?.name.toLowerCase().startsWith(needle)) {
        setActiveIndex(index);
        return true;
      }
    }
    return false;
  };

  const handleListboxKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const count = workspaces.length;

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
      setActiveIndex((previous) => {
        if (event.key === "Home") return 0;
        if (event.key === "End") return count - 1;
        if (event.key === "ArrowDown") {
          return previous < 0 ? 0 : (previous + 1) % count;
        }
        return previous < 0 ? count - 1 : (previous - 1 + count) % count;
      });
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const workspace = workspaces[activeIndex] ?? current;
      if (workspace) {
        selectWorkspace(workspace.id);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocusTrigger();
      return;
    }

    if (handleTypeAhead(event)) {
      event.preventDefault();
    }
  };

  const handleCreateKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocusTrigger();
    }
  };

  if (workspaces.length === 0) {
    return (
      <div
        dir={direction}
        data-slot="workspace-switcher"
        data-state="empty"
        className={cn(
          "flex min-h-11 w-full items-center rounded-[var(--radius-lg)] border border-dashed border-border px-3 py-2",
          className,
        )}
      >
        <span className="text-sm text-muted-foreground">{labels.empty}</span>
      </div>
    );
  }

  if (singleWorkspace) {
    return (
      <div
        dir={direction}
        data-slot="workspace-switcher"
        data-state="single"
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2",
          className,
        )}
      >
        <WorkspaceMark workspace={singleWorkspace} />
        <WorkspaceText workspace={singleWorkspace} />
      </div>
    );
  }

  const activeWorkspace = workspaces[activeIndex];
  const chevronFlipped = open !== isRtl;

  return (
    <div
      ref={rootRef}
      dir={direction}
      data-slot="workspace-switcher"
      data-state={open ? "open" : "closed"}
      className={cn("relative w-full", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        data-slot="workspace-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={labels.trigger}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openList(Math.max(0, currentIndex));
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-input bg-background px-3 py-2 text-start text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="flex min-w-0 items-center gap-2">
          {current ? <WorkspaceMark workspace={current} /> : null}
          {current ? <WorkspaceText workspace={current} /> : null}
        </span>
        <ChevronDownIcon
          data-slot="workspace-switcher-chevron"
          {...iconProps({
            size: "sm",
            className: cn(
              "text-muted-foreground transition-transform",
              chevronFlipped && "rotate-180",
            ),
          })}
        />
      </button>

      {open ? (
        <div
          data-slot="workspace-switcher-popup"
          className="absolute start-0 top-full z-50 mt-2 w-full min-w-48 rounded-[var(--radius-lg)] border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label={labels.list}
            tabIndex={-1}
            aria-activedescendant={
              activeWorkspace ? optionId(activeIndex) : undefined
            }
            onKeyDown={handleListboxKeyDown}
            className="flex flex-col outline-none"
          >
            {workspaces.map((workspace, index) => {
              const selected = workspace.id === currentId;
              return (
                // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard is handled by the parent listbox.
                <div
                  key={workspace.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={selected}
                  data-slot="workspace-switcher-option"
                  data-active={index === activeIndex || undefined}
                  tabIndex={-1}
                  onPointerDown={(event) => event.preventDefault()}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => selectWorkspace(workspace.id)}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-start select-none",
                    index === activeIndex && "bg-accent text-accent-foreground",
                  )}
                >
                  <WorkspaceMark workspace={workspace} />
                  <WorkspaceText workspace={workspace} />
                  {selected ? (
                    <CheckIcon
                      {...iconProps({
                        size: "sm",
                        className: "ms-auto text-primary",
                      })}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {onCreate && labels.create ? (
            <>
              <hr className="-mx-1 my-1 h-px border-0 bg-border" />
              <button
                type="button"
                data-slot="workspace-switcher-create"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  onCreate();
                }}
                onKeyDown={handleCreateKeyDown}
                className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-start text-sm font-medium text-foreground select-none hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <PlusIcon {...iconProps({ size: "sm" })} />
                <span className="truncate">{labels.create}</span>
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
