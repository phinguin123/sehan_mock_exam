import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import studentRoutes from './studentRoutes';
import adminRoutes from './adminRoutes';
import AdminLayout from '@/components/Layouts/AdminLayout';
const Login = lazy(() => import('@/pages/admin/Login'));

const Router = () => {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          {/* Redirections */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/secure-sehan-admin"
            element={<Navigate to="/secure-sehan-admin/login" replace />}
          />

          <Route path="/secure-sehan-admin/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/secure-sehan-admin" element={<AdminLayout />}>
            {adminRoutes.map((route, idx) => (
              <Route
                key={idx}
                path={route.path} // Strips '/admin' from the path
                element={<route.element />}
              />
            ))}
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
          {studentRoutes.map((route, idx) => (
            <Route key={idx} path={route.path} element={<route.element />} />
          ))}
          {/* Default routes */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
