import React from "react";
import { Routes, Route } from "react-router-dom";

const VehiclesList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Vehicles</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your vehicle inventory, add new vehicles, and track
            availability.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button type="button" className="btn-primary">
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No vehicles
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new vehicle to your inventory.
            </p>
            <div className="mt-6">
              <button type="button" className="btn-primary">
                Add your first vehicle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VehiclesPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<VehiclesList />} />
      <Route path="new" element={<div>Add New Vehicle - TODO</div>} />
      <Route path=":id" element={<div>Vehicle Details - TODO</div>} />
      <Route path=":id/edit" element={<div>Edit Vehicle - TODO</div>} />
    </Routes>
  );
};

export default VehiclesPage;
