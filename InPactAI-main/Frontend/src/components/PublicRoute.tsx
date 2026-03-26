import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute = ({ children, redirectTo = "/dashboard" }: PublicRouteProps) => {
  const { isAuthenticated, user, checkUserOnboarding } = useAuth();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !isChecking) {
      // Add a simple cache to prevent repeated checks
      const cacheKey = `onboarding_check_${user.id}`;
      const cachedResult = sessionStorage.getItem(cacheKey);
      
      if (cachedResult) {
        const { hasOnboarding, role } = JSON.parse(cachedResult);
        if (hasOnboarding) {
          if (role === "brand") {
            setRedirectPath("/brand/dashboard");
          } else {
            setRedirectPath("/dashboard");
          }
        } else {
          setRedirectPath("/onboarding");
        }
        return;
      }
      
      setIsChecking(true);
      console.log("PublicRoute: Checking user onboarding status");
      checkUserOnboarding(user).then(({ hasOnboarding, role }) => {
        console.log("PublicRoute: Onboarding check result", { hasOnboarding, role });
        
        // Cache the result for 2 minutes
        sessionStorage.setItem(cacheKey, JSON.stringify({ hasOnboarding, role }));
        setTimeout(() => sessionStorage.removeItem(cacheKey), 2 * 60 * 1000);
        
        if (hasOnboarding) {
          if (role === "brand") {
            setRedirectPath("/brand/dashboard");
          } else {
            setRedirectPath("/dashboard");
          }
        } else {
          setRedirectPath("/onboarding");
        }
        setIsChecking(false);
      }).catch(error => {
        console.error("PublicRoute: Error checking onboarding", error);
        setIsChecking(false);
      });
    }
  }, [isAuthenticated, user, checkUserOnboarding, isChecking]);

  if (redirectPath) {
    console.log("PublicRoute: Redirecting to", redirectPath);
    return <Navigate to={redirectPath} />;
  }

  return <>{children}</>;
};

export default PublicRoute; 