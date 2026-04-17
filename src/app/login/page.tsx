'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LogIn, Eye, EyeOff, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Image from 'next/image';

const PRIMARY = '#0f766e';
const ERROR_RED = '#ef4444';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Min 6 characters required')
    .required('Password is required'),
});

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }
  return 'Login failed. Try again.';
};

const LoginPage = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values.email, values.password);
        toast.success('Access Granted. Welcome back.');
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row bg-white">
      {/* LEFT PARTITION - BRANDING & VISUALS */}
      <div className="relative hidden h-full w-[60%] overflow-hidden md:block">
        <Image
          src="/login_bg.png"
          alt="Enterprise Background"
          fill
          priority
          className="object-cover transition-transform duration-[10000ms] hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a]/95 via-[#0f172a]/70 to-[#0f172a]/40" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-16">
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-10 duration-1000">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xl">
              <Image src="/logocrm.png" alt="Logo" width={32} height={32} />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">Akod</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Enterprise ERP</p>
            </div>
          </div>

          <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
            <h2 className="text-6xl font-black leading-[1.1] tracking-tight text-white">
              Elevate Your <span className="text-teal-400">Business</span> Horizon.
            </h2>
            <p className="text-lg font-medium leading-relaxed text-gray-200 opacity-90">
              Experience the next generation of enterprise resource planning. 
              Seamless accounting, logistics, and CRM all in one unified, high-performance workspace.
            </p>
            
            <div className="flex gap-10 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                   <ShieldCheck className="text-teal-400" size={20} />
                </div>
                <div className="text-white">
                   <p className="text-sm font-bold">Secure</p>
                   <p className="text-[10px] opacity-60">Bank-grade encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                   <Zap className="text-teal-400" size={20} />
                </div>
                <div className="text-white">
                   <p className="text-sm font-bold">Fast</p>
                   <p className="text-[10px] opacity-60">Real-time processing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                   <Globe className="text-teal-400" size={20} />
                </div>
                <div className="text-white">
                   <p className="text-sm font-bold">Global</p>
                   <p className="text-[10px] opacity-60">Multi-region support</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <span>Powering Enterprise Success</span>
            <div className="h-[1px] w-20 bg-white/20" />
            <span>Digital Transformation v2.0</span>
          </div>
        </div>
      </div>

      {/* RIGHT PARTITION - LOGIN FORM */}
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#f8fafc] px-6 md:w-[40%] lg:px-20">
        <div className="w-full max-w-[420px] space-y-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="space-y-4">
            <h3 className="text-4xl font-black tracking-tight text-gray-900">
              Welcome <span className="text-[#0f766e]">Back</span>
            </h3>
            <p className="text-sm font-semibold text-gray-500">
              Please enter your credentials to access the ERP dashboard.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="group relative">
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                  Work Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full border-b-2 bg-transparent py-4 text-sm font-bold text-gray-900 transition-all focus:outline-none 
                      ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#0f766e]'}`}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="group relative">
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full border-b-2 bg-transparent py-4 text-sm font-bold text-gray-900 transition-all focus:outline-none 
                      ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-200 focus:border-[#0f766e]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#0f766e] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#0f766e] py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-[#134e4a] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="absolute inset-x-0 bottom-0 h-1 w-full scale-x-0 bg-white/20 transition-transform duration-500 group-hover:scale-x-100" />
                <LogIn size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                {formik.isSubmitting ? 'Authenticating...' : 'Sign In To System'}
              </button>
            </div>
          </form>

          <div className="flex flex-col items-center gap-8 pt-6">
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
               <span className="h-[1px] w-12 bg-gray-200" />
               <span>Official Group Access Only</span>
               <span className="h-[1px] w-12 bg-gray-200" />
            </div>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
              © {currentYear} AKOD GROUP PVT LTD. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
