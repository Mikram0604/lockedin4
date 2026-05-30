import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import AdminLogin from "@/pages/admin-login";
import StudentLogin from "@/pages/student-login";

// Student Portal Pages
import StudentDashboard from "@/pages/student-dashboard";
import StudentChat from "@/pages/student-chat";
import StudentScholarships from "@/pages/student-scholarships";
import StudentFees from "@/pages/student-fees";
import StudentResources from "@/pages/student-resources";

// Admin Pages
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import StudentDetail from "@/pages/student-detail";
import Alerts from "@/pages/alerts";
import Scholarships from "@/pages/scholarships";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/admin/login" component={AdminLogin} />
      
      <Route path="/student" component={StudentLogin} />
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/chat" component={StudentChat} />
      <Route path="/student/scholarships" component={StudentScholarships} />
      <Route path="/student/fees" component={StudentFees} />
      <Route path="/student/resources" component={StudentResources} />
      
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/students/:id" component={StudentDetail} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/scholarships" component={Scholarships} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

import GlobalVideoBackground from "@/components/GlobalVideoBackground";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalVideoBackground />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
