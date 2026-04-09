import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { OrganizerProvider } from "@/context/OrganizerContext";

import Home from "@/pages/Home";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import MesBillets from "@/pages/MesBillets";
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminEventDetail from "@/pages/admin/AdminEventDetail";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminOrganizers from "@/pages/admin/AdminOrganizers";
import AdminContacts from "@/pages/admin/AdminContacts";
import BilletPublic from "@/pages/BilletPublic";
import OrganizerLogin from "@/pages/organizer/OrganizerLogin";
import OrganizerEvents from "@/pages/organizer/OrganizerEvents";
import OrganizerEventDetail from "@/pages/organizer/OrganizerEventDetail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders/:id" component={OrderConfirmation} />
      <Route path="/mes-billets" component={MesBillets} />
      <Route path="/auth" component={Auth} />
      <Route path="/billet" component={BilletPublic} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/events/:id" component={AdminEventDetail} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/organizers" component={AdminOrganizers} />
      <Route path="/admin/contacts" component={AdminContacts} />

      {/* Organizer Routes */}
      <Route path="/organizer/login" component={OrganizerLogin} />
      <Route path="/organizer/events" component={OrganizerEvents} />
      <Route path="/organizer/events/:id" component={OrganizerEventDetail} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <OrganizerProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </OrganizerProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
