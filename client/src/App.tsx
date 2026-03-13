import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { SessionProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { AnimatePresence, motion } from "framer-motion";
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
import ResetPassword from "@/pages/reset-password";
import InboxPage from "@/pages/inbox";
import AdminPanel from "@/pages/admin";
import LibraryPage from "@/pages/library";
import SettingsPage from "@/pages/settings";

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1],
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width: "100%", minHeight: 0, flex: 1 }}
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  const isPlayroom = location.startsWith("/playroom/");

  return (
    <>
      {!isPlayroom && <Navbar />}
      <AnimatePresence mode="wait">
        <Switch key={location}>
          <Route path="/">{() => <PageWrapper><LandingPage /></PageWrapper>}</Route>
          <Route path="/dashboard">{() => <PageWrapper><Dashboard /></PageWrapper>}</Route>
          <Route path="/playroom/:id">{(params) => <Playroom />}</Route>
          <Route path="/join/:code">{() => <PageWrapper><JoinSession /></PageWrapper>}</Route>
          <Route path="/privacy">{() => <PageWrapper><Privacy /></PageWrapper>}</Route>
          <Route path="/terms">{() => <PageWrapper><Terms /></PageWrapper>}</Route>
          <Route path="/cookies">{() => <PageWrapper><Cookies /></PageWrapper>}</Route>
          <Route path="/faq">{() => <PageWrapper><FAQ /></PageWrapper>}</Route>
          <Route path="/contact">{() => <PageWrapper><Contact /></PageWrapper>}</Route>
          <Route path="/login">{() => <PageWrapper><Login /></PageWrapper>}</Route>
          <Route path="/signup">{() => <Redirect to="/login" />}</Route>
          <Route path="/email-confirmed">{() => <PageWrapper><EmailConfirmed /></PageWrapper>}</Route>
          <Route path="/reset-password">{() => <PageWrapper><ResetPassword /></PageWrapper>}</Route>
          <Route path="/inbox">{() => <PageWrapper><InboxPage /></PageWrapper>}</Route>
          <Route path="/admin">{() => <PageWrapper><AdminPanel /></PageWrapper>}</Route>
          <Route path="/settings">{() => <PageWrapper><SettingsPage /></PageWrapper>}</Route>
          <Route path="/settings/:section">{() => <Redirect to="/settings" />}</Route>
          <Route path="/workspace">{() => <Redirect to="/settings" />}</Route>
          <Route path="/profile">{() => <Redirect to="/settings" />}</Route>
          <Route path="/library">{() => <PageWrapper><LibraryPage /></PageWrapper>}</Route>
          <Route path="/account">{() => <Redirect to="/settings" />}</Route>
          <Route>{() => <PageWrapper><NotFound /></PageWrapper>}</Route>
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
