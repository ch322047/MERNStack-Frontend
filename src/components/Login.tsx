import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function Auth() {
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [message, setMessage] = useState('');

  // Login
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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

      const text = await response.text(); // get raw text first
      let res;
      try {
        res = JSON.parse(text); // attempt JSON parse
      } catch (err) {
        console.error('Failed to parse JSON. Server returned:', text);
        setMessage('Server error: see console');
        return;
      }

      if (res.error) {
        setMessage(res.error);
      } else {
        localStorage.setItem('user_data', JSON.stringify(res.user));
        navigate('/cards');
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

      const text = await response.text(); // get raw text first
      let res;
      try {
        res = JSON.parse(text); // attempt JSON parse
      } catch (err) {
        console.error('Failed to parse JSON. Server returned:', text);
        setMessage('Server error: see console');
        return;
      }

      if (res.error) {
        setMessage(res.error);
      } else {
        localStorage.setItem('user_data', JSON.stringify(res.user));
        navigate('/cards');
        setMessage('Registration successful! Check your email.');
        setTimeout(() => setIsLoginTab(true), 2000);
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
            className={isLoginTab ? 'active' : ''}
            onClick={() => setIsLoginTab(true)}
          >
            Login
          </button>
          <button
            className={!isLoginTab ? 'active' : ''}
            onClick={() => setIsLoginTab(false)}
          >
            Register
          </button>
        </div>

        <h1>{isLoginTab ? 'Login' : 'Register'}</h1>

        {isLoginTab ? (
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
          <form onSubmit={doRegister}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Username"
              value={registerLogin}
              onChange={(e) => setRegisterLogin(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />

            <button type="submit">Register</button>
          </form>
        )}

        <p className="message">{message}</p>
      </div>
    </div>
  );
}

export default Auth;