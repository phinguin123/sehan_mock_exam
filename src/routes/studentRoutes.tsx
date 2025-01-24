import { lazy } from 'react';

const ExamPage = lazy(() => import('../pages/student/ExamPage.tsx'));

const studentRoutes = [{ path: '/exams', element: ExamPage }];

export default studentRoutes;
