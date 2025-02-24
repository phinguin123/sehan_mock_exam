import { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import StudentReportsList from './ExamStudentReportListPage';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExamStudentReportsPage() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  return (
    <div className="container mx-auto py-10 px-5">
      <h1 className="text-2xl font-bold mb-6">Student Reports</h1>
      <Suspense fallback={<StudentReportsListSkeleton />}>
        <StudentReportsList page={page} />
      </Suspense>
    </div>
  );
}

function StudentReportsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
