import { useState, useEffect } from 'react';
import PageTitle from '../components/PageTitle';
import { useNavigate } from 'react-router-dom';
//import LoggedInName from '../components/LoggedInName';

const ResetPassPage = () =>
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
            <p>RESET PASSWORD PAGE</p>
        </div>
    );
}

export default ResetPassPage;
