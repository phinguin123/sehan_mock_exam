import type { Exam } from '@/types/exam';
import ExamList from '@/components/Exams/ExamList';
import { useEffect, useState } from 'react';

async function getExams(): Promise<Exam[]> {
  // In a real application, this would be an API call
  return [
    {
      id: '1',
      title: 'Math Midterm',
      subject: 'Mathematics',
      grade: 9,
      duration: 60,
      totalQuestions: 30,
    },
    {
      id: '2',
      title: 'English Literature Quiz',
      subject: 'English',
      grade: 10,
      duration: 45,
      totalQuestions: 20,
    },
    {
      id: '3',
      title: 'Chemistry Final',
      subject: 'Chemistry',
      grade: 11,
      duration: 90,
      totalQuestions: 50,
    },
    {
      id: '4',
      title: 'World History Test',
      subject: 'History',
      grade: 9,
      duration: 60,
      totalQuestions: 40,
    },
    {
      id: '5',
      title: 'Physics Problem Set',
      subject: 'Physics',
      grade: 12,
      duration: 75,
      totalQuestions: 25,
    },
  ];
}

export default function ExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadExams = async () => {
      const fetchedExams = await getExams();
      setExams(fetchedExams);
      setLoading(false);
    };
    loadExams();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Exams</h1>
      <ExamList initialExams={exams} />
    </div>
  );
}
