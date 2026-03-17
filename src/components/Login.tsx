import { useState } from 'react';

function Login()
{
  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');

  function buildPath(route:string) : string
  {
      return `http://lampstackprojectgroup9.com/api/${route}`;
  }

  async function doLogin(event: any): Promise<void>
  {
    event.preventDefault();

    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try
    {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());

      if (res.id <= 0)
      {
        setMessage('User/Password combination incorrect');
      }
      else
      {
        const user = { firstName: res.firstName, lastName: res.lastName, id: res.id };
        localStorage.setItem('user_data', JSON.stringify(user));

        setMessage('');
        window.location.href = '/cards';
      }
    }
    catch (error: any)
    {
      alert(error.toString());
    }
  }

  return(
    <div id="loginDiv">
      <span id="inner-title">PLEASE LOG IN</span><br />

      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setLoginName(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br />

      <button onClick={doLogin}>Login</button>

      <span>{message}</span>
    </div>
  );
}

export default Login;