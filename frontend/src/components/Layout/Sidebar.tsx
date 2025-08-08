import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon,
  TruckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, roles: "all" },
  {
    name: "Vehicles",
    href: "/vehicles",
    icon: TruckIcon,
    roles: [UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_ASSOCIATE],
  },
  {
    name: "Leases",
    href: "/leases",
    icon: DocumentTextIcon,
    roles: [
      UserRole.ADMIN,
      UserRole.SALES_ADMIN,
      UserRole.SALES_ASSOCIATE,
      UserRole.CLIENT,
    ],
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCardIcon,
    roles: [
      UserRole.ADMIN,
      UserRole.CREDIT_STAFF,
      UserRole.CASHIER,
      UserRole.CLIENT,
    ],
  },
  { name: "Users", href: "/users", icon: UsersIcon, roles: [UserRole.ADMIN] },
  {
    name: "Reports",
    href: "/reports",
    icon: ChartBarIcon,
    roles: [UserRole.ADMIN, UserRole.SALES_ADMIN],
  },
  { name: "Profile", href: "/profile", icon: UserIcon, roles: "all" },
  {
    name: "Settings",
    href: "/settings",
    icon: CogIcon,
    roles: [UserRole.ADMIN],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isCurrentPath = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const hasAccess = (roles: UserRole[] | string) => {
    if (!user) return false;
    if (roles === "all") return true;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return false;
  };

  const filteredNavigation = navigation.filter((item) => hasAccess(item.roles));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-white">LTOCMS</h1>
            <p className="text-xs text-primary-200">v3.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 bg-white space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const current = isCurrentPath(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                current
                  ? "bg-primary-100 border-primary-500 text-primary-700"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } group flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors duration-200`}
              onClick={() => setOpen(false)}
            >
              <item.icon
                className={`${
                  current
                    ? "text-primary-500"
                    : "text-gray-400 group-hover:text-gray-500"
                } mr-3 flex-shrink-0 h-6 w-6`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div>
            {user?.profileImage ? (
              <img
                className="inline-block h-10 w-10 rounded-full"
                src={user.profileImage}
                alt={`${user.firstName} ${user.lastName}`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-primary-600" />
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs font-medium text-gray-500 capitalize">
              {user?.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
