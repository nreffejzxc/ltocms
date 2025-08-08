import apiClient from "./api";
import { LoginCredentials, RegisterData, AuthUser, User } from "@/types";

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await apiClient.post<AuthUser>(
        "/auth/login",
        credentials
      );

      if (response.success && response.data) {
        const { tokens } = response.data;
        apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
        return response.data;
      }

      throw new Error(response.message || "Login failed");
    } catch (error) {
      // If it's already a custom error with a message, preserve it
      if (error instanceof Error && error.name === "ApiError") {
        throw error;
      }

      // For other errors, check if there's a response message
      if ((error as any)?.response?.data?.message) {
        throw new Error((error as any).response.data.message);
      }

      // Fallback to the original error message or a generic one
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  async register(userData: RegisterData): Promise<AuthUser> {
    try {
      const response = await apiClient.post<AuthUser>(
        "/auth/register",
        userData
      );

      if (response.success && response.data) {
        const { tokens } = response.data;
        apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
        return response.data;
      }

      throw new Error(response.message || "Registration failed");
    } catch (error) {
      // If it's already a custom error with a message, preserve it
      if (error instanceof Error && error.name === "ApiError") {
        throw error;
      }

      // For other errors, check if there's a response message
      if ((error as any)?.response?.data?.message) {
        throw new Error((error as any).response.data.message);
      }

      // Fallback to the original error message or a generic one
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      // Ignore logout errors
      console.warn("Logout request failed:", error);
    } finally {
      apiClient.clearTokens();
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await apiClient.post("/auth/logout-all");
    } catch (error) {
      console.warn("Logout all request failed:", error);
    } finally {
      apiClient.clearTokens();
    }
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ user: User }>("/auth/profile");

    if (response.success && response.data) {
      return response.data.user;
    }

    throw new Error(response.message || "Failed to get profile");
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<{ user: User }>(
      "/auth/profile",
      userData
    );

    if (response.success && response.data) {
      return response.data.user;
    }

    throw new Error(response.message || "Failed to update profile");
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await apiClient.put("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword: newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to change password");
    }
  }

  async refreshToken(): Promise<AuthUser> {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{ tokens: any }>(
      "/auth/refresh-token",
      {
        refreshToken,
      }
    );

    if (response.success && response.data) {
      const { tokens } = response.data;
      apiClient.setTokens(tokens.accessToken, tokens.refreshToken);

      // Get updated user profile
      const user = await this.getProfile();

      return {
        user,
        tokens,
      };
    }

    throw new Error(response.message || "Token refresh failed");
  }

  isAuthenticated(): boolean {
    return !!apiClient.getStoredToken();
  }

  initializeAuth(): void {
    apiClient.initializeToken();
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
