import { useEffect } from 'react';
import PageTitle from '../components/PageTitle';
import ResetPassword from '../components/ResetPassword';
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

    
    return(
        <div>
            <PageTitle />
            <ResetPassword />
        </div>
    );
}

export default ResetPassPage;
