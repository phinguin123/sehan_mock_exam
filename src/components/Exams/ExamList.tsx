import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  GraduationCap,
  Download,
  Upload,
  LinkIcon,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { components } from '@/types/api';
import api from '@/apis/axiosInterceptor';
import axios, { isAxiosError } from 'axios';

type Exam = components['schemas']['Exam'];
type ExamSubmission = components['schemas']['ExamSubmission'];

interface ExamListProps {
  initialExams: Exam[];
  timeRemaining: number;
  hoursBefore: number;
}

export default function ExamList({
  initialExams,
  timeRemaining,
  hoursBefore,
}: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  // State for exam filters
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Separate state for exam details and submission details.
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<ExamSubmission | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const subjects = Array.from(
    new Set(initialExams.map((exam) => exam.subject))
  );
  const grades = Array.from(new Set(initialExams.map((exam) => exam.grade)));

  useEffect(() => {
    const filteredExams = initialExams.filter(
      (exam) =>
        (subjectFilter === 'all' || exam.subject === subjectFilter) &&
        (gradeFilter === 'all' || exam.grade === gradeFilter)
    );
    setExams(filteredExams);
  }, [subjectFilter, gradeFilter, initialExams]);

  const handleSubjectChange = (value: string) => {
    setSubjectFilter(value);
  };

  const handleGradeChange = (value: string) => {
    setGradeFilter(value);
  };

  const handleDownload = async (file_name: string) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/files/exams/${file_name}`;
    window.open(url, '_blank');
  };

  const handleViewSubmission = async (file_name: string) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/files/students/${selectedSubmission?.student_id}/${file_name}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const handleTeacherCommentDownload = async (file_name: string) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/files/students/${selectedSubmission?.student_id}/${file_name}`;
      window.open(url, '_blank');
      // const response = await api.get(`/files/exams/${file_name}`, {
      //   responseType: 'blob',
      // });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', file_name);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      if (selectedFile && selectedFile.type !== 'application/pdf') {
        alert('Please submit only pdf files');
        return;
      }

      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (userComment) {
        formData.append('text_attachment', userComment);
      }
      if (!selectedFile && !userComment) {
        alert('Please upload a file or add a comment before submitting.');
        return;
      }

      formData.append('exam_id', selectedExam?.id?.toString() || '');

      await api.post<ExamSubmission>('/exam-submissions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDialogOpen(false);
      alert('Exam uploaded successfully!');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data.message);
      } else {
        alert('There was an error submitting exam');
      }
    }
  };

  // Fetch the submission details separately when opening the dialog.
  const handleOpenDialog = async (exam: Exam) => {
    setSelectedExam(exam);
    setUserComment('');
    setSelectedFile(null);
    try {
      const { data } = await api.get<ExamSubmission>(
        `/exam-submissions/students/${exam.id}`
      );
      console.log('data exam submission', data);
      setSelectedSubmission(data);
      setUserComment(data.text_attachment || '');
    } catch (error) {
      console.error(
        'No submission details found or error fetching them:',
        error
      );
      setSelectedSubmission(null);
    }
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitComment = async () => {
    // Here you can merge the exam submission with new comment or file data.
    // Use selectedExam?.id and selectedSubmission?.id (if available) to build the request.
    console.log('Submitting comment:', userComment);
    console.log('Submitting file:', selectedFile);
    // For example, you might call an update API for exam submission.
    setDialogOpen(false);
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
              {/* {selectedSubmission?.comment && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 mt-2"
                >
                  Teacher feedback available
                </Badge>
              )} */}
            </CardContent>
            <div className="px-6 py-4 bg-gray-100">
              <Button
                onClick={() => handleOpenDialog(exam)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-full transition duration-300"
                disabled={timeRemaining > hoursBefore * 60 * 60}
              >
                View Exam Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold">
              {selectedExam?.title}{' '}
              {selectedSubmission?.id !== null && (
                <span className="text-blue-600 dark:text-sky-400 text-base">
                  (Submitted)
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedExam?.subject} - Grade {selectedExam?.grade}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-grow pr-2">
            {selectedSubmission && (
              <div className="bg-muted rounded-lg p-4 mt-2 mb-4">
                <h3 className="font-medium text-center mb-2">Your Score</h3>
                <div className="flex justify-center items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedSubmission.score}/7
                    </div>
                    <div className="text-sm text-muted-foreground">Grade</div>
                  </div>
                  {selectedSubmission.raw_score !== undefined && (
                    <>
                      <div className="text-muted-foreground">(</div>
                      <div className="text-center">
                        <div className="text-lg font-medium">
                          {selectedSubmission.raw_score}/
                          {selectedSubmission.raw_total_score}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Raw Score
                        </div>
                      </div>
                      <div className="text-muted-foreground">)</div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Exam Materials</h3>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={() =>
                    selectedExam?.file_name &&
                    handleDownload(selectedExam.file_name)
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Exam
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Submit Your Work</h3>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input
                    id="submission"
                    type="file"
                    onChange={handleFileChange}
                  />
                </div>

                {selectedSubmission?.file_name && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center mt-2"
                    onClick={() =>
                      selectedSubmission?.file_name &&
                      handleViewSubmission(selectedSubmission.file_name)
                    }
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Submitted File
                  </Button>
                )}
              </div>

              <Separator />

              {(selectedSubmission?.comment ||
                selectedSubmission?.comment_file_name) && (
                <div className="space-y-2">
                  <h3 className="font-medium">Teacher Feedback</h3>
                  {selectedSubmission?.comment && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSubmission.comment}
                      </p>
                    </div>
                  )}

                  {selectedSubmission?.comment_file_name && (
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={() =>
                        selectedSubmission.comment_file_name &&
                        handleTeacherCommentDownload(
                          selectedSubmission.comment_file_name
                        )
                      }
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download Teacher Comments
                    </Button>
                  )}
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Add Your Link</h3>
                <Textarea
                  placeholder="Add any google doc link if needed"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={
                  timeRemaining === 0 || selectedSubmission?.id !== null
                }
                // disabled={timeRemaining === 0 || timeRemaining > 3 * 60 * 60}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
