import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, GraduationCap, Download, Upload } from 'lucide-react';
import { components } from '@/types/api';
import api from '@/apis/axiosInterceptor';

// import '@/App.css';

type Exam = components['schemas']['Exam'];
type ExamSubmission = components['schemas']['ExamSubmission'];

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
        (gradeFilter === 'all' || exam.grade === gradeFilter)
    );
    setExams(filteredExams);
  }, [subjectFilter, gradeFilter]);

  const handleSubjectChange = (value: string) => {
    setSubjectFilter(value);
  };

  const handleGradeChange = (value: string) => {
    setGradeFilter(value);
  };

  const handleDownload = async (file_name: string) => {
    try {
      const response = await api.get(`/files/${file_name}`, {
        responseType: 'blob', // Ensures the response is treated as binary data (file)
      });

      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file_name); // Set the file name for downloading
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the link element
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const handleUpload = (examId: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf'; // or any file format you expect

    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target && target.files) {
        const file = target.files[0];
        if (file) {
          try {
            const formData = new FormData();
            formData.append('exam_id', examId);
            formData.append('file', file);

            console.log('exma id', examId);

            // Make the request to upload the file
            await api.post<ExamSubmission>('/exam-submissions/', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('File uploaded successfully!');
          } catch (error) {
            console.error('Error uploading the file:', error);
          }
        }
      }
    };

    fileInput.click();
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Select onValueChange={handleSubjectChange}>
          <SelectTrigger className="w-[180px] bg-white">
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
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((grade) => (
              <SelectItem key={grade} value={grade.toString()}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {exams.map((exam) => (
          <Card
            key={exam.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <CardHeader className="bg-gray-100 px-6 py-4">
              <CardTitle className="text-xl font-bold text-gray-800 overflow-hidden whitespace-nowrap text-ellipsis">
                {exam.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <div className="flex items-center text-gray-700 mb-2">
                <BookOpen className="w-5 h-5 mr-2 text-sky-500" />
                Subject: {exam.subject}
              </div>
              <div className="flex items-center text-gray-700 mb-2">
                <GraduationCap className="w-5 h-5 mr-2 text-indigo-500" />
                Grade: {exam.grade}
              </div>
              {/* <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>{exam.duration} minutes</span>
              </div> */}
              {/* <div className="flex items-center text-sm text-muted-foreground mt-2">
                <FileText className="mr-2 h-4 w-4" />
                <span>{exam.totalQuestions} questions</span>
              </div> */}
            </CardContent>
            <div className="px-6 py-4 bg-gray-100 flex justify-between space-x-4">
              <button
                onClick={() => exam.file_name && handleDownload(exam.file_name)}
                className="flex items-center justify-center min-w-[120px] bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                  Download
                </span>
              </button>
              <button
                onClick={() =>
                  exam.file_name &&
                  exam.id !== undefined &&
                  handleUpload(exam.id.toString())
                }
                className="flex items-center justify-center min-w-[120px] bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition duration-300"
              >
                <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                  Upload
                </span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
