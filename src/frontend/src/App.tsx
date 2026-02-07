import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import ReactivateAccountPage from '@/pages/ReactivateAccountPage';
import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage';
import ProtectedRoute from '@/components/protected-route';
import RoleProtectedRoute from '@/components/role-protected-route';
import Layout from '@/components/layout';
import AdminLayout from '@/components/admin-layout';
import AdminPage from '@/pages/AdminPage';
import AdminBrandsPage from '@/pages/AdminBrandsPage';
import AdminCategoriesPage from '@/pages/AdminCategoriesPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Client Layout Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Admin Layout Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<RoleProtectedRoute allowedRoles={['Administrator']} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/brands" element={<AdminBrandsPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Bare Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/reactivate-account" element={<ReactivateAccountPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;