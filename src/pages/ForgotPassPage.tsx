import { useEffect } from 'react';
import PageTitle from '../components/PageTitle';
import ForgotPassword from '../components/ForgotPassword';
import { useNavigate } from 'react-router-dom';

const ForgotPassPage = () =>
{
    const navigate = useNavigate();
    
    // Get user from localStorage
    const stored = localStorage.getItem('user_data');
    const user = stored ? JSON.parse(stored) : null;
    const userId = user?.id;
    const token = localStorage.getItem('token');

    // Redirect to login if not logged in
    useEffect(() => {
        if (!userId || !token) {
            navigate('/login');
        }
    }, [userId, navigate]);
    
    return(
        <div>
            <PageTitle />
            <ForgotPassword />
        </div>
    );
}

export default ForgotPassPage;
