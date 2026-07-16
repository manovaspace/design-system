import { useDevtools } from "../context.js";

export function ViewportFrame({ children }: { children: React.ReactNode }) {
  const { viewport } = useDevtools();

  if (!viewport) {
    return <>{children}</>;
  }

  return (
    <div
      className="mx-auto border border-dashed border-border p-2"
      style={{ width: viewport.width }}
    >
      {children}
    </div>
  );
}
