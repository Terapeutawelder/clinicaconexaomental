import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

// Lazy load admin pages
const AdminOverview = lazy(() => import("@/components/admin/AdminOverview"));
const AdminWhitelabels = lazy(() => import("@/components/admin/AdminWhitelabels"));
const AdminProfessionals = lazy(() => import("@/components/admin/AdminProfessionals"));
const AdminSubscriptions = lazy(() => import("@/components/admin/AdminSubscriptions"));
const AdminPlans = lazy(() => import("@/components/admin/AdminPlans"));
const AdminCoupons = lazy(() => import("@/components/admin/AdminCoupons"));
const AdminPayments = lazy(() => import("@/components/admin/AdminPayments"));
const AdminSettings = lazy(() => import("@/components/admin/AdminSettings"));
const AdminIntegrations = lazy(() => import("@/components/admin/AdminIntegrations"));
const AdminGateways = lazy(() => import("@/components/admin/AdminGateways"));
const AdminAnalytics = lazy(() => import("@/components/admin/AdminAnalytics"));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .in("role", ["super_admin", "admin"])
        .single();

      if (!roleData) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setUser(session.user);
      setUserRole(roleData.role);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const renderContent = () => {
    switch (currentTab) {
      case "overview":
        return <AdminOverview />;
      case "whitelabels":
        return <AdminWhitelabels />;
      case "professionals":
        return <AdminProfessionals />;
      case "subscriptions":
        return <AdminSubscriptions />;
      case "plans":
        return <AdminPlans userRole={userRole} />;
      case "coupons":
        return <AdminCoupons userRole={userRole} />;
      case "payments":
        return <AdminPayments />;
      case "settings":
        return <AdminSettings userRole={userRole} />;
      case "integrations":
        return <AdminIntegrations userRole={userRole} />;
      case "gateways":
        return <AdminGateways userRole={userRole} />;
      case "analytics":
        return <AdminAnalytics />;
      default:
        return <AdminOverview />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen admin-theme flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-theme">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
        userEmail={user?.email}
        userRole={userRole}
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"} lg:ml-64`}>
        <AdminHeader 
          userEmail={user?.email} 
          userRole={userRole}
          onLogout={handleLogout}
        />
        
        <main className="p-4 md:p-6 lg:p-8">
          <Suspense fallback={<PageLoader />}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Admin;
