'use client';

import React from 'react';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { ShieldPlus, Edit3 } from 'lucide-react';
import { FormikInput } from './shared/FormikInput';
import { FormikSelect } from './shared/FormikSelect';
import { Section } from './ui/Section';

/* ---------------- VALIDATION ---------------- */
const RoleValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(3, 'Role name must be at least 3 characters')
    .required('Role name is required'),
  status: Yup.string()
    .oneOf(['active', 'inactive'])
    .required('Status is required'),
});

const emptyPermissions = {
  user: { view: false, create: false, update: false, delete: false },
  role: { view: false, create: false, update: false, delete: false },
  vendor: { view: false, create: false, update: false, delete: false },
  customer: { view: false, create: false, update: false, delete: false },
  product: { view: false, create: false, update: false, delete: false },
  inventory: { view: false, create: false, update: false, delete: false },
  delivery_ticket: { view: false, create: false, update: false, delete: false },
  return_ticket: { view: false, create: false, update: false, delete: false },
  sales: { view: false, create: false, update: false, delete: false },
  quote_track: { view: false, create: false, update: false, delete: false },
  running_order: { view: false, create: false, update: false, delete: false },
};

interface RoleFormProps {
  initialData?: any;
  onSubmit: (
    data: any,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
}) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'active',
      permissions: initialData?.permissions
        ? JSON.parse(JSON.stringify(initialData.permissions))
        : JSON.parse(JSON.stringify(emptyPermissions)),
    },
    validationSchema: RoleValidationSchema,
    enableReinitialize: false,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      console.log('SUBMITTED ✅', values);
      await onSubmit(values, { setErrors, setSubmitting });
    },
  });

  const MODULES = Object.keys(formik.values.permissions);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between mb-10 border-b border-gray-300 pb-5">
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <Edit3 className="text-teal-700 w-7 h-7" />
          ) : (
            <ShieldPlus className="text-teal-700 w-7 h-7" />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Role' : 'Create New Role'}
            </h2>
          </div>
        </div>
      </div>

      {/* ---------------- FORM START ---------------- */}
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-12">
          {/* ========== BASIC ROLE INFO (NO BORDER) ========== */}
          <Section title="Basic Role Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormikInput
                label="Role Name"
                name="name"
                placeholder="Eg: Admin, Sales Manager"
                required
              />

              <FormikSelect
                label="Status"
                name="status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                required
              />
            </div>
          </Section>

          {/* ========== PERMISSIONS SECTION ========== */}
          <Section title="Permissions">
            <p className="text-sm text-gray-500 italic mb-4">
              Select what actions this role is allowed to perform in each
              module.
            </p>
            {/* GLOBAL SELECT ALL TOGGLE */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={MODULES.every((module) =>
                  Object.values(formik.values.permissions[module]).every(
                    (v) => v === true
                  )
                )}
                onChange={(e) => {
                  const updated = { ...formik.values.permissions };

                  Object.keys(updated).forEach((module) => {
                    Object.keys(updated[module]).forEach((perm) => {
                      updated[module][perm] = e.target.checked;
                    });
                  });

                  formik.setFieldValue('permissions', updated);
                }}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">
                Select All / Clear All Permissions
              </span>
            </div>
            {/* PERMISSION TABLE HEADER */}
            <div className="grid grid-cols-6 bg-gray-100 border p-2 text-sm font-semibold">
              <div>Module</div>
              <div className="text-center">View</div>
              <div className="text-center">Create</div>
              <div className="text-center">Update</div>
              <div className="text-center">Delete</div>
              <div className="text-center">Select Row</div>
            </div>
            {/* PERMISSION ROWS */}
            {MODULES.map((module) => (
              <div
                key={module}
                className="grid grid-cols-6 border-x border-b p-2 items-center"
              >
                <div className="capitalize text-sm">
                  {module.replace('_', ' ')}
                </div>

                {['view', 'create', 'update', 'delete'].map((perm) => (
                  <div key={perm} className="text-center">
                    <input
                      type="checkbox"
                      checked={formik.values.permissions[module][perm]}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `permissions.${module}.${perm}`,
                          e.target.checked
                        )
                      }
                    />
                  </div>
                ))}
                <div className="text-center">
                  <input
                    type="checkbox"
                    checked={Object.values(
                      formik.values.permissions[module]
                    ).every((p) => p === true)}
                    onChange={(e) => {
                      const { checked } = e.target;
                      const updatedModulePerms = {
                        ...formik.values.permissions[module],
                      };
                      Object.keys(updatedModulePerms).forEach((perm) => {
                        updatedModulePerms[perm] = checked;
                      });
                      formik.setFieldValue(
                        `permissions.${module}`,
                        updatedModulePerms
                      );
                    }}
                  />
                </div>
              </div>
            ))}{' '}
          </Section>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-300">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow"
            >
              {isEditMode ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default RoleForm;
