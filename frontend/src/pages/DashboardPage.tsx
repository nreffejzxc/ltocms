import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import {
  TruckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = {
    totalVehicles: 156,
    availableVehicles: 42,
    activeLeases: 89,
    totalPayments: 1247,
    monthlyRevenue: 125000,
    overduePayments: 12,
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    if (hour >= 17) greeting = "Good evening";

    return `${greeting}, ${user?.firstName}!`;
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return [
          {
            name: "Total Vehicles",
            value: stats.totalVehicles,
            icon: TruckIcon,
            color: "bg-blue-500",
          },
          {
            name: "Active Leases",
            value: stats.activeLeases,
            icon: DocumentTextIcon,
            color: "bg-green-500",
          },
          {
            name: "Total Payments",
            value: stats.totalPayments,
            icon: CreditCardIcon,
            color: "bg-purple-500",
          },
          {
            name: "Monthly Revenue",
            value: `$${stats.monthlyRevenue.toLocaleString()}`,
            icon: ChartBarIcon,
            color: "bg-yellow-500",
          },
        ];
      case UserRole.SALES_ADMIN:
      case UserRole.SALES_ASSOCIATE:
        return [
          {
            name: "Available Vehicles",
            value: stats.availableVehicles,
            icon: TruckIcon,
            color: "bg-blue-500",
          },
          {
            name: "Active Leases",
            value: stats.activeLeases,
            icon: DocumentTextIcon,
            color: "bg-green-500",
          },
          {
            name: "Monthly Revenue",
            value: `$${stats.monthlyRevenue.toLocaleString()}`,
            icon: ChartBarIcon,
            color: "bg-yellow-500",
          },
        ];
      case UserRole.CREDIT_STAFF:
      case UserRole.CASHIER:
        return [
          {
            name: "Total Payments",
            value: stats.totalPayments,
            icon: CreditCardIcon,
            color: "bg-purple-500",
          },
          {
            name: "Overdue Payments",
            value: stats.overduePayments,
            icon: ExclamationTriangleIcon,
            color: "bg-red-500",
          },
          {
            name: "Monthly Revenue",
            value: `$${stats.monthlyRevenue.toLocaleString()}`,
            icon: ChartBarIcon,
            color: "bg-yellow-500",
          },
        ];
      case UserRole.CLIENT:
        return [
          {
            name: "My Active Leases",
            value: 2,
            icon: DocumentTextIcon,
            color: "bg-green-500",
          },
          {
            name: "Payments Made",
            value: 24,
            icon: CreditCardIcon,
            color: "bg-purple-500",
          },
          {
            name: "Next Payment Due",
            value: "Dec 15",
            icon: ExclamationTriangleIcon,
            color: "bg-orange-500",
          },
        ];
      default:
        return [];
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return [
          {
            name: "Add New Vehicle",
            href: "/vehicles/new",
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            name: "Create Lease",
            href: "/leases/new",
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            name: "Manage Users",
            href: "/users",
            color: "bg-purple-600 hover:bg-purple-700",
          },
          {
            name: "View Reports",
            href: "/reports",
            color: "bg-yellow-600 hover:bg-yellow-700",
          },
        ];
      case UserRole.SALES_ADMIN:
      case UserRole.SALES_ASSOCIATE:
        return [
          {
            name: "Add New Vehicle",
            href: "/vehicles/new",
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            name: "Create Lease",
            href: "/leases/new",
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            name: "View Sales Report",
            href: "/reports/sales",
            color: "bg-yellow-600 hover:bg-yellow-700",
          },
        ];
      case UserRole.CREDIT_STAFF:
      case UserRole.CASHIER:
        return [
          {
            name: "Record Payment",
            href: "/payments/new",
            color: "bg-purple-600 hover:bg-purple-700",
          },
          {
            name: "View Overdue",
            href: "/payments?status=overdue",
            color: "bg-red-600 hover:bg-red-700",
          },
          {
            name: "Generate Receipt",
            href: "/payments/receipt",
            color: "bg-green-600 hover:bg-green-700",
          },
        ];
      case UserRole.CLIENT:
        return [
          {
            name: "Browse Vehicles",
            href: "/vehicles",
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            name: "View My Leases",
            href: "/leases/my-leases",
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            name: "Payment History",
            href: "/payments/my-payments",
            color: "bg-purple-600 hover:bg-purple-700",
          },
        ];
      default:
        return [];
    }
  };

  const roleSpecificStats = getRoleSpecificStats();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getWelcomeMessage()}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome to your {user?.role.replace("_", " ")} dashboard
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {user?.role.replace("_", " ").toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roleSpecificStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`inline-flex items-center justify-center p-3 rounded-md ${stat.color}`}
                  >
                    <stat.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${action.color} transition-colors duration-200`}
              >
                {action.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <DocumentTextIcon
                          className="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          New lease agreement created for{" "}
                          <span className="font-medium text-gray-900">
                            2023 Honda Civic
                          </span>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        2 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <CreditCardIcon
                          className="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Payment of{" "}
                          <span className="font-medium text-gray-900">
                            $450.00
                          </span>{" "}
                          received from John Doe
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        4 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                        <TruckIcon
                          className="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          New vehicle added:{" "}
                          <span className="font-medium text-gray-900">
                            2024 Toyota Camry
                          </span>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        1 day ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
