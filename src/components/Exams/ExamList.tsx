import { useState, useEffect } from 'react';
import type { Exam } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, FileText } from 'lucide-react';
// import '@/App.css';

interface ExamListProps {
  initialExams: Exam[];
}

export default function ExamList({ initialExams }: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  const subjects = Array.from(
    new Set(initialExams.map((Exam) => Exam.subject))
  );
  const grades = Array.from(new Set(initialExams.map((Exam) => Exam.grade)));

  useEffect(() => {
    const filteredExams = initialExams.filter(
      (exam) =>
        (subjectFilter === 'all' || exam.subject === subjectFilter) &&
        (gradeFilter === 'all' || exam.grade === Number.parseInt(gradeFilter))
    );
    setExams(filteredExams);
  }, [subjectFilter, gradeFilter]);

  const handleSubjectChange = (value: string) => {
    setSubjectFilter(value);
  };

  const handleGradeChange = (value: string) => {
    setGradeFilter(value);
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Select onValueChange={handleSubjectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleGradeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((grade) => (
              <SelectItem key={grade} value={grade.toString()}>
                Grade {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader>
              <CardTitle>{exam.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Subject: {exam.subject}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Grade: {exam.grade}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>{exam.duration} minutes</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <FileText className="mr-2 h-4 w-4" />
                <span>{exam.totalQuestions} questions</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
