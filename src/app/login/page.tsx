'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LogIn, Eye, EyeOff, ShieldCheck, Zap, Globe, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Image from 'next/image';

const PRIMARY = '#0f766e'; // Teal-700
const DARK_NAVY = '#0f172a';

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
    <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row bg-[#f8fafc]">
      {/* LEFT PARTITION - PREMIUM BRANDING & VISUALS */}
      <div className="relative hidden h-full w-[55%] overflow-hidden md:flex flex-col justify-between p-16 bg-[#0f172a]">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#0f766e]/20 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[120px] animate-pulse delay-700" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Logo Section - Sidebar Style */}
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-top-10 duration-1000">
             <div className="relative px-6 flex items-center justify-center border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md h-24 rounded-2xl transition-all duration-500 shadow-2xl">
                <div className="w-full max-w-[160px] flex items-center justify-center overflow-hidden">
                  <Image 
                    src="/logo.png" 
                    alt="Proserve Logo" 
                    width={150} 
                    height={50} 
                    className="object-contain" 
                    priority 
                  />
                </div>
              </div>
            <div className="text-white">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Proserve</h1>
              {/* <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-teal-400 mt-1">Enterprise ERP</p> */}
            </div>
          </div>

          <div className="max-w-xl space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
            <div className="space-y-4">
              <div className="h-1 w-20 bg-teal-500 rounded-full" />
              <h2 className="text-7xl font-black leading-[0.95] tracking-tight text-white">
                Next-Gen <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Operations</span> <br />
                Workspace.
              </h2>
            </div>
            
            <p className="text-xl font-medium leading-relaxed text-gray-400 max-w-lg">
              Empower your enterprise with precision logistics, seamless finance, and intelligent resource management.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group">
                  <ShieldCheck className="text-teal-400 group-hover:scale-110 transition-transform" size={24} />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Encrypted</p>
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Industrial Security</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group">
                  <Zap className="text-teal-400 group-hover:scale-110 transition-transform" size={24} />
                </div>
                <div>
                  <p className="text-base font-bold text-white">High Velocity</p>
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Real-time Sync</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">
            <span>Core Infrastructure v2.4</span>
            <div className="h-[1px] flex-1 bg-white/5" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PARTITION - LOGIN FORM */}
      <div className="flex h-full w-full flex-col items-center justify-center px-6 md:w-[45%] lg:px-24">
        <div className="w-full max-w-[440px] space-y-12 animate-in fade-in zoom-in-95 duration-700">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-teal-600 mb-2">
              <Lock size={12} strokeWidth={3} />
              <span>Secure Authentication</span>
            </div>
            <h3 className="text-5xl font-black tracking-tight text-gray-900">
              Welcome <span className="text-[#0f766e]">Back</span>
            </h3>
            <p className="text-sm font-bold text-gray-500 leading-relaxed">
              Enter secure credentials to access the Proserve enterprise dashboard.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-8">
            <div className="space-y-8">
              {/* Email Input */}
              <div className="group relative">
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                  Organizational Email
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0f766e] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@proserve.com"
                    autoComplete="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full border-b-2 bg-transparent py-4 pl-8 text-sm font-bold text-gray-900 transition-all focus:outline-none 
                      ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#0f766e]'}`}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="group relative">
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                  Secure Access Key
                </label>
                <div className="relative">
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0f766e] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full border-b-2 bg-transparent py-4 pl-8 text-sm font-bold text-gray-900 transition-all focus:outline-none 
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

            <div className="pt-6">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#0f766e] py-6 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_20px_40px_rgba(15,118,110,0.3)] transition-all hover:bg-[#134e4a] hover:-translate-y-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="absolute inset-x-0 bottom-0 h-[2px] w-full scale-x-0 bg-white/30 transition-transform duration-500 group-hover:scale-x-100" />
                {formik.isSubmitting ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="flex flex-col items-center gap-10 pt-8">
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-300 w-full">
              <div className="h-[1px] flex-1 bg-gray-100" />
              <span>Official Access Node</span>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                © {currentYear} PROSERVE GROUP.
              </p>
              <p className="text-[9px] font-bold uppercase tracking-tighter text-gray-300">
                Security Policy Enforcement Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

