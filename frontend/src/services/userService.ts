import apiClient from "./api";
import { User, UserRole, ApiResponse } from "../types";

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive?: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sort?: string;
}

class UserService {
  // Get all users
  async getUsers(
    params?: UserQueryParams
  ): Promise<ApiResponse<{ users: User[]; pagination: any }>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : "/users";

    return apiClient.get<{ users: User[]; pagination: any }>(url);
  }

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<{ user: User }>(`/users/${id}`);
  }

  // Create new user
  async createUser(
    userData: CreateUserData
  ): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post<{ user: User }>("/users", userData);
  }

  // Update user
  async updateUser(
    id: string,
    userData: UpdateUserData
  ): Promise<ApiResponse<{ user: User }>> {
    return apiClient.put<{ user: User }>(`/users/${id}`, userData);
  }

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${id}`);
  }

  // Activate user
  async activateUser(id: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.patch<{ user: User }>(`/users/${id}/activate`);
  }

  // Deactivate user
  async deactivateUser(id: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.patch<{ user: User }>(`/users/${id}/deactivate`);
  }

  // Reset user password
  async resetUserPassword(
    id: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`/users/${id}/reset-password`, {
      newPassword,
    });
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>("/users/stats");
  }

  // Get business summary
  async getBusinessSummary(): Promise<ApiResponse<any>> {
    return apiClient.get<any>("/users/business-summary");
  }
}

export default new UserService();
