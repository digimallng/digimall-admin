import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = "No data found",
  description = "There is no data to display at the moment.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      )}
      
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      
      {description && (
        <p className="mb-6 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      
      {action && <div>{action}</div>}
    </div>
  );
}