import ExamList from '@/components/Exams/ExamList';
import { useEffect, useState } from 'react';
import { components } from '@/types/api';
import { BookOpen, GraduationCap, School, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/apis/axiosInterceptor';
import LogoutButton from '@/components/LogoutButton';

type Exam = components['schemas']['Exam'];

type StudentProfile = components['schemas']['StudentProfile'];

const studentData = {
  name: 'Jitae Kim',
  grade: 11,
};

async function getExams(): Promise<Exam[]> {
  const response = await api.get('/exams/students');
  return response.data;
}

export default function ExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState(180 * 60);
  const [hoursBefore, setHoursBefore] = useState(0);

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
    const fetchTimeRemaining = async () => {
      try {
        const response = await api.get('/exams/time_remaining');
        console.log(response);
        setTimeRemaining(response.data.remaining_time);
        setHoursBefore(response.data.hours_before);
      } catch (error) {
        console.error('error fetching time remaining', error);
      }
    };
    loadExams();
    fetchStudentProfile();
    fetchTimeRemaining();
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
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white text-center mb-12">
          2026 세한아카데미 IB 학력평가
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-8">
            <ExamList
              initialExams={exams}
              timeRemaining={timeRemaining}
              hoursBefore={hoursBefore}
            />
          </div>
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Exam Information
                </h2>
                <LogoutButton
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-red-500"
                />
              </div>

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
                <ul className="list-disc list-inside text-sm font-semibold text-red-600">
                  <li>You can only submit the exam once</li>
                  <li>Exam will end when the time ends</li>
                  <li>Only submit pdf files</li>
                  <li>File size can't exceed 100MB</li>
                  <li>Made by 김지태 (phinguin) 컴싸 강사님</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
