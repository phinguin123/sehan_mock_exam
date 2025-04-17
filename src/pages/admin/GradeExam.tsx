import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import api from '@/apis/axiosInterceptor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  FileIcon,
  UserIcon,
  BookmarkIcon,
  ArrowUpIcon,
  PaperclipIcon,
  TrashIcon,
  Upload,
} from 'lucide-react';
import { components } from '@/types/api';
import axios, { isAxiosError } from 'axios';

type ExamSubmission = components['schemas']['ExamSubmission'];

type Subject = components['schemas']['Subject'];

const old_subjects = [
  'Biology',
  'Business',
  'Chemistry',
  'CompSci',
  'Economics',
  'English',
  'English A',
  'English B',
  'Korean Lit',
  'Korean LL',
  'Math',
  'Math AA',
  'Math AI',
  'Physics',
];

const grades = ['pre-IB', '11', '12'];
const levels = ['SL', 'HL', 'SL,HL'];
const types = ['Homework', 'Exam'];

const gradeBoundaries = [
  { min: 80, max: 100, score: 7 },
  { min: 70, max: 80, score: 6 },
  { min: 50, max: 70, score: 5 },
  { min: 40, max: 50, score: 4 },
  { min: 30, max: 40, score: 3 },
  { min: 20, max: 30, score: 2 },
  { min: 0, max: 20, score: 1 },
];

interface StudentName {
  student_id: number;
  name: string;
  duplicate?: string;
}

interface DeleteConfirmation {
  show: boolean;
  id: number | null;
  type: 'homework' | 'commentFile';
  commentFileName?: string;
  studentId?: number;
}

interface Filters {
  subject: string;
  grade: string;
}

export default function GradeExam() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pendingHomeworks, setPendingHomeworks] = useState<ExamSubmission[]>(
    []
  );
  const [gradedHomeworks, setGradedHomeworks] = useState<ExamSubmission[]>([]);
  const [filters, setFilters] = useState<Filters>({
    subject: '',
    grade: '',
  });
  const [currentUser, setCurrentUser] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [selectedHomework, setSelectedHomework] =
    useState<ExamSubmission | null>(null);
  const [rawScore, setRawScore] = useState<string>('');
  const [totalScore, setTotalScore] = useState<string>('');
  const [calculatedScore, setCalculatedScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('graded');
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({ show: false, id: null, type: 'homework' });
  const [studentNames, setStudentNames] = useState<StudentName[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingCurrentPage, setPendingCurrentPage] = useState<number>(1);
  const [gradedCurrentPage, setGradedCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pendingTotalPages, setPendingTotalPages] = useState<number>(0);
  const [gradedTotalPages, setGradedTotalPages] = useState<number>(0);
  const [gradedMatchingCounts, setGradedMatchingCounts] = useState<number>(0);
  const [pendingMatchingCounts, setPendingMatchingCounts] = useState<number>(0);
  const [teacherFile, setTeacherFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSubjectList = async () => {
    try {
      const response = await api.get('/subjects/');
      // const response = await axios.get(
      //   `${import.meta.env.VITE_API_BASE_URL}/subjects/`,
      //   {
      //     headers: { 'Content-Type': 'application/json' },
      //     withCredentials: true,
      //   }
      // );
      console.log('received subject list response:', response);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subject list:', error);
    }
  };

  useEffect(() => {
    fetchSubjectList();
  }, []);

  //   useEffect(() => {
  //     fetchStudentNames();
  //   }, []);

  useEffect(() => {
    if (activeTab === 'graded') {
      fetchGradedHomework(gradedCurrentPage);
    } else if (activeTab === 'pending') {
      fetchPendingHomework(pendingCurrentPage);
    }
  }, [activeTab, gradedCurrentPage, pendingCurrentPage]);

  const fetchHomework = async (page = 1, pageSize = 10, status: string) => {
    try {
      const response = await api.get('/exam-submissions/', {
        params: {
          subject: filters.subject,
          grade: filters.grade,
          searchQuery: searchQuery,
          page: page,
          itemsPerPage: 50,
          graded_status: status,
        },
      });

      // console.log('fetchhomework response', response);
      const { exam_submissions, total_pages, total_count } = response.data;

      // console.log('data', exam_submissions);

      if (status === 'graded') {
        setGradedHomeworks(exam_submissions);
        setGradedTotalPages(total_pages);
        setGradedMatchingCounts(total_count);
      } else {
        setPendingHomeworks(exam_submissions);
        setPendingTotalPages(total_pages);
        setPendingMatchingCounts(total_count);
      }

      return exam_submissions;
    } catch (error) {
      console.error('Error fetching homework:', error);
      return [];
    }
  };

  const fetchGradedHomework = (page: number) =>
    fetchHomework(page, pageSize, 'graded');
  const fetchPendingHomework = (page: number) =>
    fetchHomework(page, pageSize, 'pending');

  // For deleting homework
  const handleDelete = (id: number) => {
    setDeleteConfirmation({ show: true, id, type: 'homework' });
  };

  // For deleting comment file
  const handleDeleteCommentFile = (
    commentFileName: string,
    studentId: number,
    homeworkId: number
  ) => {
    setDeleteConfirmation({
      show: true,
      id: homeworkId,
      type: 'commentFile',
      commentFileName,
      studentId,
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.type === 'homework') {
      if (deleteConfirmation.id) {
        try {
          await api.delete(
            `${import.meta.env.VITE_API_BASE_URL}/exam-submissions/${deleteConfirmation.id}`
          );
          setGradedHomeworks((prev) =>
            prev.filter((hw) => hw.id !== deleteConfirmation.id)
          );
          setPendingHomeworks((prev) =>
            prev.filter((hw) => hw.id !== deleteConfirmation.id)
          );
          window.alert('Homework submission deleted successfully.');
        } catch (error) {
          window.alert('There was an error deleting the homework submission.');
        }
      }
    } else if (deleteConfirmation.type === 'commentFile') {
      try {
        await api.delete(
          `/files/comment_file/${deleteConfirmation.commentFileName}/${deleteConfirmation.studentId}/${deleteConfirmation.id}`
        );

        if (activeTab === 'graded') {
          fetchGradedHomework(gradedCurrentPage);
        } else {
          fetchPendingHomework(pendingCurrentPage);
        }

        alert('comment file delete successfully');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          alert(error.response?.data.message);
        } else {
          alert('There was an error deleting comment file');
        }
      }
      // Delete comment file logic using deleteConfirmation.commentFileName, deleteConfirmation.studentId, and deleteConfirmation.id
    }
    cancelDelete();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form from reloading (optional)
      submitFilters();
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, id: null, type: 'homework' });
  };

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      grade: '',
    });
    setSearchQuery('');
  };

  const submitFilters = () => {
    if (activeTab === 'graded') {
      fetchGradedHomework(gradedCurrentPage);
    } else {
      fetchPendingHomework(pendingCurrentPage);
    }
  };

  const handleHomeworkClick = (homework: ExamSubmission) => {
    setSelectedHomework(homework);
    setComment(homework.comment || '');
    setRawScore(homework.raw_score || '');
    setTotalScore(homework.total_score || '');
    calculateScore(homework.raw_score || '', homework.total_score || '');
  };

  const handleGradeSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      rawScore === '' ||
      totalScore === '' ||
      isNaN(Number(rawScore)) ||
      isNaN(Number(totalScore))
    ) {
      alert('Raw Score and Total Score must be valid numbers');
      return;
    }

    const formData = new FormData();
    if (teacherFile) {
      formData.append('file', teacherFile);
      setTeacherFile(null);
    }

    try {
      formData.append('rawScore', rawScore);
      formData.append('totalScore', totalScore);
      formData.append('calculatedScore', calculatedScore.toString());
      formData.append('comment', comment);
      formData.append(
        'student_id',
        selectedHomework?.student_id?.toString() ?? ''
      );

      console.log('FormData contents:');
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      const submitted_homework_id = selectedHomework?.id;
      const response = await api.put(
        `exam-submissions/${submitted_homework_id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // if (response.status !== 200) {
      //   throw new Error('Failed to submit grade');
      // }
      setSelectedHomework(null);

      if (activeTab === 'graded') {
        fetchGradedHomework(gradedCurrentPage);
      } else {
        fetchPendingHomework(pendingCurrentPage);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('inside axios isaxioserror');
        console.log('error received', error.response);
        alert(error.response?.data.message);
      } else {
        alert('There was an errrrrror grading exam');
      }
    }
  };

  const handleRawScoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRawScore(e.target.value);
    calculateScore(e.target.value, totalScore);
  };

  const handleTotalScoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalScore(e.target.value);
    calculateScore(rawScore, e.target.value);
  };

  const calculateScore = (raw: string, total: string) => {
    if (raw && total) {
      const percentage = (parseFloat(raw) / parseFloat(total)) * 100;
      console.log('percentage', percentage);
      const score =
        gradeBoundaries.find(
          (boundary) => percentage >= boundary.min && percentage <= boundary.max
        )?.score || 0;
      console.log('score', score);
      setCalculatedScore(score);
    } else {
      setCalculatedScore(0);
    }
  };

  const handleFileClick = async (filename: string, student_id: number) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/files/students/${student_id}/${filename}`;
    window.open(url, '_blank'); // Open blank tab immediately to prevent pop-up blocking

    // try {
    //   const response = await api.get(url, { responseType: 'blob' }); // Fetch file as a Blob
    //   const fileUrl = URL.createObjectURL(response.data); // Convert Blob to Object URL
    //   newTab!.location.href = fileUrl; // Navigate new tab to file URL
    // } catch (error) {
    //   console.error('Error fetching file:', error);
    //   newTab!.close(); // Close tab if error occurs
    // }
  };

  // const handleDeleteCommentFile = async (
  //   filename: string,
  //   student_id: number,
  //   selected_homework_id: number
  // ) => {
  //   try {
  //     await api.delete(
  //       `/files/comment_file/${filename}/${student_id}/${selected_homework_id}`
  //     );

  //     if (activeTab === 'graded') {
  //       fetchGradedHomework(gradedCurrentPage);
  //     } else {
  //       fetchPendingHomework(pendingCurrentPage);
  //     }

  //     alert('comment file delete successfully');
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       alert(error.response?.data.message);
  //     } else {
  //       alert('There was an error deleting comment file');
  //     }
  //   }
  // };

  const handleTeacherFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTeacherFile(e.target.files[0]);
    }
  };

  const handleTeacherFileUpload = async () => {
    if (!teacherFile) return;

    const formData = new FormData();
    formData.append('file', teacherFile);

    try {
      const response = await api.post(
        'http://your-server.com/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Upload successful:', response.data);
      // After successful upload, clear the selected file if needed
      // setTeacherFile(null)
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="graded">Graded</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="graded">
                  {gradedHomeworks.map((homework) => (
                    <Card
                      key={homework.id}
                      className="mb-4 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleHomeworkClick(homework)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">
                            {homework.title}
                          </h3>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              disabled={!homework.file_name}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (homework.file_name)
                                  if (homework.student_id !== undefined) {
                                    handleFileClick(
                                      homework.file_name,
                                      homework.student_id
                                    );
                                  }
                              }}
                            >
                              <FileIcon className="w-4 h-4" /> Student File
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              disabled={!homework.comment_file_name}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (homework.comment_file_name)
                                  if (homework.student_id !== undefined) {
                                    handleFileClick(
                                      homework.comment_file_name,
                                      homework.student_id
                                    );
                                  }
                              }}
                            >
                              <FileIcon className="w-4 h-4" />
                              Comment File
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mr-2"
                              disabled={!homework.comment_file_name}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (homework.comment_file_name)
                                  if (
                                    homework.student_id !== undefined &&
                                    homework.id !== undefined
                                  ) {
                                    handleDeleteCommentFile(
                                      homework.comment_file_name,
                                      homework.student_id,
                                      homework.id
                                    );
                                  }
                              }}
                            >
                              <TrashIcon className="w-4 h-4" />
                              Remove Comment File
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (homework.id !== undefined)
                                  if (homework.id !== undefined)
                                    handleDelete(homework.id);
                              }}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge className="bg-blue-500 text-white">
                            Subject: {homework.subject}
                          </Badge>
                          <Badge className="bg-green-500 text-white">
                            Student: {homework.name}
                          </Badge>
                          <Badge className="bg-yellow-500 text-white">
                            Grade: {homework.grade}
                          </Badge>
                          <Badge className="bg-pink-500 text-white">
                            Graded by: {homework.graded_by}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent value="pending">
                  {pendingHomeworks.map((homework) => {
                    console.log('homework:', homework);
                    console.log('tab', activeTab);
                    return (
                      <Card
                        key={homework.id}
                        className="mb-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleHomeworkClick(homework)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                              {homework.title}
                            </h3>
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                disabled={!homework.file_name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (homework.file_name)
                                    if (homework.student_id !== undefined) {
                                      handleFileClick(
                                        homework.file_name,
                                        homework.student_id
                                      );
                                    }
                                }}
                              >
                                <FileIcon className="w-4 h-4 mr-2" /> View File
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (homework.id !== undefined)
                                    handleDelete(homework.id);
                                }}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge className="bg-blue-500 text-white">
                              Subject: {homework.subject}
                            </Badge>
                            <Badge className="bg-green-500 text-white">
                              Student: {homework.name}
                            </Badge>
                            <Badge className="bg-yellow-500 text-white">
                              Grade: {homework.grade}
                            </Badge>
                            {/* <Badge className="bg-pink-500 text-white">
                              Grade: {homework.graded_by}
                            </Badge> */}
                            {/* <Badge variant="secondary">
                            Level: {homework.levels.join(', ')}
                          </Badge>
                          <Badge
                            variant={
                              homework.type === 'Exam'
                                ? 'destructive'
                                : 'default'
                            }
                          >
                            Type: {homework.type}
                          </Badge>
                          <Badge
                            variant={
                              homework.gradedBy ? 'default' : 'secondary'
                            }
                          >
                            {homework.gradedBy
                              ? `Graded by: ${homework.gradedBy}`
                              : 'Not graded'}
                          </Badge> */}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>
              </Tabs>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    {activeTab === 'graded'
                      ? gradedCurrentPage > 1 && (
                          <PaginationPrevious
                            onClick={() =>
                              setGradedCurrentPage((prev) =>
                                Math.max(1, prev - 1)
                              )
                            }
                          />
                        )
                      : pendingCurrentPage > 1 && (
                          <PaginationPrevious
                            onClick={() =>
                              setPendingCurrentPage((prev) =>
                                Math.max(1, prev - 1)
                              )
                            }
                          />
                        )}
                  </PaginationItem>
                  {[
                    ...Array(
                      activeTab === 'graded'
                        ? gradedTotalPages
                        : pendingTotalPages
                    ).keys(),
                  ].map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() =>
                          activeTab === 'graded'
                            ? setGradedCurrentPage(page + 1)
                            : setPendingCurrentPage(page + 1)
                        }
                        isActive={
                          activeTab === 'graded'
                            ? gradedCurrentPage === page + 1
                            : pendingCurrentPage === page + 1
                        }
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    {activeTab === 'graded'
                      ? gradedCurrentPage < gradedTotalPages && (
                          <PaginationNext
                            onClick={() =>
                              setGradedCurrentPage((prev) =>
                                Math.min(gradedTotalPages, prev + 1)
                              )
                            }
                          />
                        )
                      : pendingCurrentPage < pendingTotalPages && (
                          <PaginationNext
                            onClick={() =>
                              setPendingCurrentPage((prev) =>
                                Math.min(pendingTotalPages, prev + 1)
                              )
                            }
                          />
                        )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                Filters (
                {activeTab === 'graded'
                  ? gradedMatchingCounts
                  : pendingMatchingCounts}
                )
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Select
                  onValueChange={(value) =>
                    handleFilterChange('subject', value)
                  }
                  value={filters.subject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subj) => (
                      <SelectItem key={subj.id} value={subj.subject_name}>
                        {subj.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) => handleFilterChange('grade', value)}
                  value={filters.grade}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-between">
                  <Button variant="destructive" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button onClick={submitFilters}>Submit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={selectedHomework !== null}
        onOpenChange={() => setSelectedHomework(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedHomework?.title}</DialogTitle>
          </DialogHeader>
          {selectedHomework && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          <UserIcon className="inline mr-2 h-4 w-4" />
                          Student
                        </span>
                        <span>{selectedHomework.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          <BookmarkIcon className="inline mr-2 h-4 w-4" />
                          Subject
                        </span>
                        <span>{selectedHomework.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          <ArrowUpIcon className="inline mr-2 h-4 w-4" />
                          Grade
                        </span>
                        <span>{selectedHomework.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          <ArrowUpIcon className="inline mr-2 h-4 w-4" />
                          Graded by
                        </span>
                        <span>{selectedHomework.graded_by}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardContent className="flex justify-center items-center h-full p-3">
                    <Button
                      className="w-full"
                      disabled={!selectedHomework.file_name}
                      onClick={() =>
                        selectedHomework.file_name &&
                        selectedHomework.student_id !== undefined &&
                        handleFileClick(
                          selectedHomework.file_name,
                          selectedHomework.student_id
                        )
                      }
                    >
                      <FileIcon className="mr-2 h-4 w-4" /> View Submitted File
                    </Button>
                  </CardContent>
                </Card>

                {selectedHomework.text_attachment && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>
                        <PaperclipIcon className="inline mr-2 h-4 w-4" />
                        Text Attachment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-muted/30">
                        {selectedHomework.text_attachment}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Grading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          placeholder="Raw"
                          value={rawScore}
                          onChange={handleRawScoreChange}
                          className="w-20"
                        />
                        <span>/</span>
                        <Input
                          type="text"
                          placeholder="Total"
                          value={totalScore}
                          onChange={handleTotalScoreChange}
                          className="w-20"
                        />
                        <span className="ml-4">Score: {calculatedScore}/7</span>
                      </div>
                      <Textarea
                        placeholder="Grading Comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={10}
                      />

                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle>
                            <Upload className="inline mr-2 h-4 w-4" />
                            Attach Commented File
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleTeacherFileChange}
                              accept=".pdf"
                              className="hidden"
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                onClick={triggerFileInput}
                                className="w-full"
                              >
                                {teacherFile
                                  ? 'Change File'
                                  : 'Select PDF File'}
                              </Button>
                            </div>
                            {teacherFile && (
                              <div className="text-sm mt-2 p-2 border rounded bg-muted/30">
                                Selected file: {teacherFile.name}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedHomework(null)}>
              Close
            </Button>
            <Button onClick={handleGradeSubmit}>Submit Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmation.show} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirmation.type === 'homework'
                ? 'Confirm Homework Deletion'
                : 'Confirm Comment File Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation.type === 'homework'
                ? 'Are you sure you want to delete this homework assignment?'
                : 'Are you sure you want to remove this comment file?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// export default function GradeExam() {
//   return (
//     <div>
//       <p>hi</p>
//     </div>
//   );
// }
