import api from './axiosInterceptor';
import { paths, operations } from '../types/api';

export const getExams = () => api.get('/exams');
export const submitExam = (
  examData: operations['post_exam_submissions']['requestBody']
) => api.post('/submit-exam', examData);
