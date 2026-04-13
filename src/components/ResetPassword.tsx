import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function ResetPassword() {
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [message, setMessage] = useState('');

  // Login
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loginCode, setLoginCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Register
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerLogin, setRegisterLogin] = useState('');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  function buildPath(route: string) {
    return `https://lampstackprojectgroup9.com/api/${route}`;
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(buildPath('login'), {
        method: 'POST',
        body: JSON.stringify({ login: loginName, password: loginPassword }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
      } else {
        // Login code sent successfully
        setMessage('Login code sent to your email. Enter it above to continue.');
        setShowCodeInput(true);
      }
    } catch (err: any) {
      setMessage(err.toString());
    }
  }

  async function verifyLoginCode(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(buildPath('verify-login-code'), {
        method: 'POST',
        body: JSON.stringify({ login: loginName, code: loginCode }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
      } else {
        // Store user info & token
        localStorage.setItem('user_data', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        navigate('/trips');
      }
    } catch (err: any) {
      setMessage(err.toString());
    }
  }

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
  }

  // sends the username and email to the backend, triggering a resent email
  async function resendEmail(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(buildPath('resend-verification-email'), {
        method: 'POST',
        body: JSON.stringify({
          login: registerLogin,
          email,
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
        //localStorage.setItem('user_data', JSON.stringify(res.user));
        setMessage('Email Resent! Check your email.');
      }
        
      
    } catch (err: any) {
      setMessage(err.toString());
    }
  }

  
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

        
        <>
          {!showCodeInput ? (
            <form onSubmit={doLogin}>
              <input
                type="text"
                placeholder="Username"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />

              <button type="submit">Login</button>
            </form>
          ) : (
            <form onSubmit={verifyLoginCode}>
              <input
                type="text"
                placeholder="Enter code from email"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
              />
              <button type="submit">Verify Code</button>
            </form>
          )}
        </>
        

        <p className="message">{message}</p>
      </div>
    </div>
  );
}

export default ResetPassword;
