import { lazy } from 'react';

const ExamSettingPage = lazy(() => import('@/pages/admin/CreateExam'));
const ExamCommentsSettingPage = lazy(
  () => import('@/pages/admin/ExamCommentsSettingPage.tsx')
);
const ExamStudentReportsPage = lazy(
  () => import('@/pages/admin/ExamStudentReportsPage')
);
const CreateStudent = lazy(() => import('@/pages/admin/CreateStudent'));
const StudentComments = lazy(() => import('@/pages/admin/StudentComments'));
const GradeExam = lazy(() => import('@/pages/admin/GradeExam'));
const ExamReport = lazy(() => import('@/pages/admin/ExamReport'));
const CreateTeacher = lazy(() => import('@/pages/admin/CreateTeacher'));

const adminRoutes = [
  { path: 'exams/create', element: ExamSettingPage },
  {
    path: 'exams/comments',
    element: ExamCommentsSettingPage,
  },
  {
    path: 'exams/reports',
    element: ExamStudentReportsPage,
  },
  {
    path: 'students/create',
    element: CreateStudent,
  },
  {
    path: 'teachers/create',
    element: CreateTeacher,
  },
  // {
  //   path: 'comments',
  //   element: StudentComments,
  // },
  {
    path: 'exams/grade',
    element: GradeExam,
  },
  {
    path: 'reports',
    element: ExamReport,
  },
];

export default adminRoutes;
