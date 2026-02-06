import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: "w-7 h-7", text: "text-base", fontSize: "text-sm" },
  md: { icon: "w-8 h-8", text: "text-lg", fontSize: "text-base" },
  lg: { icon: "w-10 h-10", text: "text-xl", fontSize: "text-lg" },
  xl: { icon: "w-14 h-14", text: "text-3xl", fontSize: "text-2xl" },
};

export function LogoMark({ size = "md", showText = true, className }: LogoMarkProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(s.icon, "rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-md")}>
        <span className={cn("text-white font-serif font-bold", s.fontSize)}>C</span>
      </div>
      {showText && (
        <span className={cn("font-serif font-bold text-primary tracking-tight", s.text)}>ClinicalPlay</span>
      )}
    </div>
  );
}
