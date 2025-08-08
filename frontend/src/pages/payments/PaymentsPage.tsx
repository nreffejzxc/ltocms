import React from "react";
import { Routes, Route } from "react-router-dom";

const PaymentsList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track payments, generate receipts, and manage payment schedules.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button type="button" className="btn-primary">
            Record Payment
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No payments recorded
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by recording a new payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentsPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<PaymentsList />} />
      <Route path="new" element={<div>Record New Payment - TODO</div>} />
      <Route path="my-payments" element={<div>My Payments - TODO</div>} />
      <Route path=":id" element={<div>Payment Details - TODO</div>} />
      <Route path=":id/receipt" element={<div>Payment Receipt - TODO</div>} />
    </Routes>
  );
};

export default PaymentsPage;
