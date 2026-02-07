import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, LayoutDashboard, Library, UserCircle, LogOut, Menu, X, Sparkles, Rocket, Inbox, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useAuthFetch } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { LogoMark } from "@/components/shared/logo-mark";

function PreLaunchBanner({ onDismiss, visible }: { onDismiss: () => void; visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white">
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-center text-sm">
        <Rocket size={14} className="shrink-0 animate-pulse" />
        <span className="font-medium">
          We're launching soon! Join the waitlist for early access & founding member pricing.
        </span>
        <button
          onClick={onDismiss}
          className="ml-2 shrink-0 text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0.5"
          aria-label="Dismiss banner"
          data-testid="button-dismiss-banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function MobileBottomNav({ items }: { items: { label: string; icon: React.ElementType; tab: string }[] }) {
  const [activeTab, setActiveTab] = useState("sessions");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "tools") setActiveTab("library");
    else if (hash === "account") setActiveTab("account");
    else setActiveTab("sessions");
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      setActiveTab((e as CustomEvent).detail);
    };
    window.addEventListener("dashboard-tab", handler);
    return () => window.removeEventListener("dashboard-tab", handler);
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab);
                window.dispatchEvent(new CustomEvent("dashboard-tab", { detail: item.tab }));
              }}
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform cursor-pointer bg-transparent border-none"
              data-testid={`link-bottomnav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
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

  const [bannerVisible, setBannerVisible] = useState(() => {
    try { return sessionStorage.getItem("cp_banner_dismissed") !== "1"; } catch { return true; }
  });

  const dismissBanner = () => {
    setBannerVisible(false);
    try { sessionStorage.setItem("cp_banner_dismissed", "1"); } catch {}
  };

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
    { label: "Sessions", path: "/dashboard", icon: LayoutDashboard, tab: "sessions" },
    { label: "Library", path: "/dashboard#tools", icon: Library, tab: "library" },
    { label: "Account", path: "/dashboard#account", icon: UserCircle, tab: "account" },
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

  const bannerHeight = bannerVisible ? 36 : 0;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <PreLaunchBanner onDismiss={dismissBanner} visible={bannerVisible} />
      </div>
      <motion.nav
        style={{ top: bannerHeight }}
        className={cn(
          "fixed left-0 right-0 z-50 hidden md:flex items-center justify-between px-8 py-4 transition-all duration-300",
          scrolled
            ? "bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm py-3"
            : "bg-white/40 backdrop-blur-md py-6"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/" className="no-underline" data-testid="link-home-logo">
          <LogoMark size="md" />
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
              {isAdminUser && (
                <Link
                  href="/admin"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent no-underline flex items-center gap-1.5",
                    location === "/admin" ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                  data-testid="link-nav-admin"
                >
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <Link
                href="/inbox"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent no-underline flex items-center gap-1.5 relative",
                  location === "/inbox" ? "text-primary font-semibold" : "text-muted-foreground"
                )}
                data-testid="link-nav-inbox"
              >
                <Inbox size={16} />
                Inbox
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
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
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors no-underline"
                data-testid="link-nav-login"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 no-underline active:scale-95"
                data-testid="link-nav-get-started"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Get Started
                </span>
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      <div className="md:hidden fixed left-0 right-0 z-50" style={{ top: bannerHeight }}>
        <div className={cn(
          "flex justify-between items-center p-4 transition-all duration-300",
          scrolled || mobileMenuOpen
            ? "bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-sm"
            : "bg-white/40 backdrop-blur-md"
        )}>
          <Link href="/" className="no-underline">
            <LogoMark size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Link href="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium no-underline shadow-md active:scale-95 transition-transform" data-testid="link-mobile-signin">
                Sign In
              </Link>
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
                    {isAdminUser && (
                      <Link
                        href="/admin"
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors no-underline active:scale-[0.98]",
                          location === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"
                        )}
                        data-testid="link-mobile-admin"
                      >
                        <Shield size={18} />
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/inbox"
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors no-underline active:scale-[0.98] relative",
                        location === "/inbox" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"
                      )}
                      data-testid="link-mobile-inbox"
                    >
                      <Inbox size={18} />
                      Inbox
                      {unreadCount > 0 && (
                        <span className="ml-auto w-5 h-5 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
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
                    <Link
                      href="/signup"
                      className="flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground no-underline shadow-md active:scale-[0.98] transition-transform"
                      data-testid="link-mobile-get-started"
                    >
                      <Sparkles size={14} />
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAuthenticated && location === "/dashboard" && (
        <MobileBottomNav items={loggedInItems} />
      )}
    </>
  );
}
