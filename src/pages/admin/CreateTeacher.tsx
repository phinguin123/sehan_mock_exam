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
import { Pencil, Trash2, Plus, Minus } from 'lucide-react';
import api from '@/apis/axiosInterceptor';
import { components } from '@/types/api';

const grades = ['11', '12', 'pre-IB'];

type Teacher = components['schemas']['Teacher'];

interface DeleteConfirmation {
  isOpen: boolean;
  teacherId: number | null;
}

export default function CreateTeacher() {
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'abc@gmail.com',
    },
  ]);
  const [newTeacher, setNewTeacher] = useState<Teacher>({
    id: 0,
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      teacherId: null,
    });

  useEffect(() => {
    fetchTeacherList();
  }, []);

  const fetchTeacherList = async () => {
    try {
      const response = await api.get('/teachers');
      console.log('received Teacher list response:', response.data);
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching Teacher list:', error);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTeacher({ ...newTeacher, name: e.target.value });
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTeacher({ ...newTeacher, email: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    console.log('newTeacher to add', newTeacher);

    if (!newTeacher.name || !newTeacher.email) {
      window.alert('Name and email are required.');
      return;
    }

    if (isEditing) {
      try {
        await api.put(`/teachers/${newTeacher.id}`, newTeacher);
        window.alert('New edited successfully.');
        fetchTeacherList();
      } catch (error) {
        console.error('Error saving Teacher:', error);
        window.alert('There was an error editing the Teacher.');
      }
    } else {
      try {
        await api.post('/teachers/', newTeacher);
        window.alert('New Teacher added successfully.');
        fetchTeacherList();
      } catch (error) {
        console.error('Error saving Teacher:', error);
        window.alert('There was an error saving the Teacher.');
      }
    }

    setNewTeacher({
      id: 0,
      email: '',
      name: '',
    });
    setIsEditing(false);
  };

  const handleEdit = (Teacher: Teacher) => {
    setNewTeacher(Teacher);
    setIsEditing(true);

    window.scrollTo(0, 0);
  };

  const handleDeleteConfirmation = (id: number) => {
    setDeleteConfirmation({ isOpen: true, teacherId: id });
  };

  const handleDelete = async () => {
    if (deleteConfirmation.teacherId) {
      try {
        await api.delete(`/teachers/${deleteConfirmation.teacherId}`);
        setTeachers(
          teachers.filter(
            (Teacher) => Teacher.id !== deleteConfirmation.teacherId
          )
        );
        window.alert('Teacher deleted successfully.');
      } catch (error) {
        console.error('Error deleting Teacher:', error);
        window.alert('There was an error deleting the Teacher.');
      } finally {
        setDeleteConfirmation({ isOpen: false, teacherId: null });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teacher Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>

                <Input
                  id="name"
                  value={newTeacher.name}
                  onChange={handleNameChange}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label htmlFor="name">Email</Label>

                <Input
                  id="email"
                  type="email"
                  value={newTeacher.email}
                  onChange={handleEmailChange}
                  placeholder="Enter email"
                />
              </div>
              <Button type="submit">
                {isEditing ? 'Update Teacher' : 'Add Teacher'}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewTeacher({
                      id: 0,
                      name: '',
                      email: '',
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
            <CardTitle>Current teachers</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((Teacher) => (
                  <TableRow key={Teacher.id}>
                    <TableCell className="text-left">{Teacher.id}</TableCell>
                    <TableCell className="text-left">{Teacher.name}</TableCell>
                    <TableCell className="text-left">{Teacher.email}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(Teacher)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (Teacher.id !== null) {
                              if (Teacher.id !== undefined) {
                                handleDeleteConfirmation(Teacher.id);
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
              Are you sure you want to delete this Teacher? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirmation({ isOpen: false, teacherId: null })
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
