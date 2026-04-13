import { useNavigate } from 'react-router-dom';

function LoggedInName()
{
    function getCurrentUserName() {
        var data;
        data = JSON.parse(localStorage.getItem('user_data') || '');
        return data.firstName + ' ' + data.lastName;
    }
    function doLogout(event:any) : void
    {
	    event.preventDefault();
        localStorage.removeItem('user_data');
        window.location.href = '/';
    };    
	function changePassword() : void
	{
		navigate(`/reset-password`);
	};

    return(
      <div id="loggedInDiv">
        <span id="userName">Welcome, {getCurrentUserName()}</span><br />
        <button type="button" id="logoutButton" className="confirm-btn" 
           onClick={doLogout}> Log Out </button>
		<button type="button" id="resetPassButton" className="cancel-btn" 
           onClick={changePassword}> Reset Password </button>
      </div>
    );
};

export default LoggedInName;
