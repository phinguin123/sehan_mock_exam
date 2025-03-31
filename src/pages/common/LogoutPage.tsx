import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/apis/axiosInterceptor';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await api.post('/auth/logout');

        // remove access and refresh tokens from local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        navigate(response.data.redirect_url || '/');
      } catch (e) {
        console.log(e);
      }
    };

    performLogout();
  }, [navigate]);

  return <div>Logging out...</div>;
}
