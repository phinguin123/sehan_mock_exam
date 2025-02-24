import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { components } from '@/types/api';
import api from '@/apis/axiosInterceptor';

type Comment = components['schemas']['Comment'];

type SubjectComments = {
  [grade: number]: string;
};

type Subject = {
  name: string;
  comments: SubjectComments;
};

const GRADES = [1, 2, 3, 4, 5, 6, 7];

export default function ExamCommentsSettingPage() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: 'Mathematics', comments: {} },
    { name: 'Biology', comments: {} },
    { name: 'English A', comments: {} },
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get('/comments/');
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, []);

  const addSubject = () => {
    if (newSubject.trim() !== '') {
      setSubjects([...subjects, { name: newSubject, comments: {} }]);
      setNewSubject('');
    }
  };

  const updateComment = (
    subjectIndex: number,
    grade: number,
    comment: string
  ) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[subjectIndex].comments[grade] = comment;
    setSubjects(updatedSubjects);
  };

  const saveAllComments = () => {
    console.log('Saving all comments:', subjects);
    // Here you would typically send this data to your backend or storage solution
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Grade Boundary Comments</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter new subject name"
            />
            <Button onClick={addSubject}>Add Subject</Button>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Subject</th>
              {GRADES.map((grade) => (
                <th key={grade} className="border p-2">
                  Grade {grade}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, subjectIndex) => (
              <tr key={subject.name}>
                <td className="border p-2 font-semibold">{subject.name}</td>
                {GRADES.map((grade) => (
                  <td key={grade} className="border p-2">
                    <Textarea
                      value={subject.comments[grade] || ''}
                      onChange={(e) =>
                        updateComment(subjectIndex, grade, e.target.value)
                      }
                      placeholder={`Comment for grade ${grade}`}
                      className="w-full h-24 text-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={saveAllComments} className="mt-4">
        Save All Comments
      </Button>
    </div>
  );
}
