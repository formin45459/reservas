import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Clients from "./pages/Clients";
import Bookings from "./pages/Bookings";
import Reports from "./pages/Reports";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path="/login" component={Login} />
      
      {/* Rutas protegidas con DashboardLayout */}
      <Route path={"/dashboard"}>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      
      <Route path={"/rooms"}>
        <DashboardLayout>
          <Rooms />
        </DashboardLayout>
      </Route>
      
      <Route path={"/clients"}>
        <DashboardLayout>
          <Clients />
        </DashboardLayout>
      </Route>
      
      <Route path={"/bookings"}>
        <DashboardLayout>
          <Bookings />
        </DashboardLayout>
      </Route>
      
      <Route path={"/reports"}>
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      </Route>
      
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
