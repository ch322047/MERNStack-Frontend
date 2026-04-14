import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function ForgotPassword() {
  const navigate = useNavigate();

  // Messages to user
  const [message, setMessage] = useState('');

  // Login
  const [loginName, setLoginName] = useState('');

  // Email
  const [email, setEmail] = useState('');


  function buildPath(route: string) {
    return `https://lampstackprojectgroup9.com/api/${route}`;
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await fetch(buildPath(`forgot-password`), {
        method: 'POST',
        body: JSON.stringify({ login: loginName, email: email }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
      } else {
        setMessage('An email has been sent with a link to reset your password');
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
          ← Back
        </button>
        
        <h1>Forgot Password</h1>

        
        
        <form onSubmit={reset}>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setLoginName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit">Reset</button>
        </form>
        

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;
