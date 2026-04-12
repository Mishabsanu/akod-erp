'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Image from 'next/image';

// BRAND COLORS
const PRIMARY = '#11375d';
const SECONDARY = '#FFFFFF';
const BG = '#F8F8F8';
const TEXT = '#11375d';

// Normal red for validation errors ONLY
const ERROR_RED = '#d32f2f';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Min 6 characters required')
    .required('Password is required'),
});

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
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Login failed. Try again.';
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      {/* Background split */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full relative">
          <div
            className="absolute inset-0 backdrop-blur-xl opacity-75 clip-left"
            style={{ backgroundColor: SECONDARY }}
          />
        </div>

        <div className="w-1/2 h-full relative">
          <div
            className="absolute inset-0 backdrop-blur-xl opacity-85 clip-right"
            style={{ backgroundColor: PRIMARY }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div
        className="relative z-10 flex w-[90%] max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] border"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        {/* LEFT BRAND SIDE */}
        <div
          className="hidden md:flex w-1/2 flex-col items-center justify-center relative overflow-hidden"
          style={{ color: TEXT }}
        >
          <div
            className="absolute w-72 h-72 blur-[100px] rounded-full"
            style={{ backgroundColor: PRIMARY, opacity: 0.12 }}
          />

          <Image
            src="/logocrm.png"
            alt="Brand Logo"
            width={260}
            height={70}
            className="relative z-10 mb-8 drop-shadow-[0_0_12px_rgba(0,0,0,0.3)]"
          />

          <div
            className="w-48 h-[2px] mb-8 opacity-60"
            style={{
              background: `linear-gradient(to right, transparent, ${TEXT}, transparent)`,
            }}
          />

          <h1 className="text-4xl font-extrabold tracking-wide">AKOD CRM</h1>

          <p className="text-sm mt-4 max-w-sm text-center leading-relaxed opacity-80">
            Smart. Fast. Reliable CRM built for real business growth.
          </p>

          <div
            className="w-full max-w-xs mt-12 border-t opacity-40"
            style={{ borderColor: TEXT }}
          />

          <p className="mt-6 text-xs opacity-70">Powered with Excellence</p>
        </div>

        {/* RIGHT FORM SIDE */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-14">
          <div
            className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl shadow-xl"
            style={{
              backgroundColor: SECONDARY + 'D9',
              border: `1px solid rgba(0,0,0,0.08)`,
            }}
          >
            <h2
              className="text-3xl font-extrabold text-center mb-10"
              style={{ color: PRIMARY }}
            >
              Welcome Back
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-7">
              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: TEXT }}
                >
                  Email Address <span style={{ color: ERROR_RED }}>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yourmail@domain.com"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // autoComplete="off"
                  value={formik.values.email}
                  className="w-full px-4 py-3.5 rounded-xl text-sm focus:ring-2 border"
                  style={{
                    backgroundColor: SECONDARY,
                    borderColor:
                      formik.touched.email && formik.errors.email
                        ? ERROR_RED
                        : 'rgba(0,0,0,0.25)',
                    color: TEXT,
                    outline: 'none',
                  }}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs mt-1" style={{ color: ERROR_RED }}>
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: TEXT }}
                >
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
                    className="w-full px-4 py-3.5 rounded-xl text-sm focus:ring-2 border pr-12"
                    style={{
                      backgroundColor: SECONDARY,
                      borderColor:
                        formik.touched.password && formik.errors.password
                          ? ERROR_RED
                          : 'rgba(0,0,0,0.25)',
                      color: TEXT,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[14px]"
                    style={{ color: TEXT }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs mt-1" style={{ color: ERROR_RED }}>
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl shadow-md transition text-sm"
                style={{
                  backgroundColor: formik.isSubmitting ? '#999' : PRIMARY,
                  cursor: formik.isSubmitting ? 'not-allowed' : 'pointer',
                  color: SECONDARY,
                }}
              >
                <LogIn size={16} />
                {formik.isSubmitting ? 'Please wait…' : 'Login'}
              </button>
            </form>

            <p
              className="mt-10 text-center text-[11px]"
              style={{ color: `${TEXT}B0` }}
            >
              © {currentYear} AKOD Group. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Arrow Clipping */}
      <style jsx>{`
        .clip-left {
          clip-path: polygon(0 0, 70% 0, 100% 100%, 0 100%);
        }
        .clip-right {
          clip-path: polygon(30% 0, 100% 0, 100% 100%, 0 100%);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
