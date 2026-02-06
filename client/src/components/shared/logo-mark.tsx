import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "full" | "icon";
}

const sizeMap = {
  sm: { height: "h-7" },
  md: { height: "h-8" },
  lg: { height: "h-10" },
  xl: { height: "h-14" },
};

export function LogoMark({ size = "md", className, variant = "full" }: LogoMarkProps) {
  const s = sizeMap[size];
  const src = variant === "icon" ? "/images/logo-icon.png" : "/images/logo-full.png";

  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={src}
        alt="ClinicalPlay"
        className={cn(s.height, "w-auto object-contain")}
        draggable={false}
      />
    </div>
  );
}
