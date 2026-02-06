import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, LayoutDashboard, Gamepad2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Playroom", path: "/playroom/demo", icon: Gamepad2 },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between px-8 py-4 transition-all duration-300",
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm py-3" : "bg-transparent py-6"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg">C</span>
          </div>
          <span className="font-serif font-bold text-xl text-primary tracking-tight">ClinicalPlay</span>
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent no-underline",
                location === item.path ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/dashboard" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 no-underline">
            Sign In
          </Link>
        </div>
      </motion.nav>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/50 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path} className="flex flex-col items-center justify-center w-full h-full gap-1 no-underline">
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  isActive ? "text-primary translate-y-0 opacity-100" : "text-muted-foreground translate-y-1 opacity-0 h-0 overflow-hidden"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Mobile Top Bar Logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center shadow-md">
            <span className="text-white font-serif font-bold">C</span>
          </div>
          <span className="font-serif font-bold text-lg text-primary">ClinicalPlay</span>
        </Link>
      </div>
    </>
  );
}
