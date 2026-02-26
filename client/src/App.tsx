import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { SessionProvider } from "@/hooks/use-auth";
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
import LibraryPage from "@/pages/library";
import SettingsHub from "@/pages/settings/index";
import ProfileSettings from "@/pages/settings/profile";
import AppearanceSettings from "@/pages/settings/appearance";
import SessionSettings from "@/pages/settings/sessions";
import BillingSettings from "@/pages/settings/billing";
import TeamSettings from "@/pages/settings/team";
import SecuritySettings from "@/pages/settings/security";
import PrivacySettings from "@/pages/settings/privacy";

function Router() {
  const [location] = useLocation();
  const isPlayroom = location.startsWith("/playroom/");

  return (
    <>
      {!isPlayroom && <Navbar />}
      <Switch>
        <Route path="/">{() => <LandingPage />}</Route>
        <Route path="/dashboard">{() => <Dashboard />}</Route>
        <Route path="/playroom/:id">{(params) => <Playroom />}</Route>
        <Route path="/join/:code">{() => <JoinSession />}</Route>
        <Route path="/privacy">{() => <Privacy />}</Route>
        <Route path="/terms">{() => <Terms />}</Route>
        <Route path="/cookies">{() => <Cookies />}</Route>
        <Route path="/faq">{() => <FAQ />}</Route>
        <Route path="/contact">{() => <Contact />}</Route>
        <Route path="/login">{() => <Login />}</Route>
        <Route path="/signup">{() => <Signup />}</Route>
        <Route path="/email-confirmed">{() => <EmailConfirmed />}</Route>
        <Route path="/inbox">{() => <InboxPage />}</Route>
        <Route path="/admin">{() => <AdminPanel />}</Route>
        <Route path="/settings/profile">{() => <ProfileSettings />}</Route>
        <Route path="/settings/appearance">{() => <AppearanceSettings />}</Route>
        <Route path="/settings/sessions">{() => <SessionSettings />}</Route>
        <Route path="/settings/billing">{() => <BillingSettings />}</Route>
        <Route path="/settings/team">{() => <TeamSettings />}</Route>
        <Route path="/settings/security">{() => <SecuritySettings />}</Route>
        <Route path="/settings/privacy">{() => <PrivacySettings />}</Route>
        <Route path="/settings">{() => <SettingsHub />}</Route>
        <Route path="/workspace">{() => <Redirect to="/settings" />}</Route>
        <Route path="/profile">{() => <Redirect to="/settings" />}</Route>
        <Route path="/library">{() => <LibraryPage />}</Route>
        <Route path="/account">{() => <Redirect to="/settings" />}</Route>
        <Route>{() => <NotFound />}</Route>
      </Switch>
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
