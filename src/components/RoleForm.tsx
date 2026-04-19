import { FormikProvider, useFormik } from 'formik';
import {
  Activity,
  BookOpen,
  Box,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  Edit2,
  Eye,
  FileText,
  Layers,
  LayoutGrid,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Truck,
  UserPlus,
  Users,
  Wallet,
  Building2,
  HardHat,
  ClipboardCheck,
  Package
} from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';
import ListPageHeader from './shared/ListPageHeader';

/* ---------------- VALIDATION ---------------- */
const RoleValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(3, 'Role name must be at least 3 characters')
    .required('Role name is required'),
  status: Yup.string()
    .oneOf(['active', 'inactive'])
    .required('Status is required'),
  description: Yup.string().max(500, 'Max 500 characters'),
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
  invoice: { view: false, create: false, update: false, delete: false },
  payment: { view: false, create: false, update: false, delete: false },
  expense: { view: false, create: false, update: false, delete: false },
  attendance: { view: false, create: false, update: false, delete: false },
  payroll: { view: false, create: false, update: false, delete: false },
  ledger: { view: false, create: false, update: false, delete: false },
  accounts: { view: false, create: false, update: false, delete: false },
  fleet: { view: false, create: false, update: false, delete: false },
  facility: { view: false, create: false, update: false, delete: false },
  worker: { view: false, create: false, update: false, delete: false },
  utility: { view: false, create: false, update: false, delete: false },
};

const MODULE_CONFIG: Record<string, { label: string; icon: any; category: string }> = {
  // CRM
  sales: { label: 'Leads', icon: UserPlus, category: 'CRM' },
  quote_track: { label: 'Quote Tracking', icon: FileText, category: 'CRM' },

  // Finance
  accounts: { label: 'Accounts', icon: BookOpen, category: 'Finance' },
  ledger: { label: 'Ledger', icon: Database, category: 'Finance' },
  expense: { label: 'Expenses', icon: Wallet, category: 'Finance' },
  invoice: { label: 'Invoices', icon: FileText, category: 'Finance' },
  payment: { label: 'Payment', icon: CreditCard, category: 'Finance' },

  // Inventory
  product: { label: 'Products Catalog', icon: Box, category: 'Inventory' },
  inventory: { label: 'Stock Status', icon: Layers, category: 'Inventory' },
  delivery_ticket: { label: 'Delivery Challan', icon: Truck, category: 'Inventory' },
  return_ticket: { label: 'Return Records', icon: RotateCcw, category: 'Inventory' },
  running_order: { label: 'Running Order', icon: Activity, category: 'Inventory' },

  // HR & Payroll
  user: { label: 'Employee', icon: Users, category: 'HR & Payroll' },
  attendance: { label: 'Attendance', icon: Clock, category: 'HR & Payroll' },
  payroll: { label: 'Payroll', icon: CreditCard, category: 'HR & Payroll' },
  worker: { label: 'Worker Records', icon: HardHat, category: 'HR & Payroll' },

  // Operations
  fleet: { label: 'Fleet & Workshop', icon: Truck, category: 'Operations' },
  facility: { label: 'Facility Audits', icon: Building2, category: 'Operations' },

  // Administration
  role: { label: 'Roles & Permissions', icon: ShieldCheck, category: 'Administration' },
  customer: { label: 'Customers Master', icon: Users, category: 'Administration' },
  vendor: { label: 'Vendors Master', icon: Truck, category: 'Administration' },
  utility: { label: 'Utility & Safety Master', icon: Package, category: 'Administration' },
};

interface RoleFormProps {
  initialData?: any;
  onSubmit: (data: any, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'active',
      description: initialData?.description || '',
      permissions: initialData?.permissions
        ? JSON.parse(JSON.stringify(initialData.permissions))
        : JSON.parse(JSON.stringify(emptyPermissions)),
    },
    validationSchema: RoleValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      await onSubmit(values, helpers);
    },
  });

  const modules = Object.keys(formik.values.permissions);
  const isSuperAdmin = modules.every((m) => Object.values(formik.values.permissions[m]).every((v) => v === true));

  const toggleSuperAdmin = (checked: boolean) => {
    const updated = JSON.parse(JSON.stringify(formik.values.permissions));
    Object.keys(updated).forEach((m) => {
      Object.keys(updated[m]).forEach((p) => {
        updated[m][p] = checked;
      });
    });
    formik.setFieldValue('permissions', updated);
  };

  const toggleModule = (module: string, checked: boolean) => {
    const updated = { ...formik.values.permissions[module] };
    Object.keys(updated).forEach((p) => {
      updated[p] = checked;
    });
    formik.setFieldValue(`permissions.${module}`, updated);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] pb-24 font-sans">
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <ListPageHeader
            eyebrow="Permissions Matrix"
            title={isEditMode ? 'Modify' : 'Architect'}
            highlight="Security Role"
            description={isEditMode
              ? 'Review and adjust assigned access levels. Granular permission changes will take effect upon the next user session.'
              : 'Establish a new administrative or operational role. Define precise CRUD permissions across all system modules.'}
            className="mb-12"
            actions={
              <div className="flex items-center gap-6">
                <div className="bg-[#0f766e]/5 border border-[#0f766e]/10 rounded-2xl px-4 py-2 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-[#0f766e] uppercase tracking-widest leading-none">Super Admin</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSuperAdmin}
                      onChange={(e) => toggleSuperAdmin(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f766e]"></div>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={onCancel} className="page-header-secondary-button">
                    Discard
                  </button>
                  <button type="submit" disabled={formik.isSubmitting} className="page-header-button flex items-center gap-2">
                    {formik.isSubmitting ? 'Architecting...' : isEditMode ? 'Commit Role' : 'Launch Role'}
                    {!formik.isSubmitting && <CheckCircle2 size={14} />}
                  </button>
                </div>
              </div>
            }
          />

          <div className="max-w-[1600px] mx-auto px-8 py-10">
            {/* Role Personalization Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50 p-10 mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-1">Role Identity *</label>
                  <input
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    placeholder="e.g. Finance Director"
                    className="w-full h-14 px-6 bg-[#f8fafc] border-2 border-[#f8fafc] rounded-2xl text-gray-900 font-bold outline-none focus:bg-white focus:border-[#0f766e] transition-all"
                  />
                  {formik.errors.name && formik.touched.name && (
                    <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 uppercase">{formik.errors.name as string}</p>
                  )}

                  <div className="mt-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-1">Status</label>
                    <div className="flex bg-[#f8fafc] p-1 rounded-2xl border-2 border-[#f8fafc]">
                      {['active', 'inactive'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => formik.setFieldValue('status', s)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formik.values.status === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-1">Scope / Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="Briefly define the responsibilities and access boundaries for this role..."
                    className="w-full h-[156px] px-6 py-5 bg-[#f8fafc] border-2 border-[#f8fafc] rounded-2xl text-gray-900 font-medium outline-none focus:bg-white focus:border-[#0f766e] transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Authorization Matrix */}
            <div className="mb-10 flex items-end justify-between px-2">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Authorization <span className="text-[#0f766e]">Matrix</span>
                </h2>
                <p className="text-gray-400 text-sm font-medium mt-1">Configure granular access for every ERP module</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{modules.length} Modules Active</span>
                {isSuperAdmin && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0f766e]/10 text-[#0f766e] rounded-full">
                    <ShieldCheck size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Full Bypass Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((m) => {
                const config = MODULE_CONFIG[m] || { label: m, icon: LayoutGrid, category: 'Module' };
                const isAllSelected = Object.values(formik.values.permissions[m]).every((v) => v === true);
                const isAnySelected = Object.values(formik.values.permissions[m]).some((v) => v === true);

                return (
                  <div
                    key={m}
                    className={`bg-white rounded-[2rem] border-2 transition-all duration-300 p-8 flex flex-col ${isAllSelected ? 'border-[#0f766e] shadow-xl shadow-teal-900/5' : isAnySelected ? 'border-teal-100' : 'border-gray-50'
                      }`}
                  >
                    {/* Module Card Header */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isAnySelected ? 'bg-[#0f766e] text-white shadow-lg shadow-teal-900/20' : 'bg-gray-100 text-gray-400'
                            }`}
                        >
                          <config.icon size={24} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">{config.label}</h3>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{config.category} Module</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => toggleModule(m, e.target.checked)}
                        className="w-5 h-5 rounded-lg border-2 border-gray-200 text-[#0f766e] focus:ring-[#0f766e] transition-all cursor-pointer"
                      />
                    </div>

                    {/* Permissions Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { key: 'view', label: 'View', icon: Eye },
                        { key: 'create', label: 'Create', icon: Plus },
                        { key: 'update', label: 'Update', icon: Edit2 },
                        { key: 'delete', label: 'Delete', icon: Trash2 },
                      ].map((p) => {
                        const isActive = formik.values.permissions[m][p.key];
                        return (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => formik.setFieldValue(`permissions.${m}.${p.key}`, !isActive)}
                            className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all group ${isActive
                              ? 'bg-[#0f766e] border-[#0f766e] text-white shadow-md'
                              : 'bg-[#f8fafc] border-[#f8fafc] text-gray-400 hover:border-teal-100 hover:text-gray-600'
                              }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                            <p.icon size={14} className={isActive ? 'text-white/70' : 'text-gray-300 group-hover:text-teal-400'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default RoleForm;
