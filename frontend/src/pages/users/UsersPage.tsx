import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

const UsersList: React.FC = () => {
  const navigate = useNavigate();

  const handleAddUser = () => {
    navigate("/users/new");
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage user accounts, roles, and permissions across the system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button type="button" className="btn-primary" onClick={handleAddUser}>
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new user to the system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<UsersList />} />
      <Route path="new" element={<div>Add New User - TODO</div>} />
      <Route path=":id" element={<div>User Details - TODO</div>} />
      <Route path=":id/edit" element={<div>Edit User - TODO</div>} />
    </Routes>
  );
};

export default UsersPage;
