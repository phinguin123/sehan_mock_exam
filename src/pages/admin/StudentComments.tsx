import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import api from '@/apis/axiosInterceptor';
import { components } from '@/types/api';

type StudentExamComments = components['schemas']['StudentExamComments'];
type Student = components['schemas']['Student'];

interface Subject {
  subject_name: string;
}

// interface examMark {
//   subjectName: string]: {
//     [day: string]: string;
//   };
// }

// const mockStudents: Student[] = [
//   {
//     student_id: 1,
//     name: 'John Doe',
//     subjects: [
//       { subject_name: 'Economics', level: 'SL', comment: '' },
//       { subject_name: 'CompSci', level: 'HL', comment: 'Good job' },
//       { subject_name: 'Chemistry', level: 'HL', comment: '' },
//     ],
//     grade: '11',
//   },
//   {
//     student_id: 2,
//     name: 'Jane Smith',
//     subjects: [
//       { subject_name: 'Math', level: 'HL', comment: 'Excellent' },
//       { subject_name: 'Physics', level: 'SL', comment: '' },
//       { subject_name: 'English', level: 'HL', comment: 'Well done' },
//     ],
//     grade: '12',
//   },
// ];

const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function StudentComments() {
  const [students, setStudents] = useState<StudentExamComments[]>([]);
  const [filteredStudents, setFilteredStudents] =
    useState<StudentExamComments[]>();
  const [selectedStudent, setSelectedStudent] =
    useState<StudentExamComments | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [comment, setComment] = useState('');
  const [examMark, setExamMark] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [uncommentedFilter, setUncommentedFilter] = useState<boolean>(false);
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Fetch students data from API
    fetchAllComments();
    //fetchStudentComments()
    // setStudents(fetchedStudents)
  }, []);

  const fetchAllComments = async () => {
    try {
      const response = await api.get('/comments/all');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching comments', error);
    }
  };

  useEffect(() => {
    const filtered = students.filter((student) => {
      // Filter by subject
      const subjectMatch = subjectFilter
        ? student.comments?.some(
            (comment) => comment.subject_name === subjectFilter
          )
        : true;

      // Filter students who have subjects with missing comments
      const uncommentMatch = uncommentedFilter
        ? student.comments?.some((comment) => !comment.comment)
        : true;

      // Filter by grade (if grade is part of student data)
      const gradeMatch = gradeFilter
        ? student.student_grade === gradeFilter
        : true;

      // Filter by student name
      const nameMatch =
        student.student_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false;

      return subjectMatch && uncommentMatch && gradeMatch && nameMatch;
    });

    setFilteredStudents(filtered);
  }, [students, subjectFilter, uncommentedFilter, gradeFilter, searchQuery]);

  // const fetchStudentList = async () => {
  //   try {
  //     const response = await api.get('/students/');
  //     console.log('received student list response:', response.data);
  //     // TODO make it clean
  //     const formattedStudents = formatStudents(response.data);
  //     setStudents(formattedStudents);
  //     setFilteredStudents(formattedStudents);
  //   } catch (error) {
  //     console.error('Error fetching student list:', error);
  //   }
  // };

  // const formatStudents = (data: Comment[]): Student[] => {
  //   const studentMap: { [key: number]: Student } = {};

  //   data.forEach((item) => {
  //     if (!studentMap[item.student_id]) {
  //       studentMap[item.student_id] = {
  //         student_id: item.student_id,
  //         name: item.student_name,
  //         grade: item.grade,
  //         subjects: [],
  //       };
  //     }
  //     studentMap[item.student_id].subjects.push({
  //       subject_name: item.subject,
  //       level: '',
  //       comment: item.comment,
  //       score: item.score,
  //     });
  //   });

  //   return Object.values(studentMap);
  // };

  const handleGradeFilterChange = (selectedGrade: string) => {
    setGradeFilter(selectedGrade === 'ag' ? '' : selectedGrade);
  };

  // const fetchexamMark = async (student: Student) => {
  //   try {
  //     const response = await api.get(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/student/marks`,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         params: { student_id: student.student_id },
  //         withCredentials: true,
  //       }
  //     );
  //     console.log('received student marks response:', response.data);
  //     setExamMark(response.data);
  //   } catch (error) {
  //     console.error('Error fetching student list:', error);
  //   }
  // };

  // const fetchStudentComments = async (student: Student) => {
  //   try {
  //     console.log('inside fetch');
  //     console.log('student_id in fetch comment', student);
  //     const response = await api.get(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/student/comments`,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         params: { student_id: student.student_id },
  //         withCredentials: true,
  //       }
  //     );
  //     console.log('received student comment response:', response.data);
  //     setComment(response.data || {});
  //   } catch (error) {
  //     console.error('Error fetching student comment:', error);
  //     setComment({});
  //   }
  // };

  const handleStudentClick = (student: StudentExamComments) => {
    setSelectedStudent(student);
    if (student.comments && student.comments[0]) {
      setActiveSubject(
        student.comments[0]?.subject_name
          ? { subject_name: student.comments[0].subject_name }
          : null
      );
    } else {
      setActiveSubject(null);
    }
    setExamMark(
      student.comments && student.comments[0]?.score
        ? student.comments[0].score
        : 0
    );
    console.log('student in click', student);
    setComment(
      student.comments && student.comments[0]?.comment
        ? student.comments[0].comment
        : ''
    );
  };

  const handleSubjectChange = (subject: Subject) => {
    setActiveSubject(subject);

    const subjectComment = selectedStudent?.comments?.find(
      (c) => c.subject_name === subject.subject_name
    );

    setComment(subjectComment?.comment || '');
    setExamMark(subjectComment?.score || 0);
  };

  const handleSubjectFilterChange = (selectedSubject: string) => {
    console.log('selected subject', selectedSubject);
    if (selectedSubject === 'ab') {
      setSubjectFilter('');
    } else {
      setSubjectFilter(selectedSubject);
    }
  };

  // const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
  //   console.log('current comment', comment);
  //   setComment((prevComments) => ({
  //     ...prevComments,
  //     [activeSubject?.subject_name || '']: e.target.value,
  //   }));
  // };

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!selectedStudent || !activeSubject) return;

    try {
      const response = await api.put(
        `/comments/${selectedStudent.comments?.[0]?.comment_id}`,
        {
          comment,
        }
      );
      window.alert('Comment submitted successfully.');

      // const updatedStudents = students.map((student) =>
      //   student.student_id === selectedStudent.student_id
      //     ? {
      //         ...student,
      //         subjects: student.subjects.map((subj) =>
      //           subj.subject_name === activeSubject.subject_name
      //             ? {
      //                 ...subj,
      //                 comment: comment[activeSubject.subject_name],
      //               }
      //             : subj
      //         ),
      //       }
      //     : student
      // );
      // setStudents(updatedStudents);
      fetchAllComments();
    } catch (error) {
      console.error('Error submitted comment:', error);
      window.alert('There was an error submitting the comment.');
    }
  };

  const allSubjects = Array.from(
    new Set(
      students.flatMap((student) =>
        student.comments
          ? student.comments.map((comment) => comment.subject_name)
          : []
      )
    )
  );

  const allGrades = Array.from(
    new Set(students.map((student) => student.student_grade))
  );

  console.log('allsub and all grade', allSubjects, allGrades);

  const handleSearchQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Comments</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents?.map((student) => (
              <Card
                key={student.student_id}
                className="mb-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleStudentClick(student)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {student.student_name} - {student.school}
                    </h3>
                    <Badge className="mr-2 rounded-full border-transparent border">
                      {student.student_grade}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    {student.comments?.map((subject) => (
                      <Badge
                        key={subject.subject_name}
                        className="mr-2 rounded-full border-transparent border"
                        variant={subject.comment ? 'default' : 'secondary'}
                      >
                        {subject.subject_name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-query">Search by Name</Label>
                <Input
                  id="search-query"
                  placeholder="Enter student name"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                />
              </div>
              <div>
                <Label htmlFor="grade-filter">Grade</Label>
                <Select
                  onValueChange={handleGradeFilterChange}
                  value={gradeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ag">All Grades</SelectItem>
                    {allGrades.map((grade) => (
                      <SelectItem key={grade} value={grade || ''}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject-filter">Subject</Label>
                <Select
                  onValueChange={handleSubjectFilterChange}
                  value={subjectFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ab">All Subjects</SelectItem>
                    {allSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject || ''}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uncommented-filter"
                  checked={uncommentedFilter}
                  onCheckedChange={(checked) =>
                    setUncommentedFilter(checked === true)
                  }
                />
                <Label htmlFor="uncommented-filter">
                  Show only uncommented
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={selectedStudent !== null}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      >
        <DialogContent className="max-w-4xl" style={{ zIndex: '1055' }}>
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.student_name}- Grade{' '}
              {selectedStudent?.student_grade}- {selectedStudent?.school}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Week Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Mark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{examMark}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={
                    selectedStudent?.comments?.[0]?.subject_name ?? ''
                  }
                  className="w-full"
                >
                  <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="inline-flex">
                      {selectedStudent?.comments?.map((subject) => (
                        <TabsTrigger
                          key={subject.subject_name}
                          value={subject.subject_name || ''}
                          onClick={() =>
                            handleSubjectChange({
                              subject_name: subject.subject_name || '',
                            })
                          }
                        >
                          {subject.subject_name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                  {selectedStudent?.comments?.map((subject) => (
                    <TabsContent
                      key={subject.subject_name}
                      value={subject.subject_name || ''}
                    >
                      <Textarea
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder="Enter your comment here..."
                        className="w-full h-40"
                      />
                      <Button onClick={handleCommentSubmit} className="mt-4">
                        Submit Comment
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
