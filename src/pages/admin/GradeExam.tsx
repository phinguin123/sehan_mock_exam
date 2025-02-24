import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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
  CalendarIcon,
  UserIcon,
  BookmarkIcon,
  ArrowUpIcon,
  TagIcon,
  PaperclipIcon,
  TrashIcon,
} from 'lucide-react';
import { components } from '@/types/api';

type ExamSubmission = components['schemas']['ExamSubmission'];

const subjects = [
  'Physics',
  'English A',
  'English B',
  'Math AA',
  'Math AI',
  'CompSci',
  'Economics',
  'Business',
  'Korean LL',
  'Korean Lit',
  'Biology',
  'Chemistry',
  'Pre-Math',
  'Pre-English',
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

interface Homework {
  id: number;
  title: string;
  subject: string;
  grades: string[];
  levels: string[];
  type: string;
  gradedBy: string;
  studentName: string;
  duplicate?: string;
  submissionDate: string;
  dueDate: string;
  assignedDate: string;
  file_name?: string;
  textAttachment?: string;
  rawScore?: string;
  totalScore?: string;
  comment?: string;
}

interface DeleteConfirmation {
  show: boolean;
  id: number | null;
}

interface Filters {
  subject: string;
  grade: string;
}

export default function GradeExam() {
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
  const [rawScore, setRawScore] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('graded');
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({ show: false, id: null });
  const [studentNames, setStudentNames] = useState<StudentName[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingCurrentPage, setPendingCurrentPage] = useState<number>(1);
  const [gradedCurrentPage, setGradedCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pendingTotalPages, setPendingTotalPages] = useState<number>(0);
  const [gradedTotalPages, setGradedTotalPages] = useState<number>(0);
  const [gradedMatchingCounts, setGradedMatchingCounts] = useState<number>(0);
  const [pendingMatchingCounts, setPendingMatchingCounts] = useState<number>(0);

  useEffect(() => {
    console.log('hi');
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

      console.log('fetchhomework response', response);

      const { exam_submissions, total_pages, total_count } = response.data;

      console.log('data', exam_submissions);

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

  const handleDelete = (id: number) => {
    setDeleteConfirmation({ show: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.id) {
      try {
        await api.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/homework-submission/delete`,
          {
            headers: { 'Content-Type': 'application/json' },
            data: { submission_id: deleteConfirmation.id },
          }
        );
        setGradedHomeworks((prev) =>
          prev.filter((hw) => hw.id !== deleteConfirmation.id)
        );
        setPendingHomeworks((prev) =>
          prev.filter((hw) => hw.id !== deleteConfirmation.id)
        );
        window.alert('Homework submission deleted successfully.');
      } catch (error) {
        console.error('Error deleting homework submission:', error);
        window.alert('There was an error deleting the homework submission.');
      } finally {
        setDeleteConfirmation({ show: false, id: null });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, id: null });
  };

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      grade: '',
    });
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
    setRawScore(homework.raw_score || 0);
    setTotalScore(homework.total_score || 0);
    calculateScore(homework.raw_score || 0, homework.total_score || 0);
  };

  const handleGradeSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const submitted_homework_id = selectedHomework?.id;
      const response = await api.put(
        `exam-submissions/${submitted_homework_id}`,
        {
          rawScore,
          totalScore,
          calculatedScore,
          submitted_homework_id,
          comment,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to submit grade');
      }
      setSelectedHomework(null);

      if (activeTab === 'graded') {
        fetchGradedHomework(gradedCurrentPage);
      } else {
        fetchPendingHomework(pendingCurrentPage);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRawScoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRawScore(Number(e.target.value));
    calculateScore(Number(e.target.value), totalScore);
  };

  const handleTotalScoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalScore(Number(e.target.value));
    calculateScore(rawScore, Number(e.target.value));
  };

  const calculateScore = (raw: number, total: number) => {
    if (raw && total) {
      const percentage = (raw / total) * 100;
      const score =
        gradeBoundaries.find(
          (boundary) => percentage >= boundary.min && percentage <= boundary.max
        )?.score || 0;
      setCalculatedScore(score);
    } else {
      setCalculatedScore(0);
    }
  };

  const handleFileClick = (filename: string, student_id: number) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/files/${student_id}/${filename}`;
    window.open(url, '_blank');
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
                              <FileIcon className="w-4 h-4 mr-2" /> View File
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
                            <Badge className="bg-pink-500 text-white">
                              Grade: {homework.graded_by}
                            </Badge>
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
                    <SelectItem value="All Subjects">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
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
                    <SelectItem value="All Grades">All Grades</SelectItem>
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
                          <UserIcon className="inline mr-2" />
                          Student
                        </span>
                        <span>{selectedHomework.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          <BookmarkIcon className="inline mr-2" />
                          Subject
                        </span>
                        <span>{selectedHomework.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          <ArrowUpIcon className="inline mr-2" />
                          Grade
                        </span>
                        <span>{selectedHomework.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          <ArrowUpIcon className="inline mr-2" />
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
                      <FileIcon className="mr-2" /> View Submitted File
                    </Button>
                    {/* {selectedHomework.textAttachment && (
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle>
                            <PaperclipIcon className="inline mr-2" />
                            Text Attachment
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-40 overflow-y-auto">
                            {selectedHomework.textAttachment}
                          </div>
                        </CardContent>
                      </Card>
                    )} */}
                  </CardContent>
                </Card>
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
                          type="number"
                          placeholder="Raw"
                          value={rawScore}
                          onChange={handleRawScoreChange}
                          className="w-20"
                        />
                        <span>/</span>
                        <Input
                          type="number"
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
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this homework assignment?
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
