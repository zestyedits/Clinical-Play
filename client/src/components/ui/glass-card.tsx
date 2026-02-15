import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-card/40 backdrop-blur-md border border-border/30 rounded-3xl shadow-sm overflow-hidden dark:bg-card/60 dark:border-border/20 will-change-[transform,opacity]",
        hoverEffect && "hover:shadow-xl hover:bg-card/55 hover:border-border/50 hover:scale-[1.008] transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out dark:hover:bg-card/70",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
