import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase, User } from "../utils/supabase";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  checkUserOnboarding: (userToCheck?: User | null) => Promise<{ hasOnboarding: boolean; role: string | null }>;
  role: string | null;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

async function ensureUserInTable(user: any) {
  if (!user) return;
  
  // Add a simple cache to prevent repeated requests for the same user
  const cacheKey = `user_${user.id}`;
  if (sessionStorage.getItem(cacheKey)) {
    console.log("User already checked, skipping...");
    return;
  }
  
  try {
    console.log("Testing user table access for user:", user.id);
    
    // Just test if we can access the users table
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .limit(1);
      
    if (error) {
      console.error("Error accessing users table:", error);
      return;
    }
    
    console.log("User table access successful, found:", data?.length || 0, "records");
    
    // Cache the result for 5 minutes to prevent repeated requests
    sessionStorage.setItem(cacheKey, "true");
    setTimeout(() => sessionStorage.removeItem(cacheKey), 5 * 60 * 1000);
    
    // For now, skip the insert to avoid 400 errors
    // We'll handle user creation during onboarding instead
    
  } catch (error) {
    console.error("Error in ensureUserInTable:", error);
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRequest, setLastRequest] = useState(0);
  const navigate = useNavigate();

  // Function to check if user has completed onboarding
  const checkUserOnboarding = async (userToCheck?: User | null) => {
    const userToUse = userToCheck || user;
    if (!userToUse) return { hasOnboarding: false, role: null };
    
    // Add rate limiting - only allow one request per 2 seconds
    const now = Date.now();
    if (now - lastRequest < 2000) {
      console.log("Rate limiting: skipping request");
      return { hasOnboarding: false, role: null };
    }
    setLastRequest(now);
    
    // Check if user has completed onboarding by looking for social profiles or brand data
    const { data: socialProfiles } = await supabase
      .from("social_profiles")
      .select("id")
      .eq("user_id", userToUse.id)
      .limit(1);
    
    const { data: brandData } = await supabase
      .from("brands")
      .select("id")
      .eq("user_id", userToUse.id)
      .limit(1);
    
    const hasOnboarding = (socialProfiles && socialProfiles.length > 0) || (brandData && brandData.length > 0);
    
    // Get user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", userToUse.id)
      .single();
    
    return { hasOnboarding, role: userData?.role || null };
  };

  useEffect(() => {
    let mounted = true;
    console.log("AuthContext: Starting authentication check");

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log("AuthContext: Loading timeout reached, forcing completion");
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error("AuthContext: Error getting session", error);
        setLoading(false);
        return;
      }
      
      console.log("AuthContext: Session check result", { user: data.session?.user?.email, hasSession: !!data.session });
      
      setUser(data.session?.user || null);
      setIsAuthenticated(!!data.session?.user);
      // Determine role once at startup
      if (data.session?.user) {
        try {
          const res = await checkUserOnboarding(data.session.user);
          setRole(res.role || null);
        } catch (err) {
          console.error("AuthContext: error determining role", err);
        }
      }
      if (data.session?.user) {
        console.log("AuthContext: Ensuring user in table");
        try {
          await ensureUserInTable(data.session.user);
        } catch (error) {
          console.error("AuthContext: Error ensuring user in table", error);
        }
      }
      setLoading(false);
      console.log("AuthContext: Initial loading complete");
    }).catch(error => {
      console.error("AuthContext: Error getting session", error);
      if (mounted) {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("AuthContext: Auth state change", { event, user: session?.user?.email });
        
        setUser(session?.user || null);
        setIsAuthenticated(!!session?.user);
        
        if (session?.user) {
          console.log("AuthContext: User authenticated");
          try {
            await ensureUserInTable(session.user);
            const res = await checkUserOnboarding(session.user);
            setRole(res.role || null);
          } catch (error) {
            console.error("AuthContext: Error ensuring user in table", error);
          }
          setLoading(false);
        } else {
          // User logged out
          setRole(null);
          console.log("AuthContext: User logged out");
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <div className="text-lg font-semibold text-purple-600">Loading...</div>
        <div className="text-xs text-gray-500 mt-2">(If this is taking too long, try refreshing the page.)</div>
        <button 
          onClick={() => setLoading(false)} 
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Continue Anyway
        </button>
      </div>
    );
  }

  return (
  <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkUserOnboarding, role }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};