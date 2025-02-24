import { lazy } from 'react';

const ExamPage = lazy(() => import('../pages/student/ExamPage.tsx'));
const Login = lazy(() => import('../pages/student/Login.tsx'));

const studentRoutes = [
  { path: '/exams', element: ExamPage },
  { path: '/login', element: Login },
];

export default studentRoutes;
