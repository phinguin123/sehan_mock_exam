import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import studentRoutes from './studentRoutes';
import adminRoutes from './adminRoutes';
import AdminLayout from '@/components/Layouts/AdminLayout';
import PrivateRoutes from '@/components/PrivateRoutes';
const Login = lazy(() => import('@/pages/admin/Login'));
const Logout = lazy(() => import('@/pages/common/LogoutPage'));
const StudentLogin = lazy(() => import('../pages/student/Login.tsx'));

const Router = () => {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          {/* Default routes */}
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/logout" element={<Logout />} />

          {/* Redirections */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/secure-sehan-admin"
            element={<Navigate to="/secure-sehan-admin/login" replace />}
          />

          <Route path="/secure-sehan-admin/login" element={<Login />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoutes />}>
            <Route path="/secure-sehan-admin" element={<AdminLayout />}>
              {adminRoutes.map((route, idx) => (
                <Route
                  key={idx}
                  path={route.path} // Strips '/admin' from the path
                  element={<route.element />}
                />
              ))}
            </Route>
          </Route>

          {/* {adminRoutes.map((route, idx) => (
            <Route
              key={idx}
              path={route.path}
              element={
                <>
                  <route.element />
                </>
              }
            />
          ))} */}
          {/* Student Routes */}
          {/* <Route element={<AdminPrivateRoutes />}>
            {adminRoutes.map((route, idx) => (
              <Route
                key={idx}
                path={route.path}
                element={<route.element />}
              />
            ))}
          </Route> */}
          <Route element={<PrivateRoutes />}>
            {studentRoutes.map((route, idx) => (
              <Route key={idx} path={route.path} element={<route.element />} />
            ))}
          </Route>
          {/* Default routes */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
