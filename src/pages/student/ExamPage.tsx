import ExamList from '@/components/Exams/ExamList';
import { useEffect, useState } from 'react';
import { components } from '@/types/api';
import { BookOpen, GraduationCap, School, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/apis/axiosInterceptor';

type Exam = components['schemas']['Exam'];

type StudentProfile = components['schemas']['StudentProfile'];

const studentData = {
  name: 'Jitae Kim',
  grade: 11,
};

// async function getExams(): Promise<Exam[]> {
//   // In a real application, this would be an API call
//   return [
//     {
//       id: 1,
//       title: 'Math Exam',
//       subject: 'Mathematics',
//       grade: 'pre-IB',
//     },
//     {
//       id: 2,
//       title: 'English Literature Exam',
//       subject: 'English',
//       grade: 'pre-IB',
//     },
//     {
//       id: 3,
//       title: 'Chemistry Exam',
//       subject: 'Chemistry',
//       grade: '11',
//     },
//     {
//       id: 4,
//       title: 'English A Exam',
//       subject: 'English A',
//       grade: 'pre-IB',
//     },
//     {
//       id: 5,
//       title: 'Physics Exam',
//       subject: 'Physics',
//       grade: '12',
//     },
//   ];
// }

// async function getExams(): Promise<Exam[]> {
// }
async function getExams(): Promise<Exam[]> {
  const response = await api.get('/exams/students');
  return response.data;
}

export default function ExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState(180 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadExams = async () => {
      const fetchedExams = await getExams();
      setExams(fetchedExams);
      setLoading(false);
    };
    const fetchStudentProfile = async () => {
      const response = await api.get('/students/profile');
      console.log('received response for student profile', response.data);
      setStudentProfile(response.data);
    };
    loadExams();
    fetchStudentProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    // <div className="container mx-auto px-4 py-8">
    //   <h1 className="text-3xl font-bold mb-6">Available Exams</h1>
    //   <ExamList initialExams={exams} />
    // </div>
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white text-center mb-12">
          2025 Sehan Mock Exam
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-8">
            <ExamList initialExams={exams} />
          </div>
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Exam Information
              </h2>
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="font-semibold text-gray-700">
                    {studentProfile.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <School className="w-5 h-5 mr-2 text-purple-500" />
                  <span className="text-gray-600">{studentProfile.school}</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
                  <span className="text-gray-600">
                    Grade {studentProfile.grade}
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Exam Details
                </h3>
                <div className="flex items-center mb-2">
                  <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                  <span className="text-sm text-gray-600">
                    Each subject{/* {currentExam.subject} */}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-2 text-red-500" />
                  <span className="text-sm text-gray-600">
                    60 minutes{/* {currentExam.duration} minutes */}
                  </span>
                </div>
                {/* <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  {currentExam.totalQuestions} questions
                </span>
              </div> */}
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Time Remaining
                </h3>
                <div className="text-3xl font-bold text-red-500">
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Important Instructions
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  <li>Read all questions carefully</li>
                  <li>Answer all questions</li>
                  <li>You may use a calculator if needed</li>
                </ul>
              </div>
              {/* <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Need Help?
              </h3>
              <div className="flex items-center mb-2">
                <HelpCircle className="w-4 h-4 mr-2 text-blue-500" />
                <a href="#" className="text-sm text-blue-500 hover:underline">
                  View FAQ
                </a>
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                <a href="#" className="text-sm text-green-500 hover:underline">
                  Contact Support
                </a>
              </div>
            </div> */}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
