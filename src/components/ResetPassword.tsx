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

    // compare 2 passwords
    if (confirmNewPassword !== newPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    try {
      const response = await fetch(buildPath(`reset-password`), {
        method: 'POST',
        body: JSON.stringify({ token: token, newPassword: newPassword }),
        headers: { 'Content-Type': 'application/json' },
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


  
  return (
    <div className="auth-container">
      <div className="auth-box">

        <button
          className="back-btn"
          onClick={() => navigate('/trips')}
        >
          Back
        </button>
        
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
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />

          <button type="submit">Reset</button>
        </form>
        

        <p className="message messageOrange">{message}</p>
      </div>
    </div>
  );
}

export default ResetPassword;
