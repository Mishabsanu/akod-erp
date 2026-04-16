'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Image from 'next/image';

const PRIMARY = '#0f766e';
const SECONDARY = '#ffffff';
const ERROR_RED = '#d32f2f';

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
        toast.success('Login successful');
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden px-4 bg-[radial-gradient(circle_at_top_right,#f1f5f9,var(--bg-main))]">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[var(--bg-sidebar)] md:block" />

      <div className="relative z-10 flex w-full max-w-6xl min-h-[680px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] animate-fade-in">
        <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-white px-10 md:flex">
          <div className="absolute left-16 top-16 h-72 w-72 rounded-full bg-[#0f766e]/10 blur-[100px]" />

          <Image
            src="/logocrm.png"
            alt="Brand Logo"
            width={260}
            height={70}
            className="relative z-10 mb-8 drop-shadow-[0_10px_20px_rgba(15,118,110,0.12)]"
          />

          <div className="mb-8 h-[2px] w-48 bg-gradient-to-r from-transparent via-[#0f766e] to-transparent opacity-60" />

          <h1 className="text-4xl font-extrabold tracking-wide text-[var(--text-main)]">
            AKOD ERP
          </h1>

          <p className="mt-4 max-w-sm text-center text-sm font-semibold leading-relaxed text-[var(--text-muted)]">
            Smart. Fast. Reliable enterprise operations built for real business growth.
          </p>

          <div className="mt-12 w-full max-w-xs border-t border-[var(--border-subtle)]" />

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Powered with Excellence
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center bg-[var(--bg-sidebar)] px-8 md:px-14">
          <div className="glass-premium w-full max-w-md rounded-[var(--radius-lg)] p-8 shadow-xl">
            <h2 className="mb-10 text-center text-3xl font-extrabold text-[#0f766e]">
              Welcome Back
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-7">
              <div>
                <label className="label-premium">
                  Email Address <span style={{ color: ERROR_RED }}>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yourmail@domain.com"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className="input-premium"
                  style={{
                    backgroundColor: SECONDARY,
                    borderColor:
                      formik.touched.email && formik.errors.email
                        ? ERROR_RED
                        : undefined,
                    color: 'var(--text-main)',
                  }}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-xs" style={{ color: ERROR_RED }}>
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="label-premium">
                  Password <span style={{ color: ERROR_RED }}>*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="secure password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className="input-premium pr-12"
                    style={{
                      backgroundColor: SECONDARY,
                      borderColor:
                        formik.touched.password && formik.errors.password
                          ? ERROR_RED
                          : undefined,
                      color: 'var(--text-main)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[14px] text-[var(--text-muted)] transition hover:text-[#0f766e]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-xs" style={{ color: ERROR_RED }}>
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] py-3.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: formik.isSubmitting ? '#94a3b8' : PRIMARY }}
              >
                <LogIn size={16} />
                {formik.isSubmitting ? 'Please wait...' : 'Login'}
              </button>
            </form>

            <p className="mt-10 text-center text-[11px] text-[var(--text-muted)]">
              © {currentYear} AKOD Group. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
