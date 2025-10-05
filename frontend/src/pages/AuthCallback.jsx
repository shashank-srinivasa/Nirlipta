import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        navigate('/');
        return;
      }

      // Store token
      localStorage.setItem('token', token);

      try {
        // Get user profile
        const response = await authAPI.getProfile();
        const userData = response.data;

        // Update auth store
        setUser(userData, token);

        // Redirect to profile or home
        navigate('/profile');
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card max-w-md text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h2 className="text-2xl font-heading font-bold mb-2">Signing you in...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback;

