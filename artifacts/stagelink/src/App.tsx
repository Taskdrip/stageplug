import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/Navbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { MusicBackground } from "@/components/MusicBackground";
import NotFound from "@/pages/not-found";

import HomePage from "@/pages/HomePage";
import DiscoverPage from "@/pages/DiscoverPage";
import ArtistProfilePage from "@/pages/ArtistProfilePage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import BookingsPage from "@/pages/BookingsPage";
import CommunityPage from "@/pages/CommunityPage";
import CompetitionsPage from "@/pages/CompetitionsPage";
import DashboardPage from "@/pages/DashboardPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import AIStudioPage from "@/pages/AIStudioPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import OnboardingPage from "@/pages/OnboardingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');

/* ─── Clerk visual theme ────────────────────────────── */
const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(263 70% 50%)",
    colorForeground: "hsl(210 40% 96%)",
    colorMutedForeground: "hsl(215 20% 65%)",
    colorDanger: "hsl(0 62% 50%)",
    colorBackground: "hsl(222 25% 9%)",
    colorInput: "hsl(222 25% 13%)",
    colorInputForeground: "hsl(210 40% 96%)",
    colorNeutral: "hsl(217 15% 18%)",
    fontFamily: "Outfit, Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "rounded-3xl w-[460px] max-w-full overflow-hidden border border-white/10 shadow-2xl shadow-primary/25",
    card: "!shadow-none !border-0 !rounded-none",
    footer: "!shadow-none !border-0 !rounded-none",
    headerTitle: "text-white font-heading font-bold tracking-tight text-2xl",
    headerSubtitle: "text-white/55",
    socialButtonsBlockButtonText: "text-white font-medium",
    formFieldLabel: "text-white/75 font-medium",
    footerActionLink: "text-primary hover:text-primary/80 font-semibold",
    footerActionText: "text-white/55",
    dividerText: "text-white/35",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-red-400",
    logoBox: "mx-auto mb-2",
    logoImage: "brightness-0 invert",
    socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-white transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.35)]",
    formFieldInput: "bg-black/25 border-white/10 text-white focus:border-primary/60 focus:ring-primary/30 placeholder:text-white/25",
    footerAction: "bg-transparent",
    dividerLine: "bg-white/10",
    alert: "bg-red-500/10 border border-red-500/20",
    otpCodeFieldInput: "bg-black/25 border-white/10 text-white text-center",
    formFieldRow: "mb-3",
    main: "px-8 py-6",
  },
};

/* ─── Sign-in page ───────────────────────────────────── */
function SignInPage() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto">
      <MusicBackground />
      {/* Branding strip */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5">
        <img src={`${basePath}/logo.svg`} alt="StageLink" className="w-7 h-7" />
        <span className="text-white font-heading font-bold text-base tracking-tight">StageLink</span>
      </div>
      {/* Tagline */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 hidden md:block">
        <p className="text-white/30 text-sm tracking-widest uppercase font-medium">
          Discover · Perform · Earn · Grow
        </p>
      </div>
      {/* Clerk form */}
      <div className="relative z-10 px-4 w-full flex justify-center">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={`${basePath}/dashboard`}
        />
      </div>
    </div>
  );
}

/* ─── Sign-up page ───────────────────────────────────── */
function SignUpPage() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto">
      <MusicBackground />
      {/* Branding strip */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5">
        <img src={`${basePath}/logo.svg`} alt="StageLink" className="w-7 h-7" />
        <span className="text-white font-heading font-bold text-base tracking-tight">StageLink</span>
      </div>
      {/* Headline over form */}
      <div className="absolute top-1/2 -translate-y-[220px] left-1/2 -translate-x-1/2 z-20 text-center w-full px-4 pointer-events-none hidden md:block">
        <p className="text-white/20 text-xs tracking-widest uppercase font-medium">
          Where independent artists build global careers
        </p>
      </div>
      {/* Clerk form */}
      <div className="relative z-10 px-4 w-full flex justify-center py-16">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          forceRedirectUrl={`${basePath}/onboarding`}
        />
      </div>
    </div>
  );
}

/* ─── Cache invalidator on user switch ───────────────── */
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
}

/* ─── Home redirect ──────────────────────────────────── */
function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/dashboard" /></Show>
      <Show when="signed-out"><HomePage /></Show>
    </>
  );
}

/* ─── App router ─────────────────────────────────────── */
function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signUpForceRedirectUrl={`${basePath}/onboarding`}
      signInFallbackRedirectUrl={`${basePath}/dashboard`}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Sign in to your StageLink account" } },
        signUp: { start: { title: "Join StageLink", subtitle: "Create your account and start your journey" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <div className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary/30">
          <Navbar />
          <CommandPalette />
          <main className="flex-1 flex flex-col">
            <Switch>
              <Route path="/" component={HomeRedirect} />
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />

              {/* Onboarding — protected */}
              <Route path="/onboarding">
                <Show when="signed-in"><OnboardingPage /></Show>
                <Show when="signed-out"><Redirect to="/sign-up" /></Show>
              </Route>

              {/* Public routes */}
              <Route path="/discover" component={DiscoverPage} />
              <Route path="/artists/:id" component={ArtistProfilePage} />
              <Route path="/events" component={EventsPage} />
              <Route path="/events/:id" component={EventDetailPage} />
              <Route path="/competitions" component={CompetitionsPage} />
              <Route path="/community" component={CommunityPage} />
              <Route path="/leaderboard" component={LeaderboardPage} />
              <Route path="/ai-studio" component={AIStudioPage} />

              {/* Protected routes */}
              <Route path="/dashboard">
                <Show when="signed-in"><DashboardPage /></Show>
                <Show when="signed-out"><Redirect to="/sign-in" /></Show>
              </Route>
              <Route path="/bookings">
                <Show when="signed-in"><BookingsPage /></Show>
                <Show when="signed-out"><Redirect to="/sign-in" /></Show>
              </Route>
              <Route path="/notifications">
                <Show when="signed-in"><NotificationsPage /></Show>
                <Show when="signed-out"><Redirect to="/sign-in" /></Show>
              </Route>
              <Route path="/settings">
                <Show when="signed-in"><SettingsPage /></Show>
                <Show when="signed-out"><Redirect to="/sign-in" /></Show>
              </Route>

              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

/* ─── Root ───────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
