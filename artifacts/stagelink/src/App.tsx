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
import NotFound from "@/pages/not-found";

// Page Imports (will be created soon)
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
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

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "hsl(263 70% 50%)",
    colorForeground: "hsl(210 40% 96%)",
    colorMutedForeground: "hsl(215 20% 65%)",
    colorDanger: "hsl(0 62% 50%)",
    colorBackground: "hsl(222 25% 11%)",
    colorInput: "hsl(222 25% 13%)",
    colorInputForeground: "hsl(210 40% 96%)",
    colorNeutral: "hsl(217 15% 18%)",
    fontFamily: "Outfit, Inter, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#16171d] rounded-2xl w-[440px] max-w-full overflow-hidden border border-white/10 shadow-2xl shadow-primary/20",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold tracking-tight text-2xl",
    headerSubtitle: "text-white/60",
    socialButtonsBlockButtonText: "text-white font-medium",
    formFieldLabel: "text-white/80 font-medium",
    footerActionLink: "text-primary hover:text-primary/80 font-semibold",
    footerActionText: "text-white/60",
    dividerText: "text-white/40",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-green-400",
    alertText: "text-red-400",
    logoBox: "mx-auto mb-4",
    logoImage: "brightness-0 invert", // make logo white
    socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 transition-colors",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-white transition-colors",
    formFieldInput: "bg-black/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/50",
    footerAction: "bg-transparent",
    dividerLine: "bg-white/10",
    alert: "bg-red-500/10 border border-red-500/20 text-red-400",
    otpCodeFieldInput: "bg-black/20 border-white/10 text-white",
    formFieldRow: "mb-4",
    main: "p-8",
  },
};

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <HomePage />
      </Show>
    </>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="relative z-10 px-4 w-full flex justify-center">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="relative z-10 px-4 w-full flex justify-center py-12">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your StageLink account",
          },
        },
        signUp: {
          start: {
            title: "Join StageLink",
            subtitle: "Create your platform account",
          },
        },
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
              <Route path="/discover" component={DiscoverPage} />
              <Route path="/artists/:id" component={ArtistProfilePage} />
              <Route path="/events" component={EventsPage} />
              <Route path="/events/:id" component={EventDetailPage} />
              <Route path="/competitions" component={CompetitionsPage} />
              <Route path="/community" component={CommunityPage} />
              <Route path="/leaderboard" component={LeaderboardPage} />
              <Route path="/ai-studio" component={AIStudioPage} />
              
              {/* Protected Routes */}
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

function App() {
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

export default App;
