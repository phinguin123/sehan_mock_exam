import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast, useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Minus } from 'lucide-react';
import api from '@/apis/axiosInterceptor';
import { components } from '@/types/api';
import axios, { isAxiosError } from 'axios';

const grades = ['11', '12', 'pre-IB'];

type Subject = components['schemas']['Subject'];

type Student = components['schemas']['Student'];

interface DeleteConfirmation {
  isOpen: boolean;
  studentId: number | null;
}

export default function CreateStudent() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: 'John Doe',
      school: 'Sehan School',
      phone_number: '821099999999',
      grade: '11',
      email: 'abc@gmail.com',
      subjects: [
        { id: 1, subject_name: 'Math' },
        { id: 2, subject_name: 'English' },
      ],
    },
  ]);
  const [newStudent, setNewStudent] = useState<Student>({
    id: 0,
    name: '',
    email: '',
    school: '',
    phone_number: '',
    grade: '',
    subjects: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      studentId: null,
    });
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchStudentList();
    fetchSubjectList();
    // fetchStudentNames();
  }, []);

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

  const fetchStudentList = async () => {
    try {
      const response = await api.get('/students/');
      console.log('received student list response:', response.data);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching student list:', error);
    }
  };

  // const fetchStudentNames = async () => {
  //   try {
  //     const response = await api.get(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/student/getNames`,
  //       { withCredentials: true }
  //     );
  //     console.log('received student names response:', response.data);
  //     setStudentNames(response.data);
  //   } catch (error) {
  //     console.error('Error fetching student names:', error);
  //   }
  // };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewStudent({ ...newStudent, name: e.target.value });
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewStudent({ ...newStudent, email: e.target.value });
  };

  const handleGradeChange = (value: string) => {
    setNewStudent({ ...newStudent, grade: value });
  };

  const handleSchoolChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewStudent({ ...newStudent, school: e.target.value });
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewStudent({ ...newStudent, phone_number: e.target.value });
  };

  const handleSubjectChange = (index: number, field: string, value: string) => {
    const updatedSubjects = [...(newStudent.subjects || [])];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setNewStudent({ ...newStudent, subjects: updatedSubjects });
  };

  const addSubject = () => {
    const tempId = Date.now();
    console.log('tempid', tempId);
    setNewStudent({
      ...newStudent,
      subjects: [
        ...(newStudent.subjects || []),
        { id: tempId, subject_name: '' },
      ],
    });
  };

  const removeSubject = (index: number) => {
    const updatedSubjects = (newStudent.subjects || []).filter(
      (_, i) => i !== index
    );
    setNewStudent({ ...newStudent, subjects: updatedSubjects });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    console.log('newstudent to add', newStudent);

    if (
      !newStudent.name ||
      !newStudent.school ||
      !newStudent.email ||
      !newStudent.grade ||
      !newStudent.phone_number ||
      (newStudent.subjects || []).length === 0
    ) {
      alert('All fields and at least one subject are required.');
      return;
    }

    for (let subject of newStudent.subjects ?? []) {
      if (!subject.subject_name.trim()) {
        alert('Subject name cannot be empty');
        return;
      }
    }

    if (isEditing) {
      try {
        await api.put('/students/', newStudent);
        window.alert('New edited successfully.');
        fetchStudentList();
      } catch (error) {
        console.error('Error saving student:', error);
        window.alert('There was an error editing the student.');
      }
    } else {
      try {
        await api.post('/students/', newStudent);
        alert('New student added successfully.');
        fetchStudentList();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          alert(error.response?.data.message);
        } else {
          alert('There was an errrrrror adding student');
        }
      }
    }

    setNewStudent({
      id: 0,
      email: '',
      name: '',
      school: '',
      phone_number: '',
      grade: '',
      subjects: [],
    });
    setIsEditing(false);
  };

  const handleEdit = (student: Student) => {
    setNewStudent(student);
    console.log('newstudent', student);
    setIsEditing(true);

    window.scrollTo(0, 0);
  };

  const handleDeleteConfirmation = (id: number) => {
    setDeleteConfirmation({ isOpen: true, studentId: id });
  };

  const handleDelete = async () => {
    if (deleteConfirmation.studentId) {
      try {
        await api.delete(`/students/${deleteConfirmation.studentId}`);
        setStudents(
          students.filter(
            (student) => student.id !== deleteConfirmation.studentId
          )
        );
        window.alert('Student deleted successfully.');
      } catch (error) {
        console.error('Error deleting student:', error);
        window.alert('There was an error deleting the student.');
      } finally {
        setDeleteConfirmation({ isOpen: false, studentId: null });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Edit Student' : 'Add New Student'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>

                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={handleNameChange}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label htmlFor="name">Email</Label>

                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={handleEmailChange}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="school"
                  value={newStudent.phone_number}
                  onChange={handlePhoneNumberChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={newStudent.school}
                  onChange={handleSchoolChange}
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Select
                  onValueChange={handleGradeChange}
                  value={newStudent.grade}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(newStudent.subjects || []).map((subject, index) => (
                <div key={subject.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={(value) =>
                        handleSubjectChange(index, 'subject_name', value)
                      }
                      value={subject.subject_name}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subj) => (
                          <SelectItem key={subj.id} value={subj.subject_name}>
                            {subj.subject_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubject(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={addSubject} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Subject
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Student' : 'Add Student'}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewStudent({
                      id: 0,
                      name: '',
                      email: '',
                      school: '',
                      phone_number: '',
                      grade: '',
                      subjects: [],
                    });
                    setIsEditing(false);
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Current Students</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-left">{student.id}</TableCell>
                    <TableCell className="text-left">{student.name}</TableCell>
                    <TableCell className="text-left">{student.email}</TableCell>
                    <TableCell className="text-left">
                      {student.phone_number}
                    </TableCell>
                    <TableCell className="text-left">
                      {student.school}
                    </TableCell>
                    <TableCell className="text-left">{student.grade}</TableCell>
                    <TableCell className="text-left">
                      {(student.subjects ?? []).map((subject) => (
                        <div key={subject.id}>{subject.subject_name}</div>
                      ))}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (student.id !== null) {
                              if (student.id !== undefined) {
                                handleDeleteConfirmation(student.id);
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation({ ...deleteConfirmation, isOpen })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirmation({ isOpen: false, studentId: null })
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
