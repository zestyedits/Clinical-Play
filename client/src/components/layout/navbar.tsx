import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Library, LogOut, Menu, X, ArrowRight, Inbox, Shield, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, useAuthFetch } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { LogoMark } from "@/components/shared/logo-mark";

function MobileBottomNav({ items, currentPath, unreadCount, isDark }: { items: { label: string; icon: React.ElementType; tab: string; path: string }[]; currentPath: string; unreadCount: number; isDark?: boolean }) {
  const [, navigate] = useLocation();

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t",
        isDark
          ? "bg-[#3D3228]/95 border-[#5A4E40]/40"
          : "bg-background/95 border-border"
      )}
      aria-label="Mobile navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex justify-around items-center h-16 px-2" role="tablist">
        {items.map((item) => {
          const isActive = item.path === "/settings"
            ? currentPath.startsWith("/settings")
            : currentPath === item.path;
          return (
            <button
              key={item.tab}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full gap-1 bg-transparent border-none cursor-pointer transition-colors",
                isDark
                  ? isActive ? "text-[#C9956B]" : "text-[#7A6E60]"
                  : isActive ? "text-primary" : "text-muted-foreground"
              )}
              data-testid={`link-bottomnav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="relative">
                <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
                {item.tab === "inbox" && unreadCount > 0 && (
                  <span className={cn("absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center", isDark ? "bg-[#C9956B]" : "bg-accent")}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
              {isActive && (
                <span className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full", isDark ? "bg-[#C9956B]" : "bg-primary")} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const authFetch = useAuthFetch();

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    queryFn: async () => {
      const res = await authFetch("/api/messages/unread-count");
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count ?? 0;

  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    queryFn: async () => {
      const res = await authFetch("/api/admin/check");
      if (!res.ok) return { isAdmin: false };
      return res.json();
    },
    enabled: isAuthenticated,
  });
  const isAdminUser = adminCheck?.isAdmin === true;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const loggedOutItems = [
    { label: "Features", path: "/#features" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
  ];

  const loggedInItems = [
    { label: "Sessions", path: "/dashboard", icon: LayoutDashboard, tab: "sessions" },
    { label: "Library", path: "/library", icon: Library, tab: "library" },
    { label: "Inbox", path: "/inbox", icon: Inbox, tab: "inbox" },
    { label: "Settings", path: "/settings", icon: SlidersHorizontal, tab: "settings" },
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

  const isDarkPage = location === "/dashboard";

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between px-6 h-16 border-b",
          isDarkPage
            ? "bg-[#3D3228]/90 backdrop-blur-md border-[#5A4E40]/40"
            : "bg-background border-border"
        )}
      >
        <Link href="/" className="no-underline" data-testid="link-home-logo">
          <LogoMark size="sm" />
        </Link>

        <div className="flex items-center">
          {isAuthenticated ? (
            <>
              {/* Tab-style navigation */}
              <div className="flex items-center h-16">
                {loggedInItems.map((item) => {
                  const isActive = item.path === "/settings"
                    ? location.startsWith("/settings")
                    : location === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "relative flex items-center gap-2 px-4 h-full text-sm font-medium transition-colors no-underline",
                        isDarkPage
                          ? isActive ? "text-[#C9956B]" : "text-[#A89880] hover:text-[#D8CABB]"
                          : isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                      data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <item.icon size={16} />
                      {item.label}
                      {item.tab === "inbox" && unreadCount > 0 && (
                        <span className={cn("w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center", isDarkPage ? "bg-[#C9956B]" : "bg-accent")}>
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                      {isActive && (
                        <span className={cn("absolute bottom-0 left-3 right-3 h-0.5 rounded-full", isDarkPage ? "bg-[#C9956B]" : "bg-primary")} />
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className={cn("ml-4 pl-4 border-l flex items-center gap-3", isDarkPage ? "border-[#5A4E40]/40" : "border-border")}>
                {isAdminUser && (() => {
                  const isAdminActive = location === "/admin";
                  return (
                    <Link
                      href="/admin"
                      className={cn(
                        "text-sm font-medium transition-colors no-underline flex items-center gap-1.5",
                        isDarkPage
                          ? isAdminActive ? "text-[#C9956B]" : "text-[#A89880] hover:text-[#D8CABB]"
                          : isAdminActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                      data-testid="link-nav-admin"
                    >
                      <Shield size={15} />
                      Admin
                    </Link>
                  );
                })()}
                <button
                  onClick={() => logout()}
                  className={cn(
                    "text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                    isDarkPage ? "text-[#A89880] hover:text-[#C27878]" : "text-muted-foreground hover:text-destructive"
                  )}
                  data-testid="button-nav-signout"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-6">
              {loggedOutItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleAnchorClick(item.path, e)}
                  className={cn(
                    "text-sm font-medium transition-colors no-underline",
                    location === item.path ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium btn-warm no-underline"
                data-testid="link-nav-login"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden fixed left-0 right-0 top-0 z-50">
        <div className={cn(
          "flex justify-between items-center px-4 h-14 border-b",
          isDarkPage
            ? "bg-[#3D3228]/90 backdrop-blur-md border-[#5A4E40]/40"
            : "bg-background border-border"
        )}>
          <Link href="/" className="no-underline">
            <LogoMark size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Link href="/login" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium no-underline" data-testid="link-mobile-signin">
                Sign In
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-secondary transition-colors cursor-pointer"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "border-b overflow-hidden",
                isDarkPage
                  ? "bg-[#3D3228] border-[#5A4E40]/40"
                  : "bg-background border-border"
              )}
            >
              <div className="p-3 space-y-0.5">
                {isAuthenticated ? (
                  <>
                    {loggedInItems.map((item) => {
                      const isMobileActive = item.path === "/settings"
                        ? location.startsWith("/settings")
                        : location === item.path;
                      return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline",
                          isDarkPage
                            ? isMobileActive ? "bg-[#C9956B]/10 text-[#C9956B]" : "text-[#A89880] hover:bg-[#5A4E40]/40"
                            : isMobileActive ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-secondary"
                        )}
                        data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <item.icon size={18} />
                        {item.label}
                        {item.tab === "inbox" && unreadCount > 0 && (
                          <span className={cn("ml-auto w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center", isDarkPage ? "bg-[#C9956B]" : "bg-accent")}>
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                      );
                    })}
                    {isAdminUser && (
                      <Link
                        href="/admin"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline",
                          isDarkPage
                            ? location === "/admin" ? "bg-[#C9956B]/10 text-[#C9956B]" : "text-[#A89880] hover:bg-[#5A4E40]/40"
                            : location === "/admin" ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-secondary"
                        )}
                        data-testid="link-mobile-admin"
                      >
                        <Shield size={18} />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                        isDarkPage ? "text-[#C27878] hover:bg-[#C27878]/8" : "text-destructive hover:bg-destructive/8"
                      )}
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
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors no-underline"
                        data-testid={`link-mobile-${item.label.toLowerCase()}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Link
                      href="/signup"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 mt-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground no-underline btn-warm"
                      data-testid="link-mobile-get-started"
                    >
                      <ArrowRight size={14} />
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {isAuthenticated && !location.startsWith("/playroom/") && (
        <MobileBottomNav items={loggedInItems} currentPath={location} unreadCount={unreadCount} isDark={isDarkPage} />
      )}
    </>
  );
}
