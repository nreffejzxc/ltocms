import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthTokens } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) {
        console.log("OAuth callback already processed, skipping...");
        return;
      }

      hasProcessed.current = true;

      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        navigate("/login?error=oauth_failed");
        return;
      }

      if (token && refreshToken) {
        try {
          // Handle OAuth tokens through auth context
          await handleOAuthTokens(token, refreshToken);

          // Redirect to dashboard
          navigate("/dashboard");
        } catch (error) {
          console.error("Error handling OAuth callback:", error);
          navigate("/login?error=oauth_failed");
        }
      } else {
        console.error("Missing tokens in OAuth callback");
        navigate("/login?error=oauth_failed");
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, handleOAuthTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
