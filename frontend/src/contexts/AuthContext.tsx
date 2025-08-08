import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, LoginCredentials, RegisterData } from "@/types";
import authService from "@/services/authService";
import toast from "react-hot-toast";

// Auth state interface
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isOAuthLogin: boolean;
}

// Auth actions
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "SET_OAUTH_LOGIN"; payload: boolean };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  clearError: () => void;
  handleOAuthTokens: (
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isOAuthLogin: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "SET_OAUTH_LOGIN":
      return {
        ...state,
        isOAuthLogin: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        authService.initializeAuth();

        if (authService.isAuthenticated()) {
          const isValid = await authService.validateToken();

          if (isValid) {
            const user = await authService.getProfile();
            dispatch({ type: "AUTH_SUCCESS", payload: user });
            // Don't show success message during initialization
          } else {
            // Token is invalid, clear it
            authService.logout();
            dispatch({ type: "AUTH_LOGOUT" });
          }
        } else {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.logout();
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "AUTH_START" });
      const authUser = await authService.login(credentials);
      dispatch({ type: "AUTH_SUCCESS", payload: authUser.user });
      toast.success("Login successful!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "AUTH_ERROR", payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: RegisterData) => {
    try {
      dispatch({ type: "AUTH_START" });
      const authUser = await authService.register(userData);
      dispatch({ type: "AUTH_SUCCESS", payload: authUser.user });
      toast.success("Registration successful!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "AUTH_ERROR", payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch({ type: "AUTH_LOGOUT" });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if server request fails
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({ type: "UPDATE_USER", payload: updatedUser });
      toast.success("Profile updated successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
      throw error;
    }
  }, []);

  // Change password function
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await authService.changePassword(currentPassword, newPassword);
        toast.success("Password changed successfully!");
        // Force logout to require re-login with new password
        await logout();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to change password";
        toast.error(message);
        throw error;
      }
    },
    [logout]
  );

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Handle OAuth tokens function
  const handleOAuthTokens = useCallback(
    async (accessToken: string, refreshToken: string) => {
      try {
        // Check if we've already processed these tokens to prevent duplicates
        const tokenKey = `oauth-processed-${accessToken.slice(-10)}`;
        if (sessionStorage.getItem(tokenKey)) {
          console.log("OAuth tokens already processed, skipping...");
          return;
        }

        // Mark tokens as being processed
        sessionStorage.setItem(tokenKey, "true");

        dispatch({ type: "AUTH_START" });
        dispatch({ type: "SET_OAUTH_LOGIN", payload: true });

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Initialize auth service with tokens
        authService.initializeAuth();

        // Get user profile
        const user = await authService.getProfile();
        dispatch({ type: "AUTH_SUCCESS", payload: user });

        // Show success message only once
        toast.success("Successfully signed in with Google!");

        // Reset OAuth flag after a short delay
        setTimeout(() => {
          dispatch({ type: "SET_OAUTH_LOGIN", payload: false });
          // Clean up the processed token flag after some time
          setTimeout(() => {
            sessionStorage.removeItem(tokenKey);
          }, 5000);
        }, 1000);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "OAuth login failed";
        dispatch({ type: "AUTH_ERROR", payload: message });
        toast.error(message);
        throw error;
      }
    },
    []
  );

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    handleOAuthTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner w-8 h-8"></div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// HOC for role-based access
export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[]
): React.FC<P> => {
  return (props: P) => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner w-8 h-8"></div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;
