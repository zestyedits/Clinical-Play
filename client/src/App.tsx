import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { SessionProvider } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import Dashboard from "@/pages/dashboard";
import Playroom from "@/pages/playroom";
import JoinSession from "@/pages/join-session";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Cookies from "@/pages/cookies";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import EmailConfirmed from "@/pages/email-confirmed";
import InboxPage from "@/pages/inbox";
import AdminPanel from "@/pages/admin";
import WorkspacePage from "@/pages/workspace";
import LibraryPage from "@/pages/library";
import AccountPage from "@/pages/account";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  const isPlayroom = location.startsWith("/playroom/");

  // Use the base path segment as key so dynamic params don't cause remounts
  const routeKey = location.split("/").slice(0, 2).join("/") || "/";

  return (
    <>
      {!isPlayroom && <Navbar />}
      <AnimatePresence mode="wait">
        <Switch key={routeKey}>
          <Route path="/">{() => <PageTransition><LandingPage /></PageTransition>}</Route>
          <Route path="/dashboard">{() => <PageTransition><Dashboard /></PageTransition>}</Route>
          <Route path="/playroom/:id">{(params) => <Playroom />}</Route>
          <Route path="/join/:code">{() => <PageTransition><JoinSession /></PageTransition>}</Route>
          <Route path="/privacy">{() => <PageTransition><Privacy /></PageTransition>}</Route>
          <Route path="/terms">{() => <PageTransition><Terms /></PageTransition>}</Route>
          <Route path="/cookies">{() => <PageTransition><Cookies /></PageTransition>}</Route>
          <Route path="/faq">{() => <PageTransition><FAQ /></PageTransition>}</Route>
          <Route path="/contact">{() => <PageTransition><Contact /></PageTransition>}</Route>
          <Route path="/login">{() => <PageTransition><Login /></PageTransition>}</Route>
          <Route path="/signup">{() => <PageTransition><Signup /></PageTransition>}</Route>
          <Route path="/email-confirmed">{() => <PageTransition><EmailConfirmed /></PageTransition>}</Route>
          <Route path="/inbox">{() => <PageTransition><InboxPage /></PageTransition>}</Route>
          <Route path="/admin">{() => <PageTransition><AdminPanel /></PageTransition>}</Route>
          <Route path="/workspace">{() => <PageTransition><WorkspacePage /></PageTransition>}</Route>
          <Route path="/profile">{() => <Redirect to="/workspace" />}</Route>
          <Route path="/library">{() => <PageTransition><LibraryPage /></PageTransition>}</Route>
          <Route path="/account">{() => <PageTransition><AccountPage /></PageTransition>}</Route>
          <Route>{() => <PageTransition><NotFound /></PageTransition>}</Route>
        </Switch>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <SessionProvider>
            <Router />
          </SessionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
