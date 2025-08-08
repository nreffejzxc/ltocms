import React from "react";
import { Routes, Route } from "react-router-dom";

const LeasesList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Lease Agreements
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage lease agreements, track payments, and monitor lease status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button type="button" className="btn-primary">
            Create Lease
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No lease agreements
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new lease agreement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeasesPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<LeasesList />} />
      <Route path="new" element={<div>Create New Lease - TODO</div>} />
      <Route path="my-leases" element={<div>My Leases - TODO</div>} />
      <Route path=":id" element={<div>Lease Details - TODO</div>} />
    </Routes>
  );
};

export default LeasesPage;
