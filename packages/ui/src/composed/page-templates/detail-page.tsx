"use client";

import type * as React from "react";
import { useId } from "react";

import { ChevronLeftIcon } from "../../icons.js";
import { cn } from "../../lib/utils.js";

export type DetailPageLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export type DetailPageProps = {
  /** Page heading (h1): the record's name. */
  title: string;
  /** One meta line under the title (status, code, date). */
  description?: React.ReactNode;
  /** Link back to the parent list. */
  back: { label: string; href: string };
  /** Router link component (e.g. Next.js Link). Defaults to `a`. */
  linkComponent?: React.ComponentType<DetailPageLinkProps>;
  /** The one primary action (a `Button`). */
  primaryAction?: React.ReactNode;
  /** `DetailPageSection` elements. */
  children: React.ReactNode;
  /** Destructive actions, rendered last in their own section. */
  destructive?: { title: string; children: React.ReactNode };
  className?: string;
};

export type DetailPageSectionProps = {
  /** Section heading; the section's accessible name. */
  title: string;
  /** Meta text under the heading. */
  description?: React.ReactNode;
  /** One secondary action for this section, e.g. an edit button. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function DefaultLink({ href, className, children }: DetailPageLinkProps) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/**
 * Section of a DetailPage.
 *
 * Usage rules:
 * - Use only inside `DetailPage`.
 * - Put the content of one topic in each section.
 * - At most one secondary `action` per section.
 */
export function DetailPageSection({
  title,
  description,
  action,
  children,
  className,
}: DetailPageSectionProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      data-slot="detail-page-section"
      className={cn("rounded-xl border border-border bg-card p-4", className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          {description != null && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
        {action != null && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Record page: back, title, one action.
 *
 * Usage rules:
 * - Back goes to the parent list.
 * - One primary action, in `primaryAction`.
 * - Content goes in `DetailPageSection`s.
 * - Destructive actions go in `destructive`, which always renders last.
 */
export function DetailPage({
  title,
  description,
  back,
  linkComponent: BackLink = DefaultLink,
  primaryAction,
  children,
  destructive,
  className,
}: DetailPageProps) {
  const destructiveId = useId();
  return (
    <article
      data-slot="detail-page"
      className={cn("mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6", className)}
    >
      <header data-slot="detail-page-header" className="space-y-3">
        <BackLink
          href={back.href}
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground"
        >
          <ChevronLeftIcon
            className="size-4 shrink-0 rtl:rotate-180"
            aria-hidden="true"
          />
          {back.label}
        </BackLink>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description != null && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
          {primaryAction != null && (
            <div className="shrink-0">{primaryAction}</div>
          )}
        </div>
      </header>
      {children}
      {destructive !== undefined && (
        <section
          aria-labelledby={destructiveId}
          data-slot="detail-page-destructive"
          className="rounded-xl border border-destructive/40 bg-card p-4"
        >
          <h2
            id={destructiveId}
            className="text-base font-semibold text-destructive"
          >
            {destructive.title}
          </h2>
          <div className="mt-4">{destructive.children}</div>
        </section>
      )}
    </article>
  );
}
