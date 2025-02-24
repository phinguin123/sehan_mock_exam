import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText } from 'lucide-react';

// Helper function to generate random data
function generateRandomStudent(id: number) {
  const firstNames = [
    'Emma',
    'Liam',
    'Olivia',
    'Noah',
    'Ava',
    'Ethan',
    'Sophia',
    'Mason',
    'Isabella',
    'William',
  ];
  const lastNames = [
    'Smith',
    'Johnson',
    'Brown',
    'Taylor',
    'Miller',
    'Wilson',
    'Moore',
    'Anderson',
    'Thomas',
    'Jackson',
  ];
  const grades = ['A', 'B', 'C', 'D'];

  return {
    id,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    grade: grades[Math.floor(Math.random() * grades.length)],
    reportUrl: `/reports/student-${id}.pdf`,
  };
}

async function getStudents(page: number) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const allStudents = [...Array(100)].map((_, i) =>
    generateRandomStudent(i + 1)
  );
  return allStudents.slice((page - 1) * 10, page * 10);
}

export default function ExamStudentReportsList({ page }: { page: number }) {
  const [students, setStudents] = useState<
    Array<{ id: number; name: string; grade: string; reportUrl: string }>
  >([]);
  const totalPages = 10;

  useEffect(() => {
    getStudents(page).then(setStudents);
  }, [page]);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Report</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.grade}</TableCell>
              <TableCell>
                <a
                  href={student.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    View Report
                  </Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" disabled={page === 1}>
          <Link to={`/admin/exams/report?page=${page - 1}`}>Previous</Link>
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" disabled={page === totalPages}>
          <Link to={`/admin/exams/report?page=${page + 1}`}>Next</Link>
        </Button>
      </div>
    </div>
  );
}
