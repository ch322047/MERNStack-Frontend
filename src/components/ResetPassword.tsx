import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function ResetPassword() {
  const navigate = useNavigate();

  // Messages to user
  const [message, setMessage] = useState('');

  // New Password
  const [newPassword, setNewPassword] = useState('');

  // Confirm
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Token
  const token = localStorage.getItem('token');

  function buildPath(route: string) {
    return `https://lampstackprojectgroup9.com/api/${route}`;
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`/api/reset-password?token=${token}`), {
        method: 'POST',
        body: JSON.stringify({ token: token, newPassword: newPassword }),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`,  },
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
      } else {
        // Password reset successfully
        setMessage('Password reset!');
      }
    } catch (err: any) {
      setMessage(err.toString());
    }
  }

  /*
  async function doRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(buildPath('register'), {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          login: registerLogin,
          email,
          password: registerPassword,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      let res;
      try {
        res = await response.json()
      } catch (err) {
        console.error('Failed to parse JSON.');
        setMessage('Server error: see console');
        return;
      }

      if (res.error) {
        setMessage(res.error);
      } else {
        localStorage.setItem('user_data', JSON.stringify(res.user));
        setMessage('Registration successful! Check your email.');

        
        
        //setTimeout(() => setIsLoginTab(true), 2000); // This takes the user back to the login page
      }
    } catch (err: any) {
      setMessage(err.toString());
    }
  }*/


  
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="tabs">
          <button
            className="back-btn"
            onClick={() => navigate('/trips')}
          >
            Back
          </button>
        </div>

        <h1>Reset Password</h1>

        
        
        <form onSubmit={reset}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button type="submit">Reset</button>
        </form>
        

        <p className="message">{message}</p>
      </div>
    </div>
  );
}

export default ResetPassword;
