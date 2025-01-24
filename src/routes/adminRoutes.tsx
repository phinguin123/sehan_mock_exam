import { lazy } from 'react';

const ExamSettingPage = lazy(() => import('@/pages/admin/ExamSettingPage.tsx'));

const adminRoutes = [
  { path: '/admin/exams/settings', element: ExamSettingPage },
];

export default adminRoutes;
