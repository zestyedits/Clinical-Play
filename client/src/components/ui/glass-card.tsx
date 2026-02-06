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
        "bg-white/40 backdrop-blur-md border border-white/30 rounded-3xl shadow-sm overflow-hidden",
        hoverEffect && "hover:shadow-xl hover:bg-white/60 hover:scale-[1.01] transition-all duration-500 ease-out",
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
