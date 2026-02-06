import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, LayoutDashboard, Library, UserCircle, LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const loggedOutItems = [
    { label: "Features", path: "/#features" },
    { label: "Pricing", path: "/#pricing" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
  ];

  const loggedInItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Tool Library", path: "/dashboard#tools", icon: Library },
    { label: "Account", path: "/dashboard#account", icon: UserCircle },
  ];

  const handleAnchorClick = (path: string, e: React.MouseEvent) => {
    if (path.includes("#")) {
      const [pagePath, hash] = path.split("#");
      if (location === pagePath || (pagePath === "/" && location === "/") || (pagePath === "" && location === "/")) {
        e.preventDefault();
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <>
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between px-8 py-4 transition-all duration-300",
          scrolled
            ? "bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm py-3"
            : "bg-white/40 backdrop-blur-md py-6"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/" className="flex items-center gap-3 no-underline" data-testid="link-home-logo">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg">C</span>
          </div>
          <span className="font-serif font-bold text-xl text-primary tracking-tight">ClinicalPlay</span>
        </Link>

        <div className="flex items-center gap-8">
          {isAuthenticated ? (
            <>
              {loggedInItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleAnchorClick(item.path, e)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent no-underline flex items-center gap-1.5",
                    location === item.path.split("#")[0] && !item.path.includes("#")
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.icon && <item.icon size={16} />}
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => logout()}
                className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                data-testid="button-nav-signout"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              {loggedOutItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleAnchorClick(item.path, e)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent no-underline",
                    location === item.path ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="/api/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors no-underline"
                data-testid="link-nav-login"
              >
                Log In
              </a>
              <a
                href="/api/login"
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 no-underline active:scale-95"
                data-testid="link-nav-get-started"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Get Started
                </span>
              </a>
            </>
          )}
        </div>
      </motion.nav>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className={cn(
          "flex justify-between items-center p-4 transition-all duration-300",
          scrolled || mobileMenuOpen
            ? "bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-sm"
            : "bg-white/40 backdrop-blur-md"
        )}>
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center shadow-md">
              <span className="text-white font-serif font-bold">C</span>
            </div>
            <span className="font-serif font-bold text-lg text-primary">ClinicalPlay</span>
          </Link>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <a href="/api/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium no-underline shadow-md active:scale-95 transition-transform" data-testid="link-mobile-signin">
                Sign In
              </a>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors cursor-pointer active:scale-95"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/90 backdrop-blur-xl border-b border-white/30 overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {isAuthenticated ? (
                  <>
                    {loggedInItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={(e) => handleAnchorClick(item.path, e)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors no-underline active:scale-[0.98]",
                          location === item.path.split("#")[0] && !item.path.includes("#")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary/50"
                        )}
                        data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {item.icon && <item.icon size={18} />}
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer active:scale-[0.98]"
                      data-testid="button-mobile-signout"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {loggedOutItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={(e) => handleAnchorClick(item.path, e)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary/50 transition-colors no-underline active:scale-[0.98]"
                        data-testid={`link-mobile-${item.label.toLowerCase()}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <a
                      href="/api/login"
                      className="flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground no-underline shadow-md active:scale-[0.98] transition-transform"
                      data-testid="link-mobile-get-started"
                    >
                      <Sparkles size={14} />
                      Get Started Free
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/50 pb-safe">
          <div className="flex justify-around items-center h-16 px-2">
            {loggedInItems.map((item) => {
              const basePath = item.path.split("#")[0];
              const isActive = location === basePath || (basePath !== "/" && location.startsWith(basePath));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleAnchorClick(item.path, e)}
                  className="flex flex-col items-center justify-center w-full h-full gap-1 no-underline active:scale-95 transition-transform"
                  data-testid={`link-bottomnav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className={cn(
                    "p-1.5 rounded-xl transition-all duration-300",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}>
                    {item.icon && <item.icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />}
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
      )}
    </>
  );
}
