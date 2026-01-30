"use client";

import React, { useState } from "react";
import { useAdmins, useAddAdminMutation, useRemoveAdminMutation } from "@/hooks/use-admin";
import { Trash2, Plus, Mail, AlertCircle, X } from "lucide-react";

interface AddAdminForm {
  email: string;
  firstName: string;
  lastName: string;
}

interface DeleteConfirmModal {
  isOpen: boolean;
  adminId: string | null;
  adminEmail: string | null;
  adminName: string | null;
}

// Confirmation Modal Component
function ConfirmDeleteModal({
  isOpen,
  adminName,
  adminEmail,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  adminName: string | null;
  adminEmail: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Confirm Deletion</h2>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to remove <strong>{adminName}</strong> ({adminEmail}) as an admin?
          </p>
          <p className="text-sm text-gray-600 mb-6">
            This action will downgrade the user to a regular account. They will no longer have admin access.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 disabled:text-gray-400 px-4 py-2 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition font-medium"
            >
              {isLoading ? "Removing..." : "Remove Admin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminManagement() {
  const { data: adminsData, isLoading, error } = useAdmins();
  const addAdminMutation = useAddAdminMutation();
  const removeAdminMutation = useRemoveAdminMutation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AddAdminForm>({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState<DeleteConfirmModal>({
    isOpen: false,
    adminId: null,
    adminEmail: null,
    adminName: null,
  });

  const admins = adminsData?.admins || [];

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.email || !formData.firstName || !formData.lastName) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      await addAdminMutation.mutateAsync(formData);
      setSuccessMessage(`Admin ${formData.firstName} has been added successfully. Credentials sent to ${formData.email}`);
      setFormData({ email: "", firstName: "", lastName: "" });
      setShowForm(false);

      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to add admin");
    }
  };

  const openDeleteModal = (adminId: string, adminEmail: string, adminName: string) => {
    setDeleteModal({
      isOpen: true,
      adminId,
      adminEmail,
      adminName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      adminId: null,
      adminEmail: null,
      adminName: null,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.adminId) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await removeAdminMutation.mutateAsync(deleteModal.adminId);
      setSuccessMessage(`Admin ${deleteModal.adminEmail} has been removed successfully`);
      closeDeleteModal();

      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to remove admin");
      closeDeleteModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add New Admin
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <Mail size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Success</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Add Admin Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="John"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={addAdminMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition font-medium"
              >
                {addAdminMutation.isPending ? "Adding..." : "Add Admin"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Current Admins ({admins.length})</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading admins...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">Failed to load admins</div>
        ) : admins.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No admins found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin: any) => (
                  <tr key={admin._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {admin.firstName} {admin.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm">{admin.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openDeleteModal(admin._id, admin.email, `${admin.firstName} ${admin.lastName}`)}
                        disabled={removeAdminMutation.isPending}
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 text-red-600 disabled:text-gray-400 px-3 py-1 rounded transition text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        adminName={deleteModal.adminName}
        adminEmail={deleteModal.adminEmail}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
        isLoading={removeAdminMutation.isPending}
      />
    </div>
  );
}
