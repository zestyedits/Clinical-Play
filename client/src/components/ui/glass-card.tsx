import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl shadow-sm overflow-hidden",
        hoverEffect && "hover:shadow-md hover:border-border/80 transition-[box-shadow,border-color] duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
