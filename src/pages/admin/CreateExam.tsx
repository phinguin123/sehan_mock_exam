import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { components } from '@/types/api';
import api from '@/apis/axiosInterceptor';

type Subject = components['schemas']['Subject'];
type Grade = components['schemas']['Grade'];
type Exam = components['schemas']['Exam'];

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchExams();
    fetchSubjectList();
    fetchGradeList();
  }, []);

  const fetchExams = async () => {
    const response = await api.get('/exams/');
    setExams(response.data);
  };

  const fetchSubjectList = async () => {
    try {
      const response = await api.get('/subjects/');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subject list:', error);
    }
  };

  const fetchGradeList = async () => {
    try {
      const response = await api.get('/grades/');
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grade list:', error);
    }
  };

  const handleSubjectChange = (value: string) => {
    if (currentExam) {
      setCurrentExam({ ...currentExam, subject: value });
    }
  };

  const handleGradeChange = (value: string) => {
    if (currentExam) {
      setCurrentExam({ ...currentExam, grade: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    console.log('formData', form);
    const formData = new FormData(form);

    console.log('formData', formData);

    for (let [key, value] of formData.entries()) {
      console.log(key, value); // Check if it logs the correct data
    }

    if (file) {
      formData.append('file', file);
    }

    try {
      if (currentExam) {
        // Update existing exam
        if (currentExam && currentExam.id !== undefined) {
          formData.append('id', currentExam.id.toString());
        }
        const response = await api.put(`/exams/${currentExam.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.status === 201) {
          alert('Exam updated successfully');
        } else {
          alert('Failed to update exam');
        }
      } else {
        // Create new exam
        const response = await api.post('/exams/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.status === 201) {
          alert('Exam created successfully');
        } else {
          alert('Failed to create exam');
        }
      }
    } catch (error: any) {
      console.error('Error saving exam:', error);
      alert(`Error: ${error.response?.data?.message}`);
    }

    setIsDialogOpen(false);
    setCurrentExam(null);
    fetchExams();
  };

  const handleDelete = async (id: number | undefined) => {
    const response = await api.delete(`/exams/${id}`);
    if (response.status === 204) {
      alert('Exam deleted successfully');
      fetchExams();
    } else {
      alert('Failed to update exam');
    }
  };

  const handleEdit = (exam: Exam) => {
    setCurrentExam(exam);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Exams</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setCurrentExam(null)}>Add New Exam</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentExam ? 'Edit Exam' : 'Add New Exam'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={currentExam?.title}
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select
                onValueChange={handleSubjectChange}
                value={currentExam?.subject}
                name="subject"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.subject_name}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select
                onValueChange={handleGradeChange}
                value={currentExam?.grade}
                name="grade"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.grade_name}>
                      {grade.grade_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                name="file"
                type="file"
                onChange={handleFileChange}
              />
            </div>
            {/* <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                defaultValue={currentExam?.duration}
                required
              />
            </div> */}
            <Button type="submit">{currentExam ? 'Update' : 'Create'}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>File</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="text-left">{exam.title}</TableCell>
              <TableCell className="text-left">{exam.subject}</TableCell>
              <TableCell className="text-left">{exam.grade}</TableCell>
              <TableCell className="text-left">
                {exam.file_name && (
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL}/files/${exam.file_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {exam.file_name}
                  </a>
                )}
              </TableCell>
              {/* <TableCell>{exam.duration} min</TableCell> */}
              <TableCell className="text-left">
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => handleEdit(exam)}
                >
                  Edit
                </Button>
                {exam.id !== undefined && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(exam.id)}
                  >
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
