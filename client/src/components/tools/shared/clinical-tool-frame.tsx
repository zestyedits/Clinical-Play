import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ClinicalToolFrameProps = ComponentProps<"div">;

/**
 * Outer shell for split-layout games in the playroom.
 * min-h-0 + min-w-0 keeps flex children scrollable inside the fixed playroom viewport.
 */
export function ClinicalToolFrame({ className, ...props }: ClinicalToolFrameProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl",
        className,
      )}
      {...props}
    />
  );
}
