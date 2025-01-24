import { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import studentRoutes from './studentRoutes';
import adminRoutes from './adminRoutes';

const Router = () => {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          {/* Admin Routes */}
          {adminRoutes.map((route, idx) => (
            <Route key={idx} path={route.path} element={<route.element />} />
          ))}

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
